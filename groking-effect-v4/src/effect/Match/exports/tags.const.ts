/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: tags
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Matches values based on their `_tag` field, mapping each tag to a corresponding handler.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match, pipe } from "effect"
 * 
 * const match = pipe(
 *   Match.type<
 *     { _tag: "A"; a: string } | { _tag: "B"; b: number } | {
 *       _tag: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.tags({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   }),
 *   Match.exhaustive
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MatchModule from "effect/Match";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tags";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values based on their `_tag` field, mapping each tag to a corresponding handler.";
const sourceExample = "import { Match, pipe } from \"effect\"\n\nconst match = pipe(\n  Match.type<\n    { _tag: \"A\"; a: string } | { _tag: \"B\"; b: number } | {\n      _tag: \"C\"\n      c: boolean\n    }\n  >(),\n  Match.tags({\n    A: (a) => a.a,\n    B: (b) => b.b,\n    C: (c) => c.c\n  }),\n  Match.exhaustive\n)";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
