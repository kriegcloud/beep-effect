/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/persistence/RateLimiter
 * Export: makeSleep
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/persistence/RateLimiter.ts
 * Generated: 2026-02-19T04:14:28.391Z
 *
 * Overview:
 * Access a function that sleeps when the rate limit is exceeded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { RateLimiter } from "effect/unstable/persistence"
 * 
 * Effect.gen(function*() {
 *   // Access the `sleep` function from the RateLimiter module
 *   const sleep = yield* RateLimiter.makeSleep
 * 
 *   // Use the `sleep` function with specific rate limiting parameters.
 *   // This will only sleep if the rate limit has been exceeded.
 *   yield* sleep({
 *     key: "some-key",
 *     limit: 10,
 *     window: "5 seconds",
 *     algorithm: "fixed-window"
 *   })
 * })
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
import * as RateLimiterModule from "effect/unstable/persistence/RateLimiter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeSleep";
const exportKind = "const";
const moduleImportPath = "effect/unstable/persistence/RateLimiter";
const sourceSummary = "Access a function that sleeps when the rate limit is exceeded.";
const sourceExample = "import { Effect } from \"effect\"\nimport { RateLimiter } from \"effect/unstable/persistence\"\n\nEffect.gen(function*() {\n  // Access the `sleep` function from the RateLimiter module\n  const sleep = yield* RateLimiter.makeSleep\n\n  // Use the `sleep` function with specific rate limiting parameters.\n  // This will only sleep if the rate limit has been exceeded.\n  yield* sleep({\n    key: \"some-key\",\n    limit: 10,\n    window: \"5 seconds\",\n    algorithm: \"fixed-window\"\n  })\n})";
const moduleRecord = RateLimiterModule as Record<string, unknown>;

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
