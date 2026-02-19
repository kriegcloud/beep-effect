/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: Some
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Represents the presence of a value within an {@link Option}.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Some";
const exportKind = "interface";
const moduleImportPath = "effect/Option";
const sourceSummary = "Represents the presence of a value within an {@link Option}.";
const sourceExample = "";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`Some` is an interface, so the symbol is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionExportInspection = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime: inspect the `some` companion constructor export.");
  yield* inspectNamedExport({ moduleRecord, exportName: "some" });
});

const exampleSomeCompanionFlow = Effect.gen(function* () {
  const presentCount = O.some(3);
  const absentCount = O.none<number>();
  const incremented = O.map(presentCount, (value) => value + 1);

  const someMessage = O.match(incremented, {
    onNone: () => "No count available.",
    onSome: (value) => `Count: ${value}`,
  });
  const noneMessage = O.match(absentCount, {
    onNone: () => "No count available.",
    onSome: (value) => `Count: ${value}`,
  });

  yield* Console.log(`isSome(presentCount): ${O.isSome(presentCount)}`);
  yield* Console.log(`match(Some): ${someMessage}`);
  yield* Console.log(`match(None): ${noneMessage}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Export Inspection",
      description: "Inspect the runtime `some` constructor that corresponds to `Some` values.",
      run: exampleCompanionExportInspection,
    },
    {
      title: "Some Companion API Flow",
      description: "Create present/absent options and handle both branches with `match`.",
      run: exampleSomeCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
