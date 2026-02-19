/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: isRequest
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:50:38.787Z
 *
 * Overview:
 * Tests if a value is a `Request`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Request } from "effect"
 *
 * declare const User: unique symbol
 * declare const UserNotFound: unique symbol
 * type User = typeof User
 * type UserNotFound = typeof UserNotFound
 *
 * interface GetUser extends Request.Request<User, UserNotFound> {
 *   readonly _tag: "GetUser"
 *   readonly id: string
 * }
 * const GetUser = Request.tagged<GetUser>("GetUser")
 *
 * const request = GetUser({ id: "123" })
 * console.log(Request.isRequest(request)) // true
 * console.log(Request.isRequest("not a request")) // false
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
import * as RequestModule from "effect/Request";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isRequest";
const exportKind = "const";
const moduleImportPath = "effect/Request";
const sourceSummary = "Tests if a value is a `Request`.";
const sourceExample =
  'import { Request } from "effect"\n\ndeclare const User: unique symbol\ndeclare const UserNotFound: unique symbol\ntype User = typeof User\ntype UserNotFound = typeof UserNotFound\n\ninterface GetUser extends Request.Request<User, UserNotFound> {\n  readonly _tag: "GetUser"\n  readonly id: string\n}\nconst GetUser = Request.tagged<GetUser>("GetUser")\n\nconst request = GetUser({ id: "123" })\nconsole.log(Request.isRequest(request)) // true\nconsole.log(Request.isRequest("not a request")) // false';
const moduleRecord = RequestModule as Record<string, unknown>;

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
