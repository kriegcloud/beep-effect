/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redacted
 * Export: value
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Redacted.ts
 * Generated: 2026-02-19T04:50:38.658Z
 *
 * Overview:
 * Retrieves the original value from a `Redacted` instance. Use this function with caution, as it exposes the sensitive data.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Redacted } from "effect"
 * import * as assert from "node:assert"
 *
 * const API_KEY = Redacted.make("1234567890")
 *
 * assert.equal(Redacted.value(API_KEY), "1234567890")
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
import * as RedactedModule from "effect/Redacted";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "value";
const exportKind = "const";
const moduleImportPath = "effect/Redacted";
const sourceSummary =
  "Retrieves the original value from a `Redacted` instance. Use this function with caution, as it exposes the sensitive data.";
const sourceExample =
  'import { Redacted } from "effect"\nimport * as assert from "node:assert"\n\nconst API_KEY = Redacted.make("1234567890")\n\nassert.equal(Redacted.value(API_KEY), "1234567890")';
const moduleRecord = RedactedModule as Record<string, unknown>;

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
