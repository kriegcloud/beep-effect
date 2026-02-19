/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: grouped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Transform a request resolver by grouping requests using the specified key function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetUserRequest extends Request.Request<string> {
 *   readonly _tag: "GetUserRequest"
 *   readonly userId: number
 *   readonly department: string
 * }
 * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
 *
 * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     console.log(`Processing ${entries.length} users`)
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.userId}`))
 *     }
 *   })
 * )
 *
 * // Group requests by department for more efficient processing
 * const groupedResolver = RequestResolver.grouped(
 *   resolver,
 *   ({ request }) => request.department
 * )
 *
 * // Requests for the same department will be batched together
 * const requests = [
 *   Effect.request(
 *     GetUserRequest({ userId: 1, department: "Engineering" }),
 *     Effect.succeed(groupedResolver)
 *   ),
 *   Effect.request(
 *     GetUserRequest({ userId: 2, department: "Engineering" }),
 *     Effect.succeed(groupedResolver)
 *   ),
 *   Effect.request(
 *     GetUserRequest({ userId: 3, department: "Marketing" }),
 *     Effect.succeed(groupedResolver)
 *   )
 * ]
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
const exportName = "grouped";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Transform a request resolver by grouping requests using the specified key function.";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\ninterface GetUserRequest extends Request.Request<string> {\n  readonly _tag: "GetUserRequest"\n  readonly userId: number\n  readonly department: string\n}\nconst GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")\n\nconst resolver = RequestResolver.make<GetUserRequest>((entries) =>\n  Effect.sync(() => {\n    console.log(`Processing ${entries.length} users`)\n    for (const entry of entries) {\n      entry.completeUnsafe(Exit.succeed(`User ${entry.request.userId}`))\n    }\n  })\n)\n\n// Group requests by department for more efficient processing\nconst groupedResolver = RequestResolver.grouped(\n  resolver,\n  ({ request }) => request.department\n)\n\n// Requests for the same department will be batched together\nconst requests = [\n  Effect.request(\n    GetUserRequest({ userId: 1, department: "Engineering" }),\n    Effect.succeed(groupedResolver)\n  ),\n  Effect.request(\n    GetUserRequest({ userId: 2, department: "Engineering" }),\n    Effect.succeed(groupedResolver)\n  ),\n  Effect.request(\n    GetUserRequest({ userId: 3, department: "Marketing" }),\n    Effect.succeed(groupedResolver)\n  )\n]';
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
