/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Class
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
 * - `Class` as a type is compile-time only, while `Schema.Class` is the runtime constructor companion.
 * - Examples demonstrate class construction and decode validation with concrete schemas.
 */

import { attemptThunk, createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Class";
const exportKind = "interface";
const moduleImportPath = "effect/Schema";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassRuntimeCompanion = Effect.gen(function* () {
  const Person = SchemaModule.Class("Person")({
    name: SchemaModule.String,
    age: SchemaModule.Number,
  });

  const ada = new Person({ name: "Ada", age: 37 });

  yield* Console.log("Class interface is erased; runtime behavior comes from Schema.Class(...).");
  yield* Console.log(`Person.identifier => ${Person.identifier}`);
  yield* Console.log(`Person.fields => ${Object.keys(Person.fields).join(", ")}`);
  yield* Console.log(`new Person(...) => ${formatUnknown(ada)}`);
});

const exampleClassDecodeValidation = Effect.gen(function* () {
  const Employee = SchemaModule.Class("Employee")({
    id: SchemaModule.Int,
    name: SchemaModule.NonEmptyString,
  });
  const decodeEmployee = SchemaModule.decodeUnknownSync(Employee);

  const valid = decodeEmployee({ id: 101, name: "Lin" });
  yield* Console.log(`decode valid employee => ${formatUnknown(valid)}`);

  const invalidInputs: ReadonlyArray<unknown> = [
    { id: 2.5, name: "Lin" },
    { id: 102, name: "" },
  ];

  for (const input of invalidInputs) {
    const attempt = yield* attemptThunk(() => decodeEmployee(input));
    if (attempt._tag === "Right") {
      yield* Console.log(`decode(${formatUnknown(input)}) unexpectedly succeeded.`);
    } else {
      const message = String(attempt.error).split("\n")[0] ?? String(attempt.error);
      yield* Console.log(`decode(${formatUnknown(input)}) failed as expected: ${message}`);
    }
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
      title: "Runtime Class Companion",
      description: "Build a schema class and inspect identifier, fields, and constructed value.",
      run: exampleClassRuntimeCompanion,
    },
    {
      title: "Class Decode Validation",
      description: "Decode valid/invalid payloads against a Schema.Class-based schema.",
      run: exampleClassDecodeValidation,
    },
  ],
});

BunRuntime.runMain(program);
