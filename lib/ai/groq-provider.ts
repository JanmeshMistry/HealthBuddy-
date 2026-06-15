// ─────────────────────────────────────────────────────────────────────────────
// lib/ai/groq-provider.ts — Groq AI provider implementation
// ─────────────────────────────────────────────────────────────────────────────
import Groq from "groq-sdk";
import type { AIProvider } from "./provider";
import type { AICompletionOptions, AICompletionResult } from "@/lib/types";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export class GroqProvider implements AIProvider {
  readonly name = "groq" as const;

  private client: Groq;
  private model: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is not set. Please add it to your .env.local file."
      );
    }

    this.client = new Groq({ apiKey });
    this.model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const { messages, temperature = 0.4, maxTokens = 2048, jsonMode = false } =
      options;

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    });

    const content = completion.choices[0]?.message?.content ?? "";

    return {
      content,
      model: this.model,
      provider: this.name,
    };
  }
}
