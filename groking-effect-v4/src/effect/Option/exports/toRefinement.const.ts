/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: toRefinement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Converts an `Option`-returning function into a type guard (refinement).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * type MyData = string | number
 *
 * const parseString = (data: MyData): Option.Option<string> =>
 *   typeof data === "string" ? Option.some(data) : Option.none()
 *
 * //      ┌─── (a: MyData) => a is string
 * //      ▼
 * const isString = Option.toRefinement(parseString)
 *
 * console.log(isString("a"))
 * // Output: true
 *
 * console.log(isString(1))
 * // Output: false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toRefinement";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts an `Option`-returning function into a type guard (refinement).";
const sourceExample =
  'import { Option } from "effect"\n\ntype MyData = string | number\n\nconst parseString = (data: MyData): Option.Option<string> =>\n  typeof data === "string" ? Option.some(data) : Option.none()\n\n//      ┌─── (a: MyData) => a is string\n//      ▼\nconst isString = Option.toRefinement(parseString)\n\nconsole.log(isString("a"))\n// Output: true\n\nconsole.log(isString(1))\n// Output: false';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedRefinement = Effect.gen(function* () {
  type MyData = string | number;

  const parseString = (data: MyData): O.Option<string> => (typeof data === "string" ? O.some(data) : O.none());
  const isString = O.toRefinement(parseString);

  const valueA: MyData = "a";
  const valueB: MyData = 1;

  yield* Console.log(`isString("a") -> ${isString(valueA)}`);
  yield* Console.log(`isString(1) -> ${isString(valueB)}`);

  if (isString(valueA)) {
    yield* Console.log(`valueA uppercased -> ${valueA.toUpperCase()}`);
  }
});

const exampleFilterWorkflow = Effect.gen(function* () {
  type Candidate = string | number | null;

  const parseNonEmptyString = (candidate: Candidate): O.Option<string> =>
    typeof candidate === "string" && candidate.trim().length > 0 ? O.some(candidate) : O.none();
  const isNonEmptyString = O.toRefinement(parseNonEmptyString);

  const candidates: ReadonlyArray<Candidate> = ["effect", "   ", 42, null, "option"];
  const kept = candidates.filter(isNonEmptyString);

  yield* Console.log(`candidates -> ${formatUnknown(candidates)}`);
  yield* Console.log(`filter(isNonEmptyString) -> ${formatUnknown(kept)}`);
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
      title: "Source-Aligned String Refinement",
      description: "Build a refinement from an Option parser and validate string vs number inputs.",
      run: exampleSourceAlignedRefinement,
    },
    {
      title: "Filtering With Derived Type Guard",
      description: "Reuse the generated refinement in Array.filter to keep only valid non-empty strings.",
      run: exampleFilterWorkflow,
    },
  ],
});

BunRuntime.runMain(program);
