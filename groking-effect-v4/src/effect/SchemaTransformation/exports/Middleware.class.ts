/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: Middleware
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:14:19.707Z
 *
 * Overview:
 * A middleware that wraps the entire parsing `Effect` pipeline for both decode and encode directions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, SchemaTransformation } from "effect"
 *
 * const fallback = new SchemaTransformation.Middleware(
 *   (effect) => Effect.catch(effect, () => Effect.succeed(Option.some("fallback"))),
 *   (effect) => effect
 * )
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
const exportName = "Middleware";
const exportKind = "class";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary =
  "A middleware that wraps the entire parsing `Effect` pipeline for both decode and encode directions.";
const sourceExample =
  'import { Effect, Option, SchemaTransformation } from "effect"\n\nconst fallback = new SchemaTransformation.Middleware(\n  (effect) => Effect.catch(effect, () => Effect.succeed(Option.some("fallback"))),\n  (effect) => effect\n)';
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
