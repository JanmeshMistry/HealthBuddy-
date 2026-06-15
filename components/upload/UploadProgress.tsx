"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import type { UploadPhase } from "@/lib/types";

const STEPS: Array<{ phase: UploadPhase; label: string; description: string }> = [
  { phase: "uploading", label: "Uploading", description: "Securely transferring your file" },
  { phase: "parsing", label: "Parsing", description: "Extracting text from the PDF" },
  { phase: "summarizing", label: "Analyzing", description: "AI is reading your report" },
];

type StepState = "pending" | "active" | "done";

function getStepState(stepPhase: UploadPhase, currentPhase: UploadPhase): StepState {
  const order: UploadPhase[] = ["uploading", "parsing", "summarizing", "done"];
  const currentIdx = order.indexOf(currentPhase);
  const stepIdx = order.indexOf(stepPhase);
  if (currentIdx > stepIdx) return "done";
  if (currentIdx === stepIdx) return "active";
  return "pending";
}

interface UploadProgressProps {
  phase: UploadPhase;
}

export function UploadProgress({ phase }: UploadProgressProps) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Upload progress"
      className="w-full card-elevated rounded-2xl p-6 animate-fade-in"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-9 h-9">
          <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse-ring" />
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-green-600">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        </div>
        <div>
          <p className="font-display font-semibold text-green-900">Processing your report…</p>
          <p className="text-xs text-neutral-500">This takes 10–30 seconds</p>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = getStepState(step.phase, phase);
          return (
            <div key={step.phase} className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={[
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                  state === "done"
                    ? "bg-green-500 text-white"
                    : state === "active"
                    ? "bg-green-100 text-green-600 ring-2 ring-green-400 ring-offset-1"
                    : "bg-neutral-100 text-neutral-300",
                ].join(" ")}
                aria-hidden="true"
              >
                {state === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : state === "active" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    "text-sm font-medium transition-colors",
                    state === "done"
                      ? "text-green-700"
                      : state === "active"
                      ? "text-green-900"
                      : "text-neutral-400",
                  ].join(" ")}
                >
                  {step.label}
                </p>
                {state === "active" && (
                  <p className="text-xs text-neutral-500 animate-fade-in">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Progress bar for active step */}
              {state === "active" && (
                <div className="w-24 h-1 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
