import { BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import * as AST from "effect/SchemaAST";
import * as S from "effect/Schema";

/**
 * Scratchpad for understanding `Schema.Class.rebuild`.
 *
 * Run with:
 * `bun scratchpad/SchemaClassRebuild.ts`
 *
 * Useful hover targets:
 * - `PersonRebuildInput`
 * - `PersonRebuildOutput`
 * - `PersonClassMakeInput`
 * - `PersonRebuiltMakeInput`
 */
class Person extends S.Class<Person>("Scratchpad/SchemaClassRebuild/Person")({
  name: S.String,
  age: S.Number
}) {}

export type PersonRebuildInput = Parameters<typeof Person.rebuild>[0];
export type PersonRebuildOutput = ReturnType<typeof Person.rebuild>;
export type PersonClassMakeInput = Parameters<typeof Person.make>[0];
export type PersonRebuiltMakeInput = Parameters<PersonRebuildOutput["make"]>[0];

// In this checkout the installed runtime exports these helpers, but the public
// `effect/SchemaAST` type declarations do not currently list them.
const SchemaAstRuntime = AST as unknown as {
  annotate: (ast: PersonRebuildInput, annotations: Record<string, unknown>) => PersonRebuildInput;
  appendChecks: (ast: PersonRebuildInput, checks: ReadonlyArray<unknown>) => PersonRebuildInput;
};

const adultCheck = S.makeFilter<Person>(
  (person) => person.age >= 18,
  { expected: "a Person with age >= 18" }
);

const IdentityRebuild = Person.rebuild(Person.ast);
const AnnotatedViaHelper = Person.annotate({ title: "Annotated Person Schema" });
const AnnotatedViaRebuild = Person.rebuild(
  SchemaAstRuntime.annotate(Person.ast, { title: "Annotated Person Schema" })
);
const AdultPersonViaHelper = Person.check(adultCheck);
const AdultPersonViaRebuild = Person.rebuild(
  SchemaAstRuntime.appendChecks(Person.ast, [adultCheck])
);

const printSection = (title: string, value: unknown) =>
  Effect.sync(() => {
    console.log(`\n=== ${title} ===`);
    console.dir(value, { depth: 8 });
  });

const attempt = <A>(label: string, thunk: () => A) =>
  Effect.sync(() => {
    console.log(`\n--- ${label} ---`);
    try {
      console.dir(thunk(), { depth: 8 });
    } catch (error) {
      console.log(error instanceof Error ? error.message : String(error));
    }
  });

const main = Effect.gen(function*() {
  yield* printSection("Hover These Type Aliases In Your Editor", {
    PersonRebuildInput: "Parameters<typeof Person.rebuild>[0] -> AST.Declaration",
    PersonRebuildOutput: "ReturnType<typeof Person.rebuild> -> schema object for Person, not a class constructor",
    PersonClassMakeInput: "Parameters<typeof Person.make>[0] -> raw constructor input",
    PersonRebuiltMakeInput: "Parameters<PersonRebuildOutput['make']>[0] -> Person instance"
  });

  yield* printSection("Class Vs Rebuilt Schema Surface", {
    typeofPerson: typeof Person,
    typeofIdentityRebuild: typeof IdentityRebuild,
    rebuildIsSchema: S.isSchema(IdentityRebuild),
    rebuildIsFunction: typeof IdentityRebuild === "function",
    classHasExtend: typeof Person.extend === "function",
    rebuildHasExtend: typeof (IdentityRebuild as { readonly extend?: unknown }).extend,
    classFieldKeys: Object.keys(Person.fields),
    rebuildHasFieldsDirectly: Object.hasOwn(IdentityRebuild, "fields"),
    rebuildFromFieldKeys: Object.keys(IdentityRebuild.from.fields),
    sameAstReference: IdentityRebuild.ast === Person.ast
  });

  const decodedFromIdentity = S.decodeUnknownSync(IdentityRebuild)({ name: "Ada", age: 36 });

  yield* printSection("What Comes Out Of A Rebuild", {
    decodedValue: decodedFromIdentity,
    decodedIsPerson: decodedFromIdentity instanceof Person,
    encodedValue: S.encodeSync(IdentityRebuild)(decodedFromIdentity),
    rebuiltMakeFromInstanceIsPerson: IdentityRebuild.make(new Person({ name: "Grace", age: 40 })) instanceof Person
  });

  yield* printSection("Helper Methods Are Rebuild Sugar", {
    originalTitleAnnotation: Person.ast.annotations?.title ?? null,
    helperTitleAnnotation: AnnotatedViaHelper.ast.annotations?.title ?? null,
    manualTitleAnnotation: AnnotatedViaRebuild.ast.annotations?.title ?? null,
    helperKeepsFromFields: Object.keys(AnnotatedViaHelper.from.fields),
    manualKeepsFromFields: Object.keys(AnnotatedViaRebuild.from.fields)
  });

  yield* attempt(
    "Original class constructor still accepts a child value because rebuild does not mutate Person",
    () => new Person({ name: "Kid", age: 8 })
  );

  yield* attempt(
    "Derived adult schema rejects the same raw value via Person.check(...)",
    () => S.decodeUnknownSync(AdultPersonViaHelper)({ name: "Kid", age: 8 })
  );

  yield* attempt(
    "Derived adult schema rejects the same raw value via manual Person.rebuild(AST.appendChecks(...))",
    () => S.decodeUnknownSync(AdultPersonViaRebuild)({ name: "Kid", age: 8 })
  );

  yield* attempt(
    "Derived adult schema accepts an adult raw value",
    () => S.decodeUnknownSync(AdultPersonViaRebuild)({ name: "Ada", age: 36 })
  );

  yield* attempt(
    "Rebuilt schema make(...) works with a Person instance",
    () => IdentityRebuild.make(new Person({ name: "Lin", age: 33 }))
  );

  yield* printSection("Key Takeaway", {
    inputToRebuild: "AST.Declaration",
    outputFromRebuild: "a schema object that decodes to Person instances",
    notReturned: "a new class constructor with Person's static helper surface",
    directEquivalentOfAnnotate: "Person.rebuild(AST.annotate(Person.ast, annotations))",
    directEquivalentOfCheck: "Person.rebuild(AST.appendChecks(Person.ast, checks))"
  });
});

BunRuntime.runMain(main);
