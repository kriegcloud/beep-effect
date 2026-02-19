/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/http/HttpRouter
 * Export: use
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts
 * Generated: 2026-02-19T04:14:26.513Z
 *
 * Overview:
 * A helper function that is the equivalent of:
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as Layer from "effect/Layer"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 *
 * const MyRoute = Layer.effectDiscard(Effect.gen(function*() {
 *   const router = yield* HttpRouter.HttpRouter
 *
 *   // then use `yield* router.add(...)` to add a route
 * }))
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
import * as HttpRouterModule from "effect/unstable/http/HttpRouter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "use";
const exportKind = "const";
const moduleImportPath = "effect/unstable/http/HttpRouter";
const sourceSummary = "A helper function that is the equivalent of:";
const sourceExample =
  'import { Effect } from "effect"\nimport * as Layer from "effect/Layer"\nimport * as HttpRouter from "effect/unstable/http/HttpRouter"\n\nconst MyRoute = Layer.effectDiscard(Effect.gen(function*() {\n  const router = yield* HttpRouter.HttpRouter\n\n  // then use `yield* router.add(...)` to add a route\n}))';
const moduleRecord = HttpRouterModule as Record<string, unknown>;

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
