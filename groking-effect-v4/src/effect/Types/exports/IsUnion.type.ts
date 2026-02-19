/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: IsUnion
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:14:23.505Z
 *
 * Overview:
 * Checks whether a type `T` is a union type.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 *
 * type Yes = Types.IsUnion<"a" | "b"> // true
 * type No = Types.IsUnion<string> // false
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
import * as TypesModule from "effect/Types";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "IsUnion";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Checks whether a type `T` is a union type.";
const sourceExample =
  'import type { Types } from "effect"\n\ntype Yes = Types.IsUnion<"a" | "b"> // true\ntype No = Types.IsUnion<string> // false';
const moduleRecord = TypesModule as Record<string, unknown>;

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
