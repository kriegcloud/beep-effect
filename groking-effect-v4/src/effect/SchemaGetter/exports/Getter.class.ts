/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: Getter
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.182Z
 *
 * Overview:
 * A composable transformation from an encoded type `E` to a decoded type `T`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 * 
 * const parseNumber = SchemaGetter.transform<number, string>((s) => Number(s))
 * const double = SchemaGetter.transform<number, number>((n) => n * 2)
 * const composed = parseNumber.compose(double)
 * // composed: Getter<number, string> — parses then doubles
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaGetterModule from "effect/SchemaGetter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Getter";
const exportKind = "class";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "A composable transformation from an encoded type `E` to a decoded type `T`.";
const sourceExample = "import { SchemaGetter } from \"effect\"\n\nconst parseNumber = SchemaGetter.transform<number, string>((s) => Number(s))\nconst double = SchemaGetter.transform<number, number>((n) => n * 2)\nconst composed = parseNumber.compose(double)\n// composed: Getter<number, string> — parses then doubles";
const moduleRecord = SchemaGetterModule as Record<string, unknown>;

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
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
