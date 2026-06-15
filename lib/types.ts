// ─────────────────────────────────────────────────────────────────────────────
// lib/types.ts — All shared TypeScript types for HealthBuddy
// ─────────────────────────────────────────────────────────────────────────────

// ── Document & Chunking ──────────────────────────────────────────────────────

export interface DocumentChunk {
  id: string;
  text: string;
  /** 0-indexed page number (best-effort from parser) */
  pageIndex: number;
  /** Position of this chunk within the full document */
  chunkIndex: number;
  charStart: number;
  charEnd: number;
}

// ── Report Summary ────────────────────────────────────────────────────────────

export type FindingStatus = "normal" | "notable" | "concerning";

export interface ReportFinding {
  label: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: FindingStatus;
  explanation: string;
}

export interface ReportSummary {
  reportType: string;
  overallSummary: string;
  keyFindings: ReportFinding[];
  /** Items the user should bring up with their doctor */
  doctorDiscussionPoints: string[];
  /** Plain-English explanation of the report as a whole */
  plainEnglishExplanation: string;
  /** Raw markdown for full detailed analysis (fallback) */
  fullAnalysis: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatCitation {
  chunkId: string;
  pageIndex: number;
  chunkIndex: number;
  /** A short relevant excerpt from the chunk */
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
  timestamp: Date;
}

// ── API payloads ──────────────────────────────────────────────────────────────

export interface UploadSuccessResponse {
  success: true;
  sessionId: string;
  summary: ReportSummary;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  history: Array<{ role: ChatRole; content: string }>;
}

export interface ChatSuccessResponse {
  answer: string;
  citations: ChatCitation[];
}

export interface ApiErrorResponse {
  success?: false;
  error: string;
  code?: string;
}

// ── Upload state machine ──────────────────────────────────────────────────────

export type UploadPhase =
  | "idle"
  | "uploading"
  | "parsing"
  | "summarizing"
  | "done"
  | "error";

export interface UploadState {
  phase: UploadPhase;
  file: File | null;
  sessionId: string | null;
  summary: ReportSummary | null;
  error: string | null;
}

// ── AI Provider ───────────────────────────────────────────────────────────────

export type AIProviderName = "groq" | "openrouter";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AICompletionResult {
  content: string;
  model: string;
  provider: AIProviderName;
}
