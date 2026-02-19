/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: annotate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.183Z
 *
 * Overview:
 * Attaches metadata to every reason in a {@link Cause}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, ServiceMap } from "effect"
 *
 * const cause = Cause.fail("error")
 * const annotated = Cause.annotate(cause, ServiceMap.empty())
 * ```
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
const exportName = "annotate";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Attaches metadata to every reason in a {@link Cause}.";
const sourceExample =
  'import { Cause, ServiceMap } from "effect"\n\nconst cause = Cause.fail("error")\nconst annotated = Cause.annotate(cause, ServiceMap.empty())';
const moduleRecord = CauseModule as Record<string, unknown>;
const DemoAnnotation = ServiceMap.Service<string>("demo/cause-annotation");

const readFirstReasonAnnotation = (cause: CauseModule.Cause<unknown>): string | undefined => {
  const firstReason = cause.reasons[0];
  if (firstReason === undefined) {
    return undefined;
  }
  return ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(firstReason), DemoAnnotation);
};

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceInvocation = Effect.gen(function* () {
  const cause = CauseModule.fail("error");
  const annotated = CauseModule.annotate(cause, ServiceMap.empty());
  const mergedAnnotations = CauseModule.annotations(annotated);

  yield* Console.log(`Source invocation yields Cause: ${CauseModule.isCause(annotated)}`);
  yield* Console.log(`Merged annotation entries: ${mergedAnnotations.mapUnsafe.size}`);
  yield* Console.log(`Empty ServiceMap is a no-op: ${annotated === cause}`);
});

const exampleAnnotatesEveryReason = Effect.gen(function* () {
  const baseCause = CauseModule.combine(CauseModule.fail("left"), CauseModule.die("right"));
  const annotated = CauseModule.annotate(baseCause, ServiceMap.make(DemoAnnotation, "batch-008"));
  const allReasonsTagged = annotated.reasons.every(
    (reason) => ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(reason), DemoAnnotation) === "batch-008"
  );

  yield* Console.log(`Reason count after annotate: ${annotated.reasons.length}`);
  yield* Console.log(`Every reason tagged: ${allReasonsTagged}`);
});

const exampleOverwriteBehavior = Effect.gen(function* () {
  const base = CauseModule.annotate(CauseModule.fail("boom"), ServiceMap.make(DemoAnnotation, "original"));

  const preserveExisting = CauseModule.annotate(base, ServiceMap.make(DemoAnnotation, "incoming"));
  const overwriteExisting = CauseModule.annotate(base, ServiceMap.make(DemoAnnotation, "incoming"), {
    overwrite: true,
  });

  const preservedValue = readFirstReasonAnnotation(preserveExisting);
  const overwrittenValue = readFirstReasonAnnotation(overwriteExisting);

  yield* Console.log(`Default merge keeps existing: ${preservedValue === "original"}`);
  yield* Console.log(`overwrite=true replaces value: ${overwrittenValue === "incoming"}`);
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
      title: "Source Invocation",
      description: "Run the JSDoc-style invocation and observe no-op behavior for an empty ServiceMap.",
      run: exampleSourceInvocation,
    },
    {
      title: "Annotates Every Reason",
      description: "Attach one annotation map to a multi-reason cause and verify every reason receives it.",
      run: exampleAnnotatesEveryReason,
    },
    {
      title: "Overwrite Option",
      description: "Compare default merge behavior with overwrite=true for colliding annotation keys.",
      run: exampleOverwriteBehavior,
    },
  ],
});

BunRuntime.runMain(program);
