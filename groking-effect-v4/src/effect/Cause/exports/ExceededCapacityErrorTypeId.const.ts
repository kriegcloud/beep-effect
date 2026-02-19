/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: ExceededCapacityErrorTypeId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Unique brand for {@link ExceededCapacityError}.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ExceededCapacityErrorTypeId";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Unique brand for {@link ExceededCapacityError}.";
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
const exampleBrandedErrorShape = Effect.gen(function* () {
  const brandKey = CauseModule.ExceededCapacityErrorTypeId;
  const error = new CauseModule.ExceededCapacityError("Queue full");
  const brandValue = readBrandValue(error, brandKey);

  yield* Console.log(`Brand key: ${brandKey}`);
  yield* Console.log(`Error tag/message: ${error._tag} / ${error.message}`);
  yield* Console.log(`error[brandKey]: ${formatUnknown(brandValue)}`);
});

const exampleBrandDiscrimination = Effect.gen(function* () {
  const brandKey = CauseModule.ExceededCapacityErrorTypeId;
  const exceeded = new CauseModule.ExceededCapacityError("Queue full");
  const timeout = new CauseModule.TimeoutError("Timed out");
  const generic = new Error("boom");

  yield* Console.log(
    `Has brand (Exceeded/Timeout/Error): ${hasOwnBrand(exceeded, brandKey)} / ${hasOwnBrand(timeout, brandKey)} / ${hasOwnBrand(generic, brandKey)}`
  );
  yield* Console.log(
    `Type guard (Exceeded/Timeout/Error): ${CauseModule.isExceededCapacityError(exceeded)} / ${CauseModule.isExceededCapacityError(timeout)} / ${CauseModule.isExceededCapacityError(generic)}`
  );
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
      title: "Branded Error Shape",
      description: "Create an ExceededCapacityError and read its brand property via this type id.",
      run: exampleBrandedErrorShape,
    },
    {
      title: "Brand Discrimination",
      description: "Compare brand-key and type-guard checks across ExceededCapacityError and other errors.",
      run: exampleBrandDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
