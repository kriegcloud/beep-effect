/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: DefectWithStack
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.197Z
 *
 * Overview:
 * A schema that represents defects, that also includes stack traces in the encoded form.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Schema.DefectWithStack` preserves error stack information in encoded output.
 * - Examples contrast with `Schema.Defect` and show non-error fallback encoding.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DefectWithStack";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A schema that represents defects, that also includes stack traces in the encoded form.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleStackRetention = Effect.gen(function* () {
  const decodeDefectWithStack = SchemaModule.decodeUnknownSync(SchemaModule.DefectWithStack);
  const encodeDefectWithStack = SchemaModule.encodeUnknownSync(SchemaModule.DefectWithStack);
  const encodeDefect = SchemaModule.encodeUnknownSync(SchemaModule.Defect);

  const problem = new Error("fatal");
  problem.name = "FatalError";
  problem.stack = "STACK_FRAME";

  const decoded = decodeDefectWithStack(problem);

  yield* Console.log(`encode DefectWithStack => ${formatUnknown(encodeDefectWithStack(decoded))}`);
  yield* Console.log(`encode Defect (contrast) => ${formatUnknown(encodeDefect(decoded))}`);
});

const exampleUnknownFallbackEncoding = Effect.gen(function* () {
  const decodeDefectWithStack = SchemaModule.decodeUnknownSync(SchemaModule.DefectWithStack);
  const encodeDefectWithStack = SchemaModule.encodeUnknownSync(SchemaModule.DefectWithStack);

  const fnDefect = decodeDefectWithStack(() => 123);
  const encodedFn = encodeDefectWithStack(fnDefect);
  yield* Console.log(`encode function defect => ${formatUnknown(encodedFn)}`);

  const objectDefect = decodeDefectWithStack({ subsystem: "queue", code: 503 });
  yield* Console.log(`encode object defect => ${formatUnknown(encodeDefectWithStack(objectDefect))}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "📚",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Error Stack Retention",
      description: "Show that DefectWithStack encoding includes stack metadata for Error values.",
      run: exampleStackRetention,
    },
    {
      title: "Unknown Defect Fallback",
      description: "Show fallback encoding behavior for non-Error defect values.",
      run: exampleUnknownFallbackEncoding,
    },
  ],
});

BunRuntime.runMain(program);
