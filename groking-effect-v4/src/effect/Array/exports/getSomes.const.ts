/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: getSomes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.359Z
 *
 * Overview:
 * Extracts all `Some` values from an iterable of `Option`s, discarding `None`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Option } from "effect"
 *
 * console.log(Array.getSomes([Option.some(1), Option.none(), Option.some(2)])) // [1, 2]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getSomes";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Extracts all `Some` values from an iterable of `Option`s, discarding `None`s.";
const sourceExample =
  'import { Array, Option } from "effect"\n\nconsole.log(Array.getSomes([Option.some(1), Option.none(), Option.some(2)])) // [1, 2]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [O.some(1), O.none(), O.some(2)];
  const somes = A.getSomes(input);

  yield* Console.log(`A.getSomes([some(1), none, some(2)]) => ${JSON.stringify(somes)}`);
});

const exampleIterableAndEmptyCases = Effect.gen(function* () {
  const fromSet = A.getSomes(new Set([O.none(), O.some("alpha"), O.some("beta"), O.none()]));
  const noSomes = A.getSomes([O.none(), O.none()]);

  yield* Console.log(`A.getSomes(Set([...])) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`A.getSomes([none, none]) => ${JSON.stringify(noSomes)}`);
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Extract only present values from the documented mixed Option input.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Iterable Input And Empty Case",
      description: "Show iterable support and the empty output when all values are `None`.",
      run: exampleIterableAndEmptyCases,
    },
  ],
});

BunRuntime.runMain(program);
