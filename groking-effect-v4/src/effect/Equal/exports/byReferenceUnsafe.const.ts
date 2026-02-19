/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equal
 * Export: byReferenceUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equal.ts
 * Generated: 2026-02-19T04:50:36.022Z
 *
 * Overview:
 * Marks an object to use reference equality instead of structural equality, without creating a proxy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equal } from "effect"
 * import * as assert from "node:assert"
 *
 * const obj1 = { a: 1, b: 2 }
 * const obj2 = { a: 1, b: 2 }
 *
 * // Mark obj1 for reference equality (modifies obj1 directly)
 * const obj1ByRef = Equal.byReferenceUnsafe(obj1)
 * assert(obj1ByRef === obj1) // Same object, no proxy created
 * assert(Equal.equals(obj1ByRef, obj2) === false) // uses reference equality
 * assert(Equal.equals(obj1ByRef, obj1ByRef) === true) // same reference
 *
 * // The original obj1 is now permanently marked for reference equality
 * assert(Equal.equals(obj1, obj2) === false) // obj1 uses reference equality
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
import * as EqualModule from "effect/Equal";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "byReferenceUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Equal";
const sourceSummary =
  "Marks an object to use reference equality instead of structural equality, without creating a proxy.";
const sourceExample =
  'import { Equal } from "effect"\nimport * as assert from "node:assert"\n\nconst obj1 = { a: 1, b: 2 }\nconst obj2 = { a: 1, b: 2 }\n\n// Mark obj1 for reference equality (modifies obj1 directly)\nconst obj1ByRef = Equal.byReferenceUnsafe(obj1)\nassert(obj1ByRef === obj1) // Same object, no proxy created\nassert(Equal.equals(obj1ByRef, obj2) === false) // uses reference equality\nassert(Equal.equals(obj1ByRef, obj1ByRef) === true) // same reference\n\n// The original obj1 is now permanently marked for reference equality\nassert(Equal.equals(obj1, obj2) === false) // obj1 uses reference equality';
const moduleRecord = EqualModule as Record<string, unknown>;

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
