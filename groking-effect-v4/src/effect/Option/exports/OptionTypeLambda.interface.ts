/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: OptionTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Type lambda interface for higher-kinded type encodings with `Option`.
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
const exportName = "OptionTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Option";
const sourceSummary = "Type lambda interface for higher-kinded type encodings with `Option`.";
const sourceExample = "";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`OptionTypeLambda` is compile-time only and erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleDoNotationCompanionFlow = Effect.gen(function* () {
  yield* Console.log("Bridge: `Option.Do` + `bind`/`let` are runtime APIs backed by this type lambda.");
  yield* inspectNamedExport({ moduleRecord, exportName: "bind" });

  const result = O.Do.pipe(
    O.bind("x", () => O.some(2)),
    O.bind("y", ({ x }) => O.some(x + 3)),
    O.let("sum", ({ x, y }) => x + y)
  );

  const summary = O.match(result, {
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  });
  yield* Console.log(`do-notation result: ${summary}`);
});

const exampleGenCompanionFlow = Effect.gen(function* () {
  yield* Console.log("`Option.gen` composes Option values and short-circuits on `None`.");

  const success = O.gen(function* () {
    const name = (yield* O.some("Ada")).toUpperCase();
    const id = yield* O.some(7);
    return { id, name };
  });

  const shortCircuit = O.gen(function* () {
    const id = yield* O.some(7);
    const nickname = yield* O.none<string>();
    return { id, nickname };
  });

  const successSummary = O.match(success, {
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  });
  const shortCircuitSummary = O.match(shortCircuit, {
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  });

  yield* Console.log(`gen success: ${successSummary}`);
  yield* Console.log(`gen short-circuit: ${shortCircuitSummary}`);
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
      title: "Do Notation Companion Flow",
      description: "Build a record with Option.Do, bind, and let to show HKT-backed runtime behavior.",
      run: exampleDoNotationCompanionFlow,
    },
    {
      title: "Generator Companion Flow",
      description: "Use Option.gen to compose successful and short-circuiting optional computations.",
      run: exampleGenCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
