/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: void
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * A pre-built `Some(undefined)` constant.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.void)
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
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
const exportName = "void";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "A pre-built `Some(undefined)` constant.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.void)\n// Output: { _id: 'Option', _tag: 'Some', value: undefined }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.void as a runtime value export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedVoidConstant = Effect.gen(function* () {
  const value = O.void;
  const tag = O.match({
    onNone: () => "None",
    onSome: (inner) => (inner === undefined ? "Some(undefined)" : `Some(${formatUnknown(inner)})`),
  })(value);

  yield* Console.log(`O.void => ${formatUnknown(value)}`);
  yield* Console.log(`O.isSome(O.void) => ${O.isSome(value)}`);
  yield* Console.log(`O.match(O.void) => ${tag}`);
});

const examplePrebuiltConstantBehavior = Effect.gen(function* () {
  const fromAsVoid = O.asVoid(O.some(123));
  const sameReferenceAcrossReads = Object.is(O.void, O.void);
  const sameReferenceAsDerived = Object.is(O.void, fromAsVoid);

  yield* Console.log(`Object.is(O.void, O.void) => ${sameReferenceAcrossReads}`);
  yield* Console.log(`Object.is(O.void, O.asVoid(O.some(123))) => ${sameReferenceAsDerived}`);
  yield* Console.log(`O.asVoid(O.some(123)) => ${formatUnknown(fromAsVoid)}`);
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
      title: "Source JSDoc Behavior",
      description: "Read Option.void and verify it is a Some containing undefined.",
      run: exampleSourceAlignedVoidConstant,
    },
    {
      title: "Constant vs Derived void Option",
      description: "Compare the pre-built constant with an asVoid-derived Option value.",
      run: examplePrebuiltConstantBehavior,
    },
  ],
});

BunRuntime.runMain(program);
