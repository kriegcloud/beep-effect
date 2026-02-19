/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaIssue
 * Export: InvalidType
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaIssue.ts
 * Generated: 2026-02-19T04:14:19.209Z
 *
 * Overview:
 * Issue produced when the runtime type of the input does not match the type expected by the schema (e.g. got `null` when `string` was expected).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 *
 * try {
 *   Schema.decodeUnknownSync(Schema.String)(42)
 * } catch (e) {
 *   if (Schema.isSchemaError(e)) {
 *     console.log(String(e.issue))
 *     // "Expected string, got 42"
 *   }
 * }
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
import * as SchemaIssueModule from "effect/SchemaIssue";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InvalidType";
const exportKind = "class";
const moduleImportPath = "effect/SchemaIssue";
const sourceSummary =
  "Issue produced when the runtime type of the input does not match the type expected by the schema (e.g. got `null` when `string` was expected).";
const sourceExample =
  'import { Schema } from "effect"\n\ntry {\n  Schema.decodeUnknownSync(Schema.String)(42)\n} catch (e) {\n  if (Schema.isSchemaError(e)) {\n    console.log(String(e.issue))\n    // "Expected string, got 42"\n  }\n}';
const moduleRecord = SchemaIssueModule as Record<string, unknown>;

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
