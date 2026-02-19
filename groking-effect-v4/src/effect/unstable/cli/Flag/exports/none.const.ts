/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: none
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.461Z
 *
 * Overview:
 * Creates an empty sentinel flag that always fails to parse. This is useful for creating placeholder flags or for combinators.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 * 
 * // Used as a placeholder in flag combinators
 * const conditionalFlag = true ? Flag.string("value") : Flag.none
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
const exportName = "none";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Creates an empty sentinel flag that always fails to parse. This is useful for creating placeholder flags or for combinators.";
const sourceExample = "import { Flag } from \"effect/unstable/cli\"\n\n// Used as a placeholder in flag combinators\nconst conditionalFlag = true ? Flag.string(\"value\") : Flag.none";
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
