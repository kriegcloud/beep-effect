/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Codec
 * Kind: namespace
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Codec` namespace members are type-level and erased at runtime.
 * - Runtime companion behavior is shown with `revealCodec`, `decodeUnknownSync`, and `encodeUnknownSync`.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Codec";
const exportKind = "namespace";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleNamespaceErasure = Effect.gen(function* () {
  const moduleRecord = SchemaModule as Record<string, unknown>;
  const hasRuntimeCodec = Object.prototype.hasOwnProperty.call(moduleRecord, "Codec");

  yield* Console.log(`Schema.Codec runtime export present: ${hasRuntimeCodec}`);
  yield* Console.log("Codec namespace aliases (Encoded / DecodingServices / etc.) are compile-time only.");
});

const exampleCodecRoundTrip = Effect.gen(function* () {
  const Account = SchemaModule.Struct({
    id: SchemaModule.NumberFromString,
    active: SchemaModule.BooleanFromBit,
  });

  const codec = SchemaModule.revealCodec(Account);
  const decodeAccount = SchemaModule.decodeUnknownSync(codec);
  const encodeAccount = SchemaModule.encodeUnknownSync(codec);

  const decoded = decodeAccount({ id: "42", active: 1 });
  const encoded = encodeAccount(decoded);

  yield* Console.log(`revealCodec(Account) returns same reference: ${codec === Account}`);
  yield* Console.log(`decode({ id: "42", active: 1 }) => ${formatUnknown(decoded)}`);
  yield* Console.log(`encode(decoded) => ${formatUnknown(encoded)}`);

  const invalid = yield* attemptThunk(() => decodeAccount({ id: "42", active: 2 }));
  if (invalid._tag === "Right") {
    yield* Console.log(`decode({ id: "42", active: 2 }) unexpectedly succeeded => ${formatUnknown(invalid.value)}`);
  } else {
    const message = String(invalid.error).split("\n")[0] ?? String(invalid.error);
    yield* Console.log(`decode invalid account failed as expected: ${message}`);
  }
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
      title: "Namespace Erasure Check",
      description: "Show that Codec namespace symbols are type-level and absent at runtime.",
      run: exampleNamespaceErasure,
    },
    {
      title: "Runtime Codec Round-Trip",
      description: "Use runtime codec helpers to decode/encode structured values.",
      run: exampleCodecRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
