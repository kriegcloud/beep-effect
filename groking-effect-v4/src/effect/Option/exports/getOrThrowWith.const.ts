/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getOrThrowWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Extracts the value from a `Some`, or throws a custom error for `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrThrowWith(Option.some(1), () => new Error("missing")))
 * // Output: 1
 *
 * Option.getOrThrowWith(Option.none(), () => new Error("missing"))
 * // throws Error: missing
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  attemptThunk,
  createPlaygroundProgram,
  formatUnknown,
  inspectNamedExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrThrowWith";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Extracts the value from a `Some`, or throws a custom error for `None`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.getOrThrowWith(Option.some(1), () => new Error("missing")))\n// Output: 1\n\nOption.getOrThrowWith(Option.none(), () => new Error("missing"))\n// throws Error: missing';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.getOrThrowWith as a callable Option helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatThrownError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return formatUnknown(error);
};

const exampleSourceAlignedCustomThrow = Effect.gen(function* () {
  yield* Console.log("Use getOrThrowWith(option, onNone) for Some and None.");

  const fromSome = O.getOrThrowWith(O.some(1), () => new Error("missing"));
  const noneAttempt = yield* attemptThunk(() => O.getOrThrowWith(O.none<number>(), () => new Error("missing")));

  yield* Console.log(`some(1) -> ${formatUnknown(fromSome)}`);
  if (noneAttempt._tag === "Left") {
    yield* Console.log(`none() threw ${formatThrownError(noneAttempt.error)}`);
  } else {
    yield* Console.log(`none() unexpectedly returned ${formatUnknown(noneAttempt.value)}`);
  }
});

const exampleCurriedErrorThunk = Effect.gen(function* () {
  yield* Console.log("Use the curried overload and confirm onNone runs only for None.");

  let onNoneCalls = 0;
  const unwrapOrTypeError = O.getOrThrowWith(() => {
    onNoneCalls += 1;
    return new TypeError("configuration missing");
  });

  const fromSome = unwrapOrTypeError(O.some("ready"));
  const callsAfterSome = onNoneCalls;
  const noneAttempt = yield* attemptThunk(() => unwrapOrTypeError(O.none<string>()));

  yield* Console.log(`curried some("ready") -> ${formatUnknown(fromSome)} (onNone calls: ${callsAfterSome})`);
  if (noneAttempt._tag === "Left") {
    yield* Console.log(`curried none() threw ${formatThrownError(noneAttempt.error)} (onNone calls: ${onNoneCalls})`);
  } else {
    yield* Console.log(
      `curried none() unexpectedly returned ${formatUnknown(noneAttempt.value)} (onNone calls: ${onNoneCalls})`
    );
  }
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
      title: "Source-Aligned Custom Throw",
      description: "Run the documented Some/None behavior with a custom missing-value error.",
      run: exampleSourceAlignedCustomThrow,
    },
    {
      title: "Curried Error Thunk",
      description: "Use the curried overload and verify the error thunk is lazy.",
      run: exampleCurriedErrorThunk,
    },
  ],
});

BunRuntime.runMain(program);
