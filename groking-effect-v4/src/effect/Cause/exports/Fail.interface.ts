/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Fail
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.684Z
 *
 * Overview:
 * A typed, expected error produced by `Effect.fail`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const cause = Cause.fail("Something went wrong")
 * const reason = cause.reasons[0]
 * if (Cause.isFailReason(reason)) {
 *   console.log(reason.error) // "Something went wrong"
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

const exportName = "Fail";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A typed, expected error produced by `Effect.fail`.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst cause = Cause.fail(\"Something went wrong\")\nconst reason = cause.reasons[0]\nif (Cause.isFailReason(reason)) {\n  console.log(reason.error) // \"Something went wrong\"\n}";

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
