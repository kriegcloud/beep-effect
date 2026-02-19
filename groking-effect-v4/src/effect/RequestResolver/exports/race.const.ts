/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: race
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:50:38.825Z
 *
 * Overview:
 * Returns a new request resolver that executes requests by sending them to this request resolver and that request resolver, returning the results from the first data source to complete and safely interrupting the loser.
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
 * // Fast resolver (simulating cache)
 * const fastResolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("10 millis")
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`fast-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Slow resolver (simulating database)
 * const slowResolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`slow-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Race resolvers - will use whichever completes first
 * const racingResolver = RequestResolver.race(fastResolver, slowResolver)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RequestResolverModule from "effect/RequestResolver";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "race";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary =
  "Returns a new request resolver that executes requests by sending them to this request resolver and that request resolver, returning the results from the first data source to com...";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\ninterface GetDataRequest extends Request.Request<string> {\n  readonly _tag: "GetDataRequest"\n  readonly id: number\n}\nconst GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")\n\n// Fast resolver (simulating cache)\nconst fastResolver = RequestResolver.make<GetDataRequest>((entries) =>\n  Effect.gen(function*() {\n    yield* Effect.sleep("10 millis")\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`fast-${entry.request.id}`))\n    }\n  })\n)\n\n// Slow resolver (simulating database)\nconst slowResolver = RequestResolver.make<GetDataRequest>((entries) =>\n  Effect.gen(function*() {\n    yield* Effect.sleep("100 millis")\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`slow-${entry.request.id}`))\n    }\n  })\n)\n\n// Race resolvers - will use whichever completes first\nconst racingResolver = RequestResolver.race(fastResolver, slowResolver)';
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
