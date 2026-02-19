/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redacted
 * Export: wipeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Redacted.ts
 * Generated: 2026-02-19T04:14:16.296Z
 *
 * Overview:
 * Erases the underlying value of a `Redacted` instance, rendering it unusable. This function is intended to ensure that sensitive data does not remain in memory longer than necessary.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Redacted } from "effect"
 * import * as assert from "node:assert"
 * 
 * const API_KEY = Redacted.make("1234567890")
 * 
 * assert.equal(Redacted.value(API_KEY), "1234567890")
 * 
 * Redacted.wipeUnsafe(API_KEY)
 * 
 * assert.throws(
 *   () => Redacted.value(API_KEY),
 *   new Error("Unable to get redacted value")
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as RedactedModule from "effect/Redacted";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "wipeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Redacted";
const sourceSummary = "Erases the underlying value of a `Redacted` instance, rendering it unusable. This function is intended to ensure that sensitive data does not remain in memory longer than necess...";
const sourceExample = "import { Redacted } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst API_KEY = Redacted.make(\"1234567890\")\n\nassert.equal(Redacted.value(API_KEY), \"1234567890\")\n\nRedacted.wipeUnsafe(API_KEY)\n\nassert.throws(\n  () => Redacted.value(API_KEY),\n  new Error(\"Unable to get redacted value\")\n)";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
