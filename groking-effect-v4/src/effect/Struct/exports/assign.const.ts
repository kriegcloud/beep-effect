/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: assign
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:50:42.533Z
 *
 * Overview:
 * Merges two structs into a new struct. When both structs share a key, the value from `that` (the second struct) wins.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const defaults = { theme: "light", lang: "en" }
 * const overrides = { theme: "dark", fontSize: 14 }
 * const config = pipe(defaults, Struct.assign(overrides))
 * console.log(config) // { theme: "dark", lang: "en", fontSize: 14 }
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "assign";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Merges two structs into a new struct. When both structs share a key, the value from `that` (the second struct) wins.";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\nconst defaults = { theme: "light", lang: "en" }\nconst overrides = { theme: "dark", fontSize: 14 }\nconst config = pipe(defaults, Struct.assign(overrides))\nconsole.log(config) // { theme: "dark", lang: "en", fontSize: 14 }';
const moduleRecord = StructModule as Record<string, unknown>;

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
