// ─────────────────────────────────────────────────────────────────────────────
// lib/pdf/parser.ts — Server-side PDF text extraction
// ─────────────────────────────────────────────────────────────────────────────
// pdf-parse is a CommonJS module — use require() to avoid ESM export issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const MIN_TEXT_LENGTH = 30; // Minimum characters — catches scanned/empty PDFs

export interface ParsedDocument {
  text: string;
  pageCount: number;
  /** Best-effort array of text sections (one per page, approximate) */
  pages: string[];
}

export class PDFParseError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TOO_LARGE"
      | "WRONG_TYPE"
      | "EMPTY"
      | "PARSE_FAILED"
      | "SCANNED_PDF"
  ) {
    super(message);
    this.name = "PDFParseError";
  }
}

/**
 * Cleans extracted text:
 * - Normalizes line endings
 * - Collapses excessive whitespace
 * - Removes null/control characters
 */
function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove null bytes and other non-printable control chars (keep \n \t)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, " ")
    .replace(/[^\S\n]+/g, " ")  // collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n") // max 2 consecutive blank lines
    .trim();
}

/**
 * Validates the uploaded file before parsing.
 * Throws PDFParseError on validation failure.
 */
export function validatePDFFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new PDFParseError(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 15 MB.`,
      "TOO_LARGE"
    );
  }

  const isValidType =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isValidType) {
    throw new PDFParseError(
      "Only PDF files are supported. Please upload a PDF medical report.",
      "WRONG_TYPE"
    );
  }
}

/**
 * Parses a PDF buffer and returns clean extracted text.
 * Server-side only — never call from client components.
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const fullText = cleanText(textResult.text ?? "");

    if (fullText.length < MIN_TEXT_LENGTH) {
      throw new PDFParseError(
        "This PDF appears to contain no readable text. It may be a scanned/image-based document. HealthBuddy currently supports text-based PDFs only.",
        "SCANNED_PDF"
      );
    }

    const pages = textResult.pages.map((p: { text: string }) => cleanText(p.text));
    const pageCount = textResult.total;

    return {
      text: fullText,
      pageCount,
      pages,
    };
  } catch (err) {
    console.error("[parsePDF] pdf-parse threw:", err);
    if (err instanceof PDFParseError) {
      throw err;
    }
    throw new PDFParseError(
      "Failed to read the PDF file. The file may be password-protected, corrupted, or in an unsupported format.",
      "PARSE_FAILED"
    );
  } finally {
    try {
      await parser.destroy();
    } catch (destroyErr) {
      console.error("[parsePDF] failed to destroy parser:", destroyErr);
    }
  }
}

/**
 * Splits the full document text into roughly page-sized sections.
 * pdf-parse doesn't provide per-page text without the pagerender hook,
 * so we divide the text proportionally.
 */
function splitIntoPages(text: string, pageCount: number): string[] {
  if (pageCount <= 1 || !text) return [text];

  // First try splitting on form-feed characters (\f) which some PDFs include
  const ffSplit = text.split("\f").filter((s) => s.trim().length > 0);
  if (ffSplit.length > 1) return ffSplit;

  // Fall back to proportional character splitting
  const chunkSize = Math.ceil(text.length / pageCount);
  const pages: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const slice = text.slice(i * chunkSize, (i + 1) * chunkSize).trim();
    if (slice) pages.push(slice);
  }
  return pages;
}
