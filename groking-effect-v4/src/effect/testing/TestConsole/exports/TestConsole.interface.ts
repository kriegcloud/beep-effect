/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: TestConsole
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:14:22.354Z
 *
 * Overview:
 * A `TestConsole` provides a testable implementation of the Console interface. It captures all console output for testing purposes while maintaining full compatibility with the standard Console API.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("Hello, World!")
 *   yield* Console.error("An error occurred")
 *
 *   const logs = yield* TestConsole.logLines
 *   const errors = yield* TestConsole.errorLines
 *
 *   console.log(logs) // [["Hello, World!"]]
 *   console.log(errors) // [["An error occurred"]]
 * }).pipe(Effect.provide(TestConsole.layer))
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TestConsoleModule from "effect/testing/TestConsole";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TestConsole";
const exportKind = "interface";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary =
  "A `TestConsole` provides a testable implementation of the Console interface. It captures all console output for testing purposes while maintaining full compatibility with the st...";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport * as TestConsole from "effect/testing/TestConsole"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log("Hello, World!")\n  yield* Console.error("An error occurred")\n\n  const logs = yield* TestConsole.logLines\n  const errors = yield* TestConsole.errorLines\n\n  console.log(logs) // [["Hello, World!"]]\n  console.log(errors) // [["An error occurred"]]\n}).pipe(Effect.provide(TestConsole.layer))';
const moduleRecord = TestConsoleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
