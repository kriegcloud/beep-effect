/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.395Z
 *
 * Overview:
 * Lifts a `Result`-returning function into one that returns an array: failures produce `[]`, successes produce `[value]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 * 
 * const parseNumber = (s: string): Result.Result<number, Error> =>
 *   isNaN(Number(s))
 *     ? Result.fail(new Error("Not a number"))
 *     : Result.succeed(Number(s))
 * 
 * const liftedParseNumber = Array.liftResult(parseNumber)
 * console.log(liftedParseNumber("42")) // [42]
 * console.log(liftedParseNumber("not a number")) // []
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

const exportName = "liftResult";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Lifts a `Result`-returning function into one that returns an array: failures produce `[]`, successes produce `[value]`.";
const sourceExample = "import { Array, Result } from \"effect\"\n\nconst parseNumber = (s: string): Result.Result<number, Error> =>\n  isNaN(Number(s))\n    ? Result.fail(new Error(\"Not a number\"))\n    : Result.succeed(Number(s))\n\nconst liftedParseNumber = Array.liftResult(parseNumber)\nconsole.log(liftedParseNumber(\"42\")) // [42]\nconsole.log(liftedParseNumber(\"not a number\")) // []";

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
