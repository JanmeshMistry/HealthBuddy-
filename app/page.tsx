"use client";

import { useRef, useCallback } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/hero/HeroSection";
import { DropZone } from "@/components/upload/DropZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { SummaryDashboard } from "@/components/summary/SummaryDashboard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useReport } from "@/hooks/use-report";
import { useChat } from "@/hooks/use-chat";

export default function HomePage() {
  const uploadSectionRef = useRef<HTMLElement>(null);
  const chatSectionRef = useRef<HTMLElement>(null);

  const report = useReport();
  const chat = useChat(report.sessionId);

  const scrollToUpload = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToChat = useCallback(() => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const isProcessing =
    report.phase === "uploading" ||
    report.phase === "parsing" ||
    report.phase === "summarizing";

  const isDone = report.phase === "done";
  const isError = report.phase === "error";
  const isIdle = report.phase === "idle";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero (shown only before upload starts) ──────────────────── */}
        {isIdle && <HeroSection onGetStarted={scrollToUpload} />}

        {/* ── Upload section ───────────────────────────────────────────── */}
        <section
          ref={uploadSectionRef}
          id="upload"
          className="scroll-mt-20 max-w-2xl mx-auto px-4 py-12 sm:py-16"
          aria-label="Upload your medical report"
        >
          {/* Upload card */}
          {!isDone && (
            <div className="card-elevated rounded-3xl p-6 sm:p-8 space-y-6">
              {isIdle && (
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-700 text-green-900">
                    Upload your report
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Supported format: PDF · Up to 15 MB
                  </p>
                </div>
              )}

              {/* Error state */}
              {isError && report.error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl animate-fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Something went wrong
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">{report.error}</p>
                    <button
                      onClick={report.reset}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Drop zone — shown when idle or error */}
              {(isIdle || isError) && (
                <DropZone
                  file={report.file}
                  onFileSelect={report.setFile}
                  onSubmit={report.upload}
                  isLoading={false}
                  disabled={false}
                />
              )}

              {/* Progress — shown while processing */}
              {isProcessing && <UploadProgress phase={report.phase} />}
            </div>
          )}
        </section>

        {/* ── Summary + Chat (shown after successful analysis) ──────────── */}
        {isDone && report.summary && (
          <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8 animate-fade-in-up">
            {/* Summary */}
            <SummaryDashboard
              summary={report.summary}
              onReset={report.reset}
              onScrollToChat={scrollToChat}
            />

            {/* Chat */}
            <section
              ref={chatSectionRef}
              id="chat"
              className="scroll-mt-8"
              aria-label="Chat with your report"
            >
              <div className="mb-4">
                <h2 className="font-display text-2xl font-700 text-green-900">
                  Have questions about your report?
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Ask anything — I&apos;ll answer from your uploaded document.
                </p>
              </div>
              <ChatPanel
                messages={chat.messages}
                isLoading={chat.isLoading}
                onSendMessage={chat.sendMessage}
                sessionId={report.sessionId}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-green-50/50 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500">
            HealthBuddy is an educational tool. It does not provide medical
            advice or replace professional care.
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Your reports are never stored permanently.
          </p>
        </div>
      </footer>
    </div>
  );
}
