"use server";

import { openai } from "@ai-sdk/openai";
import { APICallError, LoadAPIKeyError, NoSuchModelError } from "@ai-sdk/provider";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText } from "ai";

export type AiErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "MODEL_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface AiError {
  readonly code: AiErrorCode;
  readonly message: string;
}

export type AiResult =
  | {
      readonly success: true;
      readonly stream: ReturnType<typeof createStreamableValue<string>>["value"];
    }
  | { readonly success: false; readonly error: AiError };

function categorizeError(err: unknown): AiError {
  // LoadAPIKeyError: API key not configured
  if (LoadAPIKeyError.isInstance(err)) {
    return {
      code: "API_KEY_MISSING",
      message: "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
    };
  }

  // NoSuchModelError: Model doesn't exist
  if (NoSuchModelError.isInstance(err)) {
    return {
      code: "MODEL_UNAVAILABLE",
      message: `The requested model is not available: ${err.modelId}`,
    };
  }

  // APICallError: HTTP-level errors from OpenAI
  if (APICallError.isInstance(err)) {
    const statusCode = err.statusCode;

    if (statusCode === 401) {
      return {
        code: "API_KEY_INVALID",
        message: "OpenAI API key is invalid or expired.",
      };
    }

    if (statusCode === 429) {
      return {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded. Please wait a moment and try again.",
      };
    }

    if (statusCode === 404) {
      return {
        code: "MODEL_UNAVAILABLE",
        message: "The requested model is not available or does not exist.",
      };
    }

    // Network-related errors (no status code or connection issues)
    if (statusCode === undefined || statusCode === 0) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error. Please check your connection and try again.",
      };
    }

    // Other API errors
    return {
      code: "UNKNOWN",
      message: err.message || `API error (status ${statusCode})`,
    };
  }

  // Check for network/timeout errors by name
  if (err instanceof Error) {
    const errorName = err.name.toLowerCase();
    const errorMessage = err.message.toLowerCase();

    if (
      errorName.includes("timeout") ||
      errorName.includes("abort") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("econnrefused") ||
      errorMessage.includes("enotfound") ||
      errorMessage.includes("network")
    ) {
      return {
        code: "NETWORK_ERROR",
        message: "Network error or timeout. Please check your connection and try again.",
      };
    }

    return {
      code: "UNKNOWN",
      message: err.message || "An unexpected error occurred",
    };
  }

  return {
    code: "UNKNOWN",
    message: "An unexpected error occurred",
  };
}

export async function improveText(selectedText: string, instruction: string): Promise<AiResult> {
  const systemPrompt = `You are a professional writing assistant. Your task is to improve or transform the given text according to the user's instruction.

IMPORTANT:
- Return ONLY the improved/transformed text
- Do NOT include explanations, comments, or meta-text
- Do NOT wrap the text in quotes or code blocks
- Preserve the original formatting style unless the instruction specifically asks to change it`;

  const userPrompt = `Here is the text to improve:
"""
${selectedText}
"""

Instruction: ${instruction}`;

  try {
    const result = streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    const stream = createStreamableValue(result.textStream);

    return { success: true, stream: stream.value };
  } catch (err) {
    const error = categorizeError(err);

    console.error("[AI Action Error]", {
      code: error.code,
      message: error.message,
      selectedTextPreview: selectedText.slice(0, 50),
      instruction: instruction.slice(0, 100),
    });

    return { success: false, error };
  }
}
