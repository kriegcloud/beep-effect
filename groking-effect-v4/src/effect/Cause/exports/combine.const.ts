/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Merges two causes into a single cause whose `reasons` array is the union of both inputs (de-duplicated by value equality).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause1 = Cause.fail("error1")
 * const cause2 = Cause.fail("error2")
 * const combined = Cause.combine(cause1, cause2)
 * console.log(combined.reasons.length) // 2
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
const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Merges two causes into a single cause whose `reasons` array is the union of both inputs (de-duplicated by value equality).";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause1 = Cause.fail("error1")\nconst cause2 = Cause.fail("error2")\nconst combined = Cause.combine(cause1, cause2)\nconsole.log(combined.reasons.length) // 2';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedCombine = Effect.gen(function* () {
  const cause1 = CauseModule.fail("error1");
  const cause2 = CauseModule.fail("error2");
  const combined = CauseModule.combine(cause1, cause2);
  const failureValues = combined.reasons.filter(CauseModule.isFailReason).map((reason) => String(reason.error));

  yield* Console.log(`cause1 reasons: ${cause1.reasons.length}`);
  yield* Console.log(`cause2 reasons: ${cause2.reasons.length}`);
  yield* Console.log(`combined reasons: ${combined.reasons.length}`);
  yield* Console.log(`combined fail values: ${failureValues.join(", ")}`);
});

const exampleIdentityAndDedupShortcuts = Effect.gen(function* () {
  const self = CauseModule.fail("duplicate");
  const duplicate = CauseModule.fail("duplicate");
  const deduped = CauseModule.combine(self, duplicate);
  const withEmptyLeft = CauseModule.combine(CauseModule.empty, self);
  const withEmptyRight = CauseModule.combine(self, CauseModule.empty);

  yield* Console.log(`deduped reasons: ${deduped.reasons.length}`);
  yield* Console.log(`deduped returns self: ${deduped === self}`);
  yield* Console.log(`combine(empty, self) returns self: ${withEmptyLeft === self}`);
  yield* Console.log(`combine(self, empty) returns self: ${withEmptyRight === self}`);
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
      title: "Source-Aligned Cause Merge",
      description: "Combine two fail causes and inspect the merged reason count and error values.",
      run: exampleSourceAlignedCombine,
    },
    {
      title: "Identity And Dedup Shortcuts",
      description: "Show de-duplication and the empty-cause identity/reference shortcuts documented for combine.",
      run: exampleIdentityAndDedupShortcuts,
    },
  ],
});

BunRuntime.runMain(program);
