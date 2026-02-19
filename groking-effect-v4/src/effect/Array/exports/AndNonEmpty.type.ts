/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: AndNonEmpty
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.383Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - This executable example documents and verifies module-level runtime context.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Array from "effect/Array";
import {
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "AndNonEmpty";
const exportKind = "type";
const moduleImportPath = "effect/Array";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🧠", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);

  const runtimeExportKeys = Object.keys(Array);
  const appearsAtRuntime = runtimeExportKeys.includes(exportName);

  yield* Console.log(`\n📦 Runtime export count: ${runtimeExportKeys.length}`);
  yield* Console.log(`🧬 Type exports are erased at runtime.`);
  yield* Console.log(`🔍 Does "${exportName}" appear at runtime? ${appearsAtRuntime ? "yes" : "no"}`);
  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
