/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: YieldableError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.701Z
 *
 * Overview:
 * Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 * 
 * const error = new Cause.NoSuchElementError("not found")
 * 
 * const program = Effect.gen(function*() {
 *   yield* error // fails the effect with NoSuchElementError
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - This executable example documents and verifies module-level runtime context.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import {
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "YieldableError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.";
const sourceExample = "import { Cause, Effect } from \"effect\"\n\nconst error = new Cause.NoSuchElementError(\"not found\")\n\nconst program = Effect.gen(function*() {\n  yield* error // fails the effect with NoSuchElementError\n})";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🧠", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);

  const runtimeExportKeys = Object.keys(CauseModule);
  const appearsAtRuntime = runtimeExportKeys.includes(exportName);

  yield* Console.log(`\n📦 Runtime export count: ${runtimeExportKeys.length}`);
  yield* Console.log(`🧬 Type exports are erased at runtime.`);
  yield* Console.log(`🔍 Does "${exportName}" appear at runtime? ${appearsAtRuntime ? "yes" : "no"}`);
  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
