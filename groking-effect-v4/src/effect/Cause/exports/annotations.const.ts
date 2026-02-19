/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: annotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.183Z
 *
 * Overview:
 * Reads the merged annotations from all reasons in a {@link Cause}.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ServiceMap from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "annotations";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Reads the merged annotations from all reasons in a {@link Cause}.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleMergeAcrossReasons = Effect.gen(function* () {
  const annotationSource = ServiceMap.Service<string>("beep/Cause/annotations/source");
  const annotationAttempt = ServiceMap.Service<number>("beep/Cause/annotations/attempt");

  const failReason = CauseModule.makeFailReason("cache-miss").annotate(
    ServiceMap.make(annotationSource, "read-through-cache")
  );
  const interruptReason = CauseModule.makeInterruptReason(101).annotate(ServiceMap.make(annotationAttempt, 3));

  const cause = CauseModule.fromReasons([failReason, interruptReason]);
  const merged = CauseModule.annotations(cause);

  const source = ServiceMap.getOrElse(merged, annotationSource, () => "missing");
  const attempt = ServiceMap.getOrElse(merged, annotationAttempt, () => -1);

  yield* Console.log(`Merged reasons: ${cause.reasons.length}`);
  yield* Console.log(`source=${source}, attempt=${attempt}`);
});

const exampleLaterReasonWinsOnCollision = Effect.gen(function* () {
  const annotationSource = ServiceMap.Service<string>("beep/Cause/annotations/source");

  const earlyReason = CauseModule.makeFailReason("decode-failed").annotate(ServiceMap.make(annotationSource, "parser"));
  const laterReason = CauseModule.makeDieReason("db-timeout").annotate(ServiceMap.make(annotationSource, "storage"));

  const cause = CauseModule.fromReasons([earlyReason, laterReason]);
  const merged = CauseModule.annotations(cause);
  const source = ServiceMap.getOrElse(merged, annotationSource, () => "missing");

  yield* Console.log("Key collisions resolve to the later reason's annotation value.");
  yield* Console.log(`resolved source=${source}`);
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
      title: "Merge Annotations Across Reasons",
      description: "Collect annotation keys contributed by different reasons in one cause.",
      run: exampleMergeAcrossReasons,
    },
    {
      title: "Later Reasons Override Earlier Keys",
      description: "When the same annotation key appears twice, the later reason wins.",
      run: exampleLaterReasonWinsOnCollision,
    },
  ],
});

BunRuntime.runMain(program);
