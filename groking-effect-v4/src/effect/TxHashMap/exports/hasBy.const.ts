/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: hasBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if any entry in the TxHashMap matches the given predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a user status map
 *   const userStatuses = yield* TxHashMap.make(
 *     ["alice", { status: "online", lastSeen: Date.now() }],
 *     ["bob", { status: "offline", lastSeen: Date.now() - 3600000 }],
 *     ["charlie", { status: "online", lastSeen: Date.now() }]
 *   )
 *
 *   // Check if any users are online
 *   const hasOnlineUsers = yield* TxHashMap.hasBy(
 *     userStatuses,
 *     (user) => user.status === "online"
 *   )
 *   console.log(hasOnlineUsers) // true
 *
 *   // Check if any users have specific username pattern
 *   const hasAdminUser = yield* TxHashMap.hasBy(
 *     userStatuses,
 *     (user, username) => username.startsWith("admin")
 *   )
 *   console.log(hasAdminUser) // false
 *
 *   // Data-last usage with pipe
 *   const hasRecentActivity = yield* userStatuses.pipe(
 *     TxHashMap.hasBy((user) => Date.now() - user.lastSeen < 1800000) // 30 minutes
 *   )
 *   console.log(hasRecentActivity) // true
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
const exportName = "hasBy";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if any entry in the TxHashMap matches the given predicate.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a user status map\n  const userStatuses = yield* TxHashMap.make(\n    ["alice", { status: "online", lastSeen: Date.now() }],\n    ["bob", { status: "offline", lastSeen: Date.now() - 3600000 }],\n    ["charlie", { status: "online", lastSeen: Date.now() }]\n  )\n\n  // Check if any users are online\n  const hasOnlineUsers = yield* TxHashMap.hasBy(\n    userStatuses,\n    (user) => user.status === "online"\n  )\n  console.log(hasOnlineUsers) // true\n\n  // Check if any users have specific username pattern\n  const hasAdminUser = yield* TxHashMap.hasBy(\n    userStatuses,\n    (user, username) => username.startsWith("admin")\n  )\n  console.log(hasAdminUser) // false\n\n  // Data-last usage with pipe\n  const hasRecentActivity = yield* userStatuses.pipe(\n    TxHashMap.hasBy((user) => Date.now() - user.lastSeen < 1800000) // 30 minutes\n  )\n  console.log(hasRecentActivity) // true\n})';
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
