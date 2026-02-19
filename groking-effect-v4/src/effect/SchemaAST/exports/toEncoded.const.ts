/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaAST
 * Export: toEncoded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaAST.ts
 * Generated: 2026-02-19T04:14:19.126Z
 *
 * Overview:
 * Returns the encoded (wire-format) AST by flipping and then stripping encodings.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaAST } from "effect"
 * 
 * const schema = Schema.NumberFromString
 * const encodedAst = SchemaAST.toEncoded(schema.ast)
 * console.log(encodedAst._tag) // "String"
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
import * as SchemaASTModule from "effect/SchemaAST";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toEncoded";
const exportKind = "const";
const moduleImportPath = "effect/SchemaAST";
const sourceSummary = "Returns the encoded (wire-format) AST by flipping and then stripping encodings.";
const sourceExample = "import { Schema, SchemaAST } from \"effect\"\n\nconst schema = Schema.NumberFromString\nconst encodedAst = SchemaAST.toEncoded(schema.ast)\nconsole.log(encodedAst._tag) // \"String\"";
const moduleRecord = SchemaASTModule as Record<string, unknown>;

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
