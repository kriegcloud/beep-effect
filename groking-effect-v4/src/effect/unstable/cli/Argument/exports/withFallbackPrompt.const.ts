/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Argument
 * Export: withFallbackPrompt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Argument.ts
 * Generated: 2026-02-19T04:14:24.406Z
 *
 * Overview:
 * Adds a fallback prompt that is shown when a required argument is missing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Argument, Prompt } from "effect/unstable/cli"
 * 
 * const filename = Argument.string("filename").pipe(
 *   Argument.withFallbackPrompt(Prompt.text({ message: "Filename" }))
 * )
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
import * as ArgumentModule from "effect/unstable/cli/Argument";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withFallbackPrompt";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Argument";
const sourceSummary = "Adds a fallback prompt that is shown when a required argument is missing.";
const sourceExample = "import { Argument, Prompt } from \"effect/unstable/cli\"\n\nconst filename = Argument.string(\"filename\").pipe(\n  Argument.withFallbackPrompt(Prompt.text({ message: \"Filename\" }))\n)";
const moduleRecord = ArgumentModule as Record<string, unknown>;

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
