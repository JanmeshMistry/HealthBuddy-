"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DropZone({
  file,
  onFileSelect,
  onSubmit,
  isLoading,
  disabled = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (selectedFile: File) => {
      setValidationError(null);

      if (!selectedFile.name.toLowerCase().endsWith(".pdf") && selectedFile.type !== "application/pdf") {
        setValidationError("Only PDF files are supported.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(
          `File is too large (${formatFileSize(selectedFile.size)}). Maximum size is ${MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }

      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) validateAndSelect(dropped);
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateAndSelect(selected);
    },
    [validateAndSelect]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileSelect(null);
      setValidationError(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFileSelect]
  );

  const isDisabled = disabled || isLoading;

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-label="Upload PDF file"
        aria-disabled={isDisabled}
        onClick={() => !isDisabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
            inputRef.current?.click();
          }
        }}
        onDrop={!isDisabled ? handleDrop : undefined}
        onDragOver={!isDisabled ? handleDragOver : undefined}
        onDragLeave={!isDisabled ? handleDragLeave : undefined}
        className={[
          "relative w-full rounded-2xl transition-all duration-200 cursor-pointer",
          "min-h-[180px] flex items-center justify-center p-8",
          isDisabled ? "opacity-60 cursor-not-allowed" : "",
          file
            ? "border-2 border-solid border-green-300 bg-green-50"
            : isDragOver
            ? "dropzone-active shadow-inner"
            : "dropzone-idle hover:border-green-400 hover:bg-green-50/50",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          id="healthbuddy-file-upload"
          onChange={handleInputChange}
          disabled={isDisabled}
          aria-hidden="true"
        />

        {file ? (
          /* File selected state */
          <div className="flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm break-all">
                {file.name}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {formatFileSize(file.size)} • PDF
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready to analyze
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-green-400 hover:text-green-700 hover:bg-green-100 transition-colors"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={[
                "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                isDragOver
                  ? "bg-green-200 text-green-700 scale-110"
                  : "bg-green-100 text-green-500",
              ].join(" ")}
            >
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-700 text-sm">
                {isDragOver ? "Release to upload" : "Drop your PDF here"}
              </p>
              <p className="text-sm text-neutral-500 mt-0.5">
                or{" "}
                <span className="text-green-600 font-medium underline underline-offset-2 decoration-dashed">
                  click to browse
                </span>
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              PDF only · Up to {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {validationError}
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={onSubmit}
        disabled={!file || isLoading || !!validationError}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md shadow-green-100 hover:shadow-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
        aria-label="Analyze medical report"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Analyze Report
          </span>
        )}
      </Button>

      <p className="text-center text-xs text-neutral-400">
        Your report is processed privately and never stored permanently.
      </p>
    </div>
  );
}
