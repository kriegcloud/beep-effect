/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findDefect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.684Z
 *
 * Overview:
 * Returns the first defect value (`unknown`) from a cause. Returns `Filter.fail` with the original cause when no {@link Die} reason is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 * 
 * const result = Cause.findDefect(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // "defect"
 * }
 * ```
 *
 * Focus:
 * - Runtime inspection for value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import {
  formatUnknown,
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "findDefect";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns the first defect value (`unknown`) from a cause. Returns `Filter.fail` with the original cause when no {@link Die} reason is found.";
const sourceExample = "import { Cause, Result } from \"effect\"\n\nconst result = Cause.findDefect(Cause.die(\"defect\"))\nif (!Result.isFailure(result)) {\n  console.log(result.success) // \"defect\"\n}";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🔎", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);
  yield* Console.log(`\n📦 Inspecting runtime value-like export...`);

  const moduleKeys = Object.keys(CauseModule);
  yield* Console.log(`\n📦 Module export count: ${moduleKeys.length}`);

  const target = CauseModule[exportName as keyof typeof CauseModule];
  yield* Console.log(`🔬 Runtime typeof: ${typeof target}`);

  if (typeof target === "function") {
    const signaturePreview = String(target).replace(/\s+/g, " ").slice(0, 240);
    yield* Console.log(`⚙️ Function-like value preview: ${signaturePreview}${String(target).length > 240 ? "..." : ""}`);
  } else {
    yield* Console.log(`📄 Value preview:\n${formatUnknown(target)}`);
  }

  yield* logBunContextLayer(BunContext);
  yield* logCompletion(moduleImportPath, exportName);
}).pipe(reportProgramError);

BunRuntime.runMain(program);
