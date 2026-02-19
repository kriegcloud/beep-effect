/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: SinkUnifyIgnore
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:50:40.916Z
 *
 * Overview:
 * Interface used to ignore certain types during Sink unification. Part of the internal type system machinery.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Sink from "effect/Sink"
 *
 * // Used internally by the type system
 * type IgnoreConfig = Sink.SinkUnifyIgnore
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SinkModule from "effect/Sink";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SinkUnifyIgnore";
const exportKind = "interface";
const moduleImportPath = "effect/Sink";
const sourceSummary =
  "Interface used to ignore certain types during Sink unification. Part of the internal type system machinery.";
const sourceExample =
  'import type * as Sink from "effect/Sink"\n\n// Used internally by the type system\ntype IgnoreConfig = Sink.SinkUnifyIgnore';
const moduleRecord = SinkModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
