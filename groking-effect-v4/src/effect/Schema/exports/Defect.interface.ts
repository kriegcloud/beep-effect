/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Defect
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.197Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Defect` is type-level; runtime behavior comes from `Schema.Defect` and companions.
 * - Examples show error-vs-unknown defect encoding behavior.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Defect";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDefectErrorEncoding = Effect.gen(function* () {
  const decodeDefect = SchemaModule.decodeUnknownSync(SchemaModule.Defect);
  const decodeDefectWithStack = SchemaModule.decodeUnknownSync(SchemaModule.DefectWithStack);
  const encodeDefect = SchemaModule.encodeUnknownSync(SchemaModule.Defect);
  const encodeDefectWithStack = SchemaModule.encodeUnknownSync(SchemaModule.DefectWithStack);

  const boom = new Error("boom");
  boom.name = "BoomError";
  boom.stack = "STACK_LINE";

  const defect = decodeDefect(boom);
  const defectWithStack = decodeDefectWithStack(boom);

  yield* Console.log("Defect type is erased; runtime behavior comes from Schema.Defect.");
  yield* Console.log(`encode(Schema.Defect, Error) => ${formatUnknown(encodeDefect(defect))}`);
  yield* Console.log(
    `encode(Schema.DefectWithStack, Error) => ${formatUnknown(encodeDefectWithStack(defectWithStack))}`
  );
});

const exampleDefectUnknownPassthrough = Effect.gen(function* () {
  const decodeDefect = SchemaModule.decodeUnknownSync(SchemaModule.Defect);
  const encodeDefect = SchemaModule.encodeUnknownSync(SchemaModule.Defect);

  const plainObject = { module: "scheduler", retryable: true };
  const plainDefect = decodeDefect(plainObject);
  yield* Console.log(`decode plain object => ${formatUnknown(plainDefect)}`);
  yield* Console.log(`encode plain object => ${formatUnknown(encodeDefect(plainDefect))}`);

  const fnDefect = decodeDefect(() => 123);
  yield* Console.log(`encode function defect => ${formatUnknown(encodeDefect(fnDefect))}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Error Defect Encoding",
      description: "Compare Defect vs DefectWithStack encoding for Error inputs.",
      run: exampleDefectErrorEncoding,
    },
    {
      title: "Unknown Defect Passthrough",
      description: "Show unknown defect values survive decode and encode with fallback formatting.",
      run: exampleDefectUnknownPassthrough,
    },
  ],
});

BunRuntime.runMain(program);
