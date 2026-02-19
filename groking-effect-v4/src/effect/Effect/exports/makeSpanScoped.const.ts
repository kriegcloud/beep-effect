/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: makeSpanScoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Create a new span for tracing, and automatically close it when the Scope finalizes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const span = yield* Effect.makeSpanScoped("scoped-operation")
 *     yield* Effect.log("Working...")
 *     return "done"
 *     // Span automatically closes when scope ends
 *   })
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeSpanScoped";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Create a new span for tracing, and automatically close it when the Scope finalizes.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const span = yield* Effect.makeSpanScoped(\"scoped-operation\")\n    yield* Effect.log(\"Working...\")\n    return \"done\"\n    // Span automatically closes when scope ends\n  })\n)";
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
