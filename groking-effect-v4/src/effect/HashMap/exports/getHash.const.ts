/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: getHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Lookup the value for the specified key in the `HashMap` using a custom hash.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 *
 * // Useful when implementing custom equality for complex keys
 * const userMap = HashMap.make(
 *   ["user123", { name: "Alice", role: "admin" }],
 *   ["user456", { name: "Bob", role: "user" }]
 * )
 *
 * // Use precomputed hash for performance in hot paths
 * const userId = "user123"
 * const precomputedHash = Hash.string(userId)
 *
 * // Lookup with custom hash (e.g., cached hash value)
 * const user = HashMap.getHash(userMap, userId, precomputedHash)
 * console.log(user) // Option.some({ name: "Alice", role: "admin" })
 *
 * // This avoids recomputing the hash when you already have it
 * const notFound = HashMap.getHash(userMap, "user999", Hash.string("user999"))
 * console.log(notFound) // Option.none()
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getHash";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Lookup the value for the specified key in the `HashMap` using a custom hash.";
const sourceExample =
  'import { Hash } from "effect"\nimport * as HashMap from "effect/HashMap"\n\n// Useful when implementing custom equality for complex keys\nconst userMap = HashMap.make(\n  ["user123", { name: "Alice", role: "admin" }],\n  ["user456", { name: "Bob", role: "user" }]\n)\n\n// Use precomputed hash for performance in hot paths\nconst userId = "user123"\nconst precomputedHash = Hash.string(userId)\n\n// Lookup with custom hash (e.g., cached hash value)\nconst user = HashMap.getHash(userMap, userId, precomputedHash)\nconsole.log(user) // Option.some({ name: "Alice", role: "admin" })\n\n// This avoids recomputing the hash when you already have it\nconst notFound = HashMap.getHash(userMap, "user999", Hash.string("user999"))\nconsole.log(notFound) // Option.none()';
const moduleRecord = HashMapModule as Record<string, unknown>;

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
