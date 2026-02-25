#!/usr/bin/env bun
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect, Order, pipe, Terminal } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type PatternDefinition, PatternLevelOrder } from "../../patterns/schema.ts";
import { findMatches, HookInput, loadPatterns } from "./core.ts";

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal;
  const input = yield* S.decodeUnknownEffect(HookInput)(JSON.parse(yield* terminal.readLine));
  const patterns = yield* loadPatterns;

  const matchedPatterns = findMatches(input, patterns);

  if (A.length(matchedPatterns) === 0) return;

  const context = pipe(
    matchedPatterns,
    A.filter((p: PatternDefinition) => p.action === "context")
  );
  const permission = pipe(
    matchedPatterns,
    A.filter((p: PatternDefinition) => p.action !== "context")
  );

  if (input.hook_event_name === "PostToolUse" && A.length(context) > 0) {
    const blocks = pipe(
      context,
      A.map((p: PatternDefinition) => {
        const tag = p.tag ?? "pattern-suggestion";
        return `<${tag}>\n${p.body}\n</${tag}>`;
      })
    );
    yield* Console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: A.join(blocks, "\n\n"),
        },
      })
    );
  }

  if (input.hook_event_name === "PreToolUse" && A.length(permission) > 0) {
    const sorted = pipe(permission, A.sort(Order.mapInput(PatternLevelOrder, (p: PatternDefinition) => p.level)));
    const primary = pipe(sorted, A.head);

    if (O.isSome(primary)) {
      yield* Console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: primary.value.action,
            permissionDecisionReason: primary.value.body,
          },
        })
      );
    }
  }
});

BunRuntime.runMain(
  program.pipe(
    Effect.catch(() => Effect.void),
    Effect.provide(BunServices.layer)
  )
);
