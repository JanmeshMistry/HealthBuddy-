"use client";

import {
  Stethoscope,
  ClipboardList,
  MessageCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReportSummary } from "@/lib/types";
import { FindingCard } from "./FindingCard";
import { DisclaimerBanner } from "./DisclaimerBanner";

interface SummaryDashboardProps {
  summary: ReportSummary;
  onReset: () => void;
  onScrollToChat?: () => void;
}

export function SummaryDashboard({
  summary,
  onReset,
  onScrollToChat,
}: SummaryDashboardProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const concerningCount = summary.keyFindings.filter(
    (f) => f.status === "concerning"
  ).length;
  const notableCount = summary.keyFindings.filter(
    (f) => f.status === "notable"
  ).length;

  return (
    <section
      className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up"
      aria-label="Report summary"
    >
      {/* ── Summary header ─────────────────────────────────────────────── */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 text-green-700">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                  Report Analysis
                </p>
                <h2 className="font-display text-xl font-700 text-green-900">
                  {summary.reportType}
                </h2>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                {summary.keyFindings.filter((f) => f.status === "normal").length} Normal
              </span>
              {notableCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  {notableCount} Notable
                </span>
              )}
              {concerningCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  {concerningCount} Review
                </span>
              )}
            </div>
          </div>

          {/* Overall summary */}
          <p className="text-neutral-700 leading-relaxed text-[15px]">
            {summary.overallSummary}
          </p>

          {/* Plain English explanation */}
          {summary.plainEnglishExplanation && (
            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-1">
                In plain terms
              </p>
              <p className="text-sm text-green-700 leading-relaxed">
                {summary.plainEnglishExplanation}
              </p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner />

      {/* ── Key findings grid ──────────────────────────────────────────── */}
      {summary.keyFindings.length > 0 && (
        <div className="card-elevated rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-600 text-green-900 flex items-center gap-2 mb-5">
            <ClipboardList className="w-5 h-5 text-green-600" />
            Key Findings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.keyFindings.map((finding, i) => (
              <FindingCard key={`${finding.label}-${i}`} finding={finding} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Doctor discussion points ───────────────────────────────────── */}
      {summary.doctorDiscussionPoints.length > 0 && (
        <div className="card-elevated rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-600 text-green-900 flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Discuss with your doctor
          </h2>
          <ul className="space-y-2.5" role="list">
            {summary.doctorDiscussionPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-neutral-700 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Full analysis (collapsible) ────────────────────────────────── */}
      {summary.fullAnalysis && (
        <div className="card-elevated rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowFullAnalysis((prev) => !prev)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-green-50/50 transition-colors"
            aria-expanded={showFullAnalysis}
            aria-controls="full-analysis-content"
          >
            <h2 className="font-display text-lg font-600 text-green-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              Full Analysis
            </h2>
            {showFullAnalysis ? (
              <ChevronUp className="w-5 h-5 text-green-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-green-500" />
            )}
          </button>

          {showFullAnalysis && (
            <div
              id="full-analysis-content"
              className="px-6 pb-6 border-t border-green-50 animate-fade-in"
            >
              <div className="prose-healthbuddy pt-4 text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.fullAnalysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onScrollToChat && (
          <button
            onClick={onScrollToChat}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Ask a question
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-green-200 hover:bg-green-50 text-green-700 font-semibold rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Upload another report
        </button>
      </div>
    </section>
  );
}
