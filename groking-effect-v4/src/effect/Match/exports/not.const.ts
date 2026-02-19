/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: not
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Excludes a specific value from matching while allowing all others.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * // Create a matcher for string or number values
 * const match = Match.type<string | number>().pipe(
 *   // Match any value except "hi", returning "ok"
 *   Match.not("hi", () => "ok"),
 *   // Fallback case for when the value is "hi"
 *   Match.orElse(() => "fallback")
 * )
 * 
 * console.log(match("hello"))
 * // Output: "ok"
 * 
 * console.log(match("hi"))
 * // Output: "fallback"
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
const exportName = "not";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Excludes a specific value from matching while allowing all others.";
const sourceExample = "import { Match } from \"effect\"\n\n// Create a matcher for string or number values\nconst match = Match.type<string | number>().pipe(\n  // Match any value except \"hi\", returning \"ok\"\n  Match.not(\"hi\", () => \"ok\"),\n  // Fallback case for when the value is \"hi\"\n  Match.orElse(() => \"fallback\")\n)\n\nconsole.log(match(\"hello\"))\n// Output: \"ok\"\n\nconsole.log(match(\"hi\"))\n// Output: \"fallback\"";
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
