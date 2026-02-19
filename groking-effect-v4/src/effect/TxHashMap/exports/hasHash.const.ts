/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: hasHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if the specified key has an entry in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Hash, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create an access control map
 *   const permissions = yield* TxHashMap.make(
 *     ["admin", { read: true, write: true, delete: true }],
 *     ["user", { read: true, write: false, delete: false }]
 *   )
 * 
 *   // When checking permissions frequently with same roles
 *   const role = "admin"
 *   const roleHash = Hash.string(role)
 * 
 *   // Use hash-optimized existence check
 *   const hasAdminRole = yield* TxHashMap.hasHash(permissions, role, roleHash)
 *   console.log(hasAdminRole) // true
 * 
 *   // Check non-existent role
 *   const hasGuestRole = yield* TxHashMap.hasHash(
 *     permissions,
 *     "guest",
 *     Hash.string("guest")
 *   )
 *   console.log(hasGuestRole) // false
 * 
 *   // Useful in hot paths where hash is computed once and reused
 *   const roles = ["admin", "user", "moderator"]
 *   const roleHashes = roles.map((role) => [role, Hash.string(role)] as const)
 * 
 *   for (const [role, hash] of roleHashes) {
 *     const exists = yield* TxHashMap.hasHash(permissions, role, hash)
 *     console.log(`Role ${role}: ${exists}`)
 *   }
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "hasHash";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if the specified key has an entry in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed.";
const sourceExample = "import { Effect, Hash, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create an access control map\n  const permissions = yield* TxHashMap.make(\n    [\"admin\", { read: true, write: true, delete: true }],\n    [\"user\", { read: true, write: false, delete: false }]\n  )\n\n  // When checking permissions frequently with same roles\n  const role = \"admin\"\n  const roleHash = Hash.string(role)\n\n  // Use hash-optimized existence check\n  const hasAdminRole = yield* TxHashMap.hasHash(permissions, role, roleHash)\n  console.log(hasAdminRole) // true\n\n  // Check non-existent role\n  const hasGuestRole = yield* TxHashMap.hasHash(\n    permissions,\n    \"guest\",\n    Hash.string(\"guest\")\n  )\n  console.log(hasGuestRole) // false\n\n  // Useful in hot paths where hash is computed once and reused\n  const roles = [\"admin\", \"user\", \"moderator\"]\n  const roleHashes = roles.map((role) => [role, Hash.string(role)] as const)\n\n  for (const [role, hash] of roleHashes) {\n    const exists = yield* TxHashMap.hasHash(permissions, role, hash)\n    console.log(`Role ${role}: ${exists}`)\n  }\n})";
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
