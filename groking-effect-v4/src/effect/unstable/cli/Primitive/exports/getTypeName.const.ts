/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: getTypeName
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Gets a human-readable type name for a primitive.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Primitive } from "effect/unstable/cli"
 * 
 * console.log(Primitive.getTypeName(Primitive.string)) // "string"
 * console.log(Primitive.getTypeName(Primitive.integer)) // "integer"
 * console.log(Primitive.getTypeName(Primitive.boolean)) // "boolean"
 * console.log(Primitive.getTypeName(Primitive.date)) // "date"
 * console.log(Primitive.getTypeName(Primitive.keyValuePair)) // "key=value"
 * 
 * const logLevelChoice = Primitive.choice([
 *   ["debug", "debug"],
 *   ["info", "info"]
 * ])
 * console.log(Primitive.getTypeName(logLevelChoice)) // "choice"
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
import * as PrimitiveModule from "effect/unstable/cli/Primitive";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getTypeName";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Gets a human-readable type name for a primitive.";
const sourceExample = "import { Primitive } from \"effect/unstable/cli\"\n\nconsole.log(Primitive.getTypeName(Primitive.string)) // \"string\"\nconsole.log(Primitive.getTypeName(Primitive.integer)) // \"integer\"\nconsole.log(Primitive.getTypeName(Primitive.boolean)) // \"boolean\"\nconsole.log(Primitive.getTypeName(Primitive.date)) // \"date\"\nconsole.log(Primitive.getTypeName(Primitive.keyValuePair)) // \"key=value\"\n\nconst logLevelChoice = Primitive.choice([\n  [\"debug\", \"debug\"],\n  [\"info\", \"info\"]\n])\nconsole.log(Primitive.getTypeName(logLevelChoice)) // \"choice\"";
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
