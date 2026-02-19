/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: modifyAt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Set or remove the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 *
 * // Increment existing value or set to 1 if not present
 * const updateFn = (option: Option.Option<number>) =>
 *   Option.isSome(option) ? Option.some(option.value + 1) : Option.some(1)
 *
 * const updated = HashMap.modifyAt(map, "a", updateFn)
 * console.log(HashMap.get(updated, "a")) // Option.some(2)
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modifyAt";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary =
  "Set or remove the specified key in the `HashMap` using the specified update function. The value of the specified key will be computed using the provided hash.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\nimport * as Option from "effect/Option"\n\nconst map = HashMap.make(["a", 1], ["b", 2])\n\n// Increment existing value or set to 1 if not present\nconst updateFn = (option: Option.Option<number>) =>\n  Option.isSome(option) ? Option.some(option.value + 1) : Option.some(1)\n\nconst updated = HashMap.modifyAt(map, "a", updateFn)\nconsole.log(HashMap.get(updated, "a")) // Option.some(2)';
const moduleRecord = HashMapModule as Record<string, unknown>;

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
