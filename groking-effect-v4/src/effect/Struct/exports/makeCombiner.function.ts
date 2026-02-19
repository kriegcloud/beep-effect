/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: makeCombiner
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Creates a `Combiner` for a struct shape by providing a `Combiner` for each property. When two structs are combined, each property is merged using its corresponding combiner.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Struct } from "effect"
 * 
 * const C = Struct.makeCombiner<{ readonly n: number; readonly s: string }>({
 *   n: Number.ReducerSum,
 *   s: String.ReducerConcat
 * })
 * 
 * const result = C.combine({ n: 1, s: "hello" }, { n: 2, s: " world" })
 * console.log(result) // { n: 3, s: "hello world" }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StructModule from "effect/Struct";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeCombiner";
const exportKind = "function";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Creates a `Combiner` for a struct shape by providing a `Combiner` for each property. When two structs are combined, each property is merged using its corresponding combiner.";
const sourceExample = "import { Number, String, Struct } from \"effect\"\n\nconst C = Struct.makeCombiner<{ readonly n: number; readonly s: string }>({\n  n: Number.ReducerSum,\n  s: String.ReducerConcat\n})\n\nconst result = C.combine({ n: 1, s: \"hello\" }, { n: 2, s: \" world\" })\nconsole.log(result) // { n: 3, s: \"hello world\" }";
const moduleRecord = StructModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
