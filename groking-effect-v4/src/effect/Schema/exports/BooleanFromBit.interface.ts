/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: BooleanFromBit
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "BooleanFromBit";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeBridge = Effect.gen(function* () {
  yield* Console.log("Type-level interface is erased; runtime behavior comes from Schema.BooleanFromBit.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleDecodeBits = Effect.gen(function* () {
  const decodeBooleanFromBit = SchemaModule.decodeUnknownSync(SchemaModule.BooleanFromBit);
  const samples: ReadonlyArray<unknown> = [0, 1, 2, "1"];

  for (const sample of samples) {
    try {
      const decoded = decodeBooleanFromBit(sample);
      yield* Console.log(`decode(${JSON.stringify(sample)}) => ${decoded}`);
    } catch (error) {
      const message = String(error).split("\n")[0] ?? String(error);
      yield* Console.log(`decode(${JSON.stringify(sample)}) failed: ${message}`);
    }
  }
});

const exampleEncodeBooleans = Effect.gen(function* () {
  const encodeBooleanToBit = SchemaModule.encodeUnknownSync(SchemaModule.BooleanFromBit);
  const samples: ReadonlyArray<unknown> = [true, false, 1];

  for (const sample of samples) {
    try {
      const encoded = encodeBooleanToBit(sample);
      yield* Console.log(`encode(${JSON.stringify(sample)}) => ${encoded}`);
    } catch (error) {
      const message = String(error).split("\n")[0] ?? String(error);
      yield* Console.log(`encode(${JSON.stringify(sample)}) failed: ${message}`);
    }
  }
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
      title: "Runtime Companion Bridge",
      description: "Show the runtime schema value that corresponds to this type-level export.",
      run: exampleRuntimeBridge,
    },
    {
      title: "Decode Bits to Booleans",
      description: "Use Schema.decodeUnknownSync(BooleanFromBit) for valid and invalid bit inputs.",
      run: exampleDecodeBits,
    },
    {
      title: "Encode Booleans to Bits",
      description: "Use Schema.encodeUnknownSync(BooleanFromBit) and show failure for non-boolean input.",
      run: exampleEncodeBooleans,
    },
  ],
});

BunRuntime.runMain(program);
