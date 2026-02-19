/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: isTagged
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.913Z
 *
 * Overview:
 * Checks whether a value has a `_tag` property equal to the given tag.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 * 
 * const isOk = Predicate.isTagged("Ok")
 * 
 * console.log(isOk({ _tag: "Ok", value: 1 }))
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
const exportName = "isTagged";
const exportKind = "const";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Checks whether a value has a `_tag` property equal to the given tag.";
const sourceExample = "import { Predicate } from \"effect\"\n\nconst isOk = Predicate.isTagged(\"Ok\")\n\nconsole.log(isOk({ _tag: \"Ok\", value: 1 }))";
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
