/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Combines filtering and mapping in a single operation. Applies a function that returns an Option to each entry, keeping only the Some values and transforming them.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a mixed data map
 *   const userData = yield* TxHashMap.make(
 *     ["alice", { age: "30", role: "admin", active: true }],
 *     ["bob", { age: "invalid", role: "user", active: true }],
 *     ["charlie", { age: "25", role: "admin", active: false }],
 *     ["diana", { age: "28", role: "user", active: true }]
 *   )
 *
 *   // Extract valid ages for active admin users only
 *   const activeAdminAges = yield* TxHashMap.filterMap(
 *     userData,
 *     (user, username) => {
 *       if (!user.active || user.role !== "admin") return Option.none()
 *       const age = parseInt(user.age)
 *       if (isNaN(age)) return Option.none()
 *       return Option.some({
 *         username,
 *         age,
 *         seniority: age > 27 ? "senior" : "junior"
 *       })
 *     }
 *   )
 *
 *   const aliceData = yield* TxHashMap.get(activeAdminAges, "alice")
 *   console.log(aliceData) // Option.some({ username: "alice", age: 30, seniority: "senior" })
 *
 *   const charlieData = yield* TxHashMap.get(activeAdminAges, "charlie")
 *   console.log(charlieData) // Option.none() (not active)
 *
 *   // Data-last usage with pipe
 *   const validAges = yield* userData.pipe(
 *     TxHashMap.filterMap((user) => {
 *       const age = parseInt(user.age)
 *       return isNaN(age) ? Option.none() : Option.some(age)
 *     })
 *   )
 *
 *   const size = yield* TxHashMap.size(validAges)
 *   console.log(size) // 3 (alice, charlie, diana have valid ages)
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
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Combines filtering and mapping in a single operation. Applies a function that returns an Option to each entry, keeping only the Some values and transforming them.";
const sourceExample =
  'import { Effect, Option, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a mixed data map\n  const userData = yield* TxHashMap.make(\n    ["alice", { age: "30", role: "admin", active: true }],\n    ["bob", { age: "invalid", role: "user", active: true }],\n    ["charlie", { age: "25", role: "admin", active: false }],\n    ["diana", { age: "28", role: "user", active: true }]\n  )\n\n  // Extract valid ages for active admin users only\n  const activeAdminAges = yield* TxHashMap.filterMap(\n    userData,\n    (user, username) => {\n      if (!user.active || user.role !== "admin") return Option.none()\n      const age = parseInt(user.age)\n      if (isNaN(age)) return Option.none()\n      return Option.some({\n        username,\n        age,\n        seniority: age > 27 ? "senior" : "junior"\n      })\n    }\n  )\n\n  const aliceData = yield* TxHashMap.get(activeAdminAges, "alice")\n  console.log(aliceData) // Option.some({ username: "alice", age: 30, seniority: "senior" })\n\n  const charlieData = yield* TxHashMap.get(activeAdminAges, "charlie")\n  console.log(charlieData) // Option.none() (not active)\n\n  // Data-last usage with pipe\n  const validAges = yield* userData.pipe(\n    TxHashMap.filterMap((user) => {\n      const age = parseInt(user.age)\n      return isNaN(age) ? Option.none() : Option.some(age)\n    })\n  )\n\n  const size = yield* TxHashMap.size(validAges)\n  console.log(size) // 3 (alice, charlie, diana have valid ages)\n})';
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
