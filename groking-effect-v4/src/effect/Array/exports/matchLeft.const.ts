/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: matchLeft
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.395Z
 *
 * Overview:
 * Pattern-matches on an array from the left, providing the first element and the remaining elements separately.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * const matchLeft = Array.matchLeft({
 *   onEmpty: () => "empty",
 *   onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`
 * })
 * console.log(matchLeft([])) // "empty"
 * console.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"
 * ```
 *
 * Focus:
 * - Runtime inspection for value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Array from "effect/Array";
import {
  formatUnknown,
  logBunContextLayer,
  logCompletion,
  logHeader,
  logSourceExample,
  logSummary,
  reportProgramError
} from "@beep/groking-effect-v4/runtime/Playground";

const exportName = "matchLeft";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Pattern-matches on an array from the left, providing the first element and the remaining elements separately.";
const sourceExample = "import { Array } from \"effect\"\n\nconst matchLeft = Array.matchLeft({\n  onEmpty: () => \"empty\",\n  onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`\n})\nconsole.log(matchLeft([])) // \"empty\"\nconsole.log(matchLeft([1, 2, 3])) // \"head: 1, tail: 2\"";

const program = Effect.gen(function* () {
  yield* logHeader({ icon: "🔎", moduleImportPath, exportName, exportKind });
  yield* logSummary(sourceSummary);
  yield* logSourceExample(sourceExample);
  yield* Console.log(`\n📦 Inspecting runtime value-like export...`);

  const moduleKeys = Object.keys(Array);
  yield* Console.log(`\n📦 Module export count: ${moduleKeys.length}`);

  const target = Array[exportName as keyof typeof Array];
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
