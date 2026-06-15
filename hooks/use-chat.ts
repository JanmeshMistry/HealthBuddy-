"use client";
// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-chat.ts — Chat state management with conversation history
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";
import type {
  ChatMessage,
  ChatSuccessResponse,
} from "@/lib/types";

/** Uses built-in crypto.randomUUID (available in all modern browsers & Node 14.17+) */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(sessionId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Build history from existing messages for follow-up context
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: content.trim(), history }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({
            error: "Something went wrong.",
          }));
          throw new Error(
            (errData as { error?: string }).error ?? "Request failed."
          );
        }

        const data = (await response.json()) as ChatSuccessResponse;

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: data.answer,
          citations: data.citations,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to get a response.";
        setError(message);

        // Add a visible error message in the chat
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant" as const,
            content: `I'm sorry, I ran into an issue: ${message}. Please try again.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
