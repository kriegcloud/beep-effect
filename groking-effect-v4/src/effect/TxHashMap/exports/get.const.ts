/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.016Z
 *
 * Overview:
 * Safely lookup the value for the specified key in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const userMap = yield* TxHashMap.make(
 *     ["alice", { name: "Alice", role: "admin" }],
 *     ["bob", { name: "Bob", role: "user" }]
 *   )
 *
 *   // Safe lookup - returns Option
 *   const alice = yield* TxHashMap.get(userMap, "alice")
 *   console.log(alice) // Option.some({ name: "Alice", role: "admin" })
 *
 *   const nonExistent = yield* TxHashMap.get(userMap, "charlie")
 *   console.log(nonExistent) // Option.none()
 *
 *   // Use with pipe syntax for type-safe access
 *   const bobRole = yield* TxHashMap.get(userMap, "bob")
 *   if (Option.isSome(bobRole)) {
 *     console.log(bobRole.value.role) // "user"
 *   }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Safely lookup the value for the specified key in the TxHashMap.";
const sourceExample =
  'import { Effect, Option, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const userMap = yield* TxHashMap.make(\n    ["alice", { name: "Alice", role: "admin" }],\n    ["bob", { name: "Bob", role: "user" }]\n  )\n\n  // Safe lookup - returns Option\n  const alice = yield* TxHashMap.get(userMap, "alice")\n  console.log(alice) // Option.some({ name: "Alice", role: "admin" })\n\n  const nonExistent = yield* TxHashMap.get(userMap, "charlie")\n  console.log(nonExistent) // Option.none()\n\n  // Use with pipe syntax for type-safe access\n  const bobRole = yield* TxHashMap.get(userMap, "bob")\n  if (Option.isSome(bobRole)) {\n    console.log(bobRole.value.role) // "user"\n  }\n})';
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
