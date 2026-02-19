/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashRing
 * Export: addMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashRing.ts
 * Generated: 2026-02-19T04:14:14.000Z
 *
 * Overview:
 * Add new nodes to the ring. If a node already exists in the ring, it will be updated. For example, you can use this to update the node's weight.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as HashRingModule from "effect/HashRing";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addMany";
const exportKind = "const";
const moduleImportPath = "effect/HashRing";
const sourceSummary =
  "Add new nodes to the ring. If a node already exists in the ring, it will be updated. For example, you can use this to update the node's weight.";
const sourceExample = "";
const moduleRecord = HashRingModule as Record<string, unknown>;

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
