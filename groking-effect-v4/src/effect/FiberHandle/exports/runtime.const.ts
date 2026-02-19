/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: runtime
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:14:12.851Z
 *
 * Overview:
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberHandle, ServiceMap } from "effect"
 * 
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = ServiceMap.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 * 
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const run = yield* FiberHandle.runtime(handle)<Users>()
 * 
 *   // run an effect and set the fiber in the handle
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * 
 *   // this will interrupt the previous fiber
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fiber will be interrupted when the scope is closed
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
import * as FiberHandleModule from "effect/FiberHandle";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runtime";
const exportKind = "const";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.";
const sourceExample = "import { Effect, FiberHandle, ServiceMap } from \"effect\"\n\ninterface Users {\n  readonly _: unique symbol\n}\nconst Users = ServiceMap.Service<Users, {\n  getAll: Effect.Effect<Array<unknown>>\n}>(\"Users\")\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n  const run = yield* FiberHandle.runtime(handle)<Users>()\n\n  // run an effect and set the fiber in the handle\n  run(Effect.andThen(Users.asEffect(), (_) => _.getAll))\n\n  // this will interrupt the previous fiber\n  run(Effect.andThen(Users.asEffect(), (_) => _.getAll))\n}).pipe(\n  Effect.scoped // The fiber will be interrupted when the scope is closed\n)";
const moduleRecord = FiberHandleModule as Record<string, unknown>;

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
