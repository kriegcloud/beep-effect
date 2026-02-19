/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/http/UrlParams
 * Export: toRecord
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/http/UrlParams.ts
 * Generated: 2026-02-19T04:14:27.325Z
 *
 * Overview:
 * Builds a `Record` containing all the key-value pairs in the given `UrlParams` as `string` (if only one value for a key) or a `NonEmptyArray<string>` (when more than one value for a key)
 *
 * Source JSDoc Example:
 * ```ts
 * import { UrlParams } from "effect/unstable/http"
 * import * as assert from "node:assert"
 * 
 * const urlParams = UrlParams.fromInput({
 *   a: 1,
 *   b: true,
 *   c: "string",
 *   e: [1, 2, 3]
 * })
 * const result = UrlParams.toRecord(urlParams)
 * 
 * assert.deepStrictEqual(
 *   result,
 *   { "a": "1", "b": "true", "c": "string", "e": ["1", "2", "3"] }
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
import * as UrlParamsModule from "effect/unstable/http/UrlParams";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toRecord";
const exportKind = "const";
const moduleImportPath = "effect/unstable/http/UrlParams";
const sourceSummary = "Builds a `Record` containing all the key-value pairs in the given `UrlParams` as `string` (if only one value for a key) or a `NonEmptyArray<string>` (when more than one value fo...";
const sourceExample = "import { UrlParams } from \"effect/unstable/http\"\nimport * as assert from \"node:assert\"\n\nconst urlParams = UrlParams.fromInput({\n  a: 1,\n  b: true,\n  c: \"string\",\n  e: [1, 2, 3]\n})\nconst result = UrlParams.toRecord(urlParams)\n\nassert.deepStrictEqual(\n  result,\n  { \"a\": \"1\", \"b\": \"true\", \"c\": \"string\", \"e\": [\"1\", \"2\", \"3\"] }\n)";
const moduleRecord = UrlParamsModule as Record<string, unknown>;

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
