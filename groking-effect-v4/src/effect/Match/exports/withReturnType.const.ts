/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: withReturnType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.673Z
 *
 * Overview:
 * Ensures that all branches of a matcher return a specific type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const match = Match.type<{ a: number } | { b: string }>().pipe(
 *   // Ensure all branches return a string
 *   Match.withReturnType<string>(),
 *   // ❌ Type error: 'number' is not assignable to type 'string'
 *   // @ts-expect-error
 *   Match.when({ a: Match.number }, (_) => _.a),
 *   // ✅ Correct: returns a string
 *   Match.when({ b: Match.string }, (_) => _.b),
 *   Match.exhaustive
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withReturnType";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Ensures that all branches of a matcher return a specific type.";
const sourceExample =
  "import { Match } from \"effect\"\n\nconst match = Match.type<{ a: number } | { b: string }>().pipe(\n  // Ensure all branches return a string\n  Match.withReturnType<string>(),\n  // ❌ Type error: 'number' is not assignable to type 'string'\n  // @ts-expect-error\n  Match.when({ a: Match.number }, (_) => _.a),\n  // ✅ Correct: returns a string\n  Match.when({ b: Match.string }, (_) => _.b),\n  Match.exhaustive\n)";
const moduleRecord = MatchModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
