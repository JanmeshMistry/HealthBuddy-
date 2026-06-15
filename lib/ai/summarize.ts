// ─────────────────────────────────────────────────────────────────────────────
// lib/ai/summarize.ts — Report summarization using AI provider
// ─────────────────────────────────────────────────────────────────────────────
import type { ReportSummary } from "@/lib/types";
import { getAIProvider } from "./provider";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from "./prompts";

const MEDICAL_KEYWORDS = [
  "blood", "test", "diagnosis", "report", "health", "scan", "medical",
  "doctor", "result", "level", "mg", "mmol", "g/dl", "units", "range",
  "normal", "abnormal", "patient", "specimen", "laboratory", "lab",
  "cholesterol", "glucose", "hemoglobin", "creatinine", "thyroid",
];

/**
 * Checks if the extracted text appears to be a medical document.
 * Prevents processing random files.
 */
function isMedicalDocument(text: string): boolean {
  const lower = text.toLowerCase();
  const matchCount = MEDICAL_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return matchCount >= 3;
}

/**
 * Parses the AI's JSON response into a ReportSummary.
 * Falls back gracefully if the response is malformed.
 */
function parseAISummaryResponse(rawContent: string): ReportSummary {
  // Try to find a JSON block in the string if it contains markdown or extra prose
  let cleaned = rawContent.trim();
  
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);
    
    // Construct fallback fullAnalysis if missing or empty
    let fullAnalysis = parsed.fullAnalysis;
    if (!fullAnalysis || typeof fullAnalysis !== "string" || fullAnalysis.trim().length === 0) {
      const findings = Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [];
      const discussionPoints = Array.isArray(parsed.doctorDiscussionPoints) ? parsed.doctorDiscussionPoints : [];
      
      fullAnalysis = `
### 📊 Detailed Findings Table

Below is a structured overview of all parameters analyzed in your report:

| Parameter / Test | Measured Value | Reference Range | Status / Alert |
| :--- | :--- | :--- | :--- |
${findings.map((f: any) => {
  const statusEmoji = f.status === "concerning" ? "🔴 Concerning" : f.status === "notable" ? "🟡 Notable" : "🟢 Normal";
  return `| **${f.label ?? "Unknown"}** | ${f.value ?? ""} ${f.unit ?? ""} | ${f.referenceRange || "Not specified"} | ${statusEmoji} |`;
}).join("\n")}

### 🩺 What this means for you
${parsed.plainEnglishExplanation || parsed.overallSummary || "Please review the key findings above."}

### 📋 Questions to ask your Doctor
${discussionPoints.map((p: string) => `- **${p}**`).join("\n")}
`.trim();
    }

    return {
      reportType: parsed.reportType ?? "Medical Report",
      overallSummary: parsed.overallSummary ?? "",
      keyFindings: Array.isArray(parsed.keyFindings)
        ? parsed.keyFindings.map(
            (f: {
              label?: string;
              value?: string;
              unit?: string;
              referenceRange?: string;
              status?: string;
              explanation?: string;
            }) => ({
              label: f.label ?? "",
              value: f.value ?? "",
              unit: f.unit ?? "",
              referenceRange: f.referenceRange ?? "",
              status:
                f.status === "notable" || f.status === "concerning"
                  ? f.status
                  : "normal",
              explanation: f.explanation ?? "",
            })
          )
        : [],
      doctorDiscussionPoints: Array.isArray(parsed.doctorDiscussionPoints)
        ? parsed.doctorDiscussionPoints
        : [],
      plainEnglishExplanation: parsed.plainEnglishExplanation ?? "",
      fullAnalysis,
    };
  } catch (parseError) {
    console.error("[parseAISummaryResponse] Failed to parse JSON:", parseError);
    
    // Attempt basic regex-based extraction for key fields
    const reportTypeMatch = rawContent.match(/"reportType"\s*:\s*"([^"]+)"/);
    const overallSummaryMatch = rawContent.match(/"overallSummary"\s*:\s*"([^"]+)"/);
    
    const reportType = reportTypeMatch ? reportTypeMatch[1] : "Medical Report";
    const overallSummary = overallSummaryMatch ? overallSummaryMatch[1] : "Your report analysis is ready.";

    // Render a clean fallback markdown document instead of dumping raw JSON
    const beautifulFallback = `
### 🔬 Report Analysis

We processed your medical report. Here is the compiled analysis of your findings:

${rawContent
  .replace(/[{}"[\]]/g, "") // strip JSON characters for display
  .split("\n")
  .map(line => line.trim())
  .filter(line => line.length > 0 && !line.startsWith("keyFindings") && !line.startsWith("doctorDiscussionPoints"))
  .map(line => `- ${line}`)
  .join("\n")}

***
*Disclaimer: This is an AI-generated explanation for educational purposes. Please consult your physician for any medical concerns.*
`;

    return {
      reportType,
      overallSummary,
      keyFindings: [],
      doctorDiscussionPoints: [],
      plainEnglishExplanation: "",
      fullAnalysis: beautifulFallback,
    };
  }
}

/**
 * Main entry point: given extracted PDF text, returns a structured ReportSummary.
 */
export async function generateReportSummary(
  documentText: string
): Promise<ReportSummary> {
  if (!isMedicalDocument(documentText)) {
    return {
      reportType: "Unknown Document",
      overallSummary:
        "This document doesn't appear to be a medical report. Please upload a valid medical report for analysis.",
      keyFindings: [],
      doctorDiscussionPoints: [],
      plainEnglishExplanation: "",
      fullAnalysis: "",
    };
  }

  const provider = await getAIProvider();

  const result = await provider.complete({
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: buildSummaryUserPrompt(documentText) },
    ],
    temperature: 0.3,
    maxTokens: 3000,
    jsonMode: true,
  });

  return parseAISummaryResponse(result.content);
}
