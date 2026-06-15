"use client";

import { AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import type { ReportFinding } from "@/lib/types";

const STATUS_CONFIG = {
  normal: {
    icon: CheckCircle2,
    className: "status-normal border",
    iconClass: "text-green-600",
    label: "Normal",
    badgeBg: "bg-green-100 text-green-700",
  },
  notable: {
    icon: TrendingUp,
    className: "status-notable border",
    iconClass: "text-amber-500",
    label: "Notable",
    badgeBg: "bg-amber-100 text-amber-700",
  },
  concerning: {
    icon: AlertCircle,
    className: "status-concerning border",
    iconClass: "text-red-500",
    label: "Review",
    badgeBg: "bg-red-100 text-red-700",
  },
} as const;

interface FindingCardProps {
  finding: ReportFinding;
  index?: number;
}

export function FindingCard({ finding, index = 0 }: FindingCardProps) {
  const config = STATUS_CONFIG[finding.status];
  const Icon = config.icon;

  return (
    <article
      className={[
        "rounded-xl p-4 transition-all duration-200 hover:shadow-md animate-fade-in-up",
        config.className,
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`${finding.label}: ${finding.value}, status: ${finding.status}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 flex-shrink-0 ${config.iconClass}`} aria-hidden="true" />
          <h3 className="text-sm font-semibold truncate">{finding.label}</h3>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg}`}
        >
          {config.label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-xl font-bold font-display">{finding.value}</span>
        {finding.unit && (
          <span className="text-sm opacity-70">{finding.unit}</span>
        )}
      </div>

      {/* Reference range */}
      {finding.referenceRange && (
        <p className="text-xs opacity-60 mb-2">
          Reference: {finding.referenceRange}
        </p>
      )}

      {/* Explanation */}
      {finding.explanation && (
        <p className="text-xs opacity-80 leading-relaxed">{finding.explanation}</p>
      )}
    </article>
  );
}
