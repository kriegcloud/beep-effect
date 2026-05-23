import { Field, FormBuilder } from "@beep/form/core";
import type { TUnsafe } from "@beep/types";
import { Effect, SchemaIssue } from "effect";
import { describe, expect, it } from "vitest";
import * as S from "../helpers/SchemaCompat.ts";

const effectTest = (name: string, body: () => Generator<TUnsafe.Any, void, TUnsafe.Any>) =>
  it(name, () => Effect.runPromise(Effect.gen(body) as TUnsafe.Any));

describe("Form", () => {
  describe("FormBuilder", () => {
    it("empty creates an empty FormBuilder", () => {
      expect(FormBuilder.isFormBuilder(FormBuilder.empty)).toBe(true);
      expect(FormBuilder.empty.fields).toEqual({});
    });

    it("addField adds a field to the builder", () => {
      const EmailField = Field.makeField("email", S.String);
      const builder = FormBuilder.empty.addField(EmailField);

      expect(FormBuilder.isFormBuilder(builder)).toBe(true);
      expect(builder.fields).toHaveProperty("email");
      expect(builder.fields.email._tag).toBe("field");
    });

    it("addField accepts inline key and schema", () => {
      const builder = FormBuilder.empty.addField("email", S.String).addField("age", S.Number);

      expect(FormBuilder.isFormBuilder(builder)).toBe(true);
      expect(builder.fields).toHaveProperty("email");
      expect(builder.fields).toHaveProperty("age");
      expect(builder.fields.email._tag).toBe("field");
      expect(builder.fields.age._tag).toBe("field");
    });

    it("addField inline syntax builds correct schema", () => {
      const builder = FormBuilder.empty.addField("name", S.String).addField("age", S.Number);

      const schema = FormBuilder.buildSchema(builder);
      const result = S.decodeUnknownSync(schema)({ name: "John", age: 30 });

      expect(result).toEqual({ name: "John", age: 30 });
    });

    it("addArray adds an array field", () => {
      const NameField = Field.makeField("name", S.String);
      const AddressesField = Field.makeArrayField(
        "addresses",
        S.Struct({
          street: S.String,
          city: S.String,
        })
      );
      const builder = FormBuilder.empty.addField(NameField).addField(AddressesField);

      expect(builder.fields.addresses._tag).toBe("array");
      expect(Field.isArrayFieldDef(builder.fields.addresses)).toBe(true);
    });

    it("merge combines two form builders", () => {
      const StreetField = Field.makeField("street", S.String);
      const CityField = Field.makeField("city", S.String);
      const addressFields = FormBuilder.empty.addField(StreetField).addField(CityField);

      const NameField = Field.makeField("name", S.String);
      const builder = FormBuilder.empty.addField(NameField).merge(addressFields);

      expect(Object.keys(builder.fields)).toEqual(["name", "street", "city"]);
    });

    it("merge preserves refinements from both builders", () => {
      const builderA = FormBuilder.empty.addField("a", S.String).refine((values) => {
        if (values.a !== "a") {
          return { path: ["a"], message: "A invalid" };
        }
      });

      const builderB = FormBuilder.empty.addField("b", S.String).refine((values) => {
        if (values.b !== "b") {
          return { path: ["b"], message: "B invalid" };
        }
      });

      const schema = FormBuilder.buildSchema(builderA.merge(builderB));

      const resultA = S.decodeUnknownResult(schema)({ a: "x", b: "b" });
      if (resultA._tag === "Success") throw new Error("Expected Left");
      const messagesA = SchemaIssue.makeFormatterStandardSchemaV1()(resultA.failure.issue).issues.map(
        (issue) => issue.message
      );
      expect(messagesA).toContain("A invalid");

      const resultB = S.decodeUnknownResult(schema)({ a: "a", b: "x" });
      if (resultB._tag === "Success") throw new Error("Expected Left");
      const messagesB = SchemaIssue.makeFormatterStandardSchemaV1()(resultB.failure.issue).issues.map(
        (issue) => issue.message
      );
      expect(messagesB).toContain("B invalid");
    });

    it("merge prefers fields from the second builder on key collision", () => {
      const first = FormBuilder.empty.addField("value", S.String);
      const second = FormBuilder.empty.addField("value", S.Number);

      const schema = FormBuilder.buildSchema(first.merge(second));

      expect(S.decodeUnknownSync(schema)({ value: 123 })).toEqual({ value: 123 });
      expect(() => S.decodeUnknownSync(schema)({ value: "text" })).toThrow();
    });
  });

  describe("buildSchema", () => {
    it("builds a Schema from simple fields", () => {
      const EmailField = Field.makeField("email", S.String);
      const AgeField = Field.makeField("age", S.Number);

      const builder = FormBuilder.empty.addField(EmailField).addField(AgeField);

      const schema = FormBuilder.buildSchema(builder);
      const result = S.decodeUnknownSync(schema)({ email: "test@example.com", age: 25 });

      expect(result).toEqual({ email: "test@example.com", age: 25 });
    });

    it("builds a Schema with array fields", () => {
      const TitleField = Field.makeField("title", S.String);
      const ItemsField = Field.makeArrayField("items", S.Struct({ name: S.String }));

      const builder = FormBuilder.empty.addField(TitleField).addField(ItemsField);

      const schema = FormBuilder.buildSchema(builder);
      const result = S.decodeUnknownSync(schema)({
        title: "My List",
        items: [{ name: "Item 1" }, { name: "Item 2" }],
      });

      expect(result).toEqual({
        title: "My List",
        items: [{ name: "Item 1" }, { name: "Item 2" }],
      });
    });

    it("validates with schema constraints", () => {
      const Email = S.String.check(S.isPattern(/@/));
      const EmailField = Field.makeField("email", Email);

      const builder = FormBuilder.empty.addField(EmailField);

      const schema = FormBuilder.buildSchema(builder);

      expect(() => S.decodeUnknownSync(schema)({ email: "invalid" })).toThrow();
      expect(S.decodeUnknownSync(schema)({ email: "valid@example.com" })).toEqual({
        email: "valid@example.com",
      });
    });

    it("applies refinements in buildSchema", () => {
      const PasswordField = Field.makeField("password", S.String);
      const ConfirmPasswordField = Field.makeField("confirmPassword", S.String);

      const builder = FormBuilder.empty
        .addField(PasswordField)
        .addField(ConfirmPasswordField)
        .refine((values) => {
          if (values.password !== values.confirmPassword) {
            return { path: ["confirmPassword"], message: "Passwords must match" };
          }
        });

      const schema = FormBuilder.buildSchema(builder);

      expect(() => S.decodeUnknownSync(schema)({ password: "secret", confirmPassword: "different" })).toThrow();

      expect(S.decodeUnknownSync(schema)({ password: "secret", confirmPassword: "secret" })).toEqual({
        password: "secret",
        confirmPassword: "secret",
      });
    });

    effectTest("applies async refinements with refineEffect", function* () {
      const UsernameField = Field.makeField("username", S.String);

      const builder = FormBuilder.empty.addField(UsernameField).refineEffect((values) =>
        Effect.gen(function* () {
          yield* Effect.sleep("1 millis");
          if (values.username === "taken") {
            return { path: ["username"], message: "Username is already taken" };
          }
        })
      );

      const schema = FormBuilder.buildSchema(builder);

      yield* Effect.promise(() =>
        expect(Effect.runPromise(S.decodeUnknownEffect(schema)({ username: "taken" }))).rejects.toThrow()
      );

      const result = yield* Effect.promise(() =>
        Effect.runPromise(S.decodeUnknownEffect(schema)({ username: "available" }))
      );
      expect(result).toEqual({ username: "available" });
    });

    it("applies multiple chained refinements", () => {
      const AField = Field.makeField("a", S.String);
      const BField = Field.makeField("b", S.String);

      const builder = FormBuilder.empty
        .addField(AField)
        .addField(BField)
        .refine((values) => {
          if (values.a === "error") {
            return { path: ["a"], message: "First refinement failed" };
          }
        })
        .refine((values) => {
          if (values.b === "error") {
            return { path: ["b"], message: "Second refinement failed" };
          }
        });

      const schema = FormBuilder.buildSchema(builder);

      expect(() => S.decodeUnknownSync(schema)({ a: "error", b: "ok" })).toThrow(/First refinement failed/);

      expect(() => S.decodeUnknownSync(schema)({ a: "ok", b: "error" })).toThrow(/Second refinement failed/);

      expect(S.decodeUnknownSync(schema)({ a: "ok", b: "ok" })).toEqual({ a: "ok", b: "ok" });
    });
  });

  describe("type guards", () => {
    it("isFormBuilder correctly identifies FormBuilder", () => {
      expect(FormBuilder.isFormBuilder(FormBuilder.empty)).toBe(true);
      expect(FormBuilder.isFormBuilder({})).toBe(false);
    });
  });
});
