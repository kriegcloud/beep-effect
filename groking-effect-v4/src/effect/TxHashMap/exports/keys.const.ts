/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.019Z
 *
 * Overview:
 * Returns an array of all keys in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const userRoles = yield* TxHashMap.make(
 *     ["alice", "admin"],
 *     ["bob", "user"],
 *     ["charlie", "moderator"]
 *   )
 *
 *   const usernames = yield* TxHashMap.keys(userRoles)
 *   console.log(usernames.sort()) // ["alice", "bob", "charlie"]
 *
 *   // Useful for iteration
 *   for (const username of usernames) {
 *     const role = yield* TxHashMap.get(userRoles, username)
 *     if (Option.isSome(role)) {
 *       console.log(`${username}: ${role.value}`)
 *     }
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
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns an array of all keys in the TxHashMap.";
const sourceExample =
  'import { Effect, Option, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const userRoles = yield* TxHashMap.make(\n    ["alice", "admin"],\n    ["bob", "user"],\n    ["charlie", "moderator"]\n  )\n\n  const usernames = yield* TxHashMap.keys(userRoles)\n  console.log(usernames.sort()) // ["alice", "bob", "charlie"]\n\n  // Useful for iteration\n  for (const username of usernames) {\n    const role = yield* TxHashMap.get(userRoles, username)\n    if (Option.isSome(role)) {\n      console.log(`${username}: ${role.value}`)\n    }\n  }\n})';
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
