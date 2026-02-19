/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: exists
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Tests if the value in a `Some` satisfies a predicate or refinement.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const isEven = (n: number) => n % 2 === 0
 *
 * console.log(Option.some(2).pipe(Option.exists(isEven)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(Option.exists(isEven)))
 * // Output: false
 *
 * console.log(Option.none().pipe(Option.exists(isEven)))
 * // Output: false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "exists";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Tests if the value in a `Some` satisfies a predicate or refinement.";
const sourceExample =
  'import { Option } from "effect"\n\nconst isEven = (n: number) => n % 2 === 0\n\nconsole.log(Option.some(2).pipe(Option.exists(isEven)))\n// Output: true\n\nconsole.log(Option.some(1).pipe(Option.exists(isEven)))\n// Output: false\n\nconsole.log(Option.none().pipe(Option.exists(isEven)))\n// Output: false';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedPredicate = Effect.gen(function* () {
  const isEven = (n: number) => n % 2 === 0;
  const someTwoIsEven = O.some(2).pipe(O.exists(isEven));
  const someOneIsEven = O.some(1).pipe(O.exists(isEven));
  const noneIsEven = O.none<number>().pipe(O.exists(isEven));

  yield* Console.log(`some(2) is even -> ${someTwoIsEven}`);
  yield* Console.log(`some(1) is even -> ${someOneIsEven}`);
  yield* Console.log(`none is even -> ${noneIsEven}`);
});

const exampleRefinementPredicate = Effect.gen(function* () {
  type User = { id: number; state: "loading" } | { id: number; state: "loaded"; email: string };

  const isLoaded = (user: User): user is Extract<User, { state: "loaded" }> => user.state === "loaded";

  const loadedUser = O.some<User>({ id: 1, state: "loaded", email: "ada@example.com" }).pipe(O.exists(isLoaded));
  const loadingUser = O.some<User>({ id: 2, state: "loading" }).pipe(O.exists(isLoaded));
  const noUser = O.none<User>().pipe(O.exists(isLoaded));

  yield* Console.log(`loaded user passes refinement -> ${loadedUser}`);
  yield* Console.log(`loading user passes refinement -> ${loadingUser}`);
  yield* Console.log(`none passes refinement -> ${noUser}`);
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
      title: "Source-Aligned Predicate Checks",
      description: "Mirror the JSDoc flow for some-even, some-odd, and none inputs.",
      run: exampleSourceAlignedPredicate,
    },
    {
      title: "Refinement Predicate Checks",
      description: "Use a refinement predicate to validate loaded vs loading user states.",
      run: exampleRefinementPredicate,
    },
  ],
});

BunRuntime.runMain(program);
