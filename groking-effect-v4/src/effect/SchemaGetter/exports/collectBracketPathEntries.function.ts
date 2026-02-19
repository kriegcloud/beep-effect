/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: collectBracketPathEntries
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.180Z
 *
 * Overview:
 * Flattens a nested object into bracket-path entries, filtering leaf values by a type guard.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter, Predicate } from "effect"
 * 
 * const collectStrings = SchemaGetter.collectBracketPathEntries(Predicate.isString)
 * const entries = collectStrings({ user: { name: "Alice", tags: ["admin", "editor"] } })
 * // [["user[name]", "Alice"], ["user[tags]", "admin"], ["user[tags]", "editor"]]
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaGetterModule from "effect/SchemaGetter";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "collectBracketPathEntries";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Flattens a nested object into bracket-path entries, filtering leaf values by a type guard.";
const sourceExample = "import { SchemaGetter, Predicate } from \"effect\"\n\nconst collectStrings = SchemaGetter.collectBracketPathEntries(Predicate.isString)\nconst entries = collectStrings({ user: { name: \"Alice\", tags: [\"admin\", \"editor\"] } })\n// [[\"user[name]\", \"Alice\"], [\"user[tags]\", \"admin\"], [\"user[tags]\", \"editor\"]]";
const moduleRecord = SchemaGetterModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
