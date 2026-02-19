/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Extracts the value from a `Some`, or evaluates a fallback thunk on `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.some(1).pipe(Option.getOrElse(() => 0)))
 * // Output: 1
 *
 * console.log(Option.none().pipe(Option.getOrElse(() => 0)))
 * // Output: 0
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrElse";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Extracts the value from a `Some`, or evaluates a fallback thunk on `None`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.some(1).pipe(Option.getOrElse(() => 0)))\n// Output: 1\n\nconsole.log(Option.none().pipe(Option.getOrElse(() => 0)))\n// Output: 0';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.getOrElse as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFallback = Effect.gen(function* () {
  yield* Console.log("Run the JSDoc behavior for Some and None.");
  const fromSome = O.some(1).pipe(O.getOrElse(() => 0));
  const fromNone = O.none<number>().pipe(O.getOrElse(() => 0));

  yield* Console.log(`some(1) -> ${formatUnknown(fromSome)}`);
  yield* Console.log(`none() -> ${formatUnknown(fromNone)}`);
});

const exampleLazyFallbackThunk = Effect.gen(function* () {
  yield* Console.log("Fallback thunk is lazy: it runs only when the input is None.");
  let fallbackCalls = 0;

  const nextGuestId = () => {
    fallbackCalls += 1;
    return `guest-${fallbackCalls}`;
  };

  const fromSome = O.getOrElse(nextGuestId)(O.some("admin"));
  const callsAfterSome = fallbackCalls;
  const fromNone = O.getOrElse(nextGuestId)(O.none<string>());
  const callsAfterNone = fallbackCalls;

  yield* Console.log(`some("admin") -> ${formatUnknown(fromSome)} (fallback calls: ${callsAfterSome})`);
  yield* Console.log(`none() -> ${formatUnknown(fromNone)} (fallback calls: ${callsAfterNone})`);
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
      title: "Source-Aligned Fallback",
      description: "Use the documented getOrElse(() => fallback) behavior for Some and None.",
      run: exampleSourceAlignedFallback,
    },
    {
      title: "Lazy Fallback Thunk",
      description: "Show that the fallback thunk is only evaluated when the Option is None.",
      run: exampleLazyFallbackThunk,
    },
  ],
});

BunRuntime.runMain(program);
