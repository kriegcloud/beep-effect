/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: symbol
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.901Z
 *
 * Overview:
 * Matches values of type `symbol`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 * 
 * const mySymbol = Symbol("my-symbol")
 * const globalSymbol = Symbol.for("global-symbol")
 * 
 * const handleSymbol = Match.type<unknown>().pipe(
 *   Match.when(Match.symbol, (sym) => {
 *     const description = sym.description
 *     if (description) {
 *       return `Symbol with description: ${description}`
 *     }
 *     return "Symbol without description"
 *   }),
 *   Match.orElse(() => "Not a symbol")
 * )
 * 
 * console.log(handleSymbol(mySymbol)) // "Symbol with description: my-symbol"
 * console.log(handleSymbol(Symbol())) // "Symbol without description"
 * console.log(handleSymbol("string")) // "Not a symbol"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MatchModule from "effect/Match";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "symbol";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values of type `symbol`.";
const sourceExample = "import { Match } from \"effect\"\n\nconst mySymbol = Symbol(\"my-symbol\")\nconst globalSymbol = Symbol.for(\"global-symbol\")\n\nconst handleSymbol = Match.type<unknown>().pipe(\n  Match.when(Match.symbol, (sym) => {\n    const description = sym.description\n    if (description) {\n      return `Symbol with description: ${description}`\n    }\n    return \"Symbol without description\"\n  }),\n  Match.orElse(() => \"Not a symbol\")\n)\n\nconsole.log(handleSymbol(mySymbol)) // \"Symbol with description: my-symbol\"\nconsole.log(handleSymbol(Symbol())) // \"Symbol without description\"\nconsole.log(handleSymbol(\"string\")) // \"Not a symbol\"";
const moduleRecord = MatchModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
