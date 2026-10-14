import { blink } from '@/blink/client'

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiProviderConfig {
  provider?: "gemini" | "openai" | "anthropic" | string;
  model?: string;
}

export async function lovableAiChat(
  messages: ChatMsg[],
  modelOrConfig: string | AiProviderConfig = "gemini-2.5-flash",
): Promise<string> {
  const cfg: AiProviderConfig =
    typeof modelOrConfig === "string"
      ? { provider: "gemini", model: modelOrConfig }
      : modelOrConfig;
  const provider = (cfg.provider || "gemini").toLowerCase();

  const defaults: Record<string, string> = {
    openai: "openai/gpt-4o-mini",
    anthropic: "anthropic/claude-sonnet-4-5",
    gemini: "google/gemini-2.5-flash",
  };
  const legacyModels: Record<string, string> = {
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "gpt-4o": "openai/gpt-4o",
    "gpt-4.1-mini": "openai/gpt-4.1-mini",
    "claude-3-5-haiku-latest": "anthropic/claude-haiku-4-5",
    "claude-3-5-sonnet-latest": "anthropic/claude-sonnet-4-5",
  };
  let model = cfg.model || defaults[provider] || "openai/gpt-4.1-mini";
  model = legacyModels[model] || model;
  if (!model.includes("/") && defaults[provider]) model = `${provider === "gemini" ? "google" : provider}/${model}`;
  // Legacy per-company provider keys are deliberately ignored; all inference is billed
  // through the server-side Blink AI gateway instead of calling vendors directly.
  const result = await blink.ai.generateText({ messages, model });
  return result.text.trim();
}
