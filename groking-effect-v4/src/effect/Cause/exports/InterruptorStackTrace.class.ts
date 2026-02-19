/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: InterruptorStackTrace
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * `ServiceMap` key for the stack frame captured at the point of interruption.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ServiceMap from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InterruptorStackTrace";
const exportKind = "class";
const moduleImportPath = "effect/Cause";
const sourceSummary = "`ServiceMap` key for the stack frame captured at the point of interruption.";
const sourceExample = "";
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleAnnotationRoundTrip = Effect.gen(function* () {
  yield* Console.log("Round-trip InterruptorStackTrace through interrupt reason annotations.");

  const deterministicFrame = {
    name: "demo-interrupt-frame",
    stack: () => "Error: interrupted\n    at demo-interrupt-frame (demo.ts:22:5)",
    parent: undefined,
  };

  const annotatedCause = CauseModule.annotate(
    CauseModule.interrupt(101),
    ServiceMap.make(CauseModule.InterruptorStackTrace, deterministicFrame)
  );
  const firstReason = annotatedCause.reasons[0];
  const annotations = firstReason === undefined ? undefined : CauseModule.reasonAnnotations(firstReason);
  const restoredFrame =
    annotations === undefined ? undefined : ServiceMap.getOrUndefined(annotations, CauseModule.InterruptorStackTrace);
  const missingFailureFrame =
    annotations === undefined ? undefined : ServiceMap.getOrUndefined(annotations, CauseModule.StackTrace);

  yield* Console.log(`Interrupt reason tag: ${firstReason?._tag ?? "missing"}`);
  yield* Console.log(`InterruptorStackTrace frame: ${restoredFrame?.name ?? "missing"}`);
  yield* Console.log(`StackTrace present: ${missingFailureFrame !== undefined}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Annotation Key Round-Trip",
      description: "Use InterruptorStackTrace as an annotation key and retrieve it safely.",
      run: exampleAnnotationRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
