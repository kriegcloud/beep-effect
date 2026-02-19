/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redacted
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Redacted.ts
 * Generated: 2026-02-19T04:14:16.296Z
 *
 * Overview:
 * Generates an equivalence relation for `Redacted<A>` values based on an equivalence relation for the underlying values `A`. This function is useful for comparing `Redacted` instances without exposing their contents.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Redacted } from "effect"
 * import * as assert from "node:assert"
 *
 * const API_KEY1 = Redacted.make("1234567890")
 * const API_KEY2 = Redacted.make("1-34567890")
 * const API_KEY3 = Redacted.make("1234567890")
 *
 * const equivalence = Redacted.makeEquivalence(Equivalence.strictEqual<string>())
 *
 * assert.equal(equivalence(API_KEY1, API_KEY2), false)
 * assert.equal(equivalence(API_KEY1, API_KEY3), true)
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
import * as RedactedModule from "effect/Redacted";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Redacted";
const sourceSummary =
  "Generates an equivalence relation for `Redacted<A>` values based on an equivalence relation for the underlying values `A`. This function is useful for comparing `Redacted` insta...";
const sourceExample =
  'import { Equivalence, Redacted } from "effect"\nimport * as assert from "node:assert"\n\nconst API_KEY1 = Redacted.make("1234567890")\nconst API_KEY2 = Redacted.make("1-34567890")\nconst API_KEY3 = Redacted.make("1234567890")\n\nconst equivalence = Redacted.makeEquivalence(Equivalence.strictEqual<string>())\n\nassert.equal(equivalence(API_KEY1, API_KEY2), false)\nassert.equal(equivalence(API_KEY1, API_KEY3), true)';
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
