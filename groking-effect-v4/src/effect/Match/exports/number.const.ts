/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: number
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Matches values of type `number`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * const categorizeNumber = Match.type<unknown>().pipe(
 *   Match.when(Match.number, (num) => {
 *     if (Number.isNaN(num)) return "Not a number"
 *     if (!Number.isFinite(num)) return "Infinite"
 *     if (Number.isInteger(num)) return `Integer: ${num}`
 *     return `Float: ${num.toFixed(2)}`
 *   }),
 *   Match.orElse(() => "Not a number type")
 * )
 * 
 * console.log(categorizeNumber(42)) // "Integer: 42"
 * console.log(categorizeNumber(3.14)) // "Float: 3.14"
 * console.log(categorizeNumber(NaN)) // "Not a number"
 * console.log(categorizeNumber("hello")) // "Not a number type"
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
const exportName = "number";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values of type `number`.";
const sourceExample = "import { Match } from \"effect\"\n\nconst categorizeNumber = Match.type<unknown>().pipe(\n  Match.when(Match.number, (num) => {\n    if (Number.isNaN(num)) return \"Not a number\"\n    if (!Number.isFinite(num)) return \"Infinite\"\n    if (Number.isInteger(num)) return `Integer: ${num}`\n    return `Float: ${num.toFixed(2)}`\n  }),\n  Match.orElse(() => \"Not a number type\")\n)\n\nconsole.log(categorizeNumber(42)) // \"Integer: 42\"\nconsole.log(categorizeNumber(3.14)) // \"Float: 3.14\"\nconsole.log(categorizeNumber(NaN)) // \"Not a number\"\nconsole.log(categorizeNumber(\"hello\")) // \"Not a number type\"";
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
