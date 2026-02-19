/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: ValueMatcher
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.902Z
 *
 * Overview:
 * Represents a pattern matcher that operates on a specific provided value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const input = { type: "user", name: "Alice", age: 30 }
 *
 * // Create a ValueMatcher for the specific input
 * const result = Match.value(input).pipe(
 *   Match.when({ type: "user" }, (user) => `User: ${user.name}`),
 *   Match.when({ type: "admin" }, (admin) => `Admin: ${admin.name}`),
 *   Match.orElse(() => "Unknown type")
 * )
 *
 * console.log(result) // "User: Alice"
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
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ValueMatcher";
const exportKind = "interface";
const moduleImportPath = "effect/Match";
const sourceSummary = "Represents a pattern matcher that operates on a specific provided value.";
const sourceExample =
  'import { Match } from "effect"\n\nconst input = { type: "user", name: "Alice", age: 30 }\n\n// Create a ValueMatcher for the specific input\nconst result = Match.value(input).pipe(\n  Match.when({ type: "user" }, (user) => `User: ${user.name}`),\n  Match.when({ type: "admin" }, (admin) => `Admin: ${admin.name}`),\n  Match.orElse(() => "Unknown type")\n)\n\nconsole.log(result) // "User: Alice"';
const moduleRecord = MatchModule as Record<string, unknown>;

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
