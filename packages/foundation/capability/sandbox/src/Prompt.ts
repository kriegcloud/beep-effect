/**
 * Prompt resolution and template argument substitution.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Duration, Effect, FileSystem, HashSet } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Display } from "./Display.ts";
import { PromptError, PromptExpansionTimeoutError, type SandboxError } from "./Sandbox.errors.ts";
import { SandboxExecOptions, type SandboxHandle } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Prompt");

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/gu;
const SHELL_BLOCK_PATTERN = /!`([^`]+)`/gu;

/**
 * Marker inserted before literal shell blocks in prompt templates.
 *
 * @category utilities
 * @since 0.0.0
 */
export const SHELL_BLOCK_MARKER = "\u0000BEEP_SANDBOX_SHELL_BLOCK\u0000" as const;

const MARKED_SHELL_BLOCK_PATTERN = new RegExp(`!${SHELL_BLOCK_MARKER}\`([^\`]+)\``, "gu");
const DEFAULT_PROMPT_EXPANSION_TIMEOUT = Duration.millis(30_000);

/**
 * Built-in prompt argument keys injected by run orchestration.
 *
 * @category utilities
 * @since 0.0.0
 */
export const BUILT_IN_PROMPT_ARG_KEYS = ["SOURCE_BRANCH", "TARGET_BRANCH"] as const;

/**
 * Built-in prompt argument keys as a `HashSet` for membership checks.
 *
 * @category utilities
 * @since 0.0.0
 */
export const BUILT_IN_PROMPT_ARG_KEY_SET: HashSet.HashSet<string> = HashSet.fromIterable(BUILT_IN_PROMPT_ARG_KEYS);

/**
 * Built-in prompt argument key domain.
 *
 * @category schemas
 * @since 0.0.0
 */
export const BuiltInPromptArgKey = LiteralKit(BUILT_IN_PROMPT_ARG_KEYS).annotate(
  $I.annote("BuiltInPromptArgKey", {
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

const promptArgValueToText = (value: PromptArgValue): string => value.toString();

/**
 * Prompt source discriminator.
 *
 * @category schemas
 * @since 0.0.0
 */
export const PromptSource = LiteralKit(["Inline", "Template"]).annotate(
  $I.annote("PromptSource", {
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
 * Options for expanding prompt shell expressions.
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
 * @category getters
 * @since 0.0.0
 */
export const findMissingPromptArgKeys: {
  (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string>;
  (providedArgs: PromptArgs): (prompt: string) => ReadonlyArray<string>;
} = dual(2, (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string> => {
  const matches = [...prompt.matchAll(PLACEHOLDER_PATTERN)];
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
    missing.push(key);
  }

  return missing;
});

/**
 * Substitute `{{KEY}}` prompt arguments in a prompt template.
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
  const matches = [...markedPrompt.matchAll(PLACEHOLDER_PATTERN)];

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

  return markedPrompt.replace(PLACEHOLDER_PATTERN, (_match: string, key: string): string => {
    const value = args[key];

    return value === undefined ? "" : promptArgValueToText(value);
  });
});

const replaceMarkedShellBlocks = (
  prompt: string,
  matches: ReadonlyArray<RegExpMatchArray>,
  results: ReadonlyArray<string>
): string => {
  let result = prompt;

  for (let index = matches.length - 1; index >= 0; index--) {
    const match = matches[index];
    const start = match?.index;
    const replacement = results[index];

    if (match === undefined || start === undefined || replacement === undefined) {
      continue;
    }

    result = `${result.slice(0, start)}${replacement}${result.slice(start + match[0].length)}`;
  }

  return Str.replaceAll(SHELL_BLOCK_MARKER, "")(result);
};

const expandShellExpression = Effect.fn("Prompt.expandShellExpression")(function* <R>(
  sandbox: SandboxHandle<R>,
  cwd: string,
  command: string,
  timeout: Duration.Duration
) {
  const result = yield* sandbox
    .exec(
      command,
      new SandboxExecOptions({
        cwd,
      })
    )
    .pipe(
      Effect.timeoutOrElse({
        duration: timeout,
        orElse: () =>
          Effect.fail(
            PromptExpansionTimeoutError.new(
              "prompt expansion timeout",
              `Shell expression \`${command}\` timed out after ${Duration.toMillis(timeout)}ms`,
              {
                expression: command,
                timeoutMs: timeout,
              }
            )
          ),
      })
    );

  if (result.exitCode !== 0) {
    return yield* PromptError.new(
      result.stderr || result.stdout,
      `Command \`${command}\` exited with code ${result.exitCode}: ${result.stderr || result.stdout}`
    );
  }

  return Str.trimEnd(result.stdout);
});

/**
 * Expand marked shell prompt expressions inside a sandbox.
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
  Effect.fn("Prompt.expandPromptShellExpressions")(function* <R>(
    sandbox: SandboxHandle<R>,
    options: ExpandPromptShellExpressionsOptions
  ) {
    const matches = [...options.prompt.matchAll(MARKED_SHELL_BLOCK_PATTERN)];

    if (matches.length === 0) {
      return Str.replaceAll(SHELL_BLOCK_MARKER, "")(options.prompt);
    }

    const display = yield* Display;

    return yield* display.taskLog(
      "Expanding shell expressions",
      Effect.fn("Prompt.expandPromptShellExpressions.task")(function* (message) {
        const results = yield* Effect.forEach(
          matches,
          (match) => {
            const command = match[1] ?? "";

            return expandShellExpression(sandbox, options.cwd, command, options.timeoutMs);
          },
          { concurrency: "unbounded" }
        );

        for (let index = 0; index < matches.length; index++) {
          const command = matches[index]?.[1] ?? "";
          const result = results[index] ?? "";
          const tokens = Math.ceil(result.length / 4);

          message(`${command} => ~${tokens} tokens`);
        }

        return replaceMarkedShellBlocks(options.prompt, matches, results);
      })
    );
  })
);
