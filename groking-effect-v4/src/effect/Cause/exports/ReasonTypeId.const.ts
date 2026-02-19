/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: ReasonTypeId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Unique brand for `Reason` values, used for runtime type checks via {@link isReason}.
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReasonTypeId";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Unique brand for `Reason` values, used for runtime type checks via {@link isReason}.";
const sourceExample = "";

const readBrandValue = (value: unknown, brandKey: PropertyKey): unknown => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return (value as Record<PropertyKey, unknown>)[brandKey];
};

const hasOwnBrand = (value: unknown, brandKey: PropertyKey): boolean =>
  typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call(value, brandKey);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleReasonBrandRoundTrip = Effect.gen(function* () {
  const brandKey = CauseModule.ReasonTypeId;
  const failReason = CauseModule.makeFailReason("boom");
  const dieReason = CauseModule.makeDieReason(new Error("defect"));
  const interruptReason = CauseModule.makeInterruptReason(42);

  yield* Console.log(`ReasonTypeId runtime value: ${brandKey}`);
  yield* Console.log(
    `Brand matches (Fail/Die/Interrupt): ${readBrandValue(failReason, brandKey) === brandKey} / ${readBrandValue(dieReason, brandKey) === brandKey} / ${readBrandValue(interruptReason, brandKey) === brandKey}`
  );
  yield* Console.log(`Reason tags: ${failReason._tag} / ${dieReason._tag} / ${interruptReason._tag}`);
});

const exampleReasonDiscrimination = Effect.gen(function* () {
  const brandKey = CauseModule.ReasonTypeId;
  const reason = CauseModule.makeFailReason("bad input");
  const cause = CauseModule.fail("bad input");
  const lookalike = { _tag: "Fail", error: "bad input", [brandKey]: "not-the-brand" };
  const lookalikeBrandMatches = readBrandValue(lookalike, brandKey) === brandKey;

  yield* Console.log(
    `Has own brand (Reason/Cause/lookalike): ${hasOwnBrand(reason, brandKey)} / ${hasOwnBrand(cause, brandKey)} / ${hasOwnBrand(lookalike, brandKey)}`
  );
  yield* Console.log(
    `isReason (Reason/Cause/lookalike): ${CauseModule.isReason(reason)} / ${CauseModule.isReason(cause)} / ${CauseModule.isReason(lookalike)}`
  );
  yield* Console.log(`Lookalike brand equals ReasonTypeId: ${lookalikeBrandMatches}`);
  yield* Console.log("Contract note: this runtime treats ReasonTypeId key presence as sufficient for isReason.");
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
      title: "Reason Brand Round-Trip",
      description: "Create each Reason variant and verify its brand field matches Cause.ReasonTypeId.",
      run: exampleReasonBrandRoundTrip,
    },
    {
      title: "Brand vs Runtime Guard",
      description: "Compare raw brand-key presence with Cause.isReason across real and lookalike values.",
      run: exampleReasonDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
