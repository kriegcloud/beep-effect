import { AnyFn, Fn, ThunkOf } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as Cause from "effect/Cause";
import * as S from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";

const runResult = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runPromise(
    Effect.match(effect, {
      onFailure: (error) => ({
        _tag: "Failure" as const,
        error,
      }),
      onSuccess: (value) => ({
        _tag: "Success" as const,
        value,
      }),
    })
  );

const runCause = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(Effect.flip(Effect.sandbox(effect)));

describe("Fn schema", () => {
  it("decodes and encodes runtime functions without wrapping them", () => {
    const schema = Fn({
      input: S.NumberFromString,
      output: S.NumberFromString,
    });
    const handler = (count: number) => count + 1;

    expect(S.decodeUnknownSync(schema)(handler)).toBe(handler);
    expect(S.encodeSync(schema)(handler)).toBe(handler);
  });

  it("rejects non-function inputs", () => {
    const schema = Fn({ output: S.String });

    expect(() => S.decodeUnknownSync(schema)(null)).toThrow("Expected Fn, got null");
  });

  it("defaults errorSchema to Schema.Never", () => {
    const schema = Fn({ output: S.String });

    expect(schema.errorSchema).toBe(S.Never);
  });
});

describe("Fn thunks", () => {
  it("validates transformed failures against the schema type side", async () => {
    const schema = Fn({
      output: S.String,
      error: S.NumberFromString,
    });
    const impl = schema.implementEffect(() => Effect.fail(2));
    const result = await runResult(impl());

    expect(result).toEqual({
      _tag: "Failure",
      error: 2,
    });
    expect(schema.errorSchema).toBe(S.NumberFromString);
  });

  it("validates transformed outputs against the schema type side", async () => {
    const schema = Fn({ output: S.NumberFromString });
    const impl = schema.implement(() => 2);

    await expect(Effect.runPromise(impl())).resolves.toBe(2);
    expect(schema.inputSchema).toBe(S.Never);
    expect(schema.outputSchema).toBe(S.NumberFromString);
  });

  it("preserves handler failures for implementEffect", async () => {
    const schema = Fn({
      output: S.String,
      error: S.String,
    });
    const impl = schema.implementEffect(() => Effect.fail("boom" as const));
    const result = await runResult(impl());

    expect(result).toEqual({
      _tag: "Failure",
      error: "boom",
    });
  });

  it("provides a synchronous helper for service-free schemas", () => {
    const schema = Fn({ output: S.String });
    const impl = schema.implementSync(() => "hello");

    expect(impl()).toBe("hello");
  });

  it("preserves defects without validating them against errorSchema", async () => {
    const schema = Fn({
      output: S.String,
      error: S.String,
    });
    const impl = schema.implementEffect(() => Effect.die("boom"));
    const cause = await runCause(impl());

    expect(Cause.hasDies(cause)).toBe(true);
    expect(Cause.hasFails(cause)).toBe(false);
  });
});

describe("Fn unary functions", () => {
  it("decodes transformed inputs before running the handler", async () => {
    const schema = Fn({
      input: S.NumberFromString,
      output: S.String,
    });
    const impl = schema.implement((count) => `${count + 1}`);

    await expect(Effect.runPromise(impl("1"))).resolves.toBe("2");
  });

  it("validates input before calling the handler", async () => {
    const schema = Fn({
      input: S.Number,
      output: S.String,
    });

    let called = false;
    const impl = schema.implementEffect((count) => {
      called = true;
      return Effect.succeed(`${count}`);
    });
    const result = await runResult(impl("nope"));

    expect(called).toBe(false);
    expect(result._tag).toBe("Failure");
  });

  it("validates output values from implement", async () => {
    const schema = Fn({
      input: S.Number,
      output: S.NonEmptyString,
    });
    const impl = schema.implement(() => "");
    const result = await runResult(impl(1));

    expect(result._tag).toBe("Failure");
  });

  it("validates failure values from implementEffect", async () => {
    const schema = Fn({
      input: S.Number,
      output: S.String,
      error: S.NonEmptyString,
    });
    const impl = schema.implementEffect(() => Effect.fail(""));
    const result = await runResult(impl(1));

    expect(result._tag).toBe("Failure");
    if (result._tag === "Failure") {
      expect(SchemaIssue.isIssue(result.error)).toBe(true);
    }
  });

  it("supports implementSync for transformed input schemas", () => {
    const schema = Fn({
      input: S.NumberFromString,
      output: S.NumberFromString,
    });
    const impl = schema.implementSync((count) => count + 1);

    expect(impl("1")).toBe(2);
  });

  it("supports void outputs", () => {
    const schema = Fn({
      input: S.String,
      output: S.Void,
    });
    const impl = schema.implementSync(() => undefined);

    expect(impl("beep")).toBeUndefined();
  });

  it("handles structured payloads", async () => {
    const schema = Fn({
      input: S.Struct({
        name: S.String,
        age: S.NumberFromString,
      }),
      output: S.Struct({
        id: S.String,
        label: S.NonEmptyString,
      }),
    });
    const impl = schema.implement(({ name, age }) => ({
      id: `${name.toLowerCase()}-${age}`,
      label: `${name} (${age})`,
    }));

    await expect(Effect.runPromise(impl({ name: "Ada", age: "10" }))).resolves.toEqual({
      id: "ada-10",
      label: "Ada (10)",
    });
  });
});

describe("Fn convenience exports", () => {
  it("preserves explicit undefined thunk semantics and statics across annotate", () => {
    const schema = Fn({
      input: S.Undefined,
      output: S.String,
      error: S.Number,
    });
    const annotated = schema.annotate({
      description: "Annotated thunk",
    });

    expect(schema.inputSchema).toBe(S.Undefined);
    expect(annotated.inputSchema).toBe(S.Undefined);
    expect(schema.errorSchema).toBe(S.Number);
    expect(annotated.errorSchema).toBe(S.Number);
    expect(annotated.implementSync(() => "hello")()).toBe("hello");
  });

  it("accepts any runtime function via AnyFn", () => {
    const handler = () => "ok";

    expect(S.decodeUnknownSync(AnyFn)(handler)).toBe(handler);
  });

  it("creates thunk schemas with ThunkOf", () => {
    const schema = ThunkOf(S.NumberFromString, S.String);
    const impl = schema.implementSync(() => 1);

    expect(impl()).toBe(1);
    expect(schema.errorSchema).toBe(S.String);
  });

  it("derives formatter and equivalence instances", () => {
    const schema = Fn({
      input: S.String,
      output: S.String,
    });
    const formatter = S.toFormatter(schema);
    const equivalence = S.toEquivalence(schema);
    const handler = () => "hello";

    expect(formatter(handler)).toBe("[Function]");
    expect(equivalence(handler, handler)).toBe(true);
    expect(equivalence(handler, () => "hello")).toBe(false);
  });
});
