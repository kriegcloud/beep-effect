/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: OptionUnify
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Internal unification interface for `Option` types. Used by the Effect library's type system for type-level operations.
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
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "OptionUnify";
const exportKind = "interface";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Internal unification interface for `Option` types. Used by the Effect library's type system for type-level operations.";
const sourceExample = "";
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`OptionUnify` is a compile-time interface and is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect a runtime companion API used to combine `Option` values.");
  yield* inspectNamedExport({ moduleRecord, exportName: "orElse" });
});

const exampleCompanionUnificationFlow = Effect.gen(function* () {
  yield* Console.log("Bridge: `OptionUnify` is type-level, while runtime `Option` APIs unify value paths.");

  const parsePort = (raw: string) => {
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? OptionModule.some(parsed) : OptionModule.none<number>();
  };

  const invalidPrimary = parsePort("oops");
  const envFallback = parsePort("8080");
  const defaultPort = parsePort("3000");

  const fromPrimaryOrEnv = OptionModule.orElse(invalidPrimary, () => envFallback);
  const resolved = OptionModule.orElse(fromPrimaryOrEnv, () => defaultPort);
  const rendered = OptionModule.match(resolved, {
    onNone: () => "no port available",
    onSome: (value) => `resolved port ${value}`,
  });

  yield* Console.log(
    `primary=${OptionModule.isSome(invalidPrimary)} env=${OptionModule.isSome(envFallback)} default=${OptionModule.isSome(defaultPort)}`
  );
  yield* Console.log(`Result after fallback unification: ${rendered}`);
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
      description: "Inspect a runtime export that participates in Option fallback composition.",
      run: exampleModuleContextInspection,
    },
    {
      title: "Companion Unification Flow",
      description: "Compose optional inputs with `orElse` to produce one resolved `Option` value.",
      run: exampleCompanionUnificationFlow,
    },
  ],
});

BunRuntime.runMain(program);
