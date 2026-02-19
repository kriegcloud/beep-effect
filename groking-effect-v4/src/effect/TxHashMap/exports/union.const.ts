/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: union
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.022Z
 *
 * Overview:
 * Merges another HashMap into this TxHashMap. If both maps contain the same key, the value from the other map will be used.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, HashMap, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create initial user preferences
 *   const userPrefs = yield* TxHashMap.make(
 *     ["theme", "light"],
 *     ["language", "en"],
 *     ["notifications", "enabled"]
 *   )
 *
 *   // New preferences to merge in
 *   const newSettings = HashMap.make(
 *     ["theme", "dark"], // will override existing
 *     ["timezone", "UTC"], // new setting
 *     ["sound", "enabled"] // new setting
 *   )
 *
 *   // Merge the new settings
 *   yield* TxHashMap.union(userPrefs, newSettings)
 *
 *   // Check the merged result
 *   const theme = yield* TxHashMap.get(userPrefs, "theme")
 *   console.log(theme) // Option.some("dark") - overridden
 *
 *   const language = yield* TxHashMap.get(userPrefs, "language")
 *   console.log(language) // Option.some("en") - preserved
 *
 *   const timezone = yield* TxHashMap.get(userPrefs, "timezone")
 *   console.log(timezone) // Option.some("UTC") - newly added
 *
 *   const size = yield* TxHashMap.size(userPrefs)
 *   console.log(size) // 5 total settings
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
const exportName = "union";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Merges another HashMap into this TxHashMap. If both maps contain the same key, the value from the other map will be used.";
const sourceExample =
  'import { Effect, HashMap, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create initial user preferences\n  const userPrefs = yield* TxHashMap.make(\n    ["theme", "light"],\n    ["language", "en"],\n    ["notifications", "enabled"]\n  )\n\n  // New preferences to merge in\n  const newSettings = HashMap.make(\n    ["theme", "dark"], // will override existing\n    ["timezone", "UTC"], // new setting\n    ["sound", "enabled"] // new setting\n  )\n\n  // Merge the new settings\n  yield* TxHashMap.union(userPrefs, newSettings)\n\n  // Check the merged result\n  const theme = yield* TxHashMap.get(userPrefs, "theme")\n  console.log(theme) // Option.some("dark") - overridden\n\n  const language = yield* TxHashMap.get(userPrefs, "language")\n  console.log(language) // Option.some("en") - preserved\n\n  const timezone = yield* TxHashMap.get(userPrefs, "timezone")\n  console.log(timezone) // Option.some("UTC") - newly added\n\n  const size = yield* TxHashMap.size(userPrefs)\n  console.log(size) // 5 total settings\n})';
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
