/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: RequestResolver
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:50:38.825Z
 *
 * Overview:
 * The `RequestResolver<A, R>` interface requires an environment `R` and handles the execution of requests of type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Request } from "effect"
 * import { Effect, Exit, RequestResolver } from "effect"
 *
 * interface GetUserRequest extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserRequest"
 *   readonly id: number
 * }
 *
 * // In practice, you would typically use RequestResolver.make() instead
 * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))
 *     }
 *   })
 * )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RequestResolverModule from "effect/RequestResolver";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RequestResolver";
const exportKind = "interface";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary =
  "The `RequestResolver<A, R>` interface requires an environment `R` and handles the execution of requests of type `A`.";
const sourceExample =
  'import type { Request } from "effect"\nimport { Effect, Exit, RequestResolver } from "effect"\n\ninterface GetUserRequest extends Request.Request<string, Error> {\n  readonly _tag: "GetUserRequest"\n  readonly id: number\n}\n\n// In practice, you would typically use RequestResolver.make() instead\nconst resolver = RequestResolver.make<GetUserRequest>((entries) =>\n  Effect.sync(() => {\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))\n    }\n  })\n)';
const moduleRecord = RequestResolverModule as Record<string, unknown>;

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
