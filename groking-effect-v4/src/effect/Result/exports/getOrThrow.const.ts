/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getOrThrow
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value or throws the raw failure value `E`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.getOrThrow(Result.succeed(1)))
 * // Output: 1
 *
 * // This would throw the string "error":
 * // Result.getOrThrow(Result.fail("error"))
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  attemptThunk,
  createPlaygroundProgram,
  formatUnknown,
  inspectNamedExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrThrow";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value or throws the raw failure value `E`.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.getOrThrow(Result.succeed(1)))\n// Output: 1\n\n// This would throw the string "error":\n// Result.getOrThrow(Result.fail("error"))';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.getOrThrow as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedUnwrap = Effect.gen(function* () {
  yield* Console.log("Unwrap a success and observe the thrown raw failure value.");
  const successValue = ResultModule.getOrThrow(ResultModule.succeed(1));
  yield* Console.log(`succeed(1) -> ${formatUnknown(successValue)}`);

  const thrown = yield* attemptThunk(() => ResultModule.getOrThrow(ResultModule.fail("error")));
  if (thrown._tag === "Left") {
    yield* Console.log(`fail("error") threw -> ${formatUnknown(thrown.error)}`);
    yield* Console.log(`thrown type -> ${typeof thrown.error}`);
  } else {
    yield* Console.log(`unexpected success -> ${formatUnknown(thrown.value)}`);
  }
});

const exampleRawFailureIdentity = Effect.gen(function* () {
  yield* Console.log("Failure payloads are thrown directly (no wrapping).");
  const payload = { code: 503, retryable: true } as const;
  const thrown = yield* attemptThunk(() => ResultModule.getOrThrow(ResultModule.fail(payload)));

  if (thrown._tag === "Left") {
    const sameReference = thrown.error === payload;
    yield* Console.log(`threw same object reference -> ${sameReference}`);
    yield* Console.log(`thrown payload -> ${formatUnknown(thrown.error)}`);
  } else {
    yield* Console.log(`unexpected success -> ${formatUnknown(thrown.value)}`);
  }
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Unwrap",
      description: 'Show succeed(1) unwrapping and fail("error") throwing the raw failure value.',
      run: exampleSourceAlignedUnwrap,
    },
    {
      title: "Raw Failure Identity",
      description: "Demonstrate that object failures are thrown directly, preserving identity.",
      run: exampleRawFailureIdentity,
    },
  ],
});

BunRuntime.runMain(program);
