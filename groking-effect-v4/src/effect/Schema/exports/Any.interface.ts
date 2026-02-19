/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Any
 * Kind: interface
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
 * - Interface export with a runtime schema companion (`Schema.Any`).
 * - Executable checks using companion APIs instead of reflection-only probes.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Any";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleAnyPredicate = Effect.gen(function* () {
  const isAny = SchemaModule.is(SchemaModule.Any);
  const samples: ReadonlyArray<unknown> = ["beep", 42, null, { nested: [1, "two"] }, [true, false], undefined];

  yield* Console.log("Compile-time Any is erased; runtime checks use Schema.Any.");
  for (const sample of samples) {
    yield* Console.log(`- ${formatUnknown(sample)} => ${isAny(sample)}`);
  }
});

const exampleAnyDecodeEncodeRoundTrip = Effect.gen(function* () {
  const decodeAny = SchemaModule.decodeUnknownSync(SchemaModule.Any);
  const encodeAny = SchemaModule.encodeUnknownSync(SchemaModule.Any);
  const input = { id: 1, tags: ["beep", "effect"], meta: { ok: true } };
  const decoded = decodeAny(input);
  const encoded = encodeAny(decoded);

  yield* Console.log(`decodeUnknownSync keeps reference: ${decoded === input}`);
  yield* Console.log(`encodeUnknownSync keeps reference: ${encoded === decoded}`);
  yield* Console.log(`Round-trip preview: ${formatUnknown(encoded)}`);
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
      title: "Schema.is with Any",
      description: "Show that the runtime Any schema accepts varied unknown values.",
      run: exampleAnyPredicate,
    },
    {
      title: "Decode/Encode Round Trip",
      description: "Demonstrate that Any decoding and encoding pass values through.",
      run: exampleAnyDecodeEncodeRoundTrip,
    },
  ],
});

BunRuntime.runMain(program);
