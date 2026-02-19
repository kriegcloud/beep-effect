/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: defaultLeafHook
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:14:19.209Z
 *
 * Overview:
 * The built-in {@link LeafHook} used by default formatters.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaIssue } from "effect"
 *
 * const formatter = SchemaIssue.makeFormatterStandardSchemaV1({
 *   leafHook: SchemaIssue.defaultLeafHook
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaIssueModule from "effect/SchemaIssue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "defaultLeafHook";
const exportKind = "const";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary = "The built-in {@link LeafHook} used by default formatters.";
const sourceExample =
  'import { SchemaIssue } from "effect"\n\nconst formatter = SchemaIssue.makeFormatterStandardSchemaV1({\n  leafHook: SchemaIssue.defaultLeafHook\n})';
const moduleRecord = SchemaIssueModule as Record<string, unknown>;

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
