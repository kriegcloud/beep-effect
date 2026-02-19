/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: string
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Matches values of type `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * const processValue = Match.type<string | number | boolean>().pipe(
 *   Match.when(Match.string, (str) => `String: ${str.toUpperCase()}`),
 *   Match.when(Match.number, (num) => `Number: ${num * 2}`),
 *   Match.when(Match.boolean, (bool) => `Boolean: ${bool ? "yes" : "no"}`),
 *   Match.exhaustive
 * )
 * 
 * console.log(processValue("hello")) // "String: HELLO"
 * console.log(processValue(42)) // "Number: 84"
 * console.log(processValue(true)) // "Boolean: yes"
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
const exportName = "string";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values of type `string`.";
const sourceExample = "import { Match } from \"effect\"\n\nconst processValue = Match.type<string | number | boolean>().pipe(\n  Match.when(Match.string, (str) => `String: ${str.toUpperCase()}`),\n  Match.when(Match.number, (num) => `Number: ${num * 2}`),\n  Match.when(Match.boolean, (bool) => `Boolean: ${bool ? \"yes\" : \"no\"}`),\n  Match.exhaustive\n)\n\nconsole.log(processValue(\"hello\")) // \"String: HELLO\"\nconsole.log(processValue(42)) // \"Number: 84\"\nconsole.log(processValue(true)) // \"Boolean: yes\"";
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
