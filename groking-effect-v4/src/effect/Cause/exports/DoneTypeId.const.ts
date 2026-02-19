/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: DoneTypeId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Unique brand for {@link Done} values.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DoneTypeId";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Unique brand for {@link Done} values.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDoneBrandRoundTrip = Effect.gen(function* () {
  const marker = CauseModule.DoneTypeId;
  const doneSignal = CauseModule.Done("queue drained");
  const doneRecord = doneSignal as Record<string, unknown>;
  const brandField = doneRecord[marker];

  yield* Console.log(`DoneTypeId runtime value: ${marker}`);
  yield* Console.log(`Done signal tag: ${doneSignal._tag}`);
  yield* Console.log(`Done brand field equals DoneTypeId: ${brandField === marker}`);
});

const exampleDoneDiscrimination = Effect.gen(function* () {
  const doneSignal = CauseModule.Done("stream complete");
  const failReason = CauseModule.makeFailReason("boom");
  const doneRecord = doneSignal as Record<string, unknown>;
  const failRecord = failReason as Record<string, unknown>;

  yield* Console.log(
    `Done reason -> has marker: ${CauseModule.DoneTypeId in doneRecord}, isDone: ${CauseModule.isDone(doneSignal)}`
  );
  yield* Console.log(
    `Fail reason -> has marker: ${CauseModule.DoneTypeId in failRecord}, isDone: ${CauseModule.isDone(failReason)}`
  );
  yield* Console.log(`Fail reason preview: ${formatUnknown(failReason)}`);
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
      title: "Done Brand Round-Trip",
      description: "Create a Done signal and verify the DoneTypeId field matches the exported marker.",
      run: exampleDoneBrandRoundTrip,
    },
    {
      title: "Done vs Fail Discrimination",
      description: "Compare Done and Fail reasons to show how the marker and Cause.isDone identify completion.",
      run: exampleDoneDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
