/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/http/HttpRouter
 * Export: add
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts
 * Generated: 2026-02-19T04:50:48.427Z
 *
 * Overview:
 * Create a layer that adds a single route to the HTTP router.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * const Route = HttpRouter.add(
 *   "GET",
 *   "/hello",
 *   Effect.succeed(HttpServerResponse.text("Hello, World!"))
 * )
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
import * as HttpRouterModule from "effect/unstable/http/HttpRouter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "add";
const exportKind = "const";
const moduleImportPath = "effect/unstable/http/HttpRouter";
const sourceSummary = "Create a layer that adds a single route to the HTTP router.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as HttpRouter from "effect/unstable/http/HttpRouter"\nimport * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"\n\nconst Route = HttpRouter.add(\n  "GET",\n  "/hello",\n  Effect.succeed(HttpServerResponse.text("Hello, World!"))\n)';
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
