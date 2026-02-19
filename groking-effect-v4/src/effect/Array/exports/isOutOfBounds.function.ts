/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: isOutOfBounds
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isOutOfBounds";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const runtimeExport = moduleRecord[exportName];
  if (typeof runtimeExport !== "function") {
    yield* Console.log("isOutOfBounds is not a callable runtime export in this build.");
    return;
  }
  const isOutOfBounds = runtimeExport as (index: number, values: ReadonlyArray<unknown>) => boolean;
  const input = ["kick", "snare", "hat"];

  yield* Console.log(`isOutOfBounds(0, ["kick", "snare", "hat"]) => ${isOutOfBounds(0, input)}`);
  yield* Console.log(`isOutOfBounds(2, ["kick", "snare", "hat"]) => ${isOutOfBounds(2, input)}`);
  yield* Console.log(`isOutOfBounds(3, ["kick", "snare", "hat"]) => ${isOutOfBounds(3, input)}`);
});

const exampleBoundaryCases = Effect.gen(function* () {
  const runtimeExport = moduleRecord[exportName];
  if (typeof runtimeExport !== "function") {
    yield* Console.log("isOutOfBounds is not a callable runtime export in this build.");
    return;
  }
  const isOutOfBounds = runtimeExport as (index: number, values: ReadonlyArray<unknown>) => boolean;
  const empty: ReadonlyArray<number> = [];
  const singleton = [42];

  yield* Console.log(`isOutOfBounds(0, []) => ${isOutOfBounds(0, empty)}`);
  yield* Console.log(`isOutOfBounds(-1, [42]) => ${isOutOfBounds(-1, singleton)}`);
  yield* Console.log(`isOutOfBounds(0, [42]) => ${isOutOfBounds(0, singleton)}`);
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
      title: "Source-Aligned Invocation",
      description: "Check in-range and out-of-range indexes against a non-empty array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Boundary: Empty and Negative Indexes",
      description: "Show bounds behavior for an empty array and a negative index.",
      run: exampleBoundaryCases,
    },
  ],
});

BunRuntime.runMain(program);
