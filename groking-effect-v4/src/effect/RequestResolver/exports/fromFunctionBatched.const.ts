/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: fromFunctionBatched
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * Constructs a request resolver from a pure function that takes a list of requests and returns a list of results of the same size. Each item in the result list must correspond to the item at the same index in the request list.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 * 
 * interface GetDoubleRequest extends Request.Request<number> {
 *   readonly _tag: "GetDoubleRequest"
 *   readonly value: number
 * }
 * const GetDoubleRequest = Request.tagged<GetDoubleRequest>("GetDoubleRequest")
 * 
 * // Create a resolver that processes multiple requests in a batch
 * const DoubleResolver = RequestResolver.fromFunctionBatched<GetDoubleRequest>(
 *   (entries) => entries.map((entry) => entry.request.value * 2)
 * )
 * 
 * // Usage with multiple requests
 * const effects = [1, 2, 3].map((value) =>
 *   Effect.request(GetDoubleRequest({ value }), Effect.succeed(DoubleResolver))
 * )
 * const batchedEffect = Effect.all(effects) // [2, 4, 6]
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
import * as RequestResolverModule from "effect/RequestResolver";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromFunctionBatched";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "Constructs a request resolver from a pure function that takes a list of requests and returns a list of results of the same size. Each item in the result list must correspond to ...";
const sourceExample = "import { Effect, Request, RequestResolver } from \"effect\"\n\ninterface GetDoubleRequest extends Request.Request<number> {\n  readonly _tag: \"GetDoubleRequest\"\n  readonly value: number\n}\nconst GetDoubleRequest = Request.tagged<GetDoubleRequest>(\"GetDoubleRequest\")\n\n// Create a resolver that processes multiple requests in a batch\nconst DoubleResolver = RequestResolver.fromFunctionBatched<GetDoubleRequest>(\n  (entries) => entries.map((entry) => entry.request.value * 2)\n)\n\n// Usage with multiple requests\nconst effects = [1, 2, 3].map((value) =>\n  Effect.request(GetDoubleRequest({ value }), Effect.succeed(DoubleResolver))\n)\nconst batchedEffect = Effect.all(effects) // [2, 4, 6]";
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
