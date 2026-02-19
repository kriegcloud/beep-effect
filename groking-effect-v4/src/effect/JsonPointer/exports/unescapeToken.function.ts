/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPointer
 * Export: unescapeToken
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/JsonPointer.ts
 * Generated: 2026-02-19T04:14:14.253Z
 *
 * Overview:
 * Unescapes a JSON Pointer reference token according to RFC 6901.
 *
 * Source JSDoc Example:
 * ```ts
 * import { unescapeToken } from "effect/JsonPointer"
 * 
 * unescapeToken("a~1b") // "a/b"
 * unescapeToken("c~0d") // "c~d"
 * unescapeToken("path~1to~0key") // "path/to~key"
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as JsonPointerModule from "effect/JsonPointer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "unescapeToken";
const exportKind = "function";
const moduleImportPath = "effect/JsonPointer";
const sourceSummary = "Unescapes a JSON Pointer reference token according to RFC 6901.";
const sourceExample = "import { unescapeToken } from \"effect/JsonPointer\"\n\nunescapeToken(\"a~1b\") // \"a/b\"\nunescapeToken(\"c~0d\") // \"c~d\"\nunescapeToken(\"path~1to~0key\") // \"path/to~key\"";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
