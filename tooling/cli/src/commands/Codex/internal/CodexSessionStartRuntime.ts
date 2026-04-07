/**
 * Codex SessionStart hook helpers backed by Graphiti and repo-local guidance.
 *
 * @module
 * @since 0.0.0
 */

import { SessionStartCommandInput } from "@beep/codex/Domain/Hooks/SessionStart.ts";
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Console, Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Codex/internal/CodexSessionStartRuntime");

class CodexSessionStartHookRuntimeError extends TaggedErrorClass<CodexSessionStartHookRuntimeError>(
  $I`CodexSessionStartHookRuntimeError`
)(
  "CodexSessionStartHookRuntimeError",
  {
    message: S.String,
  },
  $I.annote("CodexSessionStartHookRuntimeError", {
    description: "Raised when the Codex SessionStart hook input cannot be read or decoded.",
  })
) {}

const decodeSessionStartCommandInput = S.decodeUnknownSync(SessionStartCommandInput);
const isString = S.is(S.String);
const asString = (value: unknown): string | undefined => (isString(value) ? value : undefined);

const messageFromUnknown = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return String(error);
};

const parseHookInput = (text: string): Effect.Effect<Record<string, unknown>, CodexSessionStartHookRuntimeError> =>
  Effect.try({
    try: () => ({ ...decodeSessionStartCommandInput(JSON.parse(text)) }) as Record<string, unknown>,
    catch: (cause) =>
      new CodexSessionStartHookRuntimeError({
        message: `Failed to decode Codex SessionStart hook input: ${messageFromUnknown(cause)}`,
      }),
  });

/**
 * Read and decode the optional JSON payload passed to the Codex SessionStart hook via stdin.
 *
 * @returns Parsed hook payload when stdin contains JSON, otherwise `undefined`.
 * @category DomainModel
 * @since 0.0.0
 */
export const readHookInput: Effect.Effect<Record<string, unknown> | undefined, CodexSessionStartHookRuntimeError> =
  Effect.gen(function* () {
    if (process.stdin.isTTY) {
      return undefined;
    }

    const stdinText = yield* Effect.tryPromise({
      try: () =>
        new Promise<string>((resolve, reject) => {
          let buffer = "";
          process.stdin.setEncoding("utf8");
          process.stdin.on("data", (chunk) => {
            buffer += chunk;
          });
          process.stdin.on("end", () => resolve(buffer));
          process.stdin.on("error", reject);
        }),
      catch: (cause) =>
        new CodexSessionStartHookRuntimeError({
          message: `Failed to read Codex SessionStart hook input: ${messageFromUnknown(cause)}`,
        }),
    });

    const trimmed = stdinText.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    return yield* parseHookInput(trimmed);
  });

/**
 * Build the Graphiti-first startup guidance injected into the Codex SessionStart hook.
 *
 * @param source - Hook invocation source label reported by Codex.
 * @param cwd - Working directory supplied by the hook payload, when available.
 * @returns Human-readable startup guidance for the Codex SessionStart hook.
 * @category DomainModel
 * @since 0.0.0
 */
export const buildCodexSessionStartContext = (source: string, cwd: string | undefined): string =>
  [
    `Session source: ${source}.`,
    cwd === undefined ? undefined : `Working directory: ${cwd}.`,
    "Durable repo memory is Graphiti-first now; do not assume any legacy repo-memory tooling exists in this clone.",
    'When the `graphiti-memory` MCP is available, query it first for cross-session recall with `group_ids: ["beep-dev"]`; if a wrapper only accepts strings, pass the JSON literal `"[\\"beep-dev\\"]"`.',
    "High-signal commands: `bun run codex:hook:session-start`, `bun run graphiti:proxy`, `bun run graphiti:proxy:ensure`, `bun run check`, `bun run test`, and `bun run lint`.",
    "If Graphiti memory is unavailable, fall back to repo-local exploration plus the checked-in `.codex` and `.claude` guidance.",
    "Keep the repo defaults in mind early: schema-first domain models, typed errors, effect-first modules, and explicit service boundaries.",
  ]
    .filter((entry): entry is string => entry !== undefined)
    .join(" ");

/**
 * Encode the hook response shape expected by Codex.
 *
 * @param additionalContext - Context string to surface in the hook payload.
 * @returns JSON payload string for the Codex SessionStart hook.
 * @category DomainModel
 * @since 0.0.0
 */
export const buildSessionStartHookOutput = (additionalContext: string): string =>
  JSON.stringify(
    {
      continue: true,
      hookSpecificOutput: {
        additionalContext,
        hookEventName: "SessionStart",
      },
    },
    null,
    2
  );

/**
 * Emit Codex SessionStart hook output enriched with Graphiti-first startup guidance.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const runCodexSessionStartHook: Effect.Effect<void> = Effect.gen(function* () {
  const hookInput = yield* readHookInput;
  const source = asString(hookInput?.source) ?? "startup";
  const cwd = asString(hookInput?.cwd);
  const output = buildSessionStartHookOutput(buildCodexSessionStartContext(source, cwd));
  yield* Console.log(output);
}).pipe(
  Effect.catch((error) =>
    Console.log(buildSessionStartHookOutput(`Graphiti startup context failed softly: ${error.message}`))
  )
);
