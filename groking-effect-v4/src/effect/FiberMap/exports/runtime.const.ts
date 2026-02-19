/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: runtime
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.039Z
 *
 * Overview:
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap, ServiceMap } from "effect"
 * 
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = ServiceMap.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 * 
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *   const run = yield* FiberMap.runtime(map)<Users>()
 * 
 *   // run some effects and add the fibers to the map
 *   run("effect-a", Effect.andThen(Users.asEffect(), (_) => _.getAll))
 *   run("effect-b", Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
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
import * as FiberMapModule from "effect/FiberMap";
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
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap.";
const sourceExample = "import { Effect, FiberMap, ServiceMap } from \"effect\"\n\ninterface Users {\n  readonly _: unique symbol\n}\nconst Users = ServiceMap.Service<Users, {\n  getAll: Effect.Effect<Array<unknown>>\n}>(\"Users\")\n\nEffect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n  const run = yield* FiberMap.runtime(map)<Users>()\n\n  // run some effects and add the fibers to the map\n  run(\"effect-a\", Effect.andThen(Users.asEffect(), (_) => _.getAll))\n  run(\"effect-b\", Effect.andThen(Users.asEffect(), (_) => _.getAll))\n}).pipe(\n  Effect.scoped // The fibers will be interrupted when the scope is closed\n)";
const moduleRecord = FiberMapModule as Record<string, unknown>;

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
