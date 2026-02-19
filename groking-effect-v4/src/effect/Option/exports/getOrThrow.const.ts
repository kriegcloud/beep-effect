/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getOrThrow
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Extracts the value from a `Some`, or throws a default `Error` for `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrThrow(Option.some(1)))
 * // Output: 1
 *
 * Option.getOrThrow(Option.none())
 * // throws Error: getOrThrow called on a None
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
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrThrow";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Extracts the value from a `Some`, or throws a default `Error` for `None`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.getOrThrow(Option.some(1)))\n// Output: 1\n\nOption.getOrThrow(Option.none())\n// throws Error: getOrThrow called on a None';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.getOrThrow as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSome = Effect.gen(function* () {
  const extracted = O.getOrThrow(O.some(1));
  yield* Console.log(`getOrThrow(some(1)) -> ${formatUnknown(extracted)}`);
});

const exampleNoneFailureMode = Effect.gen(function* () {
  const attempt = yield* attemptThunk(() => O.getOrThrow(O.none<number>()));
  if (attempt._tag === "Left") {
    const message = attempt.error instanceof Error ? attempt.error.message : formatUnknown(attempt.error);
    yield* Console.log(`getOrThrow(none()) threw -> ${message}`);
    return;
  }

  yield* Console.log(`Contract mismatch: none() returned ${formatUnknown(attempt.value)}`);
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
      title: "Source-Aligned Some Extraction",
      description: "Run the documented Some input and extract its inner value.",
      run: exampleSourceAlignedSome,
    },
    {
      title: "None Failure Mode",
      description: "Show the default thrown Error when getOrThrow receives None.",
      run: exampleNoneFailureMode,
    },
  ],
});

BunRuntime.runMain(program);
