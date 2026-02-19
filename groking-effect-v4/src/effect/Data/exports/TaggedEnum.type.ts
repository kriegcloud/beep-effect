/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Data
 * Export: TaggedEnum
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Data.ts
 * Generated: 2026-02-19T04:14:11.233Z
 *
 * Overview:
 * Create a tagged enum data type, which is a union of `Data` structs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data } from "effect"
 *
 * // Define a tagged enum type
 * type HttpError = Data.TaggedEnum<{
 *   BadRequest: { readonly status: 400; readonly message: string }
 *   NotFound: { readonly status: 404; readonly message: string }
 *   InternalError: { readonly status: 500; readonly details: string }
 * }>
 *
 * // This is equivalent to the union type:
 * type HttpErrorExpanded =
 *   | {
 *     readonly _tag: "BadRequest"
 *     readonly status: 400
 *     readonly message: string
 *   }
 *   | {
 *     readonly _tag: "NotFound"
 *     readonly status: 404
 *     readonly message: string
 *   }
 *   | {
 *     readonly _tag: "InternalError"
 *     readonly status: 500
 *     readonly details: string
 *   }
 *
 * // Usage with constructors
 * const { BadRequest, InternalError, NotFound } = Data.taggedEnum<HttpError>()
 *
 * const error: HttpError = BadRequest({ status: 400, message: "Invalid request" })
 * console.log(error._tag) // "BadRequest"
 * console.log(error.status) // 400
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
import * as DataModule from "effect/Data";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TaggedEnum";
const exportKind = "type";
const moduleImportPath = "effect/Data";
const sourceSummary = "Create a tagged enum data type, which is a union of `Data` structs.";
const sourceExample =
  'import { Data } from "effect"\n\n// Define a tagged enum type\ntype HttpError = Data.TaggedEnum<{\n  BadRequest: { readonly status: 400; readonly message: string }\n  NotFound: { readonly status: 404; readonly message: string }\n  InternalError: { readonly status: 500; readonly details: string }\n}>\n\n// This is equivalent to the union type:\ntype HttpErrorExpanded =\n  | {\n    readonly _tag: "BadRequest"\n    readonly status: 400\n    readonly message: string\n  }\n  | {\n    readonly _tag: "NotFound"\n    readonly status: 404\n    readonly message: string\n  }\n  | {\n    readonly _tag: "InternalError"\n    readonly status: 500\n    readonly details: string\n  }\n\n// Usage with constructors\nconst { BadRequest, InternalError, NotFound } = Data.taggedEnum<HttpError>()\n\nconst error: HttpError = BadRequest({ status: 400, message: "Invalid request" })\nconsole.log(error._tag) // "BadRequest"\nconsole.log(error.status) // 400';
const moduleRecord = DataModule as Record<string, unknown>;

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
