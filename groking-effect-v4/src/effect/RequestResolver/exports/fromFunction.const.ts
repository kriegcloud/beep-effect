/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: fromFunction
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:50:38.824Z
 *
 * Overview:
 * Constructs a request resolver from a pure function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 *
 * interface GetSquareRequest extends Request.Request<number> {
 *   readonly _tag: "GetSquareRequest"
 *   readonly value: number
 * }
 * const GetSquareRequest = Request.tagged<GetSquareRequest>("GetSquareRequest")
 *
 * // Create a resolver from a pure function
 * const SquareResolver = RequestResolver.fromFunction<GetSquareRequest>(
 *   (entry) => entry.request.value * entry.request.value
 * )
 *
 * // Usage
 * const getSquareEffect = Effect.request(
 *   GetSquareRequest({ value: 5 }),
 *   Effect.succeed(SquareResolver)
 * )
 * // Will resolve to 25
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
import * as RequestResolverModule from "effect/RequestResolver";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromFunction";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver from a pure function.";
const sourceExample =
  'import { Effect, Request, RequestResolver } from "effect"\n\ninterface GetSquareRequest extends Request.Request<number> {\n  readonly _tag: "GetSquareRequest"\n  readonly value: number\n}\nconst GetSquareRequest = Request.tagged<GetSquareRequest>("GetSquareRequest")\n\n// Create a resolver from a pure function\nconst SquareResolver = RequestResolver.fromFunction<GetSquareRequest>(\n  (entry) => entry.request.value * entry.request.value\n)\n\n// Usage\nconst getSquareEffect = Effect.request(\n  GetSquareRequest({ value: 5 }),\n  Effect.succeed(SquareResolver)\n)\n// Will resolve to 25';
const moduleRecord = RequestResolverModule as Record<string, unknown>;

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
