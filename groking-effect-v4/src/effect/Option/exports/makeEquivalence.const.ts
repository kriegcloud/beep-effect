/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Option } from "effect"
 * 
 * const eq = Option.makeEquivalence(Equivalence.strictEqual<number>())
 * 
 * console.log(eq(Option.some(1), Option.some(1)))
 * // Output: true
 * 
 * console.log(eq(Option.some(1), Option.some(2)))
 * // Output: false
 * 
 * console.log(eq(Option.none(), Option.none()))
 * // Output: true
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
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`.";
const sourceExample = "import { Equivalence, Option } from \"effect\"\n\nconst eq = Option.makeEquivalence(Equivalence.strictEqual<number>())\n\nconsole.log(eq(Option.some(1), Option.some(1)))\n// Output: true\n\nconsole.log(eq(Option.some(1), Option.some(2)))\n// Output: false\n\nconsole.log(eq(Option.none(), Option.none()))\n// Output: true";
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
