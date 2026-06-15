"use client";

import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";

const MAX_LENGTH = 1000;

const SUGGESTIONS = [
  "What are my abnormal values?",
  "Explain this in simple terms",
  "Should I be concerned about any findings?",
  "What should I ask my doctor?",
  "What do normal values look like?",
];

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [canSend, onSend, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length > MAX_LENGTH) return;
      setValue(val);

      // Auto-resize
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    []
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      onSend(suggestion);
    },
    [onSend]
  );

  return (
    <div className="space-y-3">
      {/* Quick suggestions */}
      {!disabled && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Quick question suggestions">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              role="listitem"
              onClick={() => handleSuggestion(s)}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-2 bg-white border border-green-200 rounded-2xl shadow-sm focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-300 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your report… (Enter to send, Shift+Enter for new line)"
          disabled={disabled || isLoading}
          rows={1}
          aria-label="Chat message input"
          aria-multiline="true"
          className="flex-1 resize-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none px-2 py-1.5 leading-relaxed max-h-[120px] disabled:cursor-not-allowed scrollbar-thin"
          style={{ minHeight: "36px" }}
        />

        {/* Character count */}
        {value.length > MAX_LENGTH * 0.7 && (
          <span
            className={`self-end text-xs mb-1.5 px-1 ${
              value.length > MAX_LENGTH * 0.9 ? "text-red-400" : "text-neutral-400"
            }`}
            aria-live="polite"
          >
            {MAX_LENGTH - value.length}
          </span>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all duration-150 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed active:scale-95 self-end mb-0.5"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
