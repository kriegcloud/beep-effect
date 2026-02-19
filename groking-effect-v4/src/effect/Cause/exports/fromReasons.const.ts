/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: fromReasons
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Creates a {@link Cause} from an array of {@link Reason} values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reasons = [
 *   Cause.makeFailReason("err1"),
 *   Cause.makeFailReason("err2")
 * ]
 * const cause = Cause.fromReasons(reasons)
 * console.log(cause.reasons.length) // 2
 * ```
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromReasons";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Creates a {@link Cause} from an array of {@link Reason} values.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reasons = [\n  Cause.makeFailReason("err1"),\n  Cause.makeFailReason("err2")\n]\nconst cause = Cause.fromReasons(reasons)\nconsole.log(cause.reasons.length) // 2';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedFromReasons = Effect.gen(function* () {
  const reasons = [CauseModule.makeFailReason("err1"), CauseModule.makeFailReason("err2")];
  const cause = CauseModule.fromReasons(reasons);
  const failErrors = cause.reasons.filter(CauseModule.isFailReason).map((reason) => String(reason.error));

  yield* Console.log(`input reasons: ${reasons.length}`);
  yield* Console.log(`cause.reasons.length: ${cause.reasons.length}`);
  yield* Console.log(`fail errors: ${failErrors.join(", ")}`);
});

const exampleMixedReasonKinds = Effect.gen(function* () {
  const failReason = CauseModule.makeFailReason("validation-error");
  const dieReason = CauseModule.makeDieReason("panic");
  const interruptReason = CauseModule.makeInterruptReason(7);
  const cause = CauseModule.fromReasons([failReason, dieReason, interruptReason]);
  const reasonTags = cause.reasons.map((reason) => reason._tag).join(" -> ");

  yield* Console.log(`reason tags: ${reasonTags}`);
  yield* Console.log(`hasFails: ${CauseModule.hasFails(cause)}`);
  yield* Console.log(`hasDies: ${CauseModule.hasDies(cause)}`);
  yield* Console.log(`hasInterrupts: ${CauseModule.hasInterrupts(cause)}`);
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
      title: "Source-Aligned Reason Construction",
      description: "Build two fail reasons, pass them to fromReasons, and verify the resulting cause contents.",
      run: exampleSourceAlignedFromReasons,
    },
    {
      title: "Mixed Reason Kinds",
      description: "Construct a cause from fail, die, and interrupt reasons and validate reason-type predicates.",
      run: exampleMixedReasonKinds,
    },
  ],
});

BunRuntime.runMain(program);
