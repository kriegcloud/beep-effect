/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: pretty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Renders a {@link Cause} as a human-readable string for logging or debugging.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("something went wrong")
 * console.log(Cause.pretty(cause))
 * // Error: something went wrong
 * //     at ...
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pretty";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Renders a {@link Cause} as a human-readable string for logging or debugging.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("something went wrong")\nconsole.log(Cause.pretty(cause))\n// Error: something went wrong\n//     at ...';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const firstRenderedLine = (rendered: string): string => rendered.split("\n")[0] ?? "<empty render>";

const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect pretty as a callable rendering export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFailRendering = Effect.gen(function* () {
  yield* Console.log("Render a single typed failure, matching the source example.");

  const cause = CauseModule.fail("something went wrong");
  const rendered = CauseModule.pretty(cause);

  yield* Console.log(`first line: ${firstRenderedLine(rendered)}`);
  yield* Console.log(`includes message: ${rendered.includes("something went wrong")}`);
});

const exampleCombinedFailAndDefectRendering = Effect.gen(function* () {
  yield* Console.log("Render a mixed cause and confirm both reasons are represented.");

  const mixedCause = CauseModule.combine(CauseModule.fail("typed failure"), CauseModule.die(new Error("defect boom")));
  const rendered = CauseModule.pretty(mixedCause);
  const renderedErrors = CauseModule.prettyErrors(mixedCause);

  yield* Console.log(`prettyErrors count: ${renderedErrors.length}`);
  yield* Console.log(`includes typed failure: ${rendered.includes("typed failure")}`);
  yield* Console.log(`includes defect message: ${rendered.includes("defect boom")}`);
});

const exampleInterruptOnlyRendering = Effect.gen(function* () {
  yield* Console.log("Interrupt-only causes render as InterruptError text.");

  const interruptCause = CauseModule.interrupt(123);
  const rendered = CauseModule.pretty(interruptCause);

  yield* Console.log(`first line: ${firstRenderedLine(rendered)}`);
  yield* Console.log(`mentions interrupt id: ${rendered.includes("#123")}`);
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
      title: "Source-Aligned Fail Rendering",
      description: "Render a single fail cause and inspect the leading error line.",
      run: exampleSourceAlignedFailRendering,
    },
    {
      title: "Mixed Fail And Defect Rendering",
      description: "Render a combined cause and confirm both error messages appear.",
      run: exampleCombinedFailAndDefectRendering,
    },
    {
      title: "Interrupt-Only Rendering",
      description: "Show the InterruptError output shape for interrupt-only causes.",
      run: exampleInterruptOnlyRendering,
    },
  ],
});

BunRuntime.runMain(program);
