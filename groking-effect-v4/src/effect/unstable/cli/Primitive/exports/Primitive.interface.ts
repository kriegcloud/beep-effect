/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: Primitive
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Represents a primitive type that can parse string input into a typed value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 * 
 * // Using built-in primitives
 * const parseString = Effect.gen(function*() {
 *   const stringResult = yield* Primitive.string.parse("hello")
 *   const numberResult = yield* Primitive.integer.parse("42")
 *   const boolResult = yield* Primitive.boolean.parse("true")
 * 
 *   return { stringResult, numberResult, boolResult }
 * })
 * 
 * // All primitives provide parsing functionality
 * const parseDate = Effect.gen(function*() {
 *   const dateResult = yield* Primitive.date.parse("2023-12-25")
 *   const pathResult = yield* Primitive.path("file", true).parse("./package.json")
 *   return { dateResult, pathResult }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as PrimitiveModule from "effect/unstable/cli/Primitive";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Primitive";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Represents a primitive type that can parse string input into a typed value.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Primitive } from \"effect/unstable/cli\"\n\n// Using built-in primitives\nconst parseString = Effect.gen(function*() {\n  const stringResult = yield* Primitive.string.parse(\"hello\")\n  const numberResult = yield* Primitive.integer.parse(\"42\")\n  const boolResult = yield* Primitive.boolean.parse(\"true\")\n\n  return { stringResult, numberResult, boolResult }\n})\n\n// All primitives provide parsing functionality\nconst parseDate = Effect.gen(function*() {\n  const dateResult = yield* Primitive.date.parse(\"2023-12-25\")\n  const pathResult = yield* Primitive.path(\"file\", true).parse(\"./package.json\")\n  return { dateResult, pathResult }\n})";
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
