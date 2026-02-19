/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: batchN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Returns a request resolver that executes at most `n` requests in parallel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 *   readonly id: number
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     console.log(`Processing batch of ${entries.length} requests`)
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Limit batches to maximum 5 requests
 * const limitedResolver = RequestResolver.batchN(resolver, 5)
 *
 * // When more than 5 requests are made, they'll be split into multiple batches
 * const requests = Array.from(
 *   { length: 12 },
 *   (_, i) => Effect.request(GetDataRequest({ id: i }), Effect.succeed(limitedResolver))
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RequestResolverModule from "effect/RequestResolver";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "batchN";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Returns a request resolver that executes at most `n` requests in parallel.";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\ninterface GetDataRequest extends Request.Request<string> {\n  readonly _tag: "GetDataRequest"\n  readonly id: number\n}\nconst GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")\n\nconst resolver = RequestResolver.make<GetDataRequest>((entries) =>\n  Effect.sync(() => {\n    console.log(`Processing batch of ${entries.length} requests`)\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))\n    }\n  })\n)\n\n// Limit batches to maximum 5 requests\nconst limitedResolver = RequestResolver.batchN(resolver, 5)\n\n// When more than 5 requests are made, they\'ll be split into multiple batches\nconst requests = Array.from(\n  { length: 12 },\n  (_, i) => Effect.request(GetDataRequest({ id: i }), Effect.succeed(limitedResolver))\n)';
const moduleRecord = RequestResolverModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
