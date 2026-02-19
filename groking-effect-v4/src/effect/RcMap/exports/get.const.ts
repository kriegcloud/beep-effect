/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:50:38.592Z
 *
 * Overview:
 * Retrieves a value from the RcMap by key. If the resource doesn't exist, it will be acquired using the lookup function. The resource is reference counted and will be released when the scope closes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Resource: ${key}`),
 *         () => Effect.log(`Released ${key}`)
 *       )
 *   })
 *
 *   // Get a resource - it will be acquired on first access
 *   const resource = yield* RcMap.get(map, "database")
 *   console.log(resource) // "Resource: database"
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RcMapModule from "effect/RcMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/RcMap";
const sourceSummary =
  "Retrieves a value from the RcMap by key. If the resource doesn't exist, it will be acquired using the lookup function. The resource is reference counted and will be released whe...";
const sourceExample =
  'import { Effect, RcMap } from "effect"\n\nEffect.gen(function*() {\n  const map = yield* RcMap.make({\n    lookup: (key: string) =>\n      Effect.acquireRelease(\n        Effect.succeed(`Resource: ${key}`),\n        () => Effect.log(`Released ${key}`)\n      )\n  })\n\n  // Get a resource - it will be acquired on first access\n  const resource = yield* RcMap.get(map, "database")\n  console.log(resource) // "Resource: database"\n}).pipe(Effect.scoped)';
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
