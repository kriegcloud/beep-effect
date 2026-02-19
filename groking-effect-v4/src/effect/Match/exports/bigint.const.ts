/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: bigint
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.667Z
 *
 * Overview:
 * Matches values of type `bigint`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const processLargeNumber = Match.type<unknown>().pipe(
 *   Match.when(Match.bigint, (big) => {
 *     if (big > 9007199254740991n) {
 *       return `Large integer: ${big.toString()}`
 *     }
 *     return `BigInt: ${big.toString()}`
 *   }),
 *   Match.when(Match.number, (num) => `Regular number: ${num}`),
 *   Match.orElse(() => "Not a numeric type")
 * )
 *
 * console.log(processLargeNumber(123n)) // "BigInt: 123"
 * console.log(processLargeNumber(9007199254740992n)) // "Large integer: 9007199254740992"
 * console.log(processLargeNumber(123)) // "Regular number: 123"
 * console.log(processLargeNumber("123")) // "Not a numeric type"
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
const exportName = "bigint";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values of type `bigint`.";
const sourceExample =
  'import { Match } from "effect"\n\nconst processLargeNumber = Match.type<unknown>().pipe(\n  Match.when(Match.bigint, (big) => {\n    if (big > 9007199254740991n) {\n      return `Large integer: ${big.toString()}`\n    }\n    return `BigInt: ${big.toString()}`\n  }),\n  Match.when(Match.number, (num) => `Regular number: ${num}`),\n  Match.orElse(() => "Not a numeric type")\n)\n\nconsole.log(processLargeNumber(123n)) // "BigInt: 123"\nconsole.log(processLargeNumber(9007199254740992n)) // "Large integer: 9007199254740992"\nconsole.log(processLargeNumber(123)) // "Regular number: 123"\nconsole.log(processLargeNumber("123")) // "Not a numeric type"';
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
