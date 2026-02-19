/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: findErrorOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Returns the first typed error from a failed Exit as an Option.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 * 
 * console.log(Exit.findErrorOption(Exit.fail("err")))           // { _tag: "Some", value: "err" }
 * console.log(Exit.findErrorOption(Exit.die(new Error("bug")))) // { _tag: "None" }
 * console.log(Exit.findErrorOption(Exit.succeed(42)))            // { _tag: "None" }
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
import * as ExitModule from "effect/Exit";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findErrorOption";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Returns the first typed error from a failed Exit as an Option.";
const sourceExample = "import { Exit } from \"effect\"\n\nconsole.log(Exit.findErrorOption(Exit.fail(\"err\")))           // { _tag: \"Some\", value: \"err\" }\nconsole.log(Exit.findErrorOption(Exit.die(new Error(\"bug\")))) // { _tag: \"None\" }\nconsole.log(Exit.findErrorOption(Exit.succeed(42)))            // { _tag: \"None\" }";
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
