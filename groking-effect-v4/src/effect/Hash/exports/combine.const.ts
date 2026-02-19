/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * Combines two hash values into a single hash value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect" // combined hash value
 * 
 * // Can also be used with pipe
 * import { pipe } from "effect"
 * 
 * const hash1 = Hash.hash("hello")
 * const hash2 = Hash.hash("world")
 * 
 * // Combine two hash values
 * const combined = Hash.combine(hash2)(hash1)
 * console.log(combined)
 * const result = pipe(hash1, Hash.combine(hash2))
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
import * as HashModule from "effect/Hash";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Hash";
const sourceSummary = "Combines two hash values into a single hash value.";
const sourceExample = "import { Hash } from \"effect\" // combined hash value\n\n// Can also be used with pipe\nimport { pipe } from \"effect\"\n\nconst hash1 = Hash.hash(\"hello\")\nconst hash2 = Hash.hash(\"world\")\n\n// Combine two hash values\nconst combined = Hash.combine(hash2)(hash1)\nconsole.log(combined)\nconst result = pipe(hash1, Hash.combine(hash2))";
const moduleRecord = HashModule as Record<string, unknown>;

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
