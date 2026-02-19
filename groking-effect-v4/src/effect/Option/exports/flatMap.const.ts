/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Applies a function that returns an `Option` to the value of a `Some`, flattening the result. Returns `None` if the input is `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * interface User {
 *   readonly name: string
 *   readonly address: Option.Option<{ readonly street: Option.Option<string> }>
 * }
 *
 * const user: User = {
 *   name: "John",
 *   address: Option.some({ street: Option.some("123 Main St") })
 * }
 *
 * const street = user.address.pipe(
 *   Option.flatMap((addr) => addr.street)
 * )
 *
 * console.log(street)
 * // Output: { _id: 'Option', _tag: 'Some', value: '123 Main St' }
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Applies a function that returns an `Option` to the value of a `Some`, flattening the result. Returns `None` if the input is `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\ninterface User {\n  readonly name: string\n  readonly address: Option.Option<{ readonly street: Option.Option<string> }>\n}\n\nconst user: User = {\n  name: \"John\",\n  address: Option.some({ street: Option.some(\"123 Main St\") })\n}\n\nconst street = user.address.pipe(\n  Option.flatMap((addr) => addr.street)\n)\n\nconsole.log(street)\n// Output: { _id: 'Option', _tag: 'Some', value: '123 Main St' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedLookup = Effect.gen(function* () {
  interface User {
    readonly name: string;
    readonly address: O.Option<{ readonly street: O.Option<string> }>;
  }

  const streetFromUser = (user: User) => user.address.pipe(O.flatMap((address) => address.street));

  const userWithStreet: User = {
    name: "John",
    address: O.some({ street: O.some("123 Main St") }),
  };

  const userWithoutStreet: User = {
    name: "Ava",
    address: O.some({ street: O.none() }),
  };

  const userWithoutAddress: User = {
    name: "Kai",
    address: O.none(),
  };

  yield* Console.log(`John -> ${formatUnknown(streetFromUser(userWithStreet))}`);
  yield* Console.log(`Ava -> ${formatUnknown(streetFromUser(userWithoutStreet))}`);
  yield* Console.log(`Kai -> ${formatUnknown(streetFromUser(userWithoutAddress))}`);
});

const exampleDataFirstVsDataLast = Effect.gen(function* () {
  const parseInteger = (input: string): O.Option<number> =>
    /^-?\d+$/.test(input) ? O.some(Number.parseInt(input, 10)) : O.none();

  const toEvenLabel = (n: number): O.Option<string> => (n % 2 === 0 ? O.some(`even:${n}`) : O.none());

  const evenFromDataFirst = O.flatMap(parseInteger("24"), toEvenLabel);
  const oddFromDataFirst = O.flatMap(parseInteger("7"), toEvenLabel);

  const keepEvenLabel = O.flatMap(toEvenLabel);
  const invalidFromDataLast = parseInteger("7.5").pipe(keepEvenLabel);

  yield* Console.log(`data-first "24" -> ${formatUnknown(evenFromDataFirst)}`);
  yield* Console.log(`data-first "7" -> ${formatUnknown(oddFromDataFirst)}`);
  yield* Console.log(`data-last "7.5" -> ${formatUnknown(invalidFromDataLast)}`);
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
      title: "Source-Aligned Nested Lookup",
      description: "Use flatMap to access a nested optional street and propagate None automatically.",
      run: exampleSourceAlignedLookup,
    },
    {
      title: "Data-First and Data-Last Calls",
      description: "Compare both invocation forms while mapping parsed integers to an optional even label.",
      run: exampleDataFirstVsDataLast,
    },
  ],
});

BunRuntime.runMain(program);
