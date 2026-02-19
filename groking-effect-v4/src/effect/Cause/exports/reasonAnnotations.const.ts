/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: reasonAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Reads the annotations from a single {@link Reason} as a `ServiceMap`.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
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
const exportName = "reasonAnnotations";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Reads the annotations from a single {@link Reason} as a `ServiceMap`.";
const sourceExample = "";
const moduleRecord = CauseModule as Record<string, unknown>;
const DemoRequestId = ServiceMap.Service<string>("demo/cause/reason-annotations/request-id");
const DemoAttempt = ServiceMap.Service<number>("demo/cause/reason-annotations/attempt");

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect reasonAnnotations as a callable export that reads per-reason metadata.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleReadAnnotatedReason = Effect.gen(function* () {
  yield* Console.log("Read annotations from one fail reason using a ServiceMap key.");

  const reason = CauseModule.makeFailReason("validation-error").annotate(ServiceMap.make(DemoRequestId, "req-42"));
  const annotations = CauseModule.reasonAnnotations(reason);
  const requestId = ServiceMap.getOrUndefined(annotations, DemoRequestId);
  const attempt = ServiceMap.getOrUndefined(annotations, DemoAttempt);

  yield* Console.log(`reason tag: ${reason._tag}`);
  yield* Console.log(`request id: ${requestId ?? "missing"}`);
  yield* Console.log(`missing key is undefined: ${attempt === undefined}`);
});

const exampleReasonLocalVsMergedAnnotations = Effect.gen(function* () {
  yield* Console.log("Reason annotations stay local even when merged cause annotations collide by key.");

  const left = CauseModule.makeFailReason("left").annotate(ServiceMap.make(DemoRequestId, "req-left"));
  const right = CauseModule.makeDieReason("right").annotate(ServiceMap.make(DemoRequestId, "req-right"));
  const cause = CauseModule.fromReasons([left, right]);
  const firstReason = cause.reasons[0];
  const secondReason = cause.reasons[1];

  if (firstReason === undefined || secondReason === undefined) {
    yield* Console.log("Expected two reasons but cause was unexpectedly empty.");
    return;
  }

  const firstRequestId = ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(firstReason), DemoRequestId);
  const secondRequestId = ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(secondReason), DemoRequestId);
  const mergedRequestId = ServiceMap.getOrUndefined(CauseModule.annotations(cause), DemoRequestId);

  yield* Console.log(`first reason request id: ${firstRequestId ?? "missing"}`);
  yield* Console.log(`second reason request id: ${secondRequestId ?? "missing"}`);
  yield* Console.log(`merged cause request id: ${mergedRequestId ?? "missing"}`);
  yield* Console.log(`reason-local values preserved: ${firstRequestId !== secondRequestId}`);
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Read Annotations From One Reason",
      description: "Create an annotated fail reason and read its ServiceMap entries via reasonAnnotations.",
      run: exampleReadAnnotatedReason,
    },
    {
      title: "Reason-Local Versus Merged Annotations",
      description: "Compare per-reason values with merged cause annotations when the same key appears twice.",
      run: exampleReasonLocalVsMergedAnnotations,
    },
  ],
});

BunRuntime.runMain(program);
