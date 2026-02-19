/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Die
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.682Z
 *
 * Overview:
 * An untyped defect — typically a programming error or an uncaught exception.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const cause = Cause.die(new Error("Unexpected"))
 * const reason = cause.reasons[0]
 * if (Cause.isDieReason(reason)) {
 *   console.log(reason.defect) // Error: Unexpected
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

const exportName = "Die";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An untyped defect — typically a programming error or an uncaught exception.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst cause = Cause.die(new Error(\"Unexpected\"))\nconst reason = cause.reasons[0]\nif (Cause.isDieReason(reason)) {\n  console.log(reason.defect) // Error: Unexpected\n}";

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
