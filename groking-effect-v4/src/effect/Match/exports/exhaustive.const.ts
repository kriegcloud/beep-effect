/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: exhaustive
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.900Z
 *
 * Overview:
 * The `Match.exhaustive` method finalizes the pattern matching process by ensuring that all possible cases are accounted for. If any case is missing, TypeScript will produce a type error. This is particularly useful when working with unions, as it helps prevent unintended gaps in pattern matching.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * // Create a matcher for string or number values
 * const match = Match.type<string | number>().pipe(
 *   // Match when the value is a number
 *   Match.when(Match.number, (n) => `number: ${n}`),
 *   // Mark the match as exhaustive, ensuring all cases are handled
 *   // TypeScript will throw an error if any case is missing
 *   // @ts-expect-error Type 'string' is not assignable to type 'never'
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
const exportName = "exhaustive";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "The `Match.exhaustive` method finalizes the pattern matching process by ensuring that all possible cases are accounted for. If any case is missing, TypeScript will produce a typ...";
const sourceExample = "import { Match } from \"effect\"\n\n// Create a matcher for string or number values\nconst match = Match.type<string | number>().pipe(\n  // Match when the value is a number\n  Match.when(Match.number, (n) => `number: ${n}`),\n  // Mark the match as exhaustive, ensuring all cases are handled\n  // TypeScript will throw an error if any case is missing\n  // @ts-expect-error Type 'string' is not assignable to type 'never'\n  Match.exhaustive\n)";
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
