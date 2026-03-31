import { schemaToZod } from "@beep/ai-sdk/internal/schemaToZod";
import * as Mcp from "@beep/ai-sdk/Mcp";
import * as Tool from "@beep/ai-sdk/Tools/Tool";
import { expect, test } from "@effect/vitest";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import { runEffect } from "./effect-test.js";

test("getJsonSchemaFromSchemaAst preserves record additionalProperties", () => {
  const schema = Schema.Record(Schema.String, Schema.String);
  const json = Tool.getJsonSchemaFromSchemaAst(schema.ast);
  expect(json).toMatchObject({ type: "object" });
  if ("additionalProperties" in json) {
    expect(Predicate.isObject(json.additionalProperties)).toBe(true);
    if (Predicate.isObject(json.additionalProperties)) {
      const maybeType = Reflect.get(json.additionalProperties, "type");
      const maybeRef = Reflect.get(json.additionalProperties, "$ref");
      expect(Predicate.isString(maybeType) || Predicate.isString(maybeRef)).toBe(true);
    }
  } else {
    throw new Error("Expected additionalProperties in record JSON schema");
  }
});

test("getJsonSchemaFromSchemaAst renders empty struct as strict object", () => {
  const schema = Schema.Struct({});
  const json = Tool.getJsonSchemaFromSchemaAst(schema.ast);
  if ("type" in json && json.type === "object") {
    expect(json.type).toBe("object");
    return;
  }
  if ("anyOf" in json && Array.isArray(json.anyOf)) {
    const hasObject = json.anyOf.some((entry) => Predicate.isObject(entry) && Reflect.get(entry, "type") === "object");
    expect(hasObject).toBe(true);
    return;
  }
  throw new Error("Expected object-compatible schema shape");
});

test("schemaToZod compiles template literals to regex", async () => {
  const schema = Schema.TemplateLiteral(["user-", Schema.Number]);
  const zod = await runEffect(schemaToZod(schema));
  expect(zod.safeParse("user-42").success).toBe(true);
  expect(zod.safeParse("user-abc").success).toBe(false);
});

test("schemaToZod compiles records to catchall objects", async () => {
  const schema = Schema.Record(Schema.String, Schema.Number);
  const zod = await runEffect(schemaToZod(schema));
  expect(zod.safeParse({ a: 1 }).success).toBe(true);
  expect(zod.safeParse({ a: "nope" }).success).toBe(false);
});

test("schemaToZod treats union with undefined as optional", async () => {
  const schema = Schema.Union([Schema.String, Schema.Undefined]);
  const zod = await runEffect(schemaToZod(schema));
  expect(zod.safeParse("ok").success).toBe(true);
  expect(zod.safeParse(undefined).success).toBe(true);
  expect(zod.safeParse(123).success).toBe(false);
});

test("schemaToZod handles discriminated unions", async () => {
  const schema = Schema.Union([
    Schema.Struct({
      kind: Schema.Literal("alpha"),
      value: Schema.String,
    }),
    Schema.Struct({
      kind: Schema.Literal("beta"),
      value: Schema.Number,
    }),
  ]);
  const zod = await runEffect(schemaToZod(schema));
  expect(zod.safeParse({ kind: "alpha", value: "ok" }).success).toBe(true);
  expect(zod.safeParse({ kind: "beta", value: 2 }).success).toBe(true);
  expect(zod.safeParse({ kind: "beta", value: "nope" }).success).toBe(false);
});

test("schemaToZod accepts MCP method-tagged union members", async () => {
  const zod = await runEffect(schemaToZod(Mcp.ClientRequest));

  expect(
    zod.safeParse({
      method: "tasks/get",
      params: {
        taskId: "task-1",
      },
    }).success
  ).toBe(true);
});

test("schemaToZod handles tuples and non-empty arrays", async () => {
  const tupleSchema = Schema.Tuple([Schema.String, Schema.Number]);
  const tupleZod = await runEffect(schemaToZod(tupleSchema));
  expect(tupleZod.safeParse(["ok", 1]).success).toBe(true);
  expect(tupleZod.safeParse(["ok"]).success).toBe(false);

  const nonEmptySchema = Schema.NonEmptyArray(Schema.Boolean);
  const nonEmptyZod = await runEffect(schemaToZod(nonEmptySchema));
  expect(nonEmptyZod.safeParse([true, false]).success).toBe(true);
  expect(nonEmptyZod.safeParse([]).success).toBe(false);
});

test("schemaToZod handles enums", async () => {
  enum Color {
    Red = "red",
    Blue = "blue",
  }
  const schema = Schema.Enum(Color);
  const zod = await runEffect(schemaToZod(schema));
  expect(zod.safeParse("red").success).toBe(true);
  expect(zod.safeParse("green").success).toBe(false);
});

test("schemaToZod handles recursive suspend schemas", async () => {
  type Tree = {
    readonly value: string;
    readonly children: ReadonlyArray<Tree>;
  };
  const TreeSchema: Schema.Schema<Tree> = Schema.suspend(() =>
    Schema.Struct({
      value: Schema.String,
      children: Schema.Array(TreeSchema),
    })
  );

  const zod = await runEffect(schemaToZod(TreeSchema));
  expect(zod.safeParse({ value: "root", children: [{ value: "leaf", children: [] }] }).success).toBe(true);
  expect(zod.safeParse({ value: "root", children: [{ value: 123, children: [] }] }).success).toBe(false);
});
