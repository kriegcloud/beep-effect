/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: fromEffectTagged
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Constructs a request resolver from a list of tags paired to functions, that takes a list of requests and returns a list of results of the same size. Each item in the result list must correspond to the item at the same index in the request list.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Request } from "effect"
 * import { Effect, RequestResolver } from "effect"
 * 
 * interface GetUser extends Request.Request<string, Error> {
 *   readonly _tag: "GetUser"
 *   readonly id: number
 * }
 * 
 * interface GetPost extends Request.Request<string, Error> {
 *   readonly _tag: "GetPost"
 *   readonly id: number
 * }
 * 
 * type MyRequest = GetUser | GetPost
 * 
 * // Create a resolver that handles different request types
 * const MyResolver = RequestResolver.fromEffectTagged<MyRequest>()({
 *   GetUser: (requests) =>
 *     Effect.succeed(requests.map((req) => `User ${req.request.id}`)),
 *   GetPost: (requests) =>
 *     Effect.succeed(requests.map((req) => `Post ${req.request.id}`))
 * })
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
const exportName = "fromEffectTagged";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver from a list of tags paired to functions, that takes a list of requests and returns a list of results of the same size. Each item in the result list...";
const sourceExample = "import type { Request } from \"effect\"\nimport { Effect, RequestResolver } from \"effect\"\n\ninterface GetUser extends Request.Request<string, Error> {\n  readonly _tag: \"GetUser\"\n  readonly id: number\n}\n\ninterface GetPost extends Request.Request<string, Error> {\n  readonly _tag: \"GetPost\"\n  readonly id: number\n}\n\ntype MyRequest = GetUser | GetPost\n\n// Create a resolver that handles different request types\nconst MyResolver = RequestResolver.fromEffectTagged<MyRequest>()({\n  GetUser: (requests) =>\n    Effect.succeed(requests.map((req) => `User ${req.request.id}`)),\n  GetPost: (requests) =>\n    Effect.succeed(requests.map((req) => `Post ${req.request.id}`))\n})";
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
