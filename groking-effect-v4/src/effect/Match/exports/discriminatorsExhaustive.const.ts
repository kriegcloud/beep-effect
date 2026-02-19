/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: discriminatorsExhaustive
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.668Z
 *
 * Overview:
 * Matches values based on a discriminator field and **ensures all cases are handled**.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { type: "A"; a: string } | { type: "B"; b: number } | {
 *       type: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.discriminatorsExhaustive("type")({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   })
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
const exportName = "discriminatorsExhaustive";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values based on a discriminator field and **ensures all cases are handled**.";
const sourceExample =
  'import { Match, pipe } from "effect"\n\nconst match = pipe(\n  Match.type<\n    { type: "A"; a: string } | { type: "B"; b: number } | {\n      type: "C"\n      c: boolean\n    }\n  >(),\n  Match.discriminatorsExhaustive("type")({\n    A: (a) => a.a,\n    B: (b) => b.b,\n    C: (c) => c.c\n  })\n)';
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
