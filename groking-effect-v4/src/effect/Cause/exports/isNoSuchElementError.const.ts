/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isNoSuchElementError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.145Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link NoSuchElementError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isNoSuchElementError(new Cause.NoSuchElementError())) // true
 * console.log(Cause.isNoSuchElementError("nope")) // false
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
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isNoSuchElementError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link NoSuchElementError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isNoSuchElementError(new Cause.NoSuchElementError())) // true\nconsole.log(Cause.isNoSuchElementError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

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
