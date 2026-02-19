/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: makeGrouped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:50:38.824Z
 *
 * Overview:
 * Constructs a request resolver with the requests grouped by a calculated key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetUserByRole extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserByRole"
 *   readonly role: string
 *   readonly id: number
 * }
 * const GetUserByRole = Request.tagged<GetUserByRole>("GetUserByRole")
 *
 * // Group requests by role for efficient batch processing
 * const UserByRoleResolver = RequestResolver.makeGrouped<GetUserByRole, string>({
 *   key: ({ request }) => request.role,
 *   resolver: (entries, role) =>
 *     Effect.sync(() => {
 *       console.log(`Processing ${entries.length} requests for role: ${role}`)
 *       for (const entry of entries) {
 *         entry.completeUnsafe(
 *           Exit.succeed(`User ${entry.request.id} with role ${role}`)
 *         )
 *       }
 *     })
 * })
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
const exportName = "makeGrouped";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver with the requests grouped by a calculated key.";
const sourceExample =
  'import { Effect, Exit, Request, RequestResolver } from "effect"\n\ninterface GetUserByRole extends Request.Request<string, Error> {\n  readonly _tag: "GetUserByRole"\n  readonly role: string\n  readonly id: number\n}\nconst GetUserByRole = Request.tagged<GetUserByRole>("GetUserByRole")\n\n// Group requests by role for efficient batch processing\nconst UserByRoleResolver = RequestResolver.makeGrouped<GetUserByRole, string>({\n  key: ({ request }) => request.role,\n  resolver: (entries, role) =>\n    Effect.sync(() => {\n      console.log(`Processing ${entries.length} requests for role: ${role}`)\n      for (const entry of entries) {\n        entry.completeUnsafe(\n          Exit.succeed(`User ${entry.request.id} with role ${role}`)\n        )\n      }\n    })\n})';
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
