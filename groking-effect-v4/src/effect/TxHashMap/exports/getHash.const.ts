/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: getHash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Lookup the value for the specified key in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Hash, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a cache with user sessions
 *   const cache = yield* TxHashMap.make(
 *     ["session_abc123", { userId: "user1", lastActive: Date.now() }],
 *     ["session_def456", { userId: "user2", lastActive: Date.now() }]
 *   )
 * 
 *   // When you have precomputed hash (e.g., from another lookup)
 *   const sessionId = "session_abc123"
 *   const precomputedHash = Hash.string(sessionId)
 * 
 *   // Use hash-optimized lookup for performance in hot paths
 *   const session = yield* TxHashMap.getHash(cache, sessionId, precomputedHash)
 *   console.log(session) // Option.some({ userId: "user1", lastActive: ... })
 * 
 *   // This avoids recomputing the hash when you already have it
 *   const invalidSession = yield* TxHashMap.getHash(
 *     cache,
 *     "invalid",
 *     Hash.string("invalid")
 *   )
 *   console.log(invalidSession) // Option.none()
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
const exportName = "getHash";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Lookup the value for the specified key in the TxHashMap using a custom hash. This can provide performance benefits when the hash is precomputed.";
const sourceExample = "import { Effect, Hash, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a cache with user sessions\n  const cache = yield* TxHashMap.make(\n    [\"session_abc123\", { userId: \"user1\", lastActive: Date.now() }],\n    [\"session_def456\", { userId: \"user2\", lastActive: Date.now() }]\n  )\n\n  // When you have precomputed hash (e.g., from another lookup)\n  const sessionId = \"session_abc123\"\n  const precomputedHash = Hash.string(sessionId)\n\n  // Use hash-optimized lookup for performance in hot paths\n  const session = yield* TxHashMap.getHash(cache, sessionId, precomputedHash)\n  console.log(session) // Option.some({ userId: \"user1\", lastActive: ... })\n\n  // This avoids recomputing the hash when you already have it\n  const invalidSession = yield* TxHashMap.getHash(\n    cache,\n    \"invalid\",\n    Hash.string(\"invalid\")\n  )\n  console.log(invalidSession) // Option.none()\n})";
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
