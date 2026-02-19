/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: TypeId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.198Z
 *
 * Overview:
 * Unique brand for `Cause` values, used for runtime type checks via {@link isCause}.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
const exportName = "TypeId";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Unique brand for `Cause` values, used for runtime type checks via {@link isCause}.";
const sourceExample = "";
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect TypeId as a runtime value and confirm its brand literal.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`TypeId literal: ${CauseModule.TypeId}`);
  yield* Console.log(`TypeId runtime type: ${typeof CauseModule.TypeId}`);
});

const exampleCauseBranding = Effect.gen(function* () {
  const cause = CauseModule.fail("boom");
  const hasTypeIdBrand = cause[CauseModule.TypeId] === CauseModule.TypeId;

  yield* Console.log(`Cause.fail(...) carries TypeId brand: ${hasTypeIdBrand}`);
  yield* Console.log(`Cause.isCause(fail("boom")): ${CauseModule.isCause(cause)}`);
});

const exampleGuardContract = Effect.gen(function* () {
  const structurallyBranded = {
    [CauseModule.TypeId]: CauseModule.TypeId,
    reasons: [],
  };

  yield* Console.log(`Cause.isCause({ [TypeId]: TypeId, reasons: [] }): ${CauseModule.isCause(structurallyBranded)}`);
  yield* Console.log("Contract note: build causes with Cause constructors for valid reason payloads.");
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
      title: "TypeId Runtime Identity",
      description: "Inspect TypeId and confirm the runtime literal used for Cause branding.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Brand On Real Cause Values",
      description: "Create a Cause and verify it carries the TypeId brand key used by isCause.",
      run: exampleCauseBranding,
    },
    {
      title: "Guard Behavior",
      description: "Show that isCause checks the brand field shape at runtime.",
      run: exampleGuardContract,
    },
  ],
});

BunRuntime.runMain(program);
