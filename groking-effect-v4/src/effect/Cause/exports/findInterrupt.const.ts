/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findInterrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Returns the first {@link Interrupt} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Interrupt` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findInterrupt(Cause.interrupt(42))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.fiberId) // 42
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
const exportName = "findInterrupt";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first {@link Interrupt} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Interrupt` is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findInterrupt(Cause.interrupt(42))\nif (!Result.isFailure(result)) {\n  console.log(result.success.fiberId) // 42\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findInterrupt as a callable export that searches a cause for interrupt reasons.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInterruptLookup = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: pass an interrupt cause and read the Interrupt reason.");

  const interruptCause = CauseModule.interrupt(42);
  const result = CauseModule.findInterrupt(interruptCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    yield* Console.log(`reason tag: ${result.success._tag}`);
    yield* Console.log(`fiberId: ${formatUnknown(result.success.fiberId)}`);
    yield* Console.log(`returned reason identity preserved: ${result.success === interruptCause.reasons[0]}`);
  }
});

const exampleAnnotatedInterruptPreserved = Effect.gen(function* () {
  yield* Console.log("Annotations on interrupt reasons remain available through findInterrupt.");

  const ExamplePhase = ServiceMap.Service<string>("example/findInterrupt/phase");
  const annotatedCause = CauseModule.annotate(CauseModule.interrupt(7), ServiceMap.make(ExamplePhase, "shutdown"));
  const result = CauseModule.findInterrupt(annotatedCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    const annotation = result.success.annotations.get(ExamplePhase.key);
    yield* Console.log(`annotation present: ${result.success.annotations.has(ExamplePhase.key)}`);
    yield* Console.log(`annotation value: ${formatUnknown(annotation)}`);
  }
});

const exampleNoInterruptContract = Effect.gen(function* () {
  yield* Console.log("When no Interrupt reason exists, findInterrupt fails with the original cause.");

  const causeWithoutInterrupt = CauseModule.combine(CauseModule.fail("typed-error"), CauseModule.die("defect"));
  const result = CauseModule.findInterrupt(causeWithoutInterrupt);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isFailure(result)) {
    yield* Console.log(`failure carries original cause: ${result.failure === causeWithoutInterrupt}`);
    yield* Console.log(`failure has interrupts: ${CauseModule.hasInterrupts(result.failure)}`);
    yield* Console.log(`failure has typed fails: ${CauseModule.hasFails(result.failure)}`);
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
      title: "Source-Aligned Interrupt Lookup",
      description: "Call findInterrupt with an interrupt cause and inspect the extracted reason.",
      run: exampleSourceAlignedInterruptLookup,
    },
    {
      title: "Annotated Interrupt Reason",
      description: "Verify that returned interrupt reasons retain attached annotations.",
      run: exampleAnnotatedInterruptPreserved,
    },
    {
      title: "No-Interrupt Failure Contract",
      description: "Show the failure path when the cause has no interrupt reason.",
      run: exampleNoInterruptContract,
    },
  ],
});

BunRuntime.runMain(program);
