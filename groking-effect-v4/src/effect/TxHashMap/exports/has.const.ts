/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if the specified key exists in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const permissions = yield* TxHashMap.make(
 *     ["alice", ["read", "write"]],
 *     ["bob", ["read"]],
 *     ["charlie", ["admin"]]
 *   )
 * 
 *   // Check if users exist
 *   const hasAlice = yield* TxHashMap.has(permissions, "alice")
 *   console.log(hasAlice) // true
 * 
 *   const hasDavid = yield* TxHashMap.has(permissions, "david")
 *   console.log(hasDavid) // false
 * 
 *   // Use direct method call for type-safe access
 *   const hasBob = yield* TxHashMap.has(permissions, "bob")
 *   console.log(hasBob) // true
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
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if the specified key exists in the TxHashMap.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const permissions = yield* TxHashMap.make(\n    [\"alice\", [\"read\", \"write\"]],\n    [\"bob\", [\"read\"]],\n    [\"charlie\", [\"admin\"]]\n  )\n\n  // Check if users exist\n  const hasAlice = yield* TxHashMap.has(permissions, \"alice\")\n  console.log(hasAlice) // true\n\n  const hasDavid = yield* TxHashMap.has(permissions, \"david\")\n  console.log(hasDavid) // false\n\n  // Use direct method call for type-safe access\n  const hasBob = yield* TxHashMap.has(permissions, \"bob\")\n  console.log(hasBob) // true\n})";
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
