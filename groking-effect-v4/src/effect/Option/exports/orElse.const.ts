/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: orElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
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
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OptionModule from "effect/Option";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "orElse";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Returns the fallback `Option` if `self` is `None`; otherwise returns `self`.";
const sourceExample = "import { Option } from \"effect\"\n\nconsole.log(Option.none().pipe(Option.orElse(() => Option.some(\"b\"))))\n// Output: { _id: 'Option', _tag: 'Some', value: 'b' }\n\nconsole.log(Option.some(\"a\").pipe(Option.orElse(() => Option.some(\"b\"))))\n// Output: { _id: 'Option', _tag: 'Some', value: 'a' }";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
