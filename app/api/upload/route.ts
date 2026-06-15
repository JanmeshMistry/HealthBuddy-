// ─────────────────────────────────────────────────────────────────────────────
// app/api/upload/route.ts — PDF upload, parse, chunk, summarize
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { parsePDF, validatePDFFile, PDFParseError } from "@/lib/pdf/parser";
import { chunkDocument } from "@/lib/rag/chunker";
import { sessionStore } from "@/lib/rag/session-store";
import { generateReportSummary } from "@/lib/ai/summarize";
import type { UploadSuccessResponse, ApiErrorResponse } from "@/lib/types";

export const maxDuration = 60; // seconds — allow time for AI summarization

export async function POST(
  req: NextRequest
): Promise<NextResponse<UploadSuccessResponse | ApiErrorResponse>> {
  let file: File | null = null;

  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was provided. Please select a PDF to upload." },
        { status: 400 }
      );
    }

    // ── 1. Validate ──────────────────────────────────────────────────────────
    validatePDFFile(file);

    // ── 2. Parse ─────────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedDoc = await parsePDF(buffer);

    // ── 3. Chunk ─────────────────────────────────────────────────────────────
    const chunks = chunkDocument(parsedDoc.text, parsedDoc.pages);

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not extract usable content from this PDF. The file may be scanned or image-based.",
        },
        { status: 422 }
      );
    }

    // ── 4. Store chunks in session ────────────────────────────────────────────
    const sessionId = sessionStore.create(chunks);

    // ── 5. Summarize ──────────────────────────────────────────────────────────
    const summary = await generateReportSummary(parsedDoc.text);

    return NextResponse.json({
      success: true,
      sessionId,
      summary,
    });
  } catch (err) {
    if (err instanceof PDFParseError) {
      const statusMap: Record<string, number> = {
        TOO_LARGE: 413,
        WRONG_TYPE: 415,
        EMPTY: 422,
        SCANNED_PDF: 422,
        PARSE_FAILED: 422,
      };
      return NextResponse.json(
        { error: err.message },
        { status: statusMap[err.code] ?? 422 }
      );
    }

    // Log server-side but don't expose details to client
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong while processing your report. Please try again." },
      { status: 500 }
    );
  }
}
