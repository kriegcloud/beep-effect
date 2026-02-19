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

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OptionModule from "effect/Option";

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
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
