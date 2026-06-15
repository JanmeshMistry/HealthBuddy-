// ─────────────────────────────────────────────────────────────────────────────
// app/api/chat/route.ts — RAG-based grounded chat endpoint
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { sessionStore } from "@/lib/rag/session-store";
import { retrieveRelevantChunks } from "@/lib/rag/retriever";
import { getAIProvider } from "@/lib/ai/provider";
import { CHAT_SYSTEM_PROMPT, buildChatUserPrompt } from "@/lib/ai/prompts";
import type {
  ChatRequest,
  ChatSuccessResponse,
  ApiErrorResponse,
  ChatCitation,
  AIMessage,
} from "@/lib/types";

export const maxDuration = 30; // seconds

const MAX_HISTORY_TURNS = 6; // last N message pairs to include for context
const TOP_K_CHUNKS = 4;
const MAX_EXCERPT_LENGTH = 200;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ChatSuccessResponse | ApiErrorResponse>> {
  let body: ChatRequest;

  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  const { sessionId, message, history } = body;

  // ── Validate input ────────────────────────────────────────────────────────
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { error: "Missing sessionId. Please upload a report first." },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message cannot be empty." },
      { status: 400 }
    );
  }

  const trimmedMessage = message.trim().slice(0, 2000); // cap input length

  // ── Retrieve document chunks ──────────────────────────────────────────────
  const allChunks = sessionStore.getChunks(sessionId);

  if (!allChunks) {
    return NextResponse.json(
      {
        error:
          "Your session has expired or the document was not found. Please re-upload your report.",
      },
      { status: 404 }
    );
  }

  // ── RAG retrieval ─────────────────────────────────────────────────────────
  const relevantChunks = retrieveRelevantChunks(
    trimmedMessage,
    allChunks,
    TOP_K_CHUNKS
  );

  // ── Build citations ───────────────────────────────────────────────────────
  const citations: ChatCitation[] = relevantChunks.map((chunk) => ({
    chunkId: chunk.id,
    pageIndex: chunk.pageIndex,
    chunkIndex: chunk.chunkIndex,
    excerpt: chunk.text.slice(0, MAX_EXCERPT_LENGTH).trimEnd() + (chunk.text.length > MAX_EXCERPT_LENGTH ? "…" : ""),
  }));

  // ── Build message array ───────────────────────────────────────────────────
  const safeHistory = Array.isArray(history) ? history : [];
  const recentHistory = safeHistory.slice(-MAX_HISTORY_TURNS * 2);

  const messages: AIMessage[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    // Inject history for follow-up question support
    ...recentHistory.map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    {
      role: "user",
      content: buildChatUserPrompt(trimmedMessage, relevantChunks),
    },
  ];

  // ── Call AI ───────────────────────────────────────────────────────────────
  try {
    const provider = await getAIProvider();
    const result = await provider.complete({
      messages,
      temperature: 0.3,
      maxTokens: 1024,
    });

    return NextResponse.json({
      answer: result.content,
      citations,
    });
  } catch (err) {
    console.error("[chat] AI provider error:", err);
    return NextResponse.json(
      { error: "The AI assistant is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
