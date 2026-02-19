/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RequestResolver
 * Export: never
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RequestResolver.ts
 * Generated: 2026-02-19T04:14:16.537Z
 *
 * Overview:
 * A request resolver that never executes requests.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 * 
 * // A resolver that will never complete
 * const neverResolver = RequestResolver.never
 * 
 * // For testing timeout behavior with any request type
 * interface TestRequest extends Request.Request<string> {
 *   readonly _tag: "TestRequest"
 * }
 * const TestRequest = Request.tagged<TestRequest>("TestRequest")
 * 
 * // This will never resolve
 * const neverEffect = Effect.request(TestRequest({}), Effect.succeed(neverResolver) as any)
 * 
 * // Useful for testing timeout behavior
 * const timeoutTest = Effect.timeout(neverEffect, "1 second")
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
const exportName = "never";
const exportKind = "const";
const moduleImportPath = "effect/RequestResolver";
const sourceSummary = "A request resolver that never executes requests.";
const sourceExample = "import { Effect, Request, RequestResolver } from \"effect\"\n\n// A resolver that will never complete\nconst neverResolver = RequestResolver.never\n\n// For testing timeout behavior with any request type\ninterface TestRequest extends Request.Request<string> {\n  readonly _tag: \"TestRequest\"\n}\nconst TestRequest = Request.tagged<TestRequest>(\"TestRequest\")\n\n// This will never resolve\nconst neverEffect = Effect.request(TestRequest({}), Effect.succeed(neverResolver) as any)\n\n// Useful for testing timeout behavior\nconst timeoutTest = Effect.timeout(neverEffect, \"1 second\")";
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
