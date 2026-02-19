/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: withExecutionPlan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.397Z
 *
 * Overview:
 * Apply an `ExecutionPlan` to an effect, retrying with step-provided resources until it succeeds or the plan is exhausted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ExecutionPlan, Layer, ServiceMap } from "effect"
 *
 * const Endpoint = ServiceMap.Service<{ url: string }>("Endpoint")
 *
 * const fetchUrl = Effect.gen(function*() {
 *   const endpoint = yield* Effect.service(Endpoint)
 *   return endpoint.url === "bad" ? yield* Effect.fail("Unavailable") : endpoint.url
 * })
 *
 * const plan = ExecutionPlan.make(
 *   { provide: Layer.succeed(Endpoint, { url: "bad" }), attempts: 2 },
 *   { provide: Layer.succeed(Endpoint, { url: "good" }) }
 * )
 *
 * const program = Effect.withExecutionPlan(fetchUrl, plan)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withExecutionPlan";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Apply an `ExecutionPlan` to an effect, retrying with step-provided resources until it succeeds or the plan is exhausted.";
const sourceExample =
  'import { Effect, ExecutionPlan, Layer, ServiceMap } from "effect"\n\nconst Endpoint = ServiceMap.Service<{ url: string }>("Endpoint")\n\nconst fetchUrl = Effect.gen(function*() {\n  const endpoint = yield* Effect.service(Endpoint)\n  return endpoint.url === "bad" ? yield* Effect.fail("Unavailable") : endpoint.url\n})\n\nconst plan = ExecutionPlan.make(\n  { provide: Layer.succeed(Endpoint, { url: "bad" }), attempts: 2 },\n  { provide: Layer.succeed(Endpoint, { url: "good" }) }\n)\n\nconst program = Effect.withExecutionPlan(fetchUrl, plan)';
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
