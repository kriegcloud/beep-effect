/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: atMost
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.460Z
 *
 * Overview:
 * Limits a flag to be specified at most a maximum number of times.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 * 
 * const warningFlag = Flag.atMost(Flag.string("warning"), 3)
 * // Allows up to 3 warning flags
 * // Usage: --warning w1 --warning w2 --warning w3
 * 
 * const debugFlag = Flag.string("debug").pipe(
 *   Flag.atMost(1)
 * )
 * // Allows at most 1 debug flag
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
const exportName = "atMost";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Limits a flag to be specified at most a maximum number of times.";
const sourceExample = "import { Flag } from \"effect/unstable/cli\"\n\nconst warningFlag = Flag.atMost(Flag.string(\"warning\"), 3)\n// Allows up to 3 warning flags\n// Usage: --warning w1 --warning w2 --warning w3\n\nconst debugFlag = Flag.string(\"debug\").pipe(\n  Flag.atMost(1)\n)\n// Allows at most 1 debug flag";
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
