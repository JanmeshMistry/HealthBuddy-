// ─────────────────────────────────────────────────────────────────────────────
// lib/ai/provider.ts — Abstract AI provider interface
// ─────────────────────────────────────────────────────────────────────────────
import type { AICompletionOptions, AICompletionResult, AIProviderName } from "@/lib/types";

/**
 * All AI providers must implement this interface.
 * This allows swapping Groq ↔ OpenRouter ↔ any future provider
 * without touching application logic.
 */
export interface AIProvider {
  readonly name: AIProviderName;
  complete(options: AICompletionOptions): Promise<AICompletionResult>;
}

/**
 * Factory: returns the configured AI provider based on environment variables.
 * Defaults to Groq if AI_PROVIDER is not set.
 */
export async function getAIProvider(): Promise<AIProvider> {
  const providerName = (process.env.AI_PROVIDER ?? "groq") as AIProviderName;

  if (providerName === "openrouter") {
    const { OpenRouterProvider } = await import("./openrouter-provider");
    return new OpenRouterProvider();
  }

  const { GroqProvider } = await import("./groq-provider");
  return new GroqProvider();
}
