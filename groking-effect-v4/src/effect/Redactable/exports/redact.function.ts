/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redactable
 * Export: redact
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Redactable.ts
 * Generated: 2026-02-19T04:50:38.651Z
 *
 * Overview:
 * Applies redaction to a value if it implements the Redactable interface.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Redactable } from "effect"
 *
 * class CreditCard {
 *   constructor(private number: string) {}
 *
 *   [Redactable.symbolRedactable]() {
 *     return {
 *       number: this.number.slice(0, 4) + "****"
 *     }
 *   }
 * }
 *
 * const card = new CreditCard("1234567890123456")
 * console.log(Redactable.redact(card)) // { number: "1234****" }
 *
 * // Non-redactable values are returned unchanged
 * console.log(Redactable.redact("normal string")) // "normal string"
 * console.log(Redactable.redact({ id: 123 })) // { id: 123 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RedactableModule from "effect/Redactable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "redact";
const exportKind = "function";
const moduleImportPath = "effect/Redactable";
const sourceSummary = "Applies redaction to a value if it implements the Redactable interface.";
const sourceExample =
  'import { Redactable } from "effect"\n\nclass CreditCard {\n  constructor(private number: string) {}\n\n  [Redactable.symbolRedactable]() {\n    return {\n      number: this.number.slice(0, 4) + "****"\n    }\n  }\n}\n\nconst card = new CreditCard("1234567890123456")\nconsole.log(Redactable.redact(card)) // { number: "1234****" }\n\n// Non-redactable values are returned unchanged\nconsole.log(Redactable.redact("normal string")) // "normal string"\nconsole.log(Redactable.redact({ id: 123 })) // { id: 123 }';
const moduleRecord = RedactableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
