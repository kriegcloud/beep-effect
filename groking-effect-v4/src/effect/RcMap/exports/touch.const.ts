/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: touch
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:50:38.592Z
 *
 * Overview:
 * Extends the idle time for a resource in the RcMap. If the RcMap has an `idleTimeToLive` configured, calling `touch` will reset the expiration timer for the specified key.
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
 *       ),
 *     idleTimeToLive: "10 seconds"
 *   })
 *
 *   // Get a resource
 *   yield* RcMap.get(map, "session")
 *
 *   // Touch the resource to extend its idle time
 *   // This resets the 10-second expiration timer
 *   yield* RcMap.touch(map, "session")
 *
 *   // The resource will now live for another 10 seconds
 *   // from the time it was touched
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
const exportName = "touch";
const exportKind = "const";
const moduleImportPath = "effect/RcMap";
const sourceSummary =
  "Extends the idle time for a resource in the RcMap. If the RcMap has an `idleTimeToLive` configured, calling `touch` will reset the expiration timer for the specified key.";
const sourceExample =
  'import { Effect, RcMap } from "effect"\n\nEffect.gen(function*() {\n  const map = yield* RcMap.make({\n    lookup: (key: string) =>\n      Effect.acquireRelease(\n        Effect.succeed(`Resource: ${key}`),\n        () => Effect.log(`Released ${key}`)\n      ),\n    idleTimeToLive: "10 seconds"\n  })\n\n  // Get a resource\n  yield* RcMap.get(map, "session")\n\n  // Touch the resource to extend its idle time\n  // This resets the 10-second expiration timer\n  yield* RcMap.touch(map, "session")\n\n  // The resource will now live for another 10 seconds\n  // from the time it was touched\n}).pipe(Effect.scoped)';
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
