/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Inspectable
 * Export: Inspectable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Inspectable.ts
 * Generated: 2026-02-19T04:14:14.188Z
 *
 * Overview:
 * Interface for objects that can be inspected and provide custom string representations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Inspectable } from "effect"
 * import { format } from "effect/Formatter"
 *
 * class Result implements Inspectable.Inspectable {
 *   constructor(
 *     private readonly tag: "Success" | "Failure",
 *     private readonly value: unknown
 *   ) {}
 *
 *   toString(): string {
 *     return format(this.toJSON())
 *   }
 *
 *   toJSON() {
 *     return { _tag: this.tag, value: this.value }
 *   }
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return this.toJSON()
 *   }
 * }
 *
 * const success = new Result("Success", 42)
 * console.log(success.toString()) // Pretty formatted JSON
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as InspectableModule from "effect/Inspectable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Inspectable";
const exportKind = "interface";
const moduleImportPath = "effect/Inspectable";
const sourceSummary = "Interface for objects that can be inspected and provide custom string representations.";
const sourceExample =
  'import { Inspectable } from "effect"\nimport { format } from "effect/Formatter"\n\nclass Result implements Inspectable.Inspectable {\n  constructor(\n    private readonly tag: "Success" | "Failure",\n    private readonly value: unknown\n  ) {}\n\n  toString(): string {\n    return format(this.toJSON())\n  }\n\n  toJSON() {\n    return { _tag: this.tag, value: this.value }\n  }\n\n  [Inspectable.NodeInspectSymbol]() {\n    return this.toJSON()\n  }\n}\n\nconst success = new Result("Success", 42)\nconsole.log(success.toString()) // Pretty formatted JSON';
const moduleRecord = InspectableModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
