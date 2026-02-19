/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Returns the string keys of a struct as a properly typed `Array<keyof S & string>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Struct } from "effect"
 *
 * const user = { name: "Alice", age: 30, [Symbol.for("id")]: 1 }
 *
 * const k: Array<"name" | "age"> = Struct.keys(user)
 * console.log(k) // ["name", "age"]
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Returns the string keys of a struct as a properly typed `Array<keyof S & string>`.";
const sourceExample =
  'import { Struct } from "effect"\n\nconst user = { name: "Alice", age: 30, [Symbol.for("id")]: 1 }\n\nconst k: Array<"name" | "age"> = Struct.keys(user)\nconsole.log(k) // ["name", "age"]';
const moduleRecord = StructModule as Record<string, unknown>;

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
