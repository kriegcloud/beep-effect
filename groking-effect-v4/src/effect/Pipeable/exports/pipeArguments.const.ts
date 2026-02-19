/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Pipeable
 * Export: pipeArguments
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Pipeable.ts
 * Generated: 2026-02-19T04:14:15.692Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Pipeable } from "effect"
 * 
 * // pipeArguments is used internally to implement efficient piping
 * function customPipe<A>(self: A, ...fns: Array<(a: any) => any>): unknown {
 *   return Pipeable.pipeArguments(self, arguments as any)
 * }
 * 
 * // Example usage
 * const add = (x: number) => (y: number) => x + y
 * const multiply = (x: number) => (y: number) => x * y
 * 
 * const result = customPipe(5, add(2), multiply(3))
 * console.log(result) // 21
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
import * as PipeableModule from "effect/Pipeable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pipeArguments";
const exportKind = "const";
const moduleImportPath = "effect/Pipeable";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Pipeable } from \"effect\"\n\n// pipeArguments is used internally to implement efficient piping\nfunction customPipe<A>(self: A, ...fns: Array<(a: any) => any>): unknown {\n  return Pipeable.pipeArguments(self, arguments as any)\n}\n\n// Example usage\nconst add = (x: number) => (y: number) => x + y\nconst multiply = (x: number) => (y: number) => x * y\n\nconst result = customPipe(5, add(2), multiply(3))\nconsole.log(result) // 21";
const moduleRecord = PipeableModule as Record<string, unknown>;

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
