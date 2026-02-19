/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: choiceWithValue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.460Z
 *
 * Overview:
 * Constructs option parameters that represent a choice between several inputs. Each tuple maps a string flag value to an associated typed value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * // simple enum like choice mapping directly to string union
 * const color = Flag.choice("color", ["red", "green", "blue"])
 *
 * // choice with custom value mapping
 * const logLevel = Flag.choiceWithValue("log-level", [
 *   ["debug", "Debug" as const],
 *   ["info", "Info" as const],
 *   ["error", "Error" as const]
 * ])
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
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "choiceWithValue";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary =
  "Constructs option parameters that represent a choice between several inputs. Each tuple maps a string flag value to an associated typed value.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\n// simple enum like choice mapping directly to string union\nconst color = Flag.choice("color", ["red", "green", "blue"])\n\n// choice with custom value mapping\nconst logLevel = Flag.choiceWithValue("log-level", [\n  ["debug", "Debug" as const],\n  ["info", "Info" as const],\n  ["error", "Error" as const]\n])';
const moduleRecord = FlagModule as Record<string, unknown>;

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
