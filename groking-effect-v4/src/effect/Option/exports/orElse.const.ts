/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: orElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Returns the fallback `Option` if `self` is `None`; otherwise returns `self`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.none().pipe(Option.orElse(() => Option.some("b"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'b' }
 *
 * console.log(Option.some("a").pipe(Option.orElse(() => Option.some("b"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'a' }
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
const exportName = "orElse";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Returns the fallback `Option` if `self` is `None`; otherwise returns `self`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.none().pipe(Option.orElse(() => Option.some(\"b\"))))\n// Output: { _id: 'Option', _tag: 'Some', value: 'b' }\n\nconsole.log(Option.some(\"a\").pipe(Option.orElse(() => Option.some(\"b\"))))\n// Output: { _id: 'Option', _tag: 'Some', value: 'a' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.orElse as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFallback = Effect.gen(function* () {
  yield* Console.log("Run the documented fallback behavior for None and Some.");
  const fromNone = O.none<string>().pipe(O.orElse(() => O.some("b")));
  const fromSome = O.some("a").pipe(O.orElse(() => O.some("b")));

  yield* Console.log(`none() -> ${formatUnknown(fromNone)}`);
  yield* Console.log(`some("a") -> ${formatUnknown(fromSome)}`);
});

const exampleFallbackLaziness = Effect.gen(function* () {
  yield* Console.log("Fallback thunk runs only when the input is None.");
  let fallbackCalls = 0;

  const fallback = () => {
    fallbackCalls += 1;
    return O.some(`guest-${fallbackCalls}`);
  };

  const fromSome = O.some("admin").pipe(O.orElse(fallback));
  const callsAfterSome = fallbackCalls;
  const fromNone = O.none<string>().pipe(O.orElse(fallback));
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
      description: "Use the documented orElse(() => fallbackOption) behavior for None and Some.",
      run: exampleSourceAlignedFallback,
    },
    {
      title: "Lazy Fallback Thunk",
      description: "Show that fallback is evaluated only when the input Option is None.",
      run: exampleFallbackLaziness,
    },
  ],
});

BunRuntime.runMain(program);
