/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:50:40.615Z
 *
 * Overview:
 * Constructs a `Transformation` from an object with `decode` and `encode` `Getter`s. If the input is already a `Transformation`, returns it as-is.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter, SchemaTransformation } from "effect"
 *
 * const t = SchemaTransformation.make({
 *   decode: SchemaGetter.transform<number, string>((s) => Number(s)),
 *   encode: SchemaGetter.transform<string, number>((n) => String(n))
 * })
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
import * as SchemaTransformationModule from "effect/SchemaTransformation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary =
  "Constructs a `Transformation` from an object with `decode` and `encode` `Getter`s. If the input is already a `Transformation`, returns it as-is.";
const sourceExample =
  'import { SchemaGetter, SchemaTransformation } from "effect"\n\nconst t = SchemaTransformation.make({\n  decode: SchemaGetter.transform<number, string>((s) => Number(s)),\n  encode: SchemaGetter.transform<string, number>((n) => String(n))\n})';
const moduleRecord = SchemaTransformationModule as Record<string, unknown>;

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
