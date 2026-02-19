/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: hasHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * Checks if the specified key has an entry in the `HashMap` using a custom hash.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 *
 * // Create a map with case-sensitive keys
 * const userMap = HashMap.make(
 *   ["Admin", { role: "administrator" }],
 *   ["User", { role: "standard" }]
 * )
 *
 * // Check with exact hash
 * const exactHash = Hash.string("Admin")
 * console.log(HashMap.hasHash(userMap, "Admin", exactHash)) // true
 *
 * // Check case-insensitive by using custom hash
 * const caseInsensitiveHash = Hash.string("admin".toLowerCase())
 * console.log(HashMap.hasHash(userMap, "admin", caseInsensitiveHash)) // false (different hash)
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
const exportName = "hasHash";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Checks if the specified key has an entry in the `HashMap` using a custom hash.";
const sourceExample =
  'import { Hash } from "effect"\nimport * as HashMap from "effect/HashMap"\n\n// Create a map with case-sensitive keys\nconst userMap = HashMap.make(\n  ["Admin", { role: "administrator" }],\n  ["User", { role: "standard" }]\n)\n\n// Check with exact hash\nconst exactHash = Hash.string("Admin")\nconsole.log(HashMap.hasHash(userMap, "Admin", exactHash)) // true\n\n// Check case-insensitive by using custom hash\nconst caseInsensitiveHash = Hash.string("admin".toLowerCase())\nconsole.log(HashMap.hasHash(userMap, "admin", caseInsensitiveHash)) // false (different hash)';
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
