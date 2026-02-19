/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: tagStartsWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.902Z
 *
 * Overview:
 * Matches values where the `_tag` field starts with a given prefix.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe } from "effect"
 * import { Match } from "effect"
 *
 * const match = pipe(
 *   Match.type<{ _tag: "A" } | { _tag: "B" } | { _tag: "A.A" } | {}>(),
 *   Match.tagStartsWith("A", (_) => 1 as const),
 *   Match.tagStartsWith("B", (_) => 2 as const),
 *   Match.orElse((_) => 3 as const)
 * )
 *
 * console.log(match({ _tag: "A" })) // 1
 * console.log(match({ _tag: "B" })) // 2
 * console.log(match({ _tag: "A.A" })) // 1
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tagStartsWith";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values where the `_tag` field starts with a given prefix.";
const sourceExample =
  'import { pipe } from "effect"\nimport { Match } from "effect"\n\nconst match = pipe(\n  Match.type<{ _tag: "A" } | { _tag: "B" } | { _tag: "A.A" } | {}>(),\n  Match.tagStartsWith("A", (_) => 1 as const),\n  Match.tagStartsWith("B", (_) => 2 as const),\n  Match.orElse((_) => 3 as const)\n)\n\nconsole.log(match({ _tag: "A" })) // 1\nconsole.log(match({ _tag: "B" })) // 2\nconsole.log(match({ _tag: "A.A" })) // 1';
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
  bunContext: BunContext,
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
