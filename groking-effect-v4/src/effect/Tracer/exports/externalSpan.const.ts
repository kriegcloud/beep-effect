/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: externalSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:22.377Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Tracer } from "effect"
 * 
 * // Create an external span from another tracing system
 * const span = Tracer.externalSpan({
 *   spanId: "span-abc-123",
 *   traceId: "trace-xyz-789",
 *   sampled: true
 * })
 * 
 * // Use the external span as a parent
 * const program = Effect.succeed("Hello").pipe(
 *   Effect.withSpan("child-operation", { parent: span })
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
import * as TracerModule from "effect/Tracer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "externalSpan";
const exportKind = "const";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { Effect, Tracer } from \"effect\"\n\n// Create an external span from another tracing system\nconst span = Tracer.externalSpan({\n  spanId: \"span-abc-123\",\n  traceId: \"trace-xyz-789\",\n  sampled: true\n})\n\n// Use the external span as a parent\nconst program = Effect.succeed(\"Hello\").pipe(\n  Effect.withSpan(\"child-operation\", { parent: span })\n)";
const moduleRecord = TracerModule as Record<string, unknown>;

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
