/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Data
 * Export: taggedEnum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Data.ts
 * Generated: 2026-02-19T04:14:11.233Z
 *
 * Overview:
 * Create a constructor for a tagged union of `Data` structs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data } from "effect"
 *
 * const { BadRequest, NotFound } = Data.taggedEnum<
 *   | {
 *     readonly _tag: "BadRequest"
 *     readonly status: 400
 *     readonly message: string
 *   }
 *   | {
 *     readonly _tag: "NotFound"
 *     readonly status: 404
 *     readonly message: string
 *   }
 * >()
 *
 * const notFound = NotFound({ status: 404, message: "Not Found" })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DataModule from "effect/Data";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "taggedEnum";
const exportKind = "const";
const moduleImportPath = "effect/Data";
const sourceSummary = "Create a constructor for a tagged union of `Data` structs.";
const sourceExample =
  'import { Data } from "effect"\n\nconst { BadRequest, NotFound } = Data.taggedEnum<\n  | {\n    readonly _tag: "BadRequest"\n    readonly status: 400\n    readonly message: string\n  }\n  | {\n    readonly _tag: "NotFound"\n    readonly status: 404\n    readonly message: string\n  }\n>()\n\nconst notFound = NotFound({ status: 404, message: "Not Found" })';
const moduleRecord = DataModule as Record<string, unknown>;

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
