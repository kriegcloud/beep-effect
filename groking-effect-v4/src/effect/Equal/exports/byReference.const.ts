/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equal
 * Export: byReference
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equal.ts
 * Generated: 2026-02-19T04:14:12.620Z
 *
 * Overview:
 * Creates a proxy of an object that uses reference equality instead of structural equality.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equal } from "effect"
 * import * as assert from "node:assert"
 * 
 * const obj1 = { a: 1, b: 2 }
 * const obj2 = { a: 1, b: 2 }
 * 
 * // Normal structural equality
 * assert(Equal.equals(obj1, obj2) === true)
 * 
 * // Create reference equality version
 * const obj1ByRef = Equal.byReference(obj1)
 * assert(Equal.equals(obj1ByRef, obj2) === false) // uses reference equality
 * assert(Equal.equals(obj1ByRef, obj1ByRef) === true) // same reference
 * 
 * // Each call creates a new proxy instance
 * const obj1ByRef2 = Equal.byReference(obj1)
 * assert(Equal.equals(obj1ByRef, obj1ByRef2) === false) // different instances
 * 
 * // Proxy behaves like the original
 * assert(obj1ByRef.a === 1)
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
import * as EqualModule from "effect/Equal";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "byReference";
const exportKind = "const";
const moduleImportPath = "effect/Equal";
const sourceSummary = "Creates a proxy of an object that uses reference equality instead of structural equality.";
const sourceExample = "import { Equal } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst obj1 = { a: 1, b: 2 }\nconst obj2 = { a: 1, b: 2 }\n\n// Normal structural equality\nassert(Equal.equals(obj1, obj2) === true)\n\n// Create reference equality version\nconst obj1ByRef = Equal.byReference(obj1)\nassert(Equal.equals(obj1ByRef, obj2) === false) // uses reference equality\nassert(Equal.equals(obj1ByRef, obj1ByRef) === true) // same reference\n\n// Each call creates a new proxy instance\nconst obj1ByRef2 = Equal.byReference(obj1)\nassert(Equal.equals(obj1ByRef, obj1ByRef2) === false) // different instances\n\n// Proxy behaves like the original\nassert(obj1ByRef.a === 1)";
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
