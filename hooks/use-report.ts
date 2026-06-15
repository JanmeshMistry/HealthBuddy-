"use client";
// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-report.ts — Upload + analysis state machine
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";
import type { ReportSummary, UploadPhase, UploadSuccessResponse } from "@/lib/types";

export interface UseReportReturn {
  phase: UploadPhase;
  file: File | null;
  sessionId: string | null;
  summary: ReportSummary | null;
  error: string | null;
  setFile: (file: File | null) => void;
  upload: () => Promise<void>;
  reset: () => void;
}

export function useReport(): UseReportReturn {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async () => {
    if (!file) return;

    setError(null);
    setSessionId(null);
    setSummary(null);

    try {
      // Phase 1: uploading
      setPhase("uploading");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Phase 2: parsing (UI shows this while we await the response)
      setPhase("parsing");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Upload failed. Please try again.",
        }));
        throw new Error(
          (errorData as { error?: string }).error ?? "Upload failed."
        );
      }

      // Phase 3: summarizing
      setPhase("summarizing");

      const data = (await response.json()) as UploadSuccessResponse;

      setSessionId(data.sessionId);
      setSummary(data.summary);
      setPhase("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setPhase("error");
    }
  }, [file]);

  const reset = useCallback(() => {
    setPhase("idle");
    setFile(null);
    setSessionId(null);
    setSummary(null);
    setError(null);
  }, []);

  return {
    phase,
    file,
    sessionId,
    summary,
    error,
    setFile,
    upload,
    reset,
  };
}
