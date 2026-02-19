/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: hasDies
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:50:36.056Z
 *
 * Overview:
 * Tests whether a failed Exit contains defects (Die reasons).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 *
 * console.log(Exit.hasDies(Exit.die(new Error("bug")))) // true
 * console.log(Exit.hasDies(Exit.fail("err")))           // false
 * console.log(Exit.hasDies(Exit.succeed(42)))            // false
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
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "hasDies";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Tests whether a failed Exit contains defects (Die reasons).";
const sourceExample =
  'import { Exit } from "effect"\n\nconsole.log(Exit.hasDies(Exit.die(new Error("bug")))) // true\nconsole.log(Exit.hasDies(Exit.fail("err")))           // false\nconsole.log(Exit.hasDies(Exit.succeed(42)))            // false';
const moduleRecord = ExitModule as Record<string, unknown>;

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
