/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: getSuccess
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Returns the success value of an Exit as an Option.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 *
 * console.log(Exit.getSuccess(Exit.succeed(42))) // { _tag: "Some", value: 42 }
 * console.log(Exit.getSuccess(Exit.fail("err"))) // { _tag: "None" }
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
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getSuccess";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Returns the success value of an Exit as an Option.";
const sourceExample =
  'import { Exit } from "effect"\n\nconsole.log(Exit.getSuccess(Exit.succeed(42))) // { _tag: "Some", value: 42 }\nconsole.log(Exit.getSuccess(Exit.fail("err"))) // { _tag: "None" }';
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
