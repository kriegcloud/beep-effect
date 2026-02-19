/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: entityGraph
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/entityGraph.d.ts
 * Generated: 2026-02-19T04:14:22.329Z
 *
 * Overview:
 * Generates interconnected entities with relationships based on a schema definition.
 *
 * Source JSDoc Example:
 * ```ts
 * // Generate a simple directed graph where nodes link to other nodes
 * fc.entityGraph(
 *   { node: { id: fc.stringMatching(/^[A-Z][a-z]*$/) } },
 *   { node: { linkTo: { arity: 'many', type: 'node' } } },
 * )
 * // Produces: { node: [{ id: "Abc", linkTo: [<node#1>, <node#0>] }, ...] }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "entityGraph";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Generates interconnected entities with relationships based on a schema definition.";
const sourceExample = "// Generate a simple directed graph where nodes link to other nodes\nfc.entityGraph(\n  { node: { id: fc.stringMatching(/^[A-Z][a-z]*$/) } },\n  { node: { linkTo: { arity: 'many', type: 'node' } } },\n)\n// Produces: { node: [{ id: \"Abc\", linkTo: [<node#1>, <node#0>] }, ...] }";
const moduleRecord = FastCheckModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
