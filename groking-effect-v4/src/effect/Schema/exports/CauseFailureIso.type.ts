/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: CauseFailureIso
 * Kind: type
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

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CauseFailureIso";
const exportKind = "type";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;
const causeFailureSchema = SchemaModule.CauseFailure(SchemaModule.String, SchemaModule.String);
const causeFailureIsoCodec = SchemaModule.toCodecIso(causeFailureSchema);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeBridge = Effect.gen(function* () {
  const appearsAtRuntime = Object.hasOwn(moduleRecord, exportName);
  yield* Console.log(`"${exportName}" visible at runtime: ${appearsAtRuntime}`);
  yield* Console.log("Use Schema.CauseFailure(...) + Schema.toCodecIso(...) for executable behavior.");
  yield* inspectNamedExport({ moduleRecord, exportName: "CauseFailure" });
});

const exampleIsoRoundTrip = Effect.gen(function* () {
  const decodeIso = SchemaModule.decodeUnknownSync(causeFailureIsoCodec);
  const encodeIso = SchemaModule.encodeSync(causeFailureIsoCodec);
  const samples: ReadonlyArray<unknown> = [
    { _tag: "Fail", error: "validation failed" },
    { _tag: "Interrupt", fiberId: 7 },
  ];

  for (const sample of samples) {
    const reason = decodeIso(sample);
    const roundTrip = encodeIso(reason);
    yield* Console.log(`${formatUnknown(sample)} -> ${formatUnknown(roundTrip)}`);
  }
});

const exampleDieBranchShape = Effect.gen(function* () {
  const decodeIso = SchemaModule.decodeUnknownSync(causeFailureIsoCodec);
  const encodeIso = SchemaModule.encodeSync(causeFailureIsoCodec);

  const dieWithDefect = { _tag: "Die", defect: "fatal defect" };
  const reason = decodeIso(dieWithDefect);
  yield* Console.log(`Accepted Die payload: ${formatUnknown(encodeIso(reason))}`);

  try {
    decodeIso({ _tag: "Die", error: "fatal defect" });
    yield* Console.log("Unexpectedly accepted Die payload using `error`.");
  } catch (error) {
    const message = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`Die payload uses \`defect\`: ${message}`);
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
      description: "Confirm type erasure, then inspect the callable CauseFailure companion.",
      run: exampleRuntimeBridge,
    },
    {
      title: "Iso Round Trip (Fail + Interrupt)",
      description: "Decode iso payloads to runtime reasons and encode them back to iso form.",
      run: exampleIsoRoundTrip,
    },
    {
      title: "Die Branch Shape",
      description: "Show the runtime key used by the Die branch in the iso codec.",
      run: exampleDieBranchShape,
    },
  ],
});

BunRuntime.runMain(program);
