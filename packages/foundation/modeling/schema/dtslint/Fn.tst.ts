import {
  type AnyFn,
  type AnyFn as AnyFnType,
  Fn,
  type FnSchema,
  type FnSchemaStatics,
  type FnType,
  ThunkOf,
} from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";
import type * as SchemaIssue from "effect/SchemaIssue";
import { describe, expect, it } from "tstyche";

interface InputWithService extends S.Codec<number, string, "InputService"> {
  readonly "~rebuild.out": this;
}

const InputWithService = S.make<InputWithService>(S.NumberFromString.ast);

describe("Fn", () => {
  it("preserves thunk inference when input is omitted", () => {
    const schema = Fn({ output: S.String });
    const impl = schema.implement(() => "hello");
    const effectImpl = schema.implementEffect(() => Effect.succeed("hello"));
    const syncImpl = schema.implementSync(() => "hello");

    expect<typeof schema.inputSchema>().type.toBe<typeof S.Never>();
    expect<typeof schema.outputSchema>().type.toBe<typeof S.String>();
    expect<typeof schema.errorSchema>().type.toBe<typeof S.Never>();
    expect<typeof schema.Type>().type.toBe<() => string>();
    expect<FnType<never, string>>().type.toBe<() => string>();
    expect(impl).type.toBe<() => Effect.Effect<string, SchemaIssue.Issue>>();
    expect(effectImpl).type.toBe<() => Effect.Effect<string, SchemaIssue.Issue>>();
    expect(syncImpl).type.toBe<() => string>();
  });

  it("preserves thunk inference for explicit undefined input", () => {
    const schema = Fn({
      input: S.Undefined,
      output: S.String,
      error: S.Number,
    });
    const impl = schema.implementEffect(() => Effect.fail(1));

    expect<typeof schema.inputSchema>().type.toBe<typeof S.Undefined>();
    expect<typeof schema.errorSchema>().type.toBe<typeof S.Number>();
    expect<typeof schema.Type>().type.toBe<() => string>();
    expect<FnType<undefined, string>>().type.toBe<() => string>();
    expect(impl).type.toBe<() => Effect.Effect<string, SchemaIssue.Issue | number>>();
  });

  it("preserves unary inference and validated wrapper signatures", () => {
    const schema = Fn({
      input: S.NumberFromString,
      output: S.String,
      error: S.NonEmptyString,
    });
    const impl = schema.implement((count) => `${count}`);
    const effectImpl = schema.implementEffect((count) => Effect.fail(`${count}`));
    const syncImpl = schema.implementSync((count) => `${count}`);

    expect<typeof schema.inputSchema>().type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.outputSchema>().type.toBe<typeof S.String>();
    expect<typeof schema.errorSchema>().type.toBe<typeof S.NonEmptyString>();
    expect<typeof schema.Type>().type.toBe<(input: number) => string>();
    expect<FnType<number, string>>().type.toBe<(input: number) => string>();
    expect(impl).type.toBe<(input: unknown) => Effect.Effect<string, SchemaIssue.Issue>>();
    expect(effectImpl).type.toBe<(input: unknown) => Effect.Effect<string, SchemaIssue.Issue | string>>();
    expect(syncImpl).type.toBe<(input: unknown) => string>();
  });

  it("preserves implementEffect error and environment composition", () => {
    const schema = Fn({
      input: InputWithService,
      output: S.String,
      error: S.Number,
    });
    const impl = schema.implementEffect((_count): Effect.Effect<string, number, "HandlerEnv"> => Effect.fail(1));

    expect(impl).type.toBe<
      (input: unknown) => Effect.Effect<string, SchemaIssue.Issue | number, "HandlerEnv" | "InputService">
    >();
  });

  it("preserves implementEffect failures when no error schema is declared", () => {
    const schema = Fn({
      input: S.Number,
      output: S.String,
    });
    const impl = schema.implementEffect((_count): Effect.Effect<string, "boom"> => Effect.fail("boom" as const));

    expect(impl).type.toBe<(input: unknown) => Effect.Effect<string, SchemaIssue.Issue | "boom">>();
  });

  it("exposes exported helper types", () => {
    expect<FnSchema<typeof S.Never, typeof S.String>["inputSchema"]>().type.toBe<typeof S.Never>();
    expect<FnSchema<typeof S.Never, typeof S.String, typeof S.Number>["errorSchema"]>().type.toBe<typeof S.Number>();
    expect<FnSchemaStatics<typeof S.NumberFromString, typeof S.String, typeof S.Number>["outputSchema"]>().type.toBe<
      typeof S.String
    >();
    expect<FnSchemaStatics<typeof S.NumberFromString, typeof S.String, typeof S.Number>["errorSchema"]>().type.toBe<
      typeof S.Number
    >();
    expect<AnyFnType>().type.toBe<Function>();
  });

  it("supports AnyFn and ThunkOf", () => {
    const schema = ThunkOf(S.NumberFromString, S.String);
    const impl = schema.implementSync(() => 1);

    expect<AnyFn>().type.toBe<Function>();
    expect<typeof schema.Type>().type.toBe<() => number>();
    expect<typeof schema.errorSchema>().type.toBe<typeof S.String>();
    expect(impl).type.toBe<() => number>();
  });
});
