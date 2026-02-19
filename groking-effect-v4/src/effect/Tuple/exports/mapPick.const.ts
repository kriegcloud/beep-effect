/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: mapPick
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:50:43.574Z
 *
 * Overview:
 * Applies a `Struct.Lambda` transformation only to the elements at the specified indices; all other elements are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct, Tuple } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe(
 *   Tuple.make(1, "hello", true),
 *   Tuple.mapPick([0, 2], asArray)
 * )
 * console.log(result) // [[1], "hello", [true]]
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
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapPick";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary =
  "Applies a `Struct.Lambda` transformation only to the elements at the specified indices; all other elements are copied unchanged.";
const sourceExample =
  'import { pipe, Struct, Tuple } from "effect"\n\ninterface AsArray extends Struct.Lambda {\n  <A>(self: A): Array<A>\n  readonly "~lambda.out": Array<this["~lambda.in"]>\n}\n\nconst asArray = Struct.lambda<AsArray>((a) => [a])\nconst result = pipe(\n  Tuple.make(1, "hello", true),\n  Tuple.mapPick([0, 2], asArray)\n)\nconsole.log(result) // [[1], "hello", [true]]';
const moduleRecord = TupleModule as Record<string, unknown>;

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
