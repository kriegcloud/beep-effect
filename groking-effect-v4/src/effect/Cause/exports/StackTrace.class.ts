/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: StackTrace
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.146Z
 *
 * Overview:
 * `ServiceMap` key for the stack frame captured at the point of failure.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ServiceMap from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "StackTrace";
const exportKind = "class";
const moduleImportPath = "effect/Cause";
const sourceSummary = "`ServiceMap` key for the stack frame captured at the point of failure.";
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
  yield* Console.log("Round-trip StackTrace through reason annotations with safe lookup.");

  const deterministicFrame = {
    name: "demo-failure-frame",
    stack: () => "Error: boom\n    at demo-failure-frame (demo.ts:10:3)",
    parent: undefined,
  };

  const annotatedCause = CauseModule.annotate(
    CauseModule.fail("boom"),
    ServiceMap.make(CauseModule.StackTrace, deterministicFrame)
  );
  const firstReason = annotatedCause.reasons[0];
  const annotations = firstReason === undefined ? undefined : CauseModule.reasonAnnotations(firstReason);
  const restoredFrame =
    annotations === undefined ? undefined : ServiceMap.getOrUndefined(annotations, CauseModule.StackTrace);
  const missingInterruptorFrame =
    annotations === undefined ? undefined : ServiceMap.getOrUndefined(annotations, CauseModule.InterruptorStackTrace);

  yield* Console.log(`StackTrace frame: ${restoredFrame?.name ?? "missing"}`);
  yield* Console.log(`InterruptorStackTrace present: ${missingInterruptorFrame !== undefined}`);
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
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Annotation Key Round-Trip",
      description: "Use StackTrace as a ServiceMap annotation key and retrieve it safely.",
      run: exampleAnnotationRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
