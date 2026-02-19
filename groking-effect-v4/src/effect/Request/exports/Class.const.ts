/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: Class
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:50:38.787Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Request } from "effect"
 *
 * class GetUser extends Request.Class<{ id: number }, string, Error> {
 *   constructor(readonly id: number) {
 *     super({ id })
 *   }
 * }
 *
 * const getUserRequest = new GetUser(123)
 * console.log(getUserRequest.id) // 123
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
const exportName = "Class";
const exportKind = "const";
const moduleImportPath = "effect/Request";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Request } from "effect"\n\nclass GetUser extends Request.Class<{ id: number }, string, Error> {\n  constructor(readonly id: number) {\n    super({ id })\n  }\n}\n\nconst getUserRequest = new GetUser(123)\nconsole.log(getUserRequest.id) // 123';
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
