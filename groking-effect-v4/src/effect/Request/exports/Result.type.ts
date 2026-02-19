/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Request
 * Export: Result
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Request.ts
 * Generated: 2026-02-19T04:14:16.507Z
 *
 * Overview:
 * A utility type to extract the result type from a `Request`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Request } from "effect"
 * 
 * interface GetUser extends Request.Request<string, Error> {
 *   readonly _tag: "GetUser"
 *   readonly id: number
 * }
 * 
 * // Extract the result type from a Request using the utility
 * type UserResult = Request.Result<GetUser> // Exit.Exit<string, Error>
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as RequestModule from "effect/Request";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Result";
const exportKind = "type";
const moduleImportPath = "effect/Request";
const sourceSummary = "A utility type to extract the result type from a `Request`.";
const sourceExample = "import type { Request } from \"effect\"\n\ninterface GetUser extends Request.Request<string, Error> {\n  readonly _tag: \"GetUser\"\n  readonly id: number\n}\n\n// Extract the result type from a Request using the utility\ntype UserResult = Request.Result<GetUser> // Exit.Exit<string, Error>";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
