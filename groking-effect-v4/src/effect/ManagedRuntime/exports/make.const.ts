/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ManagedRuntime
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ManagedRuntime.ts
 * Generated: 2026-02-19T04:50:37.535Z
 *
 * Overview:
 * Convert a Layer into an ManagedRuntime, that can be used to run Effect's using your services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, ManagedRuntime, ServiceMap } from "effect"
 *
 * class Notifications extends ServiceMap.Service<Notifications, {
 *   readonly notify: (message: string) => Effect.Effect<void>
 * }>()("Notifications") {
 *   static layer = Layer.succeed(this)({
 *     notify: (message) => Console.log(message)
 *   })
 * }
 *
 * async function main() {
 *   const runtime = ManagedRuntime.make(Notifications.layer)
 *   await runtime.runPromise(Effect.flatMap(
 *     Notifications.asEffect(),
 *     (_) => _.notify("Hello, world!")
 *   ))
 *   await runtime.dispose()
 * }
 *
 * main()
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
import * as ManagedRuntimeModule from "effect/ManagedRuntime";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/ManagedRuntime";
const sourceSummary = "Convert a Layer into an ManagedRuntime, that can be used to run Effect's using your services.";
const sourceExample =
  'import { Console, Effect, Layer, ManagedRuntime, ServiceMap } from "effect"\n\nclass Notifications extends ServiceMap.Service<Notifications, {\n  readonly notify: (message: string) => Effect.Effect<void>\n}>()("Notifications") {\n  static layer = Layer.succeed(this)({\n    notify: (message) => Console.log(message)\n  })\n}\n\nasync function main() {\n  const runtime = ManagedRuntime.make(Notifications.layer)\n  await runtime.runPromise(Effect.flatMap(\n    Notifications.asEffect(),\n    (_) => _.notify("Hello, world!")\n  ))\n  await runtime.dispose()\n}\n\nmain()';
const moduleRecord = ManagedRuntimeModule as Record<string, unknown>;

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
