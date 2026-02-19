/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.185Z
 *
 * Overview:
 * Returns the first {@link Fail} reason from a cause, including its annotations. Returns `Filter.fail` with the remaining cause when no `Fail` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findFail(Cause.fail("error"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.error) // "error"
 * }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";
import * as ServiceMap from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findFail";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first {@link Fail} reason from a cause, including its annotations. Returns `Filter.fail` with the remaining cause when no `Fail` is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findFail(Cause.fail("error"))\nif (!Result.isFailure(result)) {\n  console.log(result.success.error) // "error"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findFail as a callable export that searches causes for Fail reasons.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFailLookup = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: pass a fail cause and inspect the Fail reason.");

  const typedError = { code: "E_PARSE", retryable: false as const };
  const failCause = CauseModule.fail(typedError);
  const result = CauseModule.findFail(failCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    yield* Console.log(`reason tag: ${result.success._tag}`);
    yield* Console.log(`error payload: ${formatUnknown(result.success.error)}`);
    yield* Console.log(`returned reason identity preserved: ${result.success === failCause.reasons[0]}`);
  }
});

const exampleAnnotatedFailPreserved = Effect.gen(function* () {
  yield* Console.log("findFail returns Fail reasons with annotations intact.");

  const ExampleTrace = ServiceMap.Service<string>("example/findFail/trace");
  const annotatedCause = CauseModule.annotate(
    CauseModule.fail("annotated-error"),
    ServiceMap.make(ExampleTrace, "batch-012")
  );
  const result = CauseModule.findFail(annotatedCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    const annotation = ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(result.success), ExampleTrace);
    yield* Console.log(`annotation present: ${annotation !== undefined}`);
    yield* Console.log(`annotation value: ${formatUnknown(annotation)}`);
  }
});

const exampleNoFailContract = Effect.gen(function* () {
  yield* Console.log("When no Fail reason exists, findFail stays in the failure channel.");

  const causeWithoutFail = CauseModule.combine(CauseModule.die("unexpected-defect"), CauseModule.interrupt(99));
  const result = CauseModule.findFail(causeWithoutFail);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isFailure(result)) {
    yield* Console.log(`failure carries original cause: ${result.failure === causeWithoutFail}`);
    yield* Console.log(`failure has fails: ${CauseModule.hasFails(result.failure)}`);
    yield* Console.log(`failure has dies: ${CauseModule.hasDies(result.failure)}`);
  }
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
      title: "Source-Aligned Fail Lookup",
      description: "Call findFail with a fail cause and inspect the extracted Fail reason.",
      run: exampleSourceAlignedFailLookup,
    },
    {
      title: "Annotated Fail Reason",
      description: "Verify that returned Fail reasons retain attached annotations.",
      run: exampleAnnotatedFailPreserved,
    },
    {
      title: "No-Fail Failure Contract",
      description: "Show the failure path when the cause has no fail reason.",
      run: exampleNoFailContract,
    },
  ],
});

BunRuntime.runMain(program);
