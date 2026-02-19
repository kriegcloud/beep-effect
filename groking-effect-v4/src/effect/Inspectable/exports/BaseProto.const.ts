/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Inspectable
 * Export: BaseProto
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Inspectable.ts
 * Generated: 2026-02-19T04:50:37.094Z
 *
 * Overview:
 * A base prototype object that implements the {@link Inspectable} interface.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Inspectable } from "effect"
 *
 * // Use as prototype
 * const myObject = Object.create(Inspectable.BaseProto)
 * myObject.name = "example"
 * myObject.value = 42
 *
 * console.log(myObject.toString()) // Pretty printed representation
 *
 * // Or extend in a constructor
 * function MyClass(this: any, name: string) {
 *   this.name = name
 * }
 * MyClass.prototype = Object.create(Inspectable.BaseProto)
 * MyClass.prototype.constructor = MyClass
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
import * as InspectableModule from "effect/Inspectable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "BaseProto";
const exportKind = "const";
const moduleImportPath = "effect/Inspectable";
const sourceSummary = "A base prototype object that implements the {@link Inspectable} interface.";
const sourceExample =
  'import { Inspectable } from "effect"\n\n// Use as prototype\nconst myObject = Object.create(Inspectable.BaseProto)\nmyObject.name = "example"\nmyObject.value = 42\n\nconsole.log(myObject.toString()) // Pretty printed representation\n\n// Or extend in a constructor\nfunction MyClass(this: any, name: string) {\n  this.name = name\n}\nMyClass.prototype = Object.create(Inspectable.BaseProto)\nMyClass.prototype.constructor = MyClass';
const moduleRecord = InspectableModule as Record<string, unknown>;

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
