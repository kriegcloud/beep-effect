import type { SchemaAnnotations } from "@beep/codebase-search";
import { detectEffectPattern, extractFieldAnnotations, extractSchemaAnnotations } from "@beep/codebase-search";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { Project } from "ts-morph";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const project = new Project({ useInMemoryFileSystem: true });

/** Creates a ts-morph source file and returns its top-level statements. */
const getStatements = (code: string) => {
  const file = project.createSourceFile(`test-${Date.now()}-${Math.random()}.ts`, code);
  return file.getStatements();
};

/** Gets the first statement from code. */
const firstStatement = (code: string) => {
  const stmts = getStatements(code);
  return pipe(
    A.head(stmts),
    O.getOrThrowWith(() => new Error("No statements found"))
  );
};

/** Gets the last statement from code (useful when imports precede the target). */
const lastStatement = (code: string) => {
  const stmts = getStatements(code);
  return pipe(
    A.last(stmts),
    O.getOrThrowWith(() => new Error("No statements found"))
  );
};

import { pipe } from "effect/Function";

// ---------------------------------------------------------------------------
// detectEffectPattern - TaggedErrorClass
// ---------------------------------------------------------------------------

describe("detectEffectPattern", () => {
  describe("TaggedErrorClass", () => {
    it("detects class extending S.TaggedErrorClass", () => {
      const node = lastStatement(`
import * as S from "effect/Schema";
export class MyError extends S.TaggedErrorClass<MyError>(
  "@scope/pkg/MyError"
)("MyError", {
  message: S.String,
}, {
  title: "My Error",
  description: "A test error class for pattern detection.",
}) {}
`);
      expect(detectEffectPattern(node)).toBe("Schema.TaggedErrorClass");
    });

    it("detects class extending Schema.TaggedErrorClass", () => {
      const node = lastStatement(`
import { Schema } from "effect";
export class AnotherError extends Schema.TaggedErrorClass<AnotherError>(
  "@scope/pkg/AnotherError"
)("AnotherError", {
  message: Schema.String,
}) {}
`);
      expect(detectEffectPattern(node)).toBe("Schema.TaggedErrorClass");
    });
  });

  // ---------------------------------------------------------------------------
  // Schema patterns
  // ---------------------------------------------------------------------------

  describe("Schema.Struct", () => {
    it("detects S.Struct pattern", () => {
      const node = firstStatement(`
export const MyStruct = S.Struct({
  name: S.String,
  age: S.Number,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.Struct");
    });

    it("detects Schema.Struct pattern", () => {
      const node = firstStatement(`
export const MyStruct = Schema.Struct({
  name: Schema.String,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.Struct");
    });
  });

  describe("Schema.Class", () => {
    it("detects S.Class pattern", () => {
      const node = firstStatement(`
export const MyClass = S.Class("MyClass")({
  name: S.String,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.Class");
    });

    it("detects Schema.Class pattern", () => {
      const node = firstStatement(`
export const MyClass = Schema.Class("MyClass")({
  name: Schema.String,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.Class");
    });
  });

  describe("Schema.Union", () => {
    it("detects S.Union pattern", () => {
      const node = firstStatement(`
export const MyUnion = S.Union([S.String, S.Number]);
`);
      expect(detectEffectPattern(node)).toBe("Schema.Union");
    });

    it("detects Schema.Union pattern", () => {
      const node = firstStatement(`
export const MyUnion = Schema.Union([Schema.String, Schema.Number]);
`);
      expect(detectEffectPattern(node)).toBe("Schema.Union");
    });
  });

  describe("Schema.TaggedStruct", () => {
    it("detects S.TaggedStruct pattern", () => {
      const node = firstStatement(`
export const MyTagged = S.TaggedStruct("MyTag", {
  value: S.String,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.TaggedStruct");
    });

    it("detects Schema.TaggedStruct pattern", () => {
      const node = firstStatement(`
export const MyTagged = Schema.TaggedStruct("MyTag", {
  value: Schema.String,
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.TaggedStruct");
    });
  });

  describe("Schema.brand", () => {
    it("detects .brand() in pipe chain", () => {
      const node = firstStatement(`
export const PackageName = S.String.pipe(S.pattern(/^@/), S.brand("PackageName")).brand("PackageName");
`);
      expect(detectEffectPattern(node)).toBe("Schema.brand");
    });

    it("detects .brand() on schema expression", () => {
      const node = firstStatement(`
export const UserId = Schema.String.brand("UserId");
`);
      expect(detectEffectPattern(node)).toBe("Schema.brand");
    });
  });

  // ---------------------------------------------------------------------------
  // Context / Layer / Effect patterns
  // ---------------------------------------------------------------------------

  describe("Context.Tag", () => {
    it("detects Context.Tag pattern", () => {
      const node = firstStatement(`
export const MyService = Context.Tag("MyService");
`);
      expect(detectEffectPattern(node)).toBe("Context.Tag");
    });
  });

  describe("Layer.effect", () => {
    it("detects Layer.effect pattern", () => {
      const node = firstStatement(`
export const MyServiceLive = Layer.effect(MyService, Effect.gen(function* () {
  return { doStuff: () => Effect.succeed("done") };
}));
`);
      expect(detectEffectPattern(node)).toBe("Layer.effect");
    });
  });

  describe("Layer.succeed", () => {
    it("detects Layer.succeed pattern", () => {
      const node = firstStatement(`
export const MyServiceTest = Layer.succeed(MyService, { doStuff: () => Effect.succeed("test") });
`);
      expect(detectEffectPattern(node)).toBe("Layer.succeed");
    });
  });

  describe("Layer.provide", () => {
    it("detects Layer.provide pattern", () => {
      const node = firstStatement(`
export const FullLayer = Layer.provide(MyServiceLive, [DbLayer, LogLayer]);
`);
      expect(detectEffectPattern(node)).toBe("Layer.provide");
    });
  });

  describe("Effect.fn", () => {
    it("detects Effect.fn pattern", () => {
      const node = firstStatement(`
export const myFunction = Effect.fn(function* (input: string) {
  const result = yield* doSomething(input);
  return result;
});
`);
      expect(detectEffectPattern(node)).toBe("Effect.fn");
    });
  });

  describe("Effect.gen", () => {
    it("detects Effect.gen pattern", () => {
      const node = firstStatement(`
export const myProgram = Effect.gen(function* () {
  const fs = yield* FileSystem;
  return yield* fs.readFileString("hello.txt");
});
`);
      expect(detectEffectPattern(node)).toBe("Effect.gen");
    });
  });

  // ---------------------------------------------------------------------------
  // CLI patterns
  // ---------------------------------------------------------------------------

  describe("Command.make", () => {
    it("detects Command.make pattern", () => {
      const node = firstStatement(`
export const myCommand = Command.make("my-command", { verbose }, Effect.fn(function* () {
    yield* Console.log("hello");
  })
);
`);
      expect(detectEffectPattern(node)).toBe("Command.make");
    });
  });

  describe("Flag.string", () => {
    it("detects Flag.string pattern", () => {
      const node = firstStatement(`
export const outputFlag = Flag.string("output").pipe(Flag.withDescription("Output path"));
`);
      expect(detectEffectPattern(node)).toBe("Flag.string");
    });
  });

  describe("Flag.boolean", () => {
    it("detects Flag.boolean pattern", () => {
      const node = firstStatement(`
export const verboseFlag = Flag.boolean("verbose").pipe(Flag.withDescription("Enable verbose logging"));
`);
      expect(detectEffectPattern(node)).toBe("Flag.boolean");
    });
  });

  describe("Argument.string", () => {
    it("detects Argument.string pattern", () => {
      const node = firstStatement(`
export const nameArg = Argument.string("name").pipe(Argument.withDescription("The package name"));
`);
      expect(detectEffectPattern(node)).toBe("Argument.string");
    });
  });

  describe("Argument.number", () => {
    it("detects Argument.number pattern", () => {
      const node = firstStatement(`
export const countArg = Argument.number("count").pipe(Argument.withDescription("Number of items"));
`);
      expect(detectEffectPattern(node)).toBe("Argument.number");
    });
  });

  // ---------------------------------------------------------------------------
  // No pattern
  // ---------------------------------------------------------------------------

  describe("no pattern", () => {
    it("returns null for a plain constant", () => {
      const node = firstStatement(`
export const VERSION = "1.0.0";
`);
      expect(detectEffectPattern(node)).toBe(null);
    });

    it("returns null for a type alias", () => {
      const node = firstStatement(`
export type MyType = { name: string; age: number };
`);
      expect(detectEffectPattern(node)).toBe(null);
    });

    it("returns null for an interface", () => {
      const node = firstStatement(`
export interface MyInterface { name: string; }
`);
      expect(detectEffectPattern(node)).toBe(null);
    });

    it("returns null for a plain function", () => {
      const node = firstStatement(`
export const add = (a: number, b: number) => a + b;
`);
      expect(detectEffectPattern(node)).toBe(null);
    });
  });

  // ---------------------------------------------------------------------------
  // Priority: Schema call patterns take precedence over text patterns
  // ---------------------------------------------------------------------------

  describe("priority", () => {
    it("Schema.Struct takes precedence over text patterns in same node", () => {
      // A Schema.Struct that also contains Effect.gen in its definition text
      const node = firstStatement(`
export const MyStruct = S.Struct({
  name: S.String,
  // Effect.gen( is mentioned in a comment
});
`);
      expect(detectEffectPattern(node)).toBe("Schema.Struct");
    });
  });
});

// ---------------------------------------------------------------------------
// extractSchemaAnnotations
// ---------------------------------------------------------------------------

describe("extractSchemaAnnotations", () => {
  it("extracts all three annotation fields", () => {
    const node = firstStatement(`
export const MySchema = S.Struct({
  name: S.String,
}).annotate({
  identifier: "@beep/pkg/MySchema",
  title: "My Schema",
  description: "A test schema for annotation extraction testing.",
});
`);
    const annotations = extractSchemaAnnotations(node);
    expect(annotations).not.toBe(null);
    expect((annotations as SchemaAnnotations).identifier).toBe("@beep/pkg/MySchema");
    expect((annotations as SchemaAnnotations).title).toBe("My Schema");
    expect((annotations as SchemaAnnotations).description).toBe("A test schema for annotation extraction testing.");
  });

  it("returns partial annotations when not all fields present", () => {
    const node = firstStatement(`
export const MySchema = S.Struct({
  name: S.String,
}).annotate({
  identifier: "@beep/pkg/Partial",
});
`);
    const annotations = extractSchemaAnnotations(node);
    expect(annotations).not.toBe(null);
    expect((annotations as SchemaAnnotations).identifier).toBe("@beep/pkg/Partial");
    expect((annotations as SchemaAnnotations).title).toBe(null);
    expect((annotations as SchemaAnnotations).description).toBe(null);
  });

  it("returns null when no .annotate() call exists", () => {
    const node = firstStatement(`
export const MySchema = S.Struct({
  name: S.String,
});
`);
    const annotations = extractSchemaAnnotations(node);
    expect(annotations).toBe(null);
  });

  it("handles single-quoted values", () => {
    const node = firstStatement(`
export const MySchema = S.Struct({
  name: S.String,
}).annotate({
  identifier: '@beep/pkg/SingleQuoted',
  title: 'Single Quoted Title',
  description: 'A description using single quotes for testing.',
});
`);
    const annotations = extractSchemaAnnotations(node);
    expect(annotations).not.toBe(null);
    expect((annotations as SchemaAnnotations).identifier).toBe("@beep/pkg/SingleQuoted");
    expect((annotations as SchemaAnnotations).title).toBe("Single Quoted Title");
  });

  it("extracts annotations from Schema.Union with .annotate()", () => {
    const node = firstStatement(`
export const Author = Schema.Union([
  Schema.String,
  Schema.Struct({ name: Schema.String }),
]).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/Author",
  title: "Author",
  description: "Package author information for the package.json file.",
});
`);
    const annotations = extractSchemaAnnotations(node);
    expect(annotations).not.toBe(null);
    expect((annotations as SchemaAnnotations).identifier).toBe("@beep/repo-utils/schemas/PackageJson/Author");
    expect((annotations as SchemaAnnotations).title).toBe("Author");
    expect((annotations as SchemaAnnotations).description).toBe(
      "Package author information for the package.json file."
    );
  });
});

// ---------------------------------------------------------------------------
// extractFieldAnnotations
// ---------------------------------------------------------------------------

describe("extractFieldAnnotations", () => {
  it("extracts field annotations from annotateKey calls", () => {
    const node = firstStatement(`
export const MyStruct = S.Struct({
  name: S.String.annotateKey({ description: "The user name field for identification" }),
  age: S.Number.annotateKey({ description: "The user age in years since birth" }),
});
`);
    const fields = extractFieldAnnotations(node);
    expect(fields).not.toBe(null);
    expect(A.length(fields as ReadonlyArray<unknown>)).toBe(2);

    const nameField = A.findFirst(
      fields as ReadonlyArray<{ name: string; description: string }>,
      (f) => f.name === "name"
    );
    expect(O.isSome(nameField)).toBe(true);
    if (O.isSome(nameField)) {
      expect(nameField.value.description).toBe("The user name field for identification");
    }

    const ageField = A.findFirst(
      fields as ReadonlyArray<{ name: string; description: string }>,
      (f) => f.name === "age"
    );

    expect(O.isSome(ageField)).toBe(true);
    if (O.isSome(ageField)) {
      expect(ageField.value.description).toBe("The user age in years since birth");
    }
  });

  it("returns null when no annotateKey calls exist", () => {
    const node = firstStatement(`
export const MyStruct = S.Struct({
  name: S.String,
  age: S.Number,
});
`);
    const fields = extractFieldAnnotations(node);
    expect(fields).toBe(null);
  });

  it("handles Schema prefix in annotateKey calls", () => {
    const node = firstStatement(`
export const MyStruct = Schema.Struct({
  email: Schema.String.annotateKey({ description: "Contact email address for the user" }),
});
`);
    const fields = extractFieldAnnotations(node);
    expect(fields).not.toBe(null);
    expect(A.length(fields as ReadonlyArray<unknown>)).toBe(1);
  });

  it("handles mixed annotated and non-annotated fields", () => {
    const node = firstStatement(`
export const MyStruct = S.Struct({
  name: S.String,
  email: S.String.annotateKey({ description: "The primary email for notifications" }),
  age: S.Number,
});
`);
    const fields = extractFieldAnnotations(node);
    expect(fields).not.toBe(null);
    expect(A.length(fields as ReadonlyArray<unknown>)).toBe(1);
  });
});
