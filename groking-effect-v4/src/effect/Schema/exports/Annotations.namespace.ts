/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: Annotations
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
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Annotations";
const exportKind = "namespace";
const moduleImportPath = "effect/Schema";
const sourceSummary =
  "Defines the typed annotation keys that can be attached to schemas and extended via module augmentation.";
const sourceExample = "";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSchemaLevelAnnotations = Effect.gen(function* () {
  const Person = SchemaModule.Struct({
    name: SchemaModule.String,
    age: SchemaModule.Number,
  }).pipe(
    SchemaModule.annotate({
      title: "Person",
      description: "Person payload used by the API.",
      examples: [{ name: "Ada", age: 37 }],
    })
  );

  const annotations = SchemaModule.resolveInto(Person);
  yield* Console.log(`title: ${annotations?.title ?? "(missing)"}`);
  yield* Console.log(`description: ${annotations?.description ?? "(missing)"}`);
  yield* Console.log(`examples: ${formatUnknown(annotations?.examples)}`);
});

const exampleKeyAnnotations = Effect.gen(function* () {
  const NameField = SchemaModule.String.pipe(
    SchemaModule.annotateKey({
      title: "Full name",
      messageMissingKey: "name is required",
    })
  );
  const Person = SchemaModule.Struct({
    name: NameField,
    age: SchemaModule.Number,
  });

  const firstProperty = Person.ast.propertySignatures[0];
  yield* Console.log(`field: ${String(firstProperty?.name ?? "(missing)")}`);
  yield* Console.log(`key annotations: ${formatUnknown(firstProperty?.type.context?.annotations)}`);
});

const exampleUnsetAnnotation = Effect.gen(function* () {
  const withTitle = SchemaModule.String.pipe(
    SchemaModule.annotate({
      title: "Display Name",
      description: "Used in UI forms",
    })
  );
  const clearedTitle = withTitle.pipe(SchemaModule.annotate({ title: undefined }));

  const before = SchemaModule.resolveInto(withTitle)?.title;
  const after = SchemaModule.resolveInto(clearedTitle)?.title;
  yield* Console.log(`title before clear: ${before ?? "(missing)"}`);
  yield* Console.log(`title after clear: ${after ?? "(missing)"}`);
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
      title: "Schema-Level Annotations",
      description: "Attach documentation annotations and read them back via resolveInto.",
      run: exampleSchemaLevelAnnotations,
    },
    {
      title: "Key-Level Annotations",
      description: "Use annotateKey and inspect field context annotations inside a Struct.",
      run: exampleKeyAnnotations,
    },
    {
      title: "Removing Annotations",
      description: "Set an annotation key to undefined to remove it from schema metadata.",
      run: exampleUnsetAnnotation,
    },
  ],
});

BunRuntime.runMain(program);
