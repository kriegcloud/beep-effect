/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: nor
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.913Z
 *
 * Overview:
 * Creates a predicate that returns `true` when neither predicate is `true`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 * 
 * const neither = Predicate.nor(Predicate.isString, Predicate.isNumber)
 * 
 * console.log(neither(true))
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
import * as PredicateModule from "effect/Predicate";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nor";
const exportKind = "const";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Creates a predicate that returns `true` when neither predicate is `true`.";
const sourceExample = "import { Predicate } from \"effect\"\n\nconst neither = Predicate.nor(Predicate.isString, Predicate.isNumber)\n\nconsole.log(neither(true))";
const moduleRecord = PredicateModule as Record<string, unknown>;

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
