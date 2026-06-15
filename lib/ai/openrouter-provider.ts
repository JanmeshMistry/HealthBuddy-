// ─────────────────────────────────────────────────────────────────────────────
// lib/ai/openrouter-provider.ts — OpenRouter AI provider (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────
import OpenAI from "openai";
import type { AIProvider } from "./provider";
import type { AICompletionOptions, AICompletionResult } from "@/lib/types";

const DEFAULT_MODEL = "anthropic/claude-3-haiku";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterProvider implements AIProvider {
  readonly name = "openrouter" as const;

  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Please add it to your .env.local file."
      );
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://healthbuddy.app",
        "X-Title": "HealthBuddy",
      },
    });

    this.model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
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
