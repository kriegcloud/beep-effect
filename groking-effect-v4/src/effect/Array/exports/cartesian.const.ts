/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: cartesian
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.386Z
 *
 * Overview:
 * Computes the cartesian product of two arrays, returning all pairs as tuples.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * const result = Array.cartesian([1, 2], ["a", "b"])
 * console.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]
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

const exportName = "cartesian";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes the cartesian product of two arrays, returning all pairs as tuples.";
const sourceExample = "import { Array } from \"effect\"\n\nconst result = Array.cartesian([1, 2], [\"a\", \"b\"])\nconsole.log(result) // [[1, \"a\"], [1, \"b\"], [2, \"a\"], [2, \"b\"]]";

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
