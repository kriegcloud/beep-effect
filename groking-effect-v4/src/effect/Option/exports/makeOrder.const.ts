/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Creates an `Order` for `Option<A>` from an `Order` for `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * import * as N from "effect/Number"
 *
 * const ord = Option.makeOrder(N.Order)
 *
 * console.log(ord(Option.none(), Option.some(1)))
 * // Output: -1
 *
 * console.log(ord(Option.some(1), Option.none()))
 * // Output: 1
 *
 * console.log(ord(Option.some(1), Option.some(2)))
 * // Output: -1
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
const exportName = "makeOrder";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates an `Order` for `Option<A>` from an `Order` for `A`.";
const sourceExample =
  'import { Option } from "effect"\nimport * as N from "effect/Number"\n\nconst ord = Option.makeOrder(N.Order)\n\nconsole.log(ord(Option.none(), Option.some(1)))\n// Output: -1\n\nconsole.log(ord(Option.some(1), Option.none()))\n// Output: 1\n\nconsole.log(ord(Option.some(1), Option.some(2)))\n// Output: -1';
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
