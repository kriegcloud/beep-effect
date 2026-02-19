/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Config
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Config.ts
 * Generated: 2026-02-19T04:14:11.161Z
 *
 * Overview:
 * Transforms the parsed value of a config with a pure function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect } from "effect"
 *
 * const upper = Config.string("name").pipe(
 *   Config.map((s) => s.toUpperCase())
 * )
 *
 * const provider = ConfigProvider.fromUnknown({ name: "alice" })
 * // Effect.runSync(upper.parse(provider)) // "ALICE"
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
import * as ConfigModule from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Config";
const sourceSummary = "Transforms the parsed value of a config with a pure function.";
const sourceExample =
  'import { Config, ConfigProvider, Effect } from "effect"\n\nconst upper = Config.string("name").pipe(\n  Config.map((s) => s.toUpperCase())\n)\n\nconst provider = ConfigProvider.fromUnknown({ name: "alice" })\n// Effect.runSync(upper.parse(provider)) // "ALICE"';
const moduleRecord = ConfigModule as Record<string, unknown>;

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
