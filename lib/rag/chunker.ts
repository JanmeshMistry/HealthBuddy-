// ─────────────────────────────────────────────────────────────────────────────
// lib/rag/chunker.ts — Document chunking for RAG retrieval
// ─────────────────────────────────────────────────────────────────────────────
import type { DocumentChunk } from "@/lib/types";

const TARGET_CHUNK_SIZE = 500; // characters (~120 tokens)
const OVERLAP_SIZE = 80; // characters of overlap between chunks

/**
 * Splits the full document text into overlapping chunks.
 * Each chunk carries metadata (pageIndex, chunkIndex, char offsets).
 *
 * Strategy:
 * 1. Split by page if page data is available.
 * 2. Within each page, split on paragraph/sentence boundaries.
 * 3. Apply overlap to preserve context across chunk boundaries.
 */
export function chunkDocument(
  fullText: string,
  pages: string[]
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let globalCharOffset = 0;

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex];
    if (!pageText.trim()) continue;

    const pageChunks = splitPageIntoChunks(pageText);

    for (const rawChunk of pageChunks) {
      const trimmed = rawChunk.trim();
      if (trimmed.length < 20) continue; // Skip noise / empty chunks

      const charStart = globalCharOffset + fullText.indexOf(trimmed, globalCharOffset);
      const charEnd = charStart + trimmed.length;

      chunks.push({
        id: `chunk-${pageIndex}-${chunkIndex}`,
        text: trimmed,
        pageIndex,
        chunkIndex,
        charStart: Math.max(0, charStart),
        charEnd: Math.max(0, charEnd),
      });

      chunkIndex++;
    }

    globalCharOffset += pageText.length;
  }

  return chunks;
}

/**
 * Splits a single page's text into target-sized chunks with overlap.
 * Prefers paragraph and sentence boundaries over hard character cuts.
 */
function splitPageIntoChunks(text: string): string[] {
  // Split into paragraphs first
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    // If the paragraph alone exceeds the target size, split it further
    if (para.length > TARGET_CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = currentChunk.slice(-OVERLAP_SIZE); // carry overlap
      }

      const subChunks = splitLongParagraph(para);
      chunks.push(...subChunks.slice(0, -1));
      currentChunk = (subChunks.at(-1) ?? "").slice(-OVERLAP_SIZE);
      continue;
    }

    if (currentChunk.length + para.length + 2 > TARGET_CHUNK_SIZE) {
      chunks.push(currentChunk);
      // Start next chunk with overlap from previous
      currentChunk = currentChunk.slice(-OVERLAP_SIZE) + "\n\n" + para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/** Splits a long paragraph by sentence boundaries */
function splitLongParagraph(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > TARGET_CHUNK_SIZE) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
