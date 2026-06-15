"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const isUser = message.role === "user";
  const hasCitations = (message.citations?.length ?? 0) > 0;

  return (
    <article
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3 animate-fade-in-up`}
      aria-label={`${isUser ? "Your" : "HealthBuddy"} message`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm mt-1"
          aria-hidden="true"
        >
          <span className="text-white text-xs font-bold">HB</span>
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Bubble */}
        <div
          className={[
            "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isUser ? "bubble-user" : "bubble-assistant text-neutral-800",
          ].join(" ")}
        >
          {message.content}
        </div>

        {/* Citations */}
        {hasCitations && (
          <div className="w-full">
            <button
              onClick={() => setCitationsOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
              aria-expanded={citationsOpen}
              aria-controls={`citations-${message.id}`}
            >
              <FileText className="w-3 h-3" />
              {message.citations!.length} source{message.citations!.length > 1 ? "s" : ""} from your report
              {citationsOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {citationsOpen && (
              <div
                id={`citations-${message.id}`}
                className="mt-2 space-y-2 animate-fade-in"
              >
                {message.citations!.map((citation) => (
                  <div
                    key={citation.chunkId}
                    className="px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-xs text-neutral-600"
                  >
                    <p className="text-green-700 font-semibold mb-1">
                      Page {citation.pageIndex + 1} · Excerpt {citation.chunkIndex + 1}
                    </p>
                    <p className="italic">&ldquo;{citation.excerpt}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <time
          className="text-[10px] text-neutral-400"
          dateTime={message.timestamp.toISOString()}
          aria-label={`Sent at ${message.timestamp.toLocaleTimeString()}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center mt-1"
          aria-hidden="true"
        >
          <span className="text-neutral-600 text-xs font-bold">You</span>
        </div>
      )}
    </article>
  );
}
