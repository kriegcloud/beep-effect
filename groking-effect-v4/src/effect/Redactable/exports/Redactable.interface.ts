/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redactable
 * Export: Redactable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Redactable.ts
 * Generated: 2026-02-19T04:14:16.289Z
 *
 * Overview:
 * Interface for objects that can provide redacted representations.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { ServiceMap } from "effect"
 * import { Redactable } from "effect"
 *
 * class SensitiveData implements Redactable.Redactable {
 *   constructor(private secret: string) {}
 *
 *   [Redactable.symbolRedactable](context: ServiceMap.ServiceMap<never>) {
 *     // In production, hide the actual secret
 *     return { secret: "[REDACTED]" }
 *   }
 * }
 *
 * const data = new SensitiveData("my-secret-key")
 * // The redacted version will be used when converting to JSON in certain contexts
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RedactableModule from "effect/Redactable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Redactable";
const exportKind = "interface";
const moduleImportPath = "effect/Redactable";
const sourceSummary = "Interface for objects that can provide redacted representations.";
const sourceExample =
  'import type { ServiceMap } from "effect"\nimport { Redactable } from "effect"\n\nclass SensitiveData implements Redactable.Redactable {\n  constructor(private secret: string) {}\n\n  [Redactable.symbolRedactable](context: ServiceMap.ServiceMap<never>) {\n    // In production, hide the actual secret\n    return { secret: "[REDACTED]" }\n  }\n}\n\nconst data = new SensitiveData("my-secret-key")\n// The redacted version will be used when converting to JSON in certain contexts';
const moduleRecord = RedactableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
