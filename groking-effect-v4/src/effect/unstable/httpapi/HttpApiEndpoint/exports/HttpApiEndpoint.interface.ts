/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/httpapi/HttpApiEndpoint
 * Export: HttpApiEndpoint
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/httpapi/HttpApiEndpoint.ts
 * Generated: 2026-02-19T04:50:49.330Z
 *
 * Overview:
 * Represents an API endpoint. An API endpoint is mapped to a single route on the underlying `HttpRouter`.
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
const exportName = "HttpApiEndpoint";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/httpapi/HttpApiEndpoint";
const sourceSummary =
  "Represents an API endpoint. An API endpoint is mapped to a single route on the underlying `HttpRouter`.";
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
