/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: at
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:14:21.471Z
 *
 * Overview:
 * A `pipe`-able version of the native `charAt` method.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, String } from "effect"
 * 
 * pipe("abc", String.at(1)) // "b"
 * pipe("abc", String.at(4)) // undefined
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
import * as StringModule from "effect/String";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "at";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "A `pipe`-able version of the native `charAt` method.";
const sourceExample = "import { pipe, String } from \"effect\"\n\npipe(\"abc\", String.at(1)) // \"b\"\npipe(\"abc\", String.at(4)) // undefined";
const moduleRecord = StringModule as Record<string, unknown>;

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
