/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: Request
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:50:38.788Z
 *
 * Overview:
 * A `Request<A, E, R>` is a request from a data source for a value of type `A` that may fail with an `E` and have requirements of type `R`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Request } from "effect"
 *
 * // Define a request that fetches a user by ID
 * interface GetUser extends Request.Request<string, Error> {
 *   readonly _tag: "GetUser"
 *   readonly id: number
 * }
 *
 * // Define a request that fetches all users
 * interface GetAllUsers extends Request.Request<ReadonlyArray<string>, Error> {
 *   readonly _tag: "GetAllUsers"
 * }
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
import * as RequestModule from "effect/Request";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Request";
const exportKind = "interface";
const moduleImportPath = "effect/Request";
const sourceSummary =
  "A `Request<A, E, R>` is a request from a data source for a value of type `A` that may fail with an `E` and have requirements of type `R`.";
const sourceExample =
  'import type { Request } from "effect"\n\n// Define a request that fetches a user by ID\ninterface GetUser extends Request.Request<string, Error> {\n  readonly _tag: "GetUser"\n  readonly id: number\n}\n\n// Define a request that fetches all users\ninterface GetAllUsers extends Request.Request<ReadonlyArray<string>, Error> {\n  readonly _tag: "GetAllUsers"\n}';
const moduleRecord = RequestModule as Record<string, unknown>;

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
