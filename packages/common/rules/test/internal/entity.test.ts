import { entityKind, isBeep, NotBeepEntityError, UnknownException } from "@beep/rules/internal/entity";
import type { UnsafeTypes } from "@beep/types";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as E from "effect/Either";
import { vi } from "vitest";

describe("rules/internal/entity", () => {
  class FooEntity {
    static [entityKind] = "foo.kind";
  }

  class BarSameKind {
    static [entityKind] = FooEntity[entityKind];
  }

  class BazDifferentKind {
    static [entityKind] = "baz.kind";
  }

  class NoTag {}

  it("isBeep returns true for exact instance of the given type", () =>
    Effect.gen(function* () {
      const ok = yield* isBeep(new FooEntity(), FooEntity);
      deepStrictEqual(ok, true);
    }));

  it("isBeep returns true for a different class that shares the same entityKind", () =>
    Effect.gen(function* () {
      const ok = yield* isBeep(new BarSameKind(), FooEntity);
      deepStrictEqual(ok, true);
    }));

  it("isBeep returns false when entityKind does not match and not an instance", () =>
    Effect.gen(function* () {
      const ok = yield* isBeep(new BazDifferentKind(), FooEntity);
      deepStrictEqual(ok, false);
    }));

  it.scoped("isBeep fails with NotBeepEntityError and prints pretty diagnostics when format=pretty", () =>
    Effect.gen(function* () {
      const prevFormat = process.env.APP_LOG_FORMAT;
      process.env.APP_LOG_FORMAT = "pretty";
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          spy.mockRestore();
          if (prevFormat == null) delete process.env.APP_LOG_FORMAT;
          else process.env.APP_LOG_FORMAT = prevFormat;
        })
      );

      const result = yield* Effect.either(isBeep({}, NoTag as unknown as any));
      deepStrictEqual(E.isLeft(result), true);
      if (E.isLeft(result)) {
        deepStrictEqual(result.left instanceof NotBeepEntityError, true);
      }

      const printed = spy.mock.calls.map((c) => String(c[0])).join("\n");
      // Printed heading should include at least the message substring and some structure
      deepStrictEqual(/Class 'NoTag'/.test(printed), true);
    })
  );

  it("isBeep fails with UnknownException for non-callable type (runtime misuse)", () =>
    Effect.gen(function* () {
      const badType: UnsafeTypes.UnsafeAny = {}; // not a constructor → instanceof throws → UnknownException path
      const res = yield* Effect.either(isBeep({}, badType));
      deepStrictEqual(E.isLeft(res), true);
      if (E.isLeft(res)) {
        deepStrictEqual(res.left instanceof UnknownException, true);
      }
    }));
});
