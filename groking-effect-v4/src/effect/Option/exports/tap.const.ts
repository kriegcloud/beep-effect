/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: tap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Runs a side-effecting `Option`-returning function on the value of a `Some`, returning the original `Option` if the function returns `Some`, or `None` if it returns `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const getInteger = (n: number) =>
 *   Number.isInteger(n) ? Option.some(n) : Option.none()
 *
 * console.log(Option.tap(Option.some(1), getInteger))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(Option.tap(Option.some(1.14), getInteger))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "tap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Runs a side-effecting `Option`-returning function on the value of a `Some`, returning the original `Option` if the function returns `Some`, or `None` if it returns `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst getInteger = (n: number) =>\n  Number.isInteger(n) ? Option.some(n) : Option.none()\n\nconsole.log(Option.tap(Option.some(1), getInteger))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }\n\nconsole.log(Option.tap(Option.some(1.14), getInteger))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const getInteger = (n: number): O.Option<number> => (Number.isInteger(n) ? O.some(n) : O.none());

const exampleSourceAlignedIntegerGate = Effect.gen(function* () {
  yield* Console.log("Gate Some values by requiring integers.");
  const integerInput = O.tap(O.some(1), getInteger);
  const decimalInput = O.tap(O.some(1.14), getInteger);
  const noneInput = O.tap(O.none<number>(), getInteger);

  yield* Console.log(`tap(some(1), getInteger) -> ${formatUnknown(integerInput)}`);
  yield* Console.log(`tap(some(1.14), getInteger) -> ${formatUnknown(decimalInput)}`);
  yield* Console.log(`tap(none(), getInteger) -> ${formatUnknown(noneInput)}`);
});

interface Session {
  readonly userId: number;
  readonly active: boolean;
}

const requireActiveSession = O.tap((session: Session) =>
  session.active ? O.some(`validated:${session.userId}`) : O.none<string>()
);

const exampleOriginalValuePreserved = Effect.gen(function* () {
  yield* Console.log("Tap preserves the original Some value on success.");
  const activeSession = requireActiveSession(O.some({ userId: 42, active: true }));
  const inactiveSession = requireActiveSession(O.some({ userId: 42, active: false }));

  yield* Console.log(`active session -> ${formatUnknown(activeSession)}`);
  yield* Console.log(`inactive session -> ${formatUnknown(inactiveSession)}`);
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
      title: "Source-Aligned Integer Gate",
      description: "Mirror the JSDoc behavior with integer, decimal, and none inputs.",
      run: exampleSourceAlignedIntegerGate,
    },
    {
      title: "Preserve Original Value",
      description: "Show that successful tap checks keep the original payload untouched.",
      run: exampleOriginalValuePreserved,
    },
  ],
});

BunRuntime.runMain(program);
