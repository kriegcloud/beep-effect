/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Runtime
 * Export: Teardown
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Runtime.ts
 * Generated: 2026-02-19T04:14:16.967Z
 *
 * Overview:
 * Represents a teardown function that handles program completion and determines the exit code.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Runtime } from "effect"
 *
 * // Custom teardown that logs completion status
 * const customTeardown: Runtime.Teardown = (exit, onExit) => {
 *   if (Exit.isSuccess(exit)) {
 *     console.log("Program completed successfully with value:", exit.value)
 *     onExit(0)
 *   } else {
 *     console.log("Program failed with cause:", exit.cause)
 *     onExit(1)
 *   }
 * }
 *
 * // Use with makeRunMain
 * const runMain = Runtime.makeRunMain(({ fiber, teardown }) => {
 *   fiber.addObserver((exit) => {
 *     teardown(exit, (code) => {
 *       console.log(`Exiting with code: ${code}`)
 *     })
 *   })
 * })
 *
 * const program = Effect.succeed("Hello, World!")
 * runMain(program, { teardown: customTeardown })
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
import * as RuntimeModule from "effect/Runtime";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Teardown";
const exportKind = "interface";
const moduleImportPath = "effect/Runtime";
const sourceSummary = "Represents a teardown function that handles program completion and determines the exit code.";
const sourceExample =
  'import { Effect, Exit, Runtime } from "effect"\n\n// Custom teardown that logs completion status\nconst customTeardown: Runtime.Teardown = (exit, onExit) => {\n  if (Exit.isSuccess(exit)) {\n    console.log("Program completed successfully with value:", exit.value)\n    onExit(0)\n  } else {\n    console.log("Program failed with cause:", exit.cause)\n    onExit(1)\n  }\n}\n\n// Use with makeRunMain\nconst runMain = Runtime.makeRunMain(({ fiber, teardown }) => {\n  fiber.addObserver((exit) => {\n    teardown(exit, (code) => {\n      console.log(`Exiting with code: ${code}`)\n    })\n  })\n})\n\nconst program = Effect.succeed("Hello, World!")\nrunMain(program, { teardown: customTeardown })';
const moduleRecord = RuntimeModule as Record<string, unknown>;

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
