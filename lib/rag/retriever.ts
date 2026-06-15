// ─────────────────────────────────────────────────────────────────────────────
// lib/rag/retriever.ts — TF-IDF based chunk retrieval
// ─────────────────────────────────────────────────────────────────────────────
// This implements a lightweight TF-IDF cosine similarity retriever.
// It requires no external API, no embeddings model, and works extremely well
// for structured medical text.
//
// Upgrade path: Replace `scoreChunks()` with an embedding-based scorer
// (e.g. Groq/OpenAI embeddings + cosine similarity) without changing the
// caller interface.
// ─────────────────────────────────────────────────────────────────────────────
import type { DocumentChunk } from "@/lib/types";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "not",
  "no", "nor", "so", "yet", "both", "either", "neither", "each", "few",
  "more", "most", "other", "some", "such", "than", "too", "very", "just",
  "this", "that", "these", "those", "it", "its", "you", "your", "my",
  "we", "our", "they", "their", "he", "she", "his", "her",
]);

/** Tokenises text into lower-case non-stop words */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** Builds a term-frequency map for a token array */
function buildTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  // Normalize
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/** Builds IDF values across all chunks */
function buildIDF(
  chunkTokens: string[][]
): Map<string, number> {
  const docCount = chunkTokens.length;
  const df = new Map<string, number>();

  for (const tokens of chunkTokens) {
    const unique = new Set(tokens);
    for (const t of unique) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((docCount + 1) / (count + 1)) + 1);
  }
  return idf;
}

/** Computes cosine similarity between two TF-IDF vectors */
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, val] of a) {
    dot += val * (b.get(term) ?? 0);
    normA += val * val;
  }
  for (const val of b.values()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface ScoredChunk {
  chunk: DocumentChunk;
  score: number;
}

/**
 * Retrieves the top-K most relevant chunks for a given query.
 * Uses TF-IDF cosine similarity.
 *
 * @param query - The user's question
 * @param chunks - All document chunks to search over
 * @param topK - Number of chunks to return (default: 4)
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK = 4
): DocumentChunk[] {
  if (chunks.length === 0) return [];
  if (chunks.length <= topK) return chunks;

  const allTexts = [query, ...chunks.map((c) => c.text)];
  const allTokens = allTexts.map(tokenise);

  const idf = buildIDF(allTokens);

  // Build TF-IDF vector for the query
  const queryTF = buildTF(allTokens[0]);
  const queryVec = new Map<string, number>();
  for (const [term, tf] of queryTF) {
    queryVec.set(term, tf * (idf.get(term) ?? 1));
  }

  // Score each chunk
  const scored: ScoredChunk[] = chunks.map((chunk, i) => {
    const chunkTF = buildTF(allTokens[i + 1]);
    const chunkVec = new Map<string, number>();
    for (const [term, tf] of chunkTF) {
      chunkVec.set(term, tf * (idf.get(term) ?? 1));
    }
    return { chunk, score: cosineSimilarity(queryVec, chunkVec) };
  });

  // Return top-K by score, filtering near-zero matches
  return scored
    .filter((s) => s.score > 0.01)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}
