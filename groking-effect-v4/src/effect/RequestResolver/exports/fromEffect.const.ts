/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: fromEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Constructs a request resolver from an effectual function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 *
 * interface GetUserFromAPIRequest extends Request.Request<string> {
 *   readonly _tag: "GetUserFromAPIRequest"
 *   readonly id: number
 * }
 * const GetUserFromAPIRequest = Request.tagged<GetUserFromAPIRequest>(
 *   "GetUserFromAPIRequest"
 * )
 *
 * // Create a resolver that uses effects (like HTTP calls)
 * const UserAPIResolver = RequestResolver.fromEffect<GetUserFromAPIRequest>(
 *   (entry) =>
 *     Effect.gen(function*() {
 *       // Simulate an API call
 *       yield* Effect.sleep("100 millis")
 *       // Just return the result without error handling for simplicity
 *       return `User ${entry.request.id} from API`
 *     })
 * )
 *
 * // Usage
 * const getUserEffect = Effect.request(
 *   GetUserFromAPIRequest({ id: 123 }),
 *   Effect.succeed(UserAPIResolver)
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
const exportName = "fromEffect";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver from an effectual function.";
const sourceExample =
  'import { Effect, Request, RequestResolver } from "effect"\n\ninterface GetUserFromAPIRequest extends Request.Request<string> {\n  readonly _tag: "GetUserFromAPIRequest"\n  readonly id: number\n}\nconst GetUserFromAPIRequest = Request.tagged<GetUserFromAPIRequest>(\n  "GetUserFromAPIRequest"\n)\n\n// Create a resolver that uses effects (like HTTP calls)\nconst UserAPIResolver = RequestResolver.fromEffect<GetUserFromAPIRequest>(\n  (entry) =>\n    Effect.gen(function*() {\n      // Simulate an API call\n      yield* Effect.sleep("100 millis")\n      // Just return the result without error handling for simplicity\n      return `User ${entry.request.id} from API`\n    })\n)\n\n// Usage\nconst getUserEffect = Effect.request(\n  GetUserFromAPIRequest({ id: 123 }),\n  Effect.succeed(UserAPIResolver)\n)';
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
