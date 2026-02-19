/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: flip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Swaps the success and failure channels of a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.flip(Result.succeed(42)))
 * // Output: { _tag: "Failure", failure: 42, ... }
 *
 * console.log(Result.flip(Result.fail("error")))
 * // Output: { _tag: "Success", success: "error", ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flip";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Swaps the success and failure channels of a `Result`.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.flip(Result.succeed(42)))\n// Output: { _tag: "Failure", failure: 42, ... }\n\nconsole.log(Result.flip(Result.fail("error")))\n// Output: { _tag: "Success", success: "error", ... }';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAligned = Effect.gen(function* () {
  const flippedSuccess = ResultModule.flip(ResultModule.succeed(42));
  const flippedFailure = ResultModule.flip(ResultModule.fail("error"));

  yield* Console.log(`flip(succeed(42)) -> ${formatUnknown(flippedSuccess)}`);
  yield* Console.log(`flip(fail("error")) -> ${formatUnknown(flippedFailure)}`);
});

const exampleRoundTrip = Effect.gen(function* () {
  const originalSuccess = ResultModule.succeed({ id: 1, status: "ok" });
  const originalFailure = ResultModule.fail({ code: "E_TIMEOUT", retryable: true });

  const roundTripSuccess = ResultModule.flip(ResultModule.flip(originalSuccess));
  const roundTripFailure = ResultModule.flip(ResultModule.flip(originalFailure));

  yield* Console.log(`double-flip succeed tags: ${originalSuccess._tag} -> ${roundTripSuccess._tag}`);
  yield* Console.log(`double-flip fail tags: ${originalFailure._tag} -> ${roundTripFailure._tag}`);
  yield* Console.log(`roundTripSuccess -> ${formatUnknown(roundTripSuccess)}`);
  yield* Console.log(`roundTripFailure -> ${formatUnknown(roundTripFailure)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Source-Aligned Channel Swap",
      description: "Flip a success and a failure value, matching the JSDoc behavior.",
      run: exampleSourceAligned,
    },
    {
      title: "Double-Flip Round Trip",
      description: "Apply flip twice to confirm the original channel orientation is restored.",
      run: exampleRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
