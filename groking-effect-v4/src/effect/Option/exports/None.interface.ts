/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: None
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Represents the absence of a value within an {@link Option}.
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
const exportName = "None";
const exportKind = "interface";
const moduleImportPath = "effect/Option";
const sourceSummary = "Represents the absence of a value within an {@link Option}.";
const sourceExample = "";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`None` is an interface, so the symbol is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionExportInspection = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime: inspect the `none` companion constructor export.");
  yield* inspectNamedExport({ moduleRecord, exportName: "none" });
});

const exampleNoneCompanionFlow = Effect.gen(function* () {
  const absentUser = O.none<string>();
  const presentUser = O.some("Ava");

  const absentMessage = O.match(absentUser, {
    onNone: () => "No user available.",
    onSome: (user) => `User: ${user}`,
  });
  const presentMessage = O.match(presentUser, {
    onNone: () => "No user available.",
    onSome: (user) => `User: ${user}`,
  });

  yield* Console.log(`isNone(absentUser): ${O.isNone(absentUser)}`);
  yield* Console.log(`match(None): ${absentMessage}`);
  yield* Console.log(`match(Some): ${presentMessage}`);
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
      description: "Inspect the runtime `none` constructor that corresponds to `None` values.",
      run: exampleCompanionExportInspection,
    },
    {
      title: "None Companion API Flow",
      description: "Create absent/present options and handle both branches with `match`.",
      run: exampleNoneCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
