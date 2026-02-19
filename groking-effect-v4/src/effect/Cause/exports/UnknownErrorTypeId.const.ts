/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: UnknownErrorTypeId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.198Z
 *
 * Overview:
 * Unique brand for {@link UnknownError}.
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
const exportName = "UnknownErrorTypeId";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Unique brand for {@link UnknownError}.";
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
const exampleBrandedUnknownErrorShape = Effect.gen(function* () {
  const brandKey = CauseModule.UnknownErrorTypeId;
  const error = new CauseModule.UnknownError({ code: "E_CONNRESET" }, "Unexpected transport failure");
  const brandValue = readBrandValue(error, brandKey);

  yield* Console.log(`Brand key: ${brandKey}`);
  yield* Console.log(`Error tag/message: ${error._tag} / ${error.message}`);
  yield* Console.log(`error[brandKey]: ${formatUnknown(brandValue)}`);
});

const exampleBrandDiscrimination = Effect.gen(function* () {
  const brandKey = CauseModule.UnknownErrorTypeId;
  const unknown = new CauseModule.UnknownError(new Error("socket closed"), "Connection failed");
  const timeout = new CauseModule.TimeoutError("Operation timed out");
  const generic = new Error("boom");

  yield* Console.log(
    `Has brand (Unknown/Timeout/Error): ${hasOwnBrand(unknown, brandKey)} / ${hasOwnBrand(timeout, brandKey)} / ${hasOwnBrand(generic, brandKey)}`
  );
  yield* Console.log(
    `Type guard (Unknown/Timeout/Error): ${CauseModule.isUnknownError(unknown)} / ${CauseModule.isUnknownError(timeout)} / ${CauseModule.isUnknownError(generic)}`
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
      title: "Branded UnknownError Shape",
      description: "Create an UnknownError and read its branded property via this type id.",
      run: exampleBrandedUnknownErrorShape,
    },
    {
      title: "Brand Discrimination",
      description: "Compare brand-key and type-guard checks across UnknownError and other errors.",
      run: exampleBrandDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
