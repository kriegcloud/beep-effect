/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: FilterEffect
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:14:13.259Z
 *
 * Overview:
 * Represents an effectful filter function that can produce Effects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Filter, Result } from "effect"
 *
 * // An effectful filter that validates user data
 * type User = { id: string; isActive: boolean }
 * type ValidationError = { message: string }
 *
 * const validateUser: Filter.FilterEffect<
 *   string,
 *   User,
 *   User,
 *   ValidationError,
 *   never
 * > = (id) =>
 *   Effect.gen(function*() {
 *     const user: User = { id, isActive: id.length > 0 }
 *     return user.isActive ? Result.succeed(user) : Result.fail(user)
 *   })
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
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FilterEffect";
const exportKind = "interface";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Represents an effectful filter function that can produce Effects.";
const sourceExample =
  'import { Effect, Filter, Result } from "effect"\n\n// An effectful filter that validates user data\ntype User = { id: string; isActive: boolean }\ntype ValidationError = { message: string }\n\nconst validateUser: Filter.FilterEffect<\n  string,\n  User,\n  User,\n  ValidationError,\n  never\n> = (id) =>\n  Effect.gen(function*() {\n    const user: User = { id, isActive: id.length > 0 }\n    return user.isActive ? Result.succeed(user) : Result.fail(user)\n  })';
const moduleRecord = FilterModule as Record<string, unknown>;

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
