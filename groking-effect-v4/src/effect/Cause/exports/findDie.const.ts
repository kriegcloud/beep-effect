/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findDie
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Returns the first {@link Die} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Die` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findDie(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.defect) // "defect"
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
const exportName = "findDie";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first {@link Die} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Die` is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findDie(Cause.die("defect"))\nif (!Result.isFailure(result)) {\n  console.log(result.success.defect) // "defect"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findDie as a callable export that searches a cause for die reasons.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDieLookup = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: pass a die cause and read the Die reason.");

  const defect = { code: "E_DEFECT", retryable: false };
  const dieCause = CauseModule.die(defect);
  const result = CauseModule.findDie(dieCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    yield* Console.log(`reason tag: ${result.success._tag}`);
    yield* Console.log(`defect payload: ${formatUnknown(result.success.defect)}`);
    yield* Console.log(`returned reason identity preserved: ${result.success === dieCause.reasons[0]}`);
  }
});

const exampleAnnotatedDiePreserved = Effect.gen(function* () {
  yield* Console.log("Annotations on die reasons remain available through findDie.");

  const ExamplePhase = ServiceMap.Service<string>("example/findDie/phase");
  const annotatedCause = CauseModule.annotate(
    CauseModule.die("annotated-defect"),
    ServiceMap.make(ExamplePhase, "preflight")
  );
  const result = CauseModule.findDie(annotatedCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    const annotation = result.success.annotations.get(ExamplePhase.key);
    yield* Console.log(`annotation present: ${result.success.annotations.has(ExamplePhase.key)}`);
    yield* Console.log(`annotation value: ${formatUnknown(annotation)}`);
  }
});

const exampleNoDieContract = Effect.gen(function* () {
  yield* Console.log("When no Die reason exists, findDie fails with the original cause.");

  const causeWithoutDefect = CauseModule.combine(CauseModule.fail("typed-error"), CauseModule.interrupt(7));
  const result = CauseModule.findDie(causeWithoutDefect);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isFailure(result)) {
    yield* Console.log(`failure carries original cause: ${result.failure === causeWithoutDefect}`);
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
      title: "Source-Aligned Die Lookup",
      description: "Call findDie with a die cause and inspect the extracted Die reason.",
      run: exampleSourceAlignedDieLookup,
    },
    {
      title: "Annotated Die Reason",
      description: "Verify that returned Die reasons retain attached annotations.",
      run: exampleAnnotatedDiePreserved,
    },
    {
      title: "No-Die Failure Contract",
      description: "Show the failure path when the cause has no die reason.",
      run: exampleNoDieContract,
    },
  ],
});

BunRuntime.runMain(program);
