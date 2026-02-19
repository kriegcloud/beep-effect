/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: BigInt
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
const exportName = "BigInt";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const formatSample = (sample: unknown): string => {
  if (typeof sample === "bigint") {
    return `${sample}n`;
  }
  if (typeof sample === "string") {
    return JSON.stringify(sample);
  }
  return String(sample);
};

const exampleRuntimeBridge = Effect.gen(function* () {
  yield* Console.log("Type-level interface is erased; runtime behavior comes from Schema.BigInt.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleBigIntGuard = Effect.gen(function* () {
  const isBigInt = SchemaModule.is(SchemaModule.BigInt);
  const samples: ReadonlyArray<unknown> = [0n, 12n, 12, "12", null];

  for (const sample of samples) {
    yield* Console.log(`is(BigInt)(${formatSample(sample)}) => ${isBigInt(sample)}`);
  }
});

const exampleBigIntConstraintDecode = Effect.gen(function* () {
  const boundedBigInt = SchemaModule.BigInt.check(SchemaModule.isBetweenBigInt({ minimum: 10n, maximum: 20n }));
  const decodeBoundedBigInt = SchemaModule.decodeUnknownSync(boundedBigInt);

  yield* Console.log(`decode(15n) => ${formatSample(decodeBoundedBigInt(15n))}`);

  try {
    decodeBoundedBigInt(25n);
    yield* Console.log("decode(25n) unexpectedly succeeded.");
  } catch (error) {
    const message = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`decode(25n) failed as expected: ${message}`);
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
      title: "BigInt Type Guard",
      description: "Use Schema.is with Schema.BigInt to validate unknown inputs.",
      run: exampleBigIntGuard,
    },
    {
      title: "Bounded BigInt Decode",
      description: "Decode a bigint constrained by Schema.isBetweenBigInt.",
      run: exampleBigIntConstraintDecode,
    },
  ],
});

BunRuntime.runMain(program);
