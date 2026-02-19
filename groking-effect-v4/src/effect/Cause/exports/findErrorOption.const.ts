/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findErrorOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:02:04.684Z
 *
 * Overview:
 * Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Option } from "effect"
 * 
 * const some = Cause.findErrorOption(Cause.fail("error"))
 * console.log(Option.isSome(some)) // true
 * 
 * const none = Cause.findErrorOption(Cause.die("defect"))
 * console.log(Option.isNone(none)) // true
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

const exportName = "findErrorOption";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.";
const sourceExample = "import { Cause, Option } from \"effect\"\n\nconst some = Cause.findErrorOption(Cause.fail(\"error\"))\nconsole.log(Option.isSome(some)) // true\n\nconst none = Cause.findErrorOption(Cause.die(\"defect\"))\nconsole.log(Option.isNone(none)) // true";

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
