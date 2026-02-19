/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: fromIterableBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.283Z
 *
 * Overview:
 * Creates a new record from an iterable, utilizing the provided function to determine the key for each element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 * 
 * const users = [
 *   { id: "2", name: "name2" },
 *   { id: "1", name: "name1" }
 * ]
 * 
 * assert.deepStrictEqual(
 *   Record.fromIterableBy(users, (user) => user.id),
 *   {
 *     "2": { id: "2", name: "name2" },
 *     "1": { id: "1", name: "name1" }
 *   }
 * )
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
import * as RecordModule from "effect/Record";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIterableBy";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary = "Creates a new record from an iterable, utilizing the provided function to determine the key for each element.";
const sourceExample = "import { Record } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst users = [\n  { id: \"2\", name: \"name2\" },\n  { id: \"1\", name: \"name1\" }\n]\n\nassert.deepStrictEqual(\n  Record.fromIterableBy(users, (user) => user.id),\n  {\n    \"2\": { id: \"2\", name: \"name2\" },\n    \"1\": { id: \"1\", name: \"name1\" }\n  }\n)";
const moduleRecord = RecordModule as Record<string, unknown>;

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
