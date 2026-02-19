/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Exit
 * Kind: function
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
 * - `Schema.Exit` builds an Exit codec from success, error, and defect schemas.
 * - Examples show decode/encode across success, fail, and die exits.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ExitModule from "effect/Exit";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Exit";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleExitDecodeEncode = Effect.gen(function* () {
  const ExitSchema = SchemaModule.Exit(SchemaModule.Number, SchemaModule.String, SchemaModule.DefectWithStack);
  const decodeExit = SchemaModule.decodeUnknownSync(ExitSchema);
  const encodeExit = SchemaModule.encodeUnknownSync(ExitSchema);

  const success = decodeExit(ExitModule.succeed(7));
  const failure = decodeExit(ExitModule.fail("invalid-input"));
  const successSummary = success._tag === "Success" ? `Success(${success.value})` : "Failure(unexpected)";
  const failureSummary =
    failure._tag === "Failure" ? String(Cause.pretty(failure.cause)).split("\n")[0] : "Success(unexpected)";

  yield* Console.log(`decode(Exit.succeed(7)) => ${successSummary}`);
  yield* Console.log(`decode(Exit.fail("invalid-input")) => ${failureSummary}`);
  yield* Console.log(`encode(success) => ${formatUnknown(encodeExit(success))}`);
  yield* Console.log(`encode(failure) => ${formatUnknown(encodeExit(failure))}`);
});

const exampleExitValidationAndDefect = Effect.gen(function* () {
  const ExitSchema = SchemaModule.Exit(SchemaModule.Number, SchemaModule.String, SchemaModule.DefectWithStack);
  const decodeExit = SchemaModule.decodeUnknownSync(ExitSchema);
  const encodeExit = SchemaModule.encodeUnknownSync(ExitSchema);

  const invalidAttempt = yield* attemptThunk(() => decodeExit({ _tag: "Success", value: 1 }));
  if (invalidAttempt._tag === "Right") {
    yield* Console.log("decode(non-Exit object) unexpectedly succeeded.");
  } else {
    const message = String(invalidAttempt.error).split("\n")[0] ?? String(invalidAttempt.error);
    yield* Console.log(`decode(non-Exit object) failed as expected: ${message}`);
  }

  const fatal = new Error("fatal");
  fatal.name = "FatalError";
  fatal.stack = "STACK_FRAME";
  const dieExit = decodeExit(ExitModule.die(fatal));
  yield* Console.log(`decode(Exit.die(Error)) => ${dieExit._tag}`);
  yield* Console.log(`encode(die exit) => ${formatUnknown(encodeExit(dieExit))}`);
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
  examples: [
    {
      title: "Exit Decode + Encode",
      description: "Decode success/failure exits and encode them through the generated Exit schema.",
      run: exampleExitDecodeEncode,
    },
    {
      title: "Validation + Defect Flow",
      description: "Reject non-Exit inputs and encode a die exit carrying defect information.",
      run: exampleExitValidationAndDefect,
    },
  ],
});

BunRuntime.runMain(program);
