/**
 * Prompt resolution and template argument substitution.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Effect, FileSystem } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Display } from "./Display.ts";
import { PromptError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("Prompt");

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/gu;
const SHELL_BLOCK_PATTERN = /!`([^`]+)`/gu;

/**
 * Marker inserted before literal shell blocks in prompt templates.
 *
 * @category configuration
 * @since 0.0.0
 */
export const SHELL_BLOCK_MARKER = "\u0000BEEP_SANDBOX_SHELL_BLOCK\u0000" as const;

/**
 * Built-in prompt argument keys injected by run orchestration.
 *
 * @category configuration
 * @since 0.0.0
 */
export const BUILT_IN_PROMPT_ARG_KEYS = ["SOURCE_BRANCH", "TARGET_BRANCH"] as const;

/**
 * Primitive prompt argument value.
 *
 * @category schemas
 * @since 0.0.0
 */
export const PromptArgValue = S.Union([S.String, S.Number, S.Boolean]).pipe(
  $I.annoteSchema("PromptArgValue", {
    description: "Primitive prompt argument value.",
  })
);

/**
 * Runtime type for {@link PromptArgValue}.
 *
 * @category models
 * @since 0.0.0
 */
export type PromptArgValue = typeof PromptArgValue.Type;

/**
 * Prompt argument map.
 *
 * @category schemas
 * @since 0.0.0
 */
export const PromptArgs = S.Record(S.String, PromptArgValue).pipe(
  $I.annoteSchema("PromptArgs", {
    description: "Prompt argument map.",
  })
);

/**
 * Runtime type for {@link PromptArgs}.
 *
 * @category models
 * @since 0.0.0
 */
export type PromptArgs = typeof PromptArgs.Type;

/**
 * Prompt source discriminator.
 *
 * @category schemas
 * @since 0.0.0
 */
export const PromptSource = LiteralKit(["Inline", "Template"]).pipe(
  $I.annoteSchema("PromptSource", {
    description: "Prompt source discriminator.",
  })
);

/**
 * Runtime type for {@link PromptSource}.
 *
 * @category models
 * @since 0.0.0
 */
export type PromptSource = typeof PromptSource.Type;

/**
 * Options for resolving a prompt.
 *
 * @category models
 * @since 0.0.0
 */
export class ResolvePromptOptions extends S.Class<ResolvePromptOptions>($I`ResolvePromptOptions`)(
  {
    prompt: S.optionalKey(S.String),
    promptFile: S.optionalKey(S.String),
  },
  $I.annote("ResolvePromptOptions", {
    description: "Options for resolving a prompt.",
  })
) {}

/**
 * Resolved prompt text and source.
 *
 * @category models
 * @since 0.0.0
 */
export class ResolvedPrompt extends S.Class<ResolvedPrompt>($I`ResolvedPrompt`)(
  {
    source: PromptSource,
    text: S.String,
  },
  $I.annote("ResolvedPrompt", {
    description: "Resolved prompt text and source.",
  })
) {}

/**
 * Resolve an inline prompt or prompt file.
 *
 * @category combinators
 * @since 0.0.0
 */
export const resolvePrompt = Effect.fn("Prompt.resolvePrompt")(function* (options: ResolvePromptOptions) {
  if (options.prompt !== undefined && options.promptFile !== undefined) {
    return yield* PromptError.new("prompt source conflict", "Cannot provide both prompt and promptFile");
  }

  if (options.prompt !== undefined) {
    return new ResolvedPrompt({ source: "Inline", text: options.prompt });
  }

  if (options.promptFile === undefined) {
    return yield* PromptError.new("prompt source missing", "Must provide either prompt or promptFile.");
  }

  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs
    .readFileString(options.promptFile)
    .pipe(PromptError.mapError(`Failed to read prompt from ${options.promptFile}`));

  return new ResolvedPrompt({ source: "Template", text });
});

/**
 * Fail when prompt arguments are provided with an inline prompt.
 *
 * @category combinators
 * @since 0.0.0
 */
export const validateNoArgsWithInlinePrompt = Effect.fn("Prompt.validateNoArgsWithInlinePrompt")(function* (
  args: PromptArgs
) {
  if (Object.keys(args).length === 0) {
    return;
  }

  return yield* PromptError.new(
    "prompt argument misuse",
    "promptArgs is only supported with promptFile. Inline prompts are passed to the agent as-is."
  );
});

/**
 * Fail when callers override built-in prompt arguments.
 *
 * @category combinators
 * @since 0.0.0
 */
export const validateNoBuiltInArgOverride = Effect.fn("Prompt.validateNoBuiltInArgOverride")(function* (
  args: PromptArgs
) {
  for (const key of BUILT_IN_PROMPT_ARG_KEYS) {
    if (Object.hasOwn(args, key)) {
      return yield* PromptError.new(
        "built-in prompt argument override",
        `"${key}" is a built-in prompt argument and cannot be overridden via promptArgs`
      );
    }
  }
});

/**
 * Find placeholders that are missing corresponding prompt arguments.
 *
 * @category getters
 * @since 0.0.0
 */
export const findMissingPromptArgKeys = (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string> => {
  const matches = [...prompt.matchAll(PLACEHOLDER_PATTERN)];
  const seen = new Set<string>();
  const missing: Array<string> = [];

  for (const match of matches) {
    const key = match[1];
    if (key === undefined || seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (BUILT_IN_PROMPT_ARG_KEYS.includes(key as (typeof BUILT_IN_PROMPT_ARG_KEYS)[number])) {
      continue;
    }
    if (Object.hasOwn(providedArgs, key)) {
      continue;
    }
    missing.push(key);
  }

  return missing;
};

/**
 * Substitute `{{KEY}}` prompt arguments in a prompt template.
 *
 * @category combinators
 * @since 0.0.0
 */
export const substitutePromptArgs = Effect.fn("Prompt.substitutePromptArgs")(function* (
  prompt: string,
  args: PromptArgs,
  silentKeys: ReadonlySet<string> = new Set()
) {
  const display = yield* Display;
  const markedPrompt = Str.replace(
    SHELL_BLOCK_PATTERN,
    `!${SHELL_BLOCK_MARKER}\`$1\``
  )(Str.replaceAll(SHELL_BLOCK_MARKER, "")(prompt));
  const matches = [...markedPrompt.matchAll(PLACEHOLDER_PATTERN)];

  for (const key of findMissingPromptArgKeys(markedPrompt, args)) {
    return yield* PromptError.new(
      "missing prompt argument",
      `Prompt argument "{{${key}}}" has no matching value in promptArgs`
    );
  }

  const referenced = new Set<string>();
  for (const match of matches) {
    if (match[1] !== undefined) {
      referenced.add(match[1]);
    }
  }

  for (const key of Object.keys(args)) {
    if (!referenced.has(key) && !silentKeys.has(key)) {
      yield* display.status(`Prompt argument "${key}" was provided but not referenced in the prompt`, "Warn");
    }
  }

  return markedPrompt.replace(PLACEHOLDER_PATTERN, (_match, key: string) => String(args[key]));
});
