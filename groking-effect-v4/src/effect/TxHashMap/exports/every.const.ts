/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if all entries in the TxHashMap satisfy the given predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a user permissions map
 *   const permissions = yield* TxHashMap.make(
 *     ["alice", { canRead: true, canWrite: true, canDelete: false }],
 *     ["bob", { canRead: true, canWrite: false, canDelete: false }],
 *     ["charlie", { canRead: true, canWrite: true, canDelete: true }]
 *   )
 *
 *   // Check if all users can read
 *   const allCanRead = yield* TxHashMap.every(
 *     permissions,
 *     (perms) => perms.canRead
 *   )
 *   console.log(allCanRead) // true
 *
 *   // Check if all users can write
 *   const allCanWrite = yield* TxHashMap.every(
 *     permissions,
 *     (perms) => perms.canWrite
 *   )
 *   console.log(allCanWrite) // false
 *
 *   // Data-last usage with pipe
 *   const allHaveBasicAccess = yield* permissions.pipe(
 *     TxHashMap.every((perms, username) => perms.canRead && username.length > 2)
 *   )
 *   console.log(allHaveBasicAccess) // true
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if all entries in the TxHashMap satisfy the given predicate.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a user permissions map\n  const permissions = yield* TxHashMap.make(\n    ["alice", { canRead: true, canWrite: true, canDelete: false }],\n    ["bob", { canRead: true, canWrite: false, canDelete: false }],\n    ["charlie", { canRead: true, canWrite: true, canDelete: true }]\n  )\n\n  // Check if all users can read\n  const allCanRead = yield* TxHashMap.every(\n    permissions,\n    (perms) => perms.canRead\n  )\n  console.log(allCanRead) // true\n\n  // Check if all users can write\n  const allCanWrite = yield* TxHashMap.every(\n    permissions,\n    (perms) => perms.canWrite\n  )\n  console.log(allCanWrite) // false\n\n  // Data-last usage with pipe\n  const allHaveBasicAccess = yield* permissions.pipe(\n    TxHashMap.every((perms, username) => perms.canRead && username.length > 2)\n  )\n  console.log(allHaveBasicAccess) // true\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
