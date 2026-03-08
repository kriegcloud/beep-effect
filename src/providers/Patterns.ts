export const PROVIDER_PATTERNS: ReadonlyArray<{
  readonly provider: "gemini" | "openai" | "ollama" | "anthropic"
  readonly match: RegExp
}> = [
  { provider: "gemini", match: /gemini|vertex|google/i },
  { provider: "openai", match: /gpt|openai|o\d/i },
  { provider: "anthropic", match: /claude|anthropic/i },
  { provider: "ollama", match: /llama|mistral|qwen|ollama/i }
]

export const detectProviderFromModelId = (
  modelId: string
): "gemini" | "openai" | "ollama" | "anthropic" => {
  const hit = PROVIDER_PATTERNS.find((candidate) =>
    candidate.match.test(modelId)
  )
  return hit?.provider ?? "openai"
}
