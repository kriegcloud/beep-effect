/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: NoSuchElementError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T03:49:05.760Z
 *
 * Overview:
 * An error indicating that a requested element does not exist.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * const error = new Cause.NoSuchElementError("Element not found")
 * console.log(error._tag)    // "NoSuchElementError"
 * console.log(error.message) // "Element not found"
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
import * as Cause from "effect/Cause";
import * as CauseModule from "effect/Cause";

const exportName = "NoSuchElementError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An error indicating that a requested element does not exist.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst error = new Cause.NoSuchElementError(\"Element not found\")\nconsole.log(error._tag)    // \"NoSuchElementError\"\nconsole.log(error.message) // \"Element not found\"";

const program = Effect.gen(function* () {
  yield* Console.log(`\n┌────────────────────────────────────────────────────────────┐`);
  yield* Console.log(`│ 🧠 ${moduleImportPath}.${exportName} (${exportKind})`);
  yield* Console.log(`└────────────────────────────────────────────────────────────┘`);
  yield* Console.log(`\n📝 ${sourceSummary}`);

  if (sourceExample.length > 0) {
    yield* Console.log(`\n📚 Source example:\n${sourceExample}`);
  }

  const runtimeExportKeys = Object.keys(CauseModule);
  const appearsAtRuntime = runtimeExportKeys.includes(exportName);

  yield* Console.log(`\n📦 Runtime export count: ${runtimeExportKeys.length}`);
  yield* Console.log(`🧬 Type exports are erased at runtime.`);
  yield* Console.log(`🔍 Does "${exportName}" appear at runtime? ${appearsAtRuntime ? "yes" : "no"}`);
  yield* Console.log(`🧱 BunContext layer detected: ${String("layer" in BunContext)}`);
  yield* Console.log(`\n✅ Demo complete for ${moduleImportPath}.${exportName}`);
}).pipe(
  Effect.catch((error) => Effect.gen(function* () {
    const msg = String(error);
    yield* Console.log(`\n💥 Program failed: ${msg}`);
    const cause = Cause.fail(error);
    yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
    return yield* Effect.fail(error);
  }))
);

BunRuntime.runMain(program);
