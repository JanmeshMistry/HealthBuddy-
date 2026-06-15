// ─────────────────────────────────────────────────────────────────────────────
// lib/rag/session-store.ts — In-memory session-scoped document store
// ─────────────────────────────────────────────────────────────────────────────
// Stores document chunks per session ID.
// Sessions expire after SESSION_TTL_MS to prevent unbounded memory growth.
//
// Upgrade path: Replace the Map with Redis (ioredis) or a vector DB (Pinecone,
// Weaviate) by swapping the implementation below while keeping the interface.
// ─────────────────────────────────────────────────────────────────────────────
import { randomUUID } from "crypto";
import type { DocumentChunk } from "@/lib/types";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

interface SessionEntry {
  chunks: DocumentChunk[];
  createdAt: number;
  lastAccessedAt: number;
}

class SessionStore {
  private store = new Map<string, SessionEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Run cleanup every 15 minutes in server context
    if (typeof globalThis.setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => this.evictExpired(), 15 * 60 * 1000);
    }
  }

  /** Creates a new session and stores chunks. Returns the session ID. */
  create(chunks: DocumentChunk[]): string {
    const sessionId = randomUUID();
    this.store.set(sessionId, {
      chunks,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    });
    return sessionId;
  }

  /** Retrieves chunks for a session. Returns null if session not found or expired. */
  getChunks(sessionId: string): DocumentChunk[] | null {
    const entry = this.store.get(sessionId);
    if (!entry) return null;

    if (Date.now() - entry.createdAt > SESSION_TTL_MS) {
      this.store.delete(sessionId);
      return null;
    }

    entry.lastAccessedAt = Date.now();
    return entry.chunks;
  }

  /** Explicitly removes a session. */
  remove(sessionId: string): void {
    this.store.delete(sessionId);
  }

  /** Returns the number of active sessions (for diagnostics). */
  get size(): number {
    return this.store.size;
  }

  /** Evicts sessions older than SESSION_TTL_MS */
  private evictExpired(): void {
    const now = Date.now();
    for (const [id, entry] of this.store) {
      if (now - entry.createdAt > SESSION_TTL_MS) {
        this.store.delete(id);
      }
    }
  }
}

// Singleton: Next.js hot-reloads can create multiple module instances in dev,
// so we attach the store to globalThis to survive HMR.
const globalStoreKey = "__healthbuddy_session_store__";
declare global {
  // eslint-disable-next-line no-var
  var __healthbuddy_session_store__: SessionStore | undefined;
}

if (!globalThis[globalStoreKey]) {
  globalThis[globalStoreKey] = new SessionStore();
}

export const sessionStore: SessionStore = globalThis[globalStoreKey]!;
