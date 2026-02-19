/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:14:16.239Z
 *
 * Overview:
 * An `RcMap` can contain multiple reference counted resources that can be indexed by a key. The resources are lazily acquired on the first call to `get` and released when the last reference is released.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcMap } from "effect"
 * 
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`acquired ${key}`),
 *         () => Effect.log(`releasing ${key}`)
 *       )
 *   })
 * 
 *   // Get "foo" from the map twice, which will only acquire it once.
 *   // It will then be released once the scope closes.
 *   yield* RcMap.get(map, "foo").pipe(
 *     Effect.andThen(RcMap.get(map, "foo")),
 *     Effect.scoped
 *   )
 * })
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
import * as RcMapModule from "effect/RcMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/RcMap";
const sourceSummary = "An `RcMap` can contain multiple reference counted resources that can be indexed by a key. The resources are lazily acquired on the first call to `get` and released when the last...";
const sourceExample = "import { Effect, RcMap } from \"effect\"\n\nEffect.gen(function*() {\n  const map = yield* RcMap.make({\n    lookup: (key: string) =>\n      Effect.acquireRelease(\n        Effect.succeed(`acquired ${key}`),\n        () => Effect.log(`releasing ${key}`)\n      )\n  })\n\n  // Get \"foo\" from the map twice, which will only acquire it once.\n  // It will then be released once the scope closes.\n  yield* RcMap.get(map, \"foo\").pipe(\n    Effect.andThen(RcMap.get(map, \"foo\")),\n    Effect.scoped\n  )\n})";
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
