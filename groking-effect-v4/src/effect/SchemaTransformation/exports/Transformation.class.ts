/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: Transformation
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:14:19.708Z
 *
 * Overview:
 * A bidirectional transformation between a decoded type `T` and an encoded type `E`, built from a pair of `Getter`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaTransformation } from "effect"
 *
 * const trimAndLower = SchemaTransformation.trim().compose(
 *   SchemaTransformation.toLowerCase()
 * )
 * // decode: trim then lowercase
 * // encode: passthrough (both directions)
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaTransformationModule from "effect/SchemaTransformation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Transformation";
const exportKind = "class";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary =
  "A bidirectional transformation between a decoded type `T` and an encoded type `E`, built from a pair of `Getter`s.";
const sourceExample =
  'import { SchemaTransformation } from "effect"\n\nconst trimAndLower = SchemaTransformation.trim().compose(\n  SchemaTransformation.toLowerCase()\n)\n// decode: trim then lowercase\n// encode: passthrough (both directions)';
const moduleRecord = SchemaTransformationModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
