/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.460Z
 *
 * Overview:
 * Constrains a flag to be specified between a minimum and maximum number of times.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 * 
 * const hostFlag = Flag.between(Flag.string("host"), 1, 3)
 * // Requires 1-3 host flags
 * // Usage: --host host1 --host host2
 * 
 * const excludeFlag = Flag.string("exclude").pipe(
 *   Flag.between(0, 5)
 * )
 * // Allows 0-5 exclude patterns
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
import * as FlagModule from "effect/unstable/cli/Flag";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Constrains a flag to be specified between a minimum and maximum number of times.";
const sourceExample = "import { Flag } from \"effect/unstable/cli\"\n\nconst hostFlag = Flag.between(Flag.string(\"host\"), 1, 3)\n// Requires 1-3 host flags\n// Usage: --host host1 --host host2\n\nconst excludeFlag = Flag.string(\"exclude\").pipe(\n  Flag.between(0, 5)\n)\n// Allows 0-5 exclude patterns";
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
