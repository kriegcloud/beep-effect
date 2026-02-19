/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: ConstructorDefault
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.196Z
 *
 * Overview:
 * Does the constructor of this schema supply a default value?
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `ConstructorDefault` is compile-time only.
 * - Runtime behavior is demonstrated via `Schema.tag(...)` and constructor/decode flows.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ConstructorDefault";
const exportKind = "type";
const moduleImportPath = "effect/Schema";
const sourceSummary = "Does the constructor of this schema supply a default value?";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleConstructorDefaultWithTag = Effect.gen(function* () {
  const TaggedEvent = SchemaModule.Class("TaggedEvent")({
    _tag: SchemaModule.tag("TaggedEvent"),
    payload: SchemaModule.String,
  });

  const event = new TaggedEvent({ payload: "created" });

  yield* Console.log("Type alias ConstructorDefault is erased; behavior is visible through runtime constructors.");
  yield* Console.log(`new TaggedEvent({ payload: "created" }) => ${formatUnknown(event)}`);
  yield* Console.log(`Auto-populated tag => ${event._tag}`);
});

const exampleLiteralWithoutDefault = Effect.gen(function* () {
  const TaggedStruct = SchemaModule.Struct({
    _tag: SchemaModule.tag("TaggedStruct"),
    payload: SchemaModule.String,
  });
  const LiteralStruct = SchemaModule.Struct({
    _tag: SchemaModule.Literal("TaggedStruct"),
    payload: SchemaModule.String,
  });

  type TaggedStructInput = { readonly _tag: "TaggedStruct"; readonly payload: string };
  const missingTagInput = { payload: "ok" } as unknown as TaggedStructInput;

  const taggedValue = TaggedStruct.makeUnsafe(missingTagInput);
  yield* Console.log(`tag(...) default in makeUnsafe => ${formatUnknown(taggedValue)}`);

  const literalAttempt = yield* attemptThunk(() => LiteralStruct.makeUnsafe(missingTagInput));
  if (literalAttempt._tag === "Right") {
    yield* Console.log(`Literal schema unexpectedly defaulted tag => ${formatUnknown(literalAttempt.value)}`);
  } else {
    const message = String(literalAttempt.error).split("\n")[0] ?? String(literalAttempt.error);
    yield* Console.log(`Literal schema without constructor default failed as expected: ${message}`);
  }
});

const exampleDecodeStillNeedsEncodedValue = Effect.gen(function* () {
  const TaggedEvent = SchemaModule.Class("DecodeTaggedEvent")({
    _tag: SchemaModule.tag("DecodeTaggedEvent"),
    payload: SchemaModule.String,
  });
  const decodeTaggedEvent = SchemaModule.decodeUnknownSync(TaggedEvent);

  const missingTagAttempt = yield* attemptThunk(() => decodeTaggedEvent({ payload: "created" }));
  if (missingTagAttempt._tag === "Right") {
    yield* Console.log("decode without _tag unexpectedly succeeded.");
  } else {
    const message = String(missingTagAttempt.error).split("\n")[0] ?? String(missingTagAttempt.error);
    yield* Console.log(`decode without _tag failed as expected: ${message}`);
  }

  const decoded = decodeTaggedEvent({ _tag: "DecodeTaggedEvent", payload: "created" });
  yield* Console.log(`decode with _tag => ${formatUnknown(decoded)}`);
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
      title: "Constructor Defaults via tag",
      description: "Show constructor defaults in action using Schema.tag inside a class schema.",
      run: exampleConstructorDefaultWithTag,
    },
    {
      title: "Literal Has No Constructor Default",
      description: "Contrast tag-based defaults with literal schemas in makeUnsafe flows.",
      run: exampleLiteralWithoutDefault,
    },
    {
      title: "Decode Path Still Requires Encoded Key",
      description: "Demonstrate that decodeUnknownSync still expects the encoded tag field.",
      run: exampleDecodeStillNeedsEncodedValue,
    },
  ],
});

BunRuntime.runMain(program);
