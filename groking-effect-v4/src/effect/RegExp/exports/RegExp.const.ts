/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RegExp
 * Export: RegExp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RegExp.ts
 * Generated: 2026-02-19T04:14:16.494Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { RegExp } from "effect"
 * 
 * // Create a regular expression using Effect's RegExp constructor
 * const pattern = new RegExp.RegExp("hello", "i")
 * 
 * // Test the pattern
 * console.log(pattern.test("Hello World")) // true
 * console.log(pattern.test("goodbye")) // false
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
import * as RegExpModule from "effect/RegExp";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RegExp";
const exportKind = "const";
const moduleImportPath = "effect/RegExp";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { RegExp } from \"effect\"\n\n// Create a regular expression using Effect's RegExp constructor\nconst pattern = new RegExp.RegExp(\"hello\", \"i\")\n\n// Test the pattern\nconsole.log(pattern.test(\"Hello World\")) // true\nconsole.log(pattern.test(\"goodbye\")) // false";
const moduleRecord = RegExpModule as Record<string, unknown>;

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
