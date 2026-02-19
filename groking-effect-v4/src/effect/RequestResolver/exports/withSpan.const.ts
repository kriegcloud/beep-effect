/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: withSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Add a tracing span to the request resolver, which will also add any span links from the request's.
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
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
 *     }
 *   })
 * )
 * 
 * // Add tracing span with custom name and attributes
 * const tracedResolver = RequestResolver.withSpan(
 *   resolver,
 *   "user-data-resolver",
 *   {
 *     attributes: {
 *       "resolver.type": "user-data",
 *       "resolver.version": "1.0"
 *     }
 *   }
 * )
 * 
 * // Spans will automatically include batch size and request links
 * const effect = Effect.request(GetDataRequest({ id: 123 }), Effect.succeed(tracedResolver))
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as RequestResolverModule from "effect/RequestResolver";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSpan";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Add a tracing span to the request resolver, which will also add any span links from the request's.";
const sourceExample = "import { Effect, Exit, Request, RequestResolver } from \"effect\"\n\ninterface GetDataRequest extends Request.Request<string> {\n  readonly _tag: \"GetDataRequest\"\n  readonly id: number\n}\nconst GetDataRequest = Request.tagged<GetDataRequest>(\"GetDataRequest\")\n\nconst resolver = RequestResolver.make<GetDataRequest>((entries) =>\n  Effect.sync(() => {\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))\n    }\n  })\n)\n\n// Add tracing span with custom name and attributes\nconst tracedResolver = RequestResolver.withSpan(\n  resolver,\n  \"user-data-resolver\",\n  {\n    attributes: {\n      \"resolver.type\": \"user-data\",\n      \"resolver.version\": \"1.0\"\n    }\n  }\n)\n\n// Spans will automatically include batch size and request links\nconst effect = Effect.request(GetDataRequest({ id: 123 }), Effect.succeed(tracedResolver))";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
