/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Interrupt
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.687Z
 *
 * Overview:
 * A fiber interruption signal, optionally carrying the ID of the fiber that initiated the interruption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const cause = Cause.interrupt(123)
 * const reason = cause.reasons[0]
 * if (Cause.isInterruptReason(reason)) {
 *   console.log(reason.fiberId) // 123
 * }
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

const exportName = "Interrupt";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A fiber interruption signal, optionally carrying the ID of the fiber that initiated the interruption.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst cause = Cause.interrupt(123)\nconst reason = cause.reasons[0]\nif (Cause.isInterruptReason(reason)) {\n  console.log(reason.fiberId) // 123\n}";

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
