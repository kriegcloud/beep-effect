/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: ExcludeReason
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:14:23.505Z
 *
 * Overview:
 * Excludes a specific reason variant by its `_tag` from an error's `reason` field.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 *
 * type RateLimitError = { readonly _tag: "RateLimitError"; readonly retryAfter: number }
 * type QuotaError = { readonly _tag: "QuotaError"; readonly limit: number }
 * type ApiError = { readonly _tag: "ApiError"; readonly reason: RateLimitError | QuotaError }
 *
 * type Result = Types.ExcludeReason<ApiError, "RateLimitError">
 * // { readonly _tag: "QuotaError"; readonly limit: number }
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
const exportName = "ExcludeReason";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Excludes a specific reason variant by its `_tag` from an error's `reason` field.";
const sourceExample =
  'import type { Types } from "effect"\n\ntype RateLimitError = { readonly _tag: "RateLimitError"; readonly retryAfter: number }\ntype QuotaError = { readonly _tag: "QuotaError"; readonly limit: number }\ntype ApiError = { readonly _tag: "ApiError"; readonly reason: RateLimitError | QuotaError }\n\ntype Result = Types.ExcludeReason<ApiError, "RateLimitError">\n// { readonly _tag: "QuotaError"; readonly limit: number }';
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
