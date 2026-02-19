/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Bottom
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.195Z
 *
 * Overview:
 * The base interface for all schemas in the Effect Schema library, exposing all 14 type parameters that control schema behavior and type inference. Bottom sits at the root of the schema type hierarchy and provides access to the complete internal type information of schemas.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - `Bottom` is a type-level root interface and is erased at runtime.
 * - Runtime behavior is demonstrated via concrete schemas that implement `Bottom`.
 */

import { createPlaygroundProgram, inspectTypeLikeExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Bottom";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary =
  "The base interface for all schemas in the Effect Schema library, exposing all 14 type parameters that control schema behavior and type inference. Bottom sits at the root of the ...";
const sourceExample = "";
const moduleRecord = SchemaModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeBridge = Effect.gen(function* () {
  yield* Console.log("Bottom is compile-time only; concrete schemas carry the runtime contract.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });

  const runtimeSchemas = [
    ["Schema.String", SchemaModule.String],
    ["Schema.Array(Schema.Number)", SchemaModule.Array(SchemaModule.Number)],
  ] as const;

  for (const [label, schema] of runtimeSchemas) {
    yield* Console.log(`${label} ast tag => ${schema.ast._tag}`);
  }
});

const exampleSharedBottomMethods = Effect.gen(function* () {
  const User = SchemaModule.Struct({
    id: SchemaModule.Number,
    name: SchemaModule.String.check(SchemaModule.isMinLength(1)),
  });
  const UserWithTitle = User.annotate({ title: "User" });
  const rebuiltUser = UserWithTitle.rebuild(UserWithTitle.ast);
  const decodeUser = SchemaModule.decodeUnknownSync(rebuiltUser);

  const decoded = decodeUser({ id: 1, name: "Ada" });
  yield* Console.log(`annotate(title) => ${String(UserWithTitle.ast.annotations?.title ?? "(none)")}`);
  yield* Console.log(`decode valid user => ${JSON.stringify(decoded)}`);

  try {
    decodeUser({ id: 1, name: "" });
    yield* Console.log("decode invalid user unexpectedly succeeded.");
  } catch (error) {
    const firstLine = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`decode invalid user failed: ${firstLine}`);
  }
});

const exampleMakeUnsafeContract = Effect.gen(function* () {
  const makeNumberUnsafe = SchemaModule.Number.makeUnsafe as (input: unknown) => number;

  yield* Console.log(`Number.makeUnsafe(12) => ${makeNumberUnsafe(12)}`);

  try {
    makeNumberUnsafe("12");
    yield* Console.log('Number.makeUnsafe("12") unexpectedly succeeded.');
  } catch (error) {
    const firstLine = String(error).split("\n")[0] ?? String(error);
    yield* Console.log(`Number.makeUnsafe("12") failed: ${firstLine}`);
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
      title: "Type Erasure and Runtime Bridge",
      description: "Confirm Bottom erasure, then inspect concrete schema AST tags.",
      run: exampleTypeRuntimeBridge,
    },
    {
      title: "Shared Bottom Methods",
      description: "Use annotate, rebuild, and decodeUnknownSync on a concrete schema.",
      run: exampleSharedBottomMethods,
    },
    {
      title: "makeUnsafe Contract",
      description: "Show makeUnsafe success and failure behavior on Schema.Number.",
      run: exampleMakeUnsafeContract,
    },
  ],
});

BunRuntime.runMain(program);
