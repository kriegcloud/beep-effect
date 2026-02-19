/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: lambda
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:50:42.533Z
 *
 * Overview:
 * Wraps a plain function as a {@link Lambda} value so it can be used with {@link map}, {@link mapPick}, and {@link mapOmit}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))
 * console.log(result) // { x: [1], y: ["hello"] }
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "lambda";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Wraps a plain function as a {@link Lambda} value so it can be used with {@link map}, {@link mapPick}, and {@link mapOmit}.";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\ninterface AsArray extends Struct.Lambda {\n  <A>(self: A): Array<A>\n  readonly "~lambda.out": Array<this["~lambda.in"]>\n}\n\nconst asArray = Struct.lambda<AsArray>((a) => [a])\nconst result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))\nconsole.log(result) // { x: [1], y: ["hello"] }';
const moduleRecord = StructModule as Record<string, unknown>;

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
