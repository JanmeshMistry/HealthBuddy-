"use client";

import { useEffect, useRef } from "react";
import { MessageSquare, Bot } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  sessionId: string | null;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
        <Bot className="w-7 h-7 text-green-600" />
      </div>
      <h3 className="font-display font-semibold text-green-900 mb-2">
        Ask me about your report
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
        I can explain findings, clarify medical terms, and tell you what to
        discuss with your doctor — all based on your uploaded document.
      </p>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm">
        <span className="text-white text-xs font-bold">HB</span>
      </div>
      <div className="bubble-assistant px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  sessionId,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDisabled = !sessionId;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section
      aria-label="Report chat assistant"
      className="w-full card-elevated rounded-2xl overflow-hidden flex flex-col"
      style={{ minHeight: "480px", maxHeight: "640px" }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-green-100 bg-green-50/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-100 text-green-700">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display font-600 text-green-900 text-sm">
            Chat with your report
          </h2>
          <p className="text-xs text-neutral-500">
            Answers grounded in your uploaded document
          </p>
        </div>
        {messages.length > 0 && (
          <span className="ml-auto text-xs text-neutral-400">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Messages list */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {isLoading && <ThinkingIndicator />}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="px-4 sm:px-5 py-4 border-t border-green-100">
        {isDisabled ? (
          <p className="text-center text-sm text-neutral-400 py-2">
            Upload a report above to start chatting
          </p>
        ) : (
          <ChatInput
            onSend={onSendMessage}
            isLoading={isLoading}
            disabled={isDisabled}
          />
        )}
      </div>
    </section>
  );
}
