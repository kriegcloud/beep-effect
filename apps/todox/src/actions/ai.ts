"use server";

import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import { type AiErrorCode, LlmLive, TextImprovementService } from "../services/ai";

export interface AiError {
  readonly code: AiErrorCode;
  readonly message: string;
}

export type AiResult =
  | { readonly success: true; readonly text: string }
  | { readonly success: false; readonly error: AiError };

const TextImprovementLive = TextImprovementService.Default.pipe(Layer.provide(LlmLive));

export async function improveText(selectedText: string, instruction: string): Promise<AiResult> {
  const program = Effect.gen(function* () {
    const service = yield* TextImprovementService;
    const text = yield* service.improveText(selectedText, instruction);
    return { success: true, text } as const;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("AI text improvement failed", {
        code: error.code,
        selectedTextPreview: pipe(selectedText, Str.slice(0, 50)),
        instruction,
      })
    ),
    Effect.catchTag("TextImprovementError", (error) =>
      Effect.succeed({
        success: false,
        error: { code: error.code, message: error.message },
      } as const)
    ),
    Effect.provide(TextImprovementLive)
  );

  return Effect.runPromise(program);
}
