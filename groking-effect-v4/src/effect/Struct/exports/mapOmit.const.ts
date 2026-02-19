/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: mapOmit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Applies a {@link Lambda} transformation to all keys except the specified ones; the excluded keys are copied unchanged.
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
 * const result = pipe(
 *   { x: 1, y: 2, z: 3 },
 *   Struct.mapOmit(["y"], asArray)
 * )
 * console.log(result) // { x: [1], y: 2, z: [3] }
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapOmit";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Applies a {@link Lambda} transformation to all keys except the specified ones; the excluded keys are copied unchanged.";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\ninterface AsArray extends Struct.Lambda {\n  <A>(self: A): Array<A>\n  readonly "~lambda.out": Array<this["~lambda.in"]>\n}\n\nconst asArray = Struct.lambda<AsArray>((a) => [a])\nconst result = pipe(\n  { x: 1, y: 2, z: 3 },\n  Struct.mapOmit(["y"], asArray)\n)\nconsole.log(result) // { x: [1], y: 2, z: [3] }';
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
  bunContext: BunContext,
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
