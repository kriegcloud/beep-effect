/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: flatMapNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Combines {@link flatMap} with {@link fromNullishOr}: applies a function that may return `null`/`undefined` to the value of a `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * interface Employee {
 *   company?: { address?: { street?: { name?: string } } }
 * }
 *
 * const emp: Employee = {
 *   company: { address: { street: { name: "high street" } } }
 * }
 *
 * console.log(
 *   Option.some(emp).pipe(
 *     Option.flatMapNullishOr((e) => e.company?.address?.street?.name)
 *   )
 * )
 * // Output: { _id: 'Option', _tag: 'Some', value: 'high street' }
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
const exportName = "flatMapNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Combines {@link flatMap} with {@link fromNullishOr}: applies a function that may return `null`/`undefined` to the value of a `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\ninterface Employee {\n  company?: { address?: { street?: { name?: string } } }\n}\n\nconst emp: Employee = {\n  company: { address: { street: { name: \"high street\" } } }\n}\n\nconsole.log(\n  Option.some(emp).pipe(\n    Option.flatMapNullishOr((e) => e.company?.address?.street?.name)\n  )\n)\n// Output: { _id: 'Option', _tag: 'Some', value: 'high street' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedNestedLookup = Effect.gen(function* () {
  interface Employee {
    readonly company?: {
      readonly address?: {
        readonly street?: {
          readonly name?: string;
        };
      };
    };
  }

  const streetName = (employee: Employee) =>
    O.some(employee).pipe(O.flatMapNullishOr((e) => e.company?.address?.street?.name));

  const employeeWithStreet: Employee = {
    company: { address: { street: { name: "high street" } } },
  };

  const employeeWithoutStreet: Employee = {
    company: { address: {} },
  };

  const employeeWithoutCompany: Employee = {};

  yield* Console.log(`with street -> ${formatUnknown(streetName(employeeWithStreet))}`);
  yield* Console.log(`without street -> ${formatUnknown(streetName(employeeWithoutStreet))}`);
  yield* Console.log(`without company -> ${formatUnknown(streetName(employeeWithoutCompany))}`);
});

const exampleDataFirstAndDataLast = Effect.gen(function* () {
  const classifyStatus = (status: number): string | null => {
    if (status === 200) {
      return "ok";
    }
    if (status === 404) {
      return "not-found";
    }
    return null;
  };

  const dataFirstKnown = O.flatMapNullishOr(O.some(200), classifyStatus);
  const dataFirstUnknown = O.flatMapNullishOr(O.some(500), classifyStatus);

  const toStatusLabel = O.flatMapNullishOr(classifyStatus);
  const dataLastMissingInput = O.none<number>().pipe(toStatusLabel);
  const dataLastKnown = O.some(404).pipe(toStatusLabel);

  yield* Console.log(`data-first 200 -> ${formatUnknown(dataFirstKnown)}`);
  yield* Console.log(`data-first 500 -> ${formatUnknown(dataFirstUnknown)}`);
  yield* Console.log(`data-last none -> ${formatUnknown(dataLastMissingInput)}`);
  yield* Console.log(`data-last 404 -> ${formatUnknown(dataLastKnown)}`);
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
      title: "Source-Aligned Nested Property Lookup",
      description: "Follow optional employee fields and convert missing `name` values into `None`.",
      run: exampleSourceAlignedNestedLookup,
    },
    {
      title: "Data-First and Data-Last Invocation",
      description: "Compare both call styles when the mapper may return `null` for unknown statuses.",
      run: exampleDataFirstAndDataLast,
    },
  ],
});

BunRuntime.runMain(program);
