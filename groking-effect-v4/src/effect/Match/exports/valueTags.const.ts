/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: valueTags
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.902Z
 *
 * Overview:
 * Creates a match function for a specific value with discriminated union handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * type Status = { readonly _tag: "Success"; readonly data: string }
 * 
 * const success: Status = { _tag: "Success", data: "Hello" }
 * 
 * // Simple valueTags usage
 * const message = Match.valueTags(success, {
 *   Success: (result) => `Success: ${result.data}`
 * })
 * 
 * console.log(message) // "Success: Hello"
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
import * as MatchModule from "effect/Match";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "valueTags";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Creates a match function for a specific value with discriminated union handling.";
const sourceExample = "import { Match } from \"effect\"\n\ntype Status = { readonly _tag: \"Success\"; readonly data: string }\n\nconst success: Status = { _tag: \"Success\", data: \"Hello\" }\n\n// Simple valueTags usage\nconst message = Match.valueTags(success, {\n  Success: (result) => `Success: ${result.data}`\n})\n\nconsole.log(message) // \"Success: Hello\"";
const moduleRecord = MatchModule as Record<string, unknown>;

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
