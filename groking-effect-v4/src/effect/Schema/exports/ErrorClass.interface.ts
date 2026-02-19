/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: ErrorClass
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
 * - `ErrorClass` is type-level while `Schema.ErrorClass` creates runtime constructors.
 * - Examples show decode/encode with generated error classes and tagged variants.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ErrorClass";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeErrorClass = Effect.gen(function* () {
  const ValidationError = SchemaModule.ErrorClass("ValidationError")({
    field: SchemaModule.String,
    reason: SchemaModule.NonEmptyString,
  });

  const decodeValidationError = SchemaModule.decodeUnknownSync(ValidationError);
  const encodeValidationError = SchemaModule.encodeUnknownSync(ValidationError);

  const instance = new ValidationError({ field: "email", reason: "required" });
  const decoded = decodeValidationError({ field: "age", reason: "must be an integer" });

  yield* Console.log(`ValidationError.identifier => ${ValidationError.identifier}`);
  yield* Console.log(`ValidationError.fields => ${Object.keys(ValidationError.fields).join(", ")}`);
  yield* Console.log(`new ValidationError(...) instanceof Error => ${instance instanceof Error}`);
  yield* Console.log(`decode(...) returns ValidationError instance => ${decoded instanceof ValidationError}`);
  yield* Console.log(`encode(decoded) => ${formatUnknown(encodeValidationError(decoded))}`);
});

const exampleTaggedErrorClass = Effect.gen(function* () {
  const AuthError = SchemaModule.TaggedErrorClass()("AuthError", {
    code: SchemaModule.Int,
  });
  const decodeAuthError = SchemaModule.decodeUnknownSync(AuthError);
  const encodeAuthError = SchemaModule.encodeUnknownSync(AuthError);

  const parsed = decodeAuthError({ _tag: "AuthError", code: 403 });
  yield* Console.log(`decode tagged payload => ${formatUnknown(encodeAuthError(parsed))}`);

  const invalidTag = yield* attemptThunk(() => decodeAuthError({ _tag: "OtherError", code: 403 }));
  if (invalidTag._tag === "Right") {
    yield* Console.log("decode with wrong _tag unexpectedly succeeded.");
  } else {
    const message = String(invalidTag.error).split("\n")[0] ?? String(invalidTag.error);
    yield* Console.log(`decode with wrong _tag failed as expected: ${message}`);
  }

  const invalidCode = yield* attemptThunk(() => decodeAuthError({ _tag: "AuthError", code: 403.5 }));
  if (invalidCode._tag === "Right") {
    yield* Console.log("decode with non-int code unexpectedly succeeded.");
  } else {
    const message = String(invalidCode.error).split("\n")[0] ?? String(invalidCode.error);
    yield* Console.log(`decode with non-int code failed as expected: ${message}`);
  }
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
      title: "Runtime ErrorClass Constructor",
      description: "Create an ErrorClass schema, instantiate it, and round-trip encode/decode values.",
      run: exampleRuntimeErrorClass,
    },
    {
      title: "Tagged ErrorClass Validation",
      description: "Validate tagged error payloads and show strict _tag / Int enforcement.",
      run: exampleTaggedErrorClass,
    },
  ],
});

BunRuntime.runMain(program);
