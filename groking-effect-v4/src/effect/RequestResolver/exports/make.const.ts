/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Constructs a request resolver with the specified method to run requests.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * // Define a request type
 * interface GetUserRequest extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserRequest"
 *   readonly id: number
 * }
 * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
 *
 * // Create a resolver that handles the requests
 * const UserResolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       // Complete each request with a result
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Use the resolver to handle requests
 * const getUserEffect = Effect.request(GetUserRequest({ id: 123 }), Effect.succeed(UserResolver))
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver with the specified method to run requests.";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\n// Define a request type\ninterface GetUserRequest extends Request.Request<string, Error> {\n  readonly _tag: "GetUserRequest"\n  readonly id: number\n}\nconst GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")\n\n// Create a resolver that handles the requests\nconst UserResolver = RequestResolver.make<GetUserRequest>((entries) =>\n  Effect.sync(() => {\n    for (const entry of entries) {\n      // Complete each request with a result\n      entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))\n    }\n  })\n)\n\n// Use the resolver to handle requests\nconst getUserEffect = Effect.request(GetUserRequest({ id: 123 }), Effect.succeed(UserResolver))';
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
