/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: andRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:14:13.258Z
 *
 * Overview:
 * Combines two filters but only returns the result of the right filter.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Filter, Result } from "effect"
 * 
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const doubleNumbers = Filter.make((n: number) =>
 *   n > 0 ? Result.succeed(n * 2) : Result.fail(n)
 * )
 * 
 * const positiveDoubled = Filter.andRight(positiveNumbers, doubleNumbers)
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
import * as FilterModule from "effect/Filter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andRight";
const exportKind = "const";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Combines two filters but only returns the result of the right filter.";
const sourceExample = "import { Filter, Result } from \"effect\"\n\nconst positiveNumbers = Filter.fromPredicate((n: number) => n > 0)\nconst doubleNumbers = Filter.make((n: number) =>\n  n > 0 ? Result.succeed(n * 2) : Result.fail(n)\n)\n\nconst positiveDoubled = Filter.andRight(positiveNumbers, doubleNumbers)";
const moduleRecord = FilterModule as Record<string, unknown>;

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
