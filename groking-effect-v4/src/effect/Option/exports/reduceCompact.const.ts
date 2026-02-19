/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: reduceCompact
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
 *
 * Overview:
 * Reduces an iterable of `Option`s to a single value, skipping `None` entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, pipe } from "effect"
 * 
 * const items = [Option.some(1), Option.none(), Option.some(2), Option.none()]
 * 
 * console.log(pipe(items, Option.reduceCompact(0, (b, a) => b + a)))
 * // Output: 3
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
import * as OptionModule from "effect/Option";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reduceCompact";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Reduces an iterable of `Option`s to a single value, skipping `None` entries.";
const sourceExample = "import { Option, pipe } from \"effect\"\n\nconst items = [Option.some(1), Option.none(), Option.some(2), Option.none()]\n\nconsole.log(pipe(items, Option.reduceCompact(0, (b, a) => b + a)))\n// Output: 3";
const moduleRecord = OptionModule as Record<string, unknown>;

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
