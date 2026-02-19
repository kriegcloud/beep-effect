/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: serviceOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.915Z
 *
 * Overview:
 * Optionally accesses a service from the environment.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, ServiceMap } from "effect"
 *
 * // Define a service key
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 *
 * // Use serviceOption to optionally access the logger
 * const program = Effect.gen(function*() {
 *   const maybeLogger = yield* Effect.serviceOption(Logger)
 *
 *   if (Option.isSome(maybeLogger)) {
 *     maybeLogger.value.log("Service is available")
 *   } else {
 *     console.log("Service not available")
 *   }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "serviceOption";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Optionally accesses a service from the environment.";
const sourceExample =
  'import { Effect, Option, ServiceMap } from "effect"\n\n// Define a service key\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\n\n// Use serviceOption to optionally access the logger\nconst program = Effect.gen(function*() {\n  const maybeLogger = yield* Effect.serviceOption(Logger)\n\n  if (Option.isSome(maybeLogger)) {\n    maybeLogger.value.log("Service is available")\n  } else {\n    console.log("Service not available")\n  }\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

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
