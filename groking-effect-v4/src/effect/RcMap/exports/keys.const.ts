/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:14:16.239Z
 *
 * Overview:
 * Returns an array of all keys currently stored in the RcMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) => Effect.succeed(`value-${key}`)
 *   })
 *
 *   // Add some resources to the map
 *   yield* RcMap.get(map, "foo")
 *   yield* RcMap.get(map, "bar")
 *   yield* RcMap.get(map, "baz")
 *
 *   // Get all keys currently in the map
 *   const allKeys = yield* RcMap.keys(map)
 *   console.log(allKeys) // ["foo", "bar", "baz"]
 * }).pipe(Effect.scoped)
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
import * as RcMapModule from "effect/RcMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/RcMap";
const sourceSummary = "Returns an array of all keys currently stored in the RcMap.";
const sourceExample =
  'import { Effect, RcMap } from "effect"\n\nEffect.gen(function*() {\n  const map = yield* RcMap.make({\n    lookup: (key: string) => Effect.succeed(`value-${key}`)\n  })\n\n  // Add some resources to the map\n  yield* RcMap.get(map, "foo")\n  yield* RcMap.get(map, "bar")\n  yield* RcMap.get(map, "baz")\n\n  // Get all keys currently in the map\n  const allKeys = yield* RcMap.keys(map)\n  console.log(allKeys) // ["foo", "bar", "baz"]\n}).pipe(Effect.scoped)';
const moduleRecord = RcMapModule as Record<string, unknown>;

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
