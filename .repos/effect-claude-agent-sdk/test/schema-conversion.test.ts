import { test, expect } from "bun:test"
import * as Schema from "effect/Schema"
import * as Tool from "../src/Tools/Tool.js"
import { schemaToZod } from "../src/internal/schemaToZod.js"

test("getJsonSchemaFromSchemaAst preserves record additionalProperties", () => {
  const schema = Schema.Record({ key: Schema.String, value: Schema.String })
  const json = Tool.getJsonSchemaFromSchemaAst(schema.ast) as {
    readonly additionalProperties?: unknown
  }
  expect((json as { type?: string }).type).toBe("object")
  expect(typeof json.additionalProperties).toBe("object")
  expect((json.additionalProperties as { type?: string }).type).toBe("string")
})

test("getJsonSchemaFromSchemaAst renders empty struct as strict object", () => {
  const schema = Schema.Struct({})
  const json = Tool.getJsonSchemaFromSchemaAst(schema.ast) as {
    readonly type?: string
    readonly properties?: unknown
    readonly required?: unknown
    readonly additionalProperties?: unknown
  }
  expect(json.type).toBe("object")
  expect(json.properties).toEqual({})
  expect(json.required).toEqual([])
  expect(json.additionalProperties).toBe(false)
})

test("schemaToZod compiles template literals to regex", () => {
  const schema = Schema.TemplateLiteral("user-", Schema.Number)
  const zod = schemaToZod(schema)
  expect(zod.safeParse("user-42").success).toBe(true)
  expect(zod.safeParse("user-abc").success).toBe(false)
})

test("schemaToZod compiles records to catchall objects", () => {
  const schema = Schema.Record({ key: Schema.String, value: Schema.Number })
  const zod = schemaToZod(schema)
  expect(zod.safeParse({ a: 1 }).success).toBe(true)
  expect(zod.safeParse({ a: "nope" }).success).toBe(false)
})

test("schemaToZod treats union with undefined as optional", () => {
  const schema = Schema.Union(Schema.String, Schema.Undefined)
  const zod = schemaToZod(schema)
  expect(zod.safeParse("ok").success).toBe(true)
  expect(zod.safeParse(undefined).success).toBe(true)
  expect(zod.safeParse(123).success).toBe(false)
})

test("schemaToZod handles discriminated unions", () => {
  const schema = Schema.Union(
    Schema.Struct({
      kind: Schema.Literal("alpha"),
      value: Schema.String
    }),
    Schema.Struct({
      kind: Schema.Literal("beta"),
      value: Schema.Number
    })
  )
  const zod = schemaToZod(schema)
  expect(zod.safeParse({ kind: "alpha", value: "ok" }).success).toBe(true)
  expect(zod.safeParse({ kind: "beta", value: 2 }).success).toBe(true)
  expect(zod.safeParse({ kind: "beta", value: "nope" }).success).toBe(false)
})

test("schemaToZod handles tuples and non-empty arrays", () => {
  const tupleSchema = Schema.Tuple(Schema.String, Schema.Number)
  const tupleZod = schemaToZod(tupleSchema)
  expect(tupleZod.safeParse(["ok", 1]).success).toBe(true)
  expect(tupleZod.safeParse(["ok"]).success).toBe(false)

  const nonEmptySchema = Schema.NonEmptyArray(Schema.Boolean)
  const nonEmptyZod = schemaToZod(nonEmptySchema)
  expect(nonEmptyZod.safeParse([true, false]).success).toBe(true)
  expect(nonEmptyZod.safeParse([]).success).toBe(false)
})

test("schemaToZod handles enums", () => {
  enum Color {
    Red = "red",
    Blue = "blue"
  }
  const schema = Schema.Enums(Color)
  const zod = schemaToZod(schema)
  expect(zod.safeParse("red").success).toBe(true)
  expect(zod.safeParse("green").success).toBe(false)
})

test("schemaToZod handles recursive suspend schemas", () => {
  type Tree = {
    readonly value: string
    readonly children: ReadonlyArray<Tree>
  }
  const TreeSchema: Schema.Schema<Tree> = Schema.suspend(() =>
    Schema.Struct({
      value: Schema.String,
      children: Schema.Array(TreeSchema)
    })
  )

  const zod = schemaToZod(TreeSchema)
  expect(
    zod.safeParse({ value: "root", children: [{ value: "leaf", children: [] }] })
      .success
  ).toBe(true)
  expect(
    zod.safeParse({ value: "root", children: [{ value: 123, children: [] }] })
      .success
  ).toBe(false)
})
