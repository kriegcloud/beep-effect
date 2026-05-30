/**
 * Prompt resolution and template argument substitution.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Duration, Effect, FileSystem, HashSet } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { Display } from "./Display.ts";
import { PromptError } from "./Sandbox.errors.ts";
import type { SandboxError } from "./Sandbox.errors.ts";
import type { SandboxHandle } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Prompt");

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/gu;
const SHELL_BLOCK_PATTERN = /!`([^`]+)`/gu;

/**
 * Marker inserted before literal shell blocks in prompt templates.
 *
 * @example
 * ```ts
 * import { SHELL_BLOCK_MARKER } from "@beep/sandbox/Prompt"
 *
 * console.log(SHELL_BLOCK_MARKER)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const SHELL_BLOCK_MARKER = "\u0000BEEP_SANDBOX_SHELL_BLOCK\u0000" as const;

const DEFAULT_PROMPT_EXPANSION_TIMEOUT = Duration.millis(30_000);

/**
 * Built-in prompt argument keys injected by run orchestration.
 *
 * @example
 * ```ts
 * import { BUILT_IN_PROMPT_ARG_KEYS } from "@beep/sandbox/Prompt"
 *
 * console.log(BUILT_IN_PROMPT_ARG_KEYS)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const BUILT_IN_PROMPT_ARG_KEYS = ["SOURCE_BRANCH", "TARGET_BRANCH"] as const;

/**
 * Built-in prompt argument keys as a `HashSet` for membership checks.
 *
 * @example
 * ```ts
 * import { BUILT_IN_PROMPT_ARG_KEY_SET } from "@beep/sandbox/Prompt"
 *
 * console.log(BUILT_IN_PROMPT_ARG_KEY_SET)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const BUILT_IN_PROMPT_ARG_KEY_SET: HashSet.HashSet<string> = HashSet.fromIterable(BUILT_IN_PROMPT_ARG_KEYS);

/**
 * Built-in prompt argument key domain.
 *
 * @example
 * ```ts
 * import { BuiltInPromptArgKey } from "@beep/sandbox/Prompt"
 *
 * console.log(BuiltInPromptArgKey)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const BuiltInPromptArgKey = LiteralKit(BUILT_IN_PROMPT_ARG_KEYS).pipe(
  $I.annoteSchema("BuiltInPromptArgKey", {
    description: "Built-in prompt argument key domain.",
  })
);

/**
 * Runtime type for {@link BuiltInPromptArgKey}.
 *
 * @category models
 * @since 0.0.0
 */
export type BuiltInPromptArgKey = typeof BuiltInPromptArgKey.Type;

/**
 * Primitive prompt argument value.
 *
 * @example
 * ```ts
 * import { PromptArgValue } from "@beep/sandbox/Prompt"
 *
 * console.log(PromptArgValue)
 * ```
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
 * @example
 * ```ts
 * import { PromptArgs } from "@beep/sandbox/Prompt"
 *
 * console.log(PromptArgs)
 * ```
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

const promptArgValueToText = (value: PromptArgValue): string => value.toString();

/**
 * Prompt source discriminator.
 *
 * @example
 * ```ts
 * import { PromptSource } from "@beep/sandbox/Prompt"
 *
 * console.log(PromptSource)
 * ```
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
 * @example
 * ```ts
 * import { ResolvePromptOptions } from "@beep/sandbox/Prompt"
 *
 * console.log(ResolvePromptOptions)
 * ```
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
 * @example
 * ```ts
 * import { ResolvedPrompt } from "@beep/sandbox/Prompt"
 *
 * console.log(ResolvedPrompt)
 * ```
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
 * Options for expanding prompt shell expressions.
 *
 * @example
 * ```ts
 * import { ExpandPromptShellExpressionsOptions } from "@beep/sandbox/Prompt"
 *
 * console.log(ExpandPromptShellExpressionsOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExpandPromptShellExpressionsOptions extends S.Class<ExpandPromptShellExpressionsOptions>(
  $I`ExpandPromptShellExpressionsOptions`
)(
  {
    cwd: S.String,
    prompt: S.String,
    timeoutMs: S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(DEFAULT_PROMPT_EXPANSION_TIMEOUT))),
  },
  $I.annote("ExpandPromptShellExpressionsOptions", {
    description: "Options for expanding prompt shell expressions.",
  })
) {}

/**
 * Resolve an inline prompt or prompt file.
 *
 * @example
 * ```ts
 * import { resolvePrompt } from "@beep/sandbox/Prompt"
 *
 * console.log(resolvePrompt)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const resolvePrompt = Effect.fn("Prompt.resolvePrompt")(function* (options: ResolvePromptOptions) {
  if (options.prompt !== undefined && options.promptFile !== undefined) {
    return yield* PromptError.new("prompt source conflict", "Cannot provide both prompt and promptFile");
  }

  if (options.prompt !== undefined) {
    return ResolvedPrompt.make({ source: "Inline", text: options.prompt });
  }

  if (options.promptFile === undefined) {
    return yield* PromptError.new("prompt source missing", "Must provide either prompt or promptFile.");
  }

  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs
    .readFileString(options.promptFile)
    .pipe(PromptError.mapError(`Failed to read prompt from ${options.promptFile}`));

  return ResolvedPrompt.make({ source: "Template", text });
});

/**
 * Fail when prompt arguments are provided with an inline prompt.
 *
 * @example
 * ```ts
 * import { validateNoArgsWithInlinePrompt } from "@beep/sandbox/Prompt"
 *
 * console.log(validateNoArgsWithInlinePrompt)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const validateNoArgsWithInlinePrompt = Effect.fn("Prompt.validateNoArgsWithInlinePrompt")(function* (
  args: PromptArgs
) {
  if (R.isEmptyRecord(args)) {
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
 * @example
 * ```ts
 * import { validateNoBuiltInArgOverride } from "@beep/sandbox/Prompt"
 *
 * console.log(validateNoBuiltInArgOverride)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const validateNoBuiltInArgOverride = Effect.fn("Prompt.validateNoBuiltInArgOverride")(function* (
  args: PromptArgs
) {
  for (const key of BUILT_IN_PROMPT_ARG_KEYS) {
    if (R.has(key)(args)) {
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
 * @example
 * ```ts
 * import { findMissingPromptArgKeys } from "@beep/sandbox/Prompt"
 *
 * console.log(findMissingPromptArgKeys)
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const findMissingPromptArgKeys: {
  (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string>;
  (providedArgs: PromptArgs): (prompt: string) => ReadonlyArray<string>;
} = dual(2, (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string> => {
  const matches = [...Str.matchAll(PLACEHOLDER_PATTERN)(prompt)];
  let seen = HashSet.empty<string>();
  const missing = A.empty<string>();

  for (const match of matches) {
    const key = match[1];
    if (key === undefined || HashSet.has(seen, key)) {
      continue;
    }
    seen = HashSet.add(seen, key);
    if (BuiltInPromptArgKey.is.SOURCE_BRANCH(key) || BuiltInPromptArgKey.is.TARGET_BRANCH(key)) {
      continue;
    }
    if (R.has(key)(providedArgs)) {
      continue;
    }
    A.appendInPlace(missing, key);
  }

  return missing;
});

/**
 * Substitute `{{KEY}}` prompt arguments in a prompt template.
 *
 * @example
 * ```ts
 * import { substitutePromptArgs } from "@beep/sandbox/Prompt"
 *
 * console.log(substitutePromptArgs)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const substitutePromptArgs = Effect.fn("Prompt.substitutePromptArgs")(function* (
  prompt: string,
  args: PromptArgs,
  silentKeys: HashSet.HashSet<string> = HashSet.empty()
) {
  const display = yield* Display;
  const markedPrompt = Str.replace(
    SHELL_BLOCK_PATTERN,
    `!${SHELL_BLOCK_MARKER}\`$1\``
  )(Str.replaceAll(SHELL_BLOCK_MARKER, "")(prompt));
  const matches = [...Str.matchAll(PLACEHOLDER_PATTERN)(markedPrompt)];

  for (const key of findMissingPromptArgKeys(markedPrompt, args)) {
    return yield* PromptError.new(
      "missing prompt argument",
      `Prompt argument "{{${key}}}" has no matching value in promptArgs`
    );
  }

  let referenced = HashSet.empty<string>();
  for (const match of matches) {
    if (match[1] !== undefined) {
      referenced = HashSet.add(referenced, match[1]);
    }
  }

  for (const key of R.keys(args)) {
    if (!HashSet.has(referenced, key) && !HashSet.has(silentKeys, key)) {
      yield* display.status(`Prompt argument "${key}" was provided but not referenced in the prompt`, "Warn");
    }
  }

  return Str.replaceWith(PLACEHOLDER_PATTERN, (_match, key): string => {
    if (!P.isString(key)) {
      return "";
    }

    const value = args[key];

    return value === undefined ? "" : promptArgValueToText(value);
  })(markedPrompt);
});

/**
 * Normalize marked shell prompt expressions without executing repository-controlled commands.
 *
 * @example
 * ```ts
 * import { expandPromptShellExpressions } from "@beep/sandbox/Prompt"
 *
 * console.log(expandPromptShellExpressions)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const expandPromptShellExpressions: {
  <R>(
    sandbox: SandboxHandle<R>,
    options: ExpandPromptShellExpressionsOptions
  ): Effect.Effect<string, SandboxError, R | Display>;
  <R>(
    options: ExpandPromptShellExpressionsOptions
  ): (sandbox: SandboxHandle<R>) => Effect.Effect<string, SandboxError, R | Display>;
} = dual(
  2,
  Effect.fn("Prompt.expandPromptShellExpressions")(
    <R>(_sandbox: SandboxHandle<R>, options: ExpandPromptShellExpressionsOptions) =>
      Effect.succeed(Str.replaceAll(SHELL_BLOCK_MARKER, "")(options.prompt))
  )
);
