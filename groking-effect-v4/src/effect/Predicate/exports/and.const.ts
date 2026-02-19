/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: and
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.911Z
 *
 * Overview:
 * Creates a predicate that returns `true` only if both predicates are `true`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 *
 * const hasAAndB = Predicate.and(
 *   Predicate.hasProperty("a"),
 *   Predicate.hasProperty("b")
 * )
 *
 * const input: unknown = JSON.parse(`{"a":1,"b":"ok"}`)
 * if (hasAAndB(input)) {
 *   // input has both properties at this point
 *   const a = input.a
 *   const b = input.b
 * }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PredicateModule from "effect/Predicate";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "and";
const exportKind = "const";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Creates a predicate that returns `true` only if both predicates are `true`.";
const sourceExample =
  'import { Predicate } from "effect"\n\nconst hasAAndB = Predicate.and(\n  Predicate.hasProperty("a"),\n  Predicate.hasProperty("b")\n)\n\nconst input: unknown = JSON.parse(`{"a":1,"b":"ok"}`)\nif (hasAAndB(input)) {\n  // input has both properties at this point\n  const a = input.a\n  const b = input.b\n}';
const moduleRecord = PredicateModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
