/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: orElseResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Like {@link orElse}, but wraps the result in a `Result` to indicate the source of the value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.orElseResult(Option.some("primary"), () => Option.some("fallback")))
 * // Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Failure', value: 'primary' } }
 *
 * console.log(Option.orElseResult(Option.none(), () => Option.some("fallback")))
 * // Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Success', value: 'fallback' } }
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
const exportName = "orElseResult";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Like {@link orElse}, but wraps the result in a `Result` to indicate the source of the value.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.orElseResult(Option.some(\"primary\"), () => Option.some(\"fallback\")))\n// Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Failure', value: 'primary' } }\n\nconsole.log(Option.orElseResult(Option.none(), () => Option.some(\"fallback\")))\n// Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Success', value: 'fallback' } }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export value and confirm it is callable.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSomeInputUsesFailure = Effect.gen(function* () {
  const result = O.orElseResult(O.some("primary"), () => O.some("fallback"));
  yield* Console.log("Some input keeps the original value with Result.Failure.");
  yield* Console.log(formatUnknown(result));
});

const exampleNoneInputUsesSuccess = Effect.gen(function* () {
  const result = O.orElseResult(O.none<string>(), () => O.some("fallback"));
  yield* Console.log("None input uses fallback value with Result.Success.");
  yield* Console.log(formatUnknown(result));
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
      title: "Primary Value Branch",
      description: "A Some input keeps its value and wraps it as Result.Failure.",
      run: exampleSomeInputUsesFailure,
    },
    {
      title: "Fallback Value Branch",
      description: "A None input evaluates fallback and wraps it as Result.Success.",
      run: exampleNoneInputUsesSuccess,
    },
  ],
});

BunRuntime.runMain(program);
