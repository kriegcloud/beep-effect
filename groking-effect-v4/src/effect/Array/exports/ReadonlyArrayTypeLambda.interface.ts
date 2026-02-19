/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: ReadonlyArrayTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Type lambda for `ReadonlyArray`, used for higher-kinded type operations.
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReadonlyArrayTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Array";
const sourceSummary = "Type lambda for `ReadonlyArray`, used for higher-kinded type operations.";
const sourceExample = "";
const moduleRecord = ArrayModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: ReadonlyArrayTypeLambda is erased at runtime; companion Array APIs carry runtime behavior."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionReadonlyPipeline = Effect.gen(function* () {
  const base: ReadonlyArray<number> = [1, 2, 3];
  const doubled = ArrayModule.map(base, (n) => n * 2);
  const appended = ArrayModule.append(doubled, 8);

  yield* Console.log(`base readonly values: ${JSON.stringify(base)}`);
  yield* Console.log(`Array.map(base, n => n * 2): ${JSON.stringify(doubled)}`);
  yield* Console.log(`Array.append(doubled, 8): ${JSON.stringify(appended)}`);
  yield* Console.log(`base remains unchanged: ${JSON.stringify(base)}`);
});

const exampleCompanionGuardFlow = Effect.gen(function* () {
  yield* Console.log("Runtime companion context: inspect Array.isReadonlyArrayNonEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName: "isReadonlyArrayNonEmpty" });

  const candidates: ReadonlyArray<ReadonlyArray<number>> = [[], [5, 10, 15]];
  for (const candidate of candidates) {
    const nonEmpty = ArrayModule.isReadonlyArrayNonEmpty(candidate);
    if (!nonEmpty) {
      yield* Console.log(`${JSON.stringify(candidate)} -> nonEmpty=false; skipping reduce.`);
      continue;
    }

    const total = ArrayModule.reduce(candidate, 0, (sum, value) => sum + value);
    yield* Console.log(`${JSON.stringify(candidate)} -> nonEmpty=true; reduce sum=${total}.`);
  }
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
      title: "Companion Readonly Pipeline",
      description: "Use Array.map and Array.append to model readonly-oriented transformation flow.",
      run: exampleCompanionReadonlyPipeline,
    },
    {
      title: "Companion Guard Flow",
      description: "Use Array.isReadonlyArrayNonEmpty before reducing values.",
      run: exampleCompanionGuardFlow,
    },
  ],
});

BunRuntime.runMain(program);
