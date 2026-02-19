/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Random
 * Export: Random
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Random.ts
 * Generated: 2026-02-19T04:14:16.224Z
 *
 * Overview:
 * Represents a service for generating random numbers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const float = yield* Random.next
 *   const integer = yield* Random.nextInt
 *   const inRange = yield* Random.nextIntBetween(1, 100)
 *   const uuid = yield* Random.nextUUIDv4
 *
 *   console.log("Float:", float)
 *   console.log("Integer:", integer)
 *   console.log("In range:", inRange)
 *   console.log("UUID:", uuid)
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
import * as RandomModule from "effect/Random";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Random";
const exportKind = "const";
const moduleImportPath = "effect/Random";
const sourceSummary = "Represents a service for generating random numbers.";
const sourceExample =
  'import { Effect, Random } from "effect"\n\nconst program = Effect.gen(function*() {\n  const float = yield* Random.next\n  const integer = yield* Random.nextInt\n  const inRange = yield* Random.nextIntBetween(1, 100)\n  const uuid = yield* Random.nextUUIDv4\n\n  console.log("Float:", float)\n  console.log("Integer:", integer)\n  console.log("In range:", inRange)\n  console.log("UUID:", uuid)\n})';
const moduleRecord = RandomModule as Record<string, unknown>;

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
