/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Primitive
 * Export: keyValuePair
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Primitive.ts
 * Generated: 2026-02-19T04:14:24.523Z
 *
 * Overview:
 * Parses a single `key=value` pair into a record object.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseKeyValue = Effect.gen(function*() {
 *   const result1 = yield* Primitive.keyValuePair.parse("name=john")
 *   console.log(result1) // { name: "john" }
 *
 *   const result2 = yield* Primitive.keyValuePair.parse("port=3000")
 *   console.log(result2) // { port: "3000" }
 *
 *   const result3 = yield* Primitive.keyValuePair.parse("debug=true")
 *   console.log(result3) // { debug: "true" }
 * })
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
import * as PrimitiveModule from "effect/unstable/cli/Primitive";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "keyValuePair";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Primitive";
const sourceSummary = "Parses a single `key=value` pair into a record object.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Primitive } from "effect/unstable/cli"\n\nconst parseKeyValue = Effect.gen(function*() {\n  const result1 = yield* Primitive.keyValuePair.parse("name=john")\n  console.log(result1) // { name: "john" }\n\n  const result2 = yield* Primitive.keyValuePair.parse("port=3000")\n  console.log(result2) // { port: "3000" }\n\n  const result3 = yield* Primitive.keyValuePair.parse("debug=true")\n  console.log(result3) // { debug: "true" }\n})';
const moduleRecord = PrimitiveModule as Record<string, unknown>;

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
