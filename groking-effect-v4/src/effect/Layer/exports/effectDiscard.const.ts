/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: effectDiscard
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Constructs a layer from the specified scoped effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer } from "effect"
 *
 * const initLayer = Layer.effectDiscard(
 *   Effect.sync(() => {
 *     console.log("Initializing application...")
 *   })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "effectDiscard";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Constructs a layer from the specified scoped effect.";
const sourceExample =
  'import { Effect, Layer } from "effect"\n\nconst initLayer = Layer.effectDiscard(\n  Effect.sync(() => {\n    console.log("Initializing application...")\n  })\n)';
const moduleRecord = LayerModule as Record<string, unknown>;

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
