import { Chalk } from "@beep/chalk";
import { makeCreateChalk } from "@beep/chalk/internal/ChalkRuntime";
import { it } from "@beep/test-runner";
import { assert, describe, expect } from "@effect/vitest";
import { identity } from "effect/Function";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as S from "effect/Schema";

const capture = (evaluate: () => unknown): unknown =>
  Result.match(Result.try(evaluate), {
    onFailure: identity,
    onSuccess: identity,
  });

const triggerMissingBuilderMetadata = (): unknown => {
  const builder = makeCreateChalk(false)();
  const prototype = Reflect.getPrototypeOf(builder);
  const level = P.isObjectKeyword(prototype) ? Reflect.getOwnPropertyDescriptor(prototype, "level") : undefined;
  const getter = P.isObject(level) ? Reflect.get(level, "get") : undefined;
  return P.isFunction(getter) ? Reflect.apply(getter, () => "", []) : getter;
};

describe("@beep/chalk tagged-error declared equivalence", () => {
  it("rejects a foreign visible receiver without damaging the registered builder", () => {
    const builder = new Chalk({ level: 1 });
    const prototype = Reflect.getPrototypeOf(builder);
    assert(P.isObjectKeyword(prototype));
    const descriptor = Reflect.getOwnPropertyDescriptor(prototype, "visible");
    assert(P.isNotUndefined(descriptor));
    const getter = descriptor.get;
    assert(P.isFunction(getter));

    expect(() => Reflect.apply(getter, () => "foreign", [])).toThrow(
      expect.objectContaining({
        _tag: "MissingBuilderMetadataError",
        message: "Missing Chalk builder metadata.",
      })
    );
    expect(builder.visible.red("registered")).toBe("\u001B[31mregistered\u001B[39m");
    expect(builder.level).toBe(1);
  });

  it("compares the private missing-builder-metadata error by declared message", () => {
    const first = capture(triggerMissingBuilderMetadata);
    const second = capture(triggerMissingBuilderMetadata);
    const schema = P.isObject(first) ? Reflect.get(first, "constructor") : first;

    expect(S.isSchema(schema)).toBe(true);
    if (S.isSchema(schema)) {
      const make = Reflect.get(schema, "make");
      const different = P.isFunction(make)
        ? Reflect.apply(make, schema, [{ message: "Different Chalk metadata failure." }])
        : make;
      const same = S.toEquivalence(schema);

      expect(same(first, second)).toBe(true);
      expect(same(first, different)).toBe(false);
    }
  });
});
