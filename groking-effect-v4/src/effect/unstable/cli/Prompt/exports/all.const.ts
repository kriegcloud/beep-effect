/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Prompt
 * Export: all
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Prompt.ts
 * Generated: 2026-02-19T04:14:24.720Z
 *
 * Overview:
 * Runs all the provided prompts in sequence respecting the structure provided in input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Prompt } from "effect/unstable/cli"
 * 
 * const username = Prompt.text({
 *   message: "Enter your username: "
 * })
 * 
 * const password = Prompt.password({
 *   message: "Enter your password: ",
 *   validate: (value) =>
 *     value.length === 0
 *       ? Effect.fail("Password cannot be empty")
 *       : Effect.succeed(value)
 * })
 * 
 * const allWithTuple = Prompt.all([username, password])
 * 
 * const allWithRecord = Prompt.all({ username, password })
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
import * as PromptModule from "effect/unstable/cli/Prompt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "all";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Prompt";
const sourceSummary = "Runs all the provided prompts in sequence respecting the structure provided in input.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Prompt } from \"effect/unstable/cli\"\n\nconst username = Prompt.text({\n  message: \"Enter your username: \"\n})\n\nconst password = Prompt.password({\n  message: \"Enter your password: \",\n  validate: (value) =>\n    value.length === 0\n      ? Effect.fail(\"Password cannot be empty\")\n      : Effect.succeed(value)\n})\n\nconst allWithTuple = Prompt.all([username, password])\n\nconst allWithRecord = Prompt.all({ username, password })";
const moduleRecord = PromptModule as Record<string, unknown>;

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
