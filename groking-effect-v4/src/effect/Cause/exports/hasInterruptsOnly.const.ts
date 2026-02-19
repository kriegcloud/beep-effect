/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: hasInterruptsOnly
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.687Z
 *
 * Overview:
 * Returns `true` if every reason in the cause is an {@link Interrupt} (and there is at least one reason).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 * 
 * console.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false
 * console.log(Cause.hasInterruptsOnly(Cause.empty))          // false
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

const exportName = "hasInterruptsOnly";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns `true` if every reason in the cause is an {@link Interrupt} (and there is at least one reason).";
const sourceExample = "import { Cause } from \"effect\"\n\nconsole.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true\nconsole.log(Cause.hasInterruptsOnly(Cause.fail(\"error\")))  // false\nconsole.log(Cause.hasInterruptsOnly(Cause.empty))          // false";

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
