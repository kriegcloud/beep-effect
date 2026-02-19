/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: ReadonlyRecord
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.284Z
 *
 * Overview:
 * Represents a readonly record with keys of type `K` and values of type `A`. This is the foundational type for immutable key-value mappings in Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Record } from "effect"
 *
 * // Creating a readonly record type
 * type UserRecord = Record.ReadonlyRecord<"name" | "age", string | number>
 *
 * const user: UserRecord = {
 *   name: "John",
 *   age: 30
 * }
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
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReadonlyRecord";
const exportKind = "type";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Represents a readonly record with keys of type `K` and values of type `A`. This is the foundational type for immutable key-value mappings in Effect.";
const sourceExample =
  'import type { Record } from "effect"\n\n// Creating a readonly record type\ntype UserRecord = Record.ReadonlyRecord<"name" | "age", string | number>\n\nconst user: UserRecord = {\n  name: "John",\n  age: 30\n}';
const moduleRecord = RecordModule as Record<string, unknown>;

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
