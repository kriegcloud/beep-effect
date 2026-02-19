/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: ErrorWithStack
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.197Z
 *
 * Overview:
 * A schema that represents `Error` objects.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Schema.ErrorWithStack` preserves stack traces in default JSON encoding.
 * - Examples contrast stack-preserving behavior against `Schema.Error`.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ErrorWithStack";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "A schema that represents `Error` objects.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleStackEncodingContrast = Effect.gen(function* () {
  const ErrorJson = SchemaModule.toCodecJson(SchemaModule.Error);
  const ErrorWithStackJson = SchemaModule.toCodecJson(SchemaModule.ErrorWithStack);
  const encodeError = SchemaModule.encodeUnknownSync(ErrorJson);
  const encodeErrorWithStack = SchemaModule.encodeUnknownSync(ErrorWithStackJson);

  const issue = new Error("boom");
  issue.name = "BoomError";
  issue.stack = "STACK_LINE";

  yield* Console.log(`encode(ErrorJson, Error) => ${formatUnknown(encodeError(issue))}`);
  yield* Console.log(`encode(ErrorWithStackJson, Error) => ${formatUnknown(encodeErrorWithStack(issue))}`);
});

const exampleDecodeAndValidation = Effect.gen(function* () {
  const ErrorWithStackJson = SchemaModule.toCodecJson(SchemaModule.ErrorWithStack);
  const decodeErrorWithStack = SchemaModule.decodeUnknownSync(ErrorWithStackJson);

  const parsed = decodeErrorWithStack({
    name: "GatewayError",
    message: "bad gateway",
    stack: "TRACE_LINE",
  });
  yield* Console.log(`decode with stack => name=${parsed.name}, stack=${parsed.stack}`);

  const withoutStack = decodeErrorWithStack({
    name: "NoStackError",
    message: "still valid",
  });
  const stackSummary = String(withoutStack.stack).split("\n")[0] ?? String(withoutStack.stack);
  yield* Console.log(`decode without stack => name=${withoutStack.name}, stack=${stackSummary}`);

  const invalidAttempt = yield* attemptThunk(() => decodeErrorWithStack({ name: "MissingMessage" }));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode missing message unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode missing message failed as expected: ${message}`);
  }
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
  examples: [
    {
      title: "Stack-Preserving Encoding",
      description: "Compare Error JSON encoding with and without stack preservation.",
      run: exampleStackEncodingContrast,
    },
    {
      title: "Decode + Validation",
      description: "Decode stack-bearing payloads and reject invalid payloads missing required fields.",
      run: exampleDecodeAndValidation,
    },
  ],
});

BunRuntime.runMain(program);
