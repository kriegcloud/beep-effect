/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: setDelayEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:50:38.825Z
 *
 * Overview:
 * Sets the batch delay effect for this request resolver.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed("data"))
 *     }
 *   })
 * )
 *
 * // Set a custom delay effect (e.g., with logging)
 * const resolverWithCustomDelay = RequestResolver.setDelayEffect(
 *   resolver,
 *   Effect.gen(function*() {
 *     yield* Effect.log("Waiting before processing batch...")
 *     yield* Effect.sleep("50 millis")
 *   })
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RequestResolverModule from "effect/RequestResolver";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "setDelayEffect";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Sets the batch delay effect for this request resolver.";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\ninterface GetDataRequest extends Request.Request<string> {\n  readonly _tag: "GetDataRequest"\n}\nconst GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")\n\nconst resolver = RequestResolver.make<GetDataRequest>((entries) =>\n  Effect.sync(() => {\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed("data"))\n    }\n  })\n)\n\n// Set a custom delay effect (e.g., with logging)\nconst resolverWithCustomDelay = RequestResolver.setDelayEffect(\n  resolver,\n  Effect.gen(function*() {\n    yield* Effect.log("Waiting before processing batch...")\n    yield* Effect.sleep("50 millis")\n  })\n)';
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
