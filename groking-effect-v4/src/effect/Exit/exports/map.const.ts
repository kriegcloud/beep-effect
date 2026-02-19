/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Transforms the success value of an Exit using the given function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 * 
 * const exit = Exit.succeed(21)
 * const doubled = Exit.map(exit, (x) => x * 2)
 * console.log(Exit.isSuccess(doubled) && doubled.value) // 42
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
import * as ExitModule from "effect/Exit";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Transforms the success value of an Exit using the given function.";
const sourceExample = "import { Exit } from \"effect\"\n\nconst exit = Exit.succeed(21)\nconst doubled = Exit.map(exit, (x) => x * 2)\nconsole.log(Exit.isSuccess(doubled) && doubled.value) // 42";
const moduleRecord = ExitModule as Record<string, unknown>;

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
