/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: makeFailReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Creates a standalone {@link Fail} reason (not wrapped in a {@link Cause}).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeFailReason("error")
 * console.log(reason._tag) // "Fail"
 * console.log(reason.error) // "error"
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
const exportName = "makeFailReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Creates a standalone {@link Fail} reason (not wrapped in a {@link Cause}).";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reason = Cause.makeFailReason("error")\nconsole.log(reason._tag) // "Fail"\nconsole.log(reason.error) // "error"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeFailReason as a callable constructor for Fail reasons.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceInvocation = Effect.gen(function* () {
  const error = "error";
  const reason = CauseModule.makeFailReason(error);

  yield* Console.log(`reason._tag: ${reason._tag}`);
  yield* Console.log(`isFailReason: ${CauseModule.isFailReason(reason)}`);
  yield* Console.log(`error matches input: ${reason.error === error}`);
});

const exampleFromReasonsComposition = Effect.gen(function* () {
  const reasons = [CauseModule.makeFailReason("err1"), CauseModule.makeFailReason("err2")];
  const cause = CauseModule.fromReasons(reasons);
  const failErrors = cause.reasons
    .filter(CauseModule.isFailReason)
    .map((reason) => String(reason.error))
    .join(", ");

  yield* Console.log(`input reasons: ${reasons.length}`);
  yield* Console.log(`cause.reasons.length: ${cause.reasons.length}`);
  yield* Console.log(`all reasons are Fail: ${cause.reasons.every(CauseModule.isFailReason)}`);
  yield* Console.log(`errors in order: ${failErrors}`);
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
      description: "Create a Fail reason with a string error and verify tag/payload.",
      run: exampleSourceInvocation,
    },
    {
      title: "Compose Reasons with fromReasons",
      description: "Build a Cause from standalone fail reasons and verify reason order.",
      run: exampleFromReasonsComposition,
    },
  ],
});

BunRuntime.runMain(program);
