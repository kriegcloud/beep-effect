/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: exists
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Tests if the value in a `Some` satisfies a predicate or refinement.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const isEven = (n: number) => n % 2 === 0
 *
 * console.log(Option.some(2).pipe(Option.exists(isEven)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(Option.exists(isEven)))
 * // Output: false
 *
 * console.log(Option.none().pipe(Option.exists(isEven)))
 * // Output: false
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "exists";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Tests if the value in a `Some` satisfies a predicate or refinement.";
const sourceExample =
  'import { Option } from "effect"\n\nconst isEven = (n: number) => n % 2 === 0\n\nconsole.log(Option.some(2).pipe(Option.exists(isEven)))\n// Output: true\n\nconsole.log(Option.some(1).pipe(Option.exists(isEven)))\n// Output: false\n\nconsole.log(Option.none().pipe(Option.exists(isEven)))\n// Output: false';
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
