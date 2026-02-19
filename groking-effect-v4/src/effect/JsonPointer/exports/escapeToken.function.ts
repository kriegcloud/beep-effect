/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPointer
 * Export: escapeToken
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/JsonPointer.ts
 * Generated: 2026-02-19T04:50:37.192Z
 *
 * Overview:
 * Escapes a JSON Pointer reference token according to RFC 6901.
 *
 * Source JSDoc Example:
 * ```ts
 * import { escapeToken } from "effect/JsonPointer"
 *
 * escapeToken("a/b") // "a~1b"
 * escapeToken("c~d") // "c~0d"
 * escapeToken("path/to~key") // "path~1to~0key"
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as JsonPointerModule from "effect/JsonPointer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "escapeToken";
const exportKind = "function";
const moduleImportPath = "effect/JsonPointer";
const sourceSummary = "Escapes a JSON Pointer reference token according to RFC 6901.";
const sourceExample =
  'import { escapeToken } from "effect/JsonPointer"\n\nescapeToken("a/b") // "a~1b"\nescapeToken("c~d") // "c~0d"\nescapeToken("path/to~key") // "path~1to~0key"';
const moduleRecord = JsonPointerModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
