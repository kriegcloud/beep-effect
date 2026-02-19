/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: UnknownError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.700Z
 *
 * Overview:
 * A wrapper for errors whose type is not statically known.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const error = new Cause.UnknownError("original", "Something unknown")
 * console.log(error._tag)    // "UnknownError"
 * console.log(error.message) // "Something unknown"
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

const exportName = "UnknownError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A wrapper for errors whose type is not statically known.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst error = new Cause.UnknownError(\"original\", \"Something unknown\")\nconsole.log(error._tag)    // \"UnknownError\"\nconsole.log(error.message) // \"Something unknown\"";

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
