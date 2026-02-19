/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.144Z
 *
 * Overview:
 * Returns the first {@link Fail} reason from a cause, including its annotations. Returns `Filter.fail` with the remaining cause when no `Fail` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 * 
 * const result = Cause.findFail(Cause.fail("error"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.error) // "error"
 * }
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
import * as CauseModule from "effect/Cause";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findFail";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns the first {@link Fail} reason from a cause, including its annotations. Returns `Filter.fail` with the remaining cause when no `Fail` is found.";
const sourceExample = "import { Cause, Result } from \"effect\"\n\nconst result = Cause.findFail(Cause.fail(\"error\"))\nif (!Result.isFailure(result)) {\n  console.log(result.success.error) // \"error\"\n}";
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
