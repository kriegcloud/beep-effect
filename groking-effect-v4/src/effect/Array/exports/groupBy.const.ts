/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: groupBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:02:05.393Z
 *
 * Overview:
 * Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * const people = [
 *   { name: "Alice", group: "A" },
 *   { name: "Bob", group: "B" },
 *   { name: "Charlie", group: "A" }
 * ]
 * 
 * const result = Array.groupBy(people, (person) => person.group)
 * console.log(result)
 * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
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

const exportName = "groupBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.";
const sourceExample = "import { Array } from \"effect\"\n\nconst people = [\n  { name: \"Alice\", group: \"A\" },\n  { name: \"Bob\", group: \"B\" },\n  { name: \"Charlie\", group: \"A\" }\n]\n\nconst result = Array.groupBy(people, (person) => person.group)\nconsole.log(result)\n// { A: [{ name: \"Alice\", group: \"A\" }, { name: \"Charlie\", group: \"A\" }], B: [{ name: \"Bob\", group: \"B\" }] }";

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
