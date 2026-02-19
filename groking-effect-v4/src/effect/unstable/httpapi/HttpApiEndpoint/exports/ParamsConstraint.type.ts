/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/httpapi/HttpApiEndpoint
 * Export: ParamsConstraint
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/httpapi/HttpApiEndpoint.ts
 * Generated: 2026-02-19T04:50:49.331Z
 *
 * Overview:
 * Params come from the router as `string` (optional params as `undefined`) and must be encodable back into the URL path.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as HttpApiEndpointModule from "effect/unstable/httpapi/HttpApiEndpoint";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ParamsConstraint";
const exportKind = "type";
const moduleImportPath = "effect/unstable/httpapi/HttpApiEndpoint";
const sourceSummary =
  "Params come from the router as `string` (optional params as `undefined`) and must be encodable back into the URL path.";
const sourceExample = "";
const moduleRecord = HttpApiEndpointModule as Record<string, unknown>;

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
