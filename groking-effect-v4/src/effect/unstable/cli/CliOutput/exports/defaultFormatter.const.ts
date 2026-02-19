/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliOutput
 * Export: defaultFormatter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliOutput.ts
 * Generated: 2026-02-19T04:14:24.425Z
 *
 * Overview:
 * Creates a default formatter with configurable options.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError, CliOutput } from "effect/unstable/cli"
 * 
 * // Create a formatter without colors for tests or CI environments
 * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
 * 
 * // Create a formatter with colors forced on
 * const colorFormatter = CliOutput.defaultFormatter({ colors: true })
 * 
 * // Auto-detect colors based on terminal support (default behavior)
 * const autoFormatter = CliOutput.defaultFormatter()
 * 
 * const program = Effect.gen(function*() {
 *   const formatter = colorFormatter
 * 
 *   // Format an error with proper styling
 *   const error = new CliError.InvalidValue({
 *     option: "foo",
 *     value: "bar",
 *     expected: "baz",
 *     kind: "flag"
 *   })
 *   const errorText = formatter.formatError(error)
 *   console.log(errorText)
 * 
 *   // Format version information
 *   const versionText = formatter.formatVersion("my-tool", "1.2.3")
 *   console.log(versionText)
 * })
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
import * as CliOutputModule from "effect/unstable/cli/CliOutput";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "defaultFormatter";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/CliOutput";
const sourceSummary = "Creates a default formatter with configurable options.";
const sourceExample = "import { Effect } from \"effect\"\nimport { CliError, CliOutput } from \"effect/unstable/cli\"\n\n// Create a formatter without colors for tests or CI environments\nconst noColorFormatter = CliOutput.defaultFormatter({ colors: false })\n\n// Create a formatter with colors forced on\nconst colorFormatter = CliOutput.defaultFormatter({ colors: true })\n\n// Auto-detect colors based on terminal support (default behavior)\nconst autoFormatter = CliOutput.defaultFormatter()\n\nconst program = Effect.gen(function*() {\n  const formatter = colorFormatter\n\n  // Format an error with proper styling\n  const error = new CliError.InvalidValue({\n    option: \"foo\",\n    value: \"bar\",\n    expected: \"baz\",\n    kind: \"flag\"\n  })\n  const errorText = formatter.formatError(error)\n  console.log(errorText)\n\n  // Format version information\n  const versionText = formatter.formatVersion(\"my-tool\", \"1.2.3\")\n  console.log(versionText)\n})";
const moduleRecord = CliOutputModule as Record<string, unknown>;

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
