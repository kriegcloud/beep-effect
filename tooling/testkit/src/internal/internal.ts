/**
 * @since 0.1.0
 */

import { describe, it } from "bun:test";
import * as Arbitrary from "effect/Arbitrary";
import * as Cause from "effect/Cause";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as fc from "effect/FastCheck";
import * as Fiber from "effect/Fiber";
import { identity, pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { isObject } from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import * as Scope from "effect/Scope";
import * as TestEnvironment from "effect/TestContext";
import type * as TestServices from "effect/TestServices";
import type { UnsafeAny } from "./types";

const runPromise = <E, A>(effect: Effect.Effect<A, E>) =>
  Effect.gen(function* () {
    const exitFiber = yield* Effect.fork(Effect.exit(effect));
    const exit = yield* Fiber.join(exitFiber);
    if (Exit.isSuccess(exit)) {
      return exit.value;
    }
    const errors = Cause.prettyErrors(exit.cause);
    for (let i = 1; i < errors.length; i++) {
      yield* Effect.logError(errors[i]);
    }
    throw errors[0];
  }).pipe(Effect.runPromise);

const runTest = <E, A>(effect: Effect.Effect<A, E>) => runPromise(effect);

const TestEnv = TestEnvironment.TestContext.pipe(Layer.provide(Logger.remove(Logger.defaultLogger)));

export const addEqualityTesters = () => {
  // Bun's expect doesn't have addEqualityTesters like bun:test
};

const testOptions = (timeout?: number | { timeout?: number }) =>
  typeof timeout === "number" ? { timeout } : (timeout ?? {});

const makeTester = <R>(mapEffect: <A, E>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, never>) => {
  const run =
    <A, E>(self: (...args: Array<UnsafeAny>) => Effect.Effect<A, E, R>) =>
    (...args: Array<UnsafeAny>) =>
      pipe(
        Effect.suspend(() => self(...args)),
        mapEffect,
        runTest
      );

  const f = (
    name: string,
    self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
    timeout?: UnsafeAny
  ) => it(name, run(self), testOptions(timeout));

  const skip = (
    name: string,
    self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
    timeout?: UnsafeAny
  ) => it.skip(name, run(self), testOptions(timeout));

  const skipIf =
    (condition: unknown) =>
    (name: string, self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>, timeout?: UnsafeAny) =>
      condition ? skip(name, self, timeout) : f(name, self, timeout);

  const runIf =
    (condition: unknown) =>
    (name: string, self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>, timeout?: UnsafeAny) =>
      condition ? f(name, self, timeout) : skip(name, self, timeout);

  const only = (
    name: string,
    self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
    timeout?: UnsafeAny
  ) => it.only(name, run(self), testOptions(timeout));

  const each =
    (cases: ReadonlyArray<UnsafeAny>) =>
    (
      name: string,
      self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
      timeout?: UnsafeAny
    ) => {
      cases.forEach((testCase, index) => {
        it(`${name} [${index}]`, () => run(self)(testCase), testOptions(timeout));
      });
    };

  const fails = (
    name: string,
    self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
    timeout?: UnsafeAny
  ) =>
    it(
      name,
      async () => {
        try {
          await run(self)();
          throw new Error("Expected test to fail");
        } catch (_error) {
          // Test is expected to fail, so this is success
        }
      },
      testOptions(timeout)
    );

  const prop = (
    name: string,
    arbitraries: UnsafeAny,
    self: (...args: Array<UnsafeAny>) => Effect.Effect<UnsafeAny, UnsafeAny, R>,
    timeout?: UnsafeAny
  ) => {
    if (Array.isArray(arbitraries)) {
      const arbs = arbitraries.map((arbitrary) => (Schema.isSchema(arbitrary) ? Arbitrary.make(arbitrary) : arbitrary));
      return it(
        name,
        () =>
          fc.assert(
            // @ts-expect-error - FastCheck spread typing
            fc.asyncProperty(...arbs, (...as: Array<UnsafeAny>) => run(self)(as)),
            isObject(timeout) ? (timeout as UnsafeAny)?.fastCheck : {}
          ),
        testOptions(timeout)
      );
    }

    const arbs = fc.record(
      Object.keys(arbitraries).reduce(
        (result, key) => {
          result[key] = Schema.isSchema(arbitraries[key]) ? Arbitrary.make(arbitraries[key]) : arbitraries[key];
          return result;
        },
        {} as Record<string, fc.Arbitrary<UnsafeAny>>
      )
    );

    return it(
      name,
      () =>
        fc.assert(
          fc.asyncProperty(arbs, (as) => run(self)(as)),
          isObject(timeout) ? (timeout as UnsafeAny)?.fastCheck : {}
        ),
      testOptions(timeout)
    );
  };

  return Object.assign(f, { each, fails, only, prop, runIf, skip, skipIf });
};

export const prop = (
  name: string,
  arbitraries: UnsafeAny,
  self: (properties: UnsafeAny, ctx: UnsafeAny) => void,
  timeout?: UnsafeAny
) => {
  if (Array.isArray(arbitraries)) {
    const arbs = arbitraries.map((arbitrary) => (Schema.isSchema(arbitrary) ? Arbitrary.make(arbitrary) : arbitrary));
    return it(
      name,
      () =>
        fc.assert(
          // @ts-expect-error - FastCheck spread typing
          fc.property(...arbs, (...as: Array<UnsafeAny>) => self(as, {})),
          isObject(timeout) ? (timeout as UnsafeAny)?.fastCheck : {}
        ),
      testOptions(timeout)
    );
  }

  const arbs = fc.record(
    Object.keys(arbitraries).reduce(
      (result, key) => {
        result[key] = Schema.isSchema(arbitraries[key]) ? Arbitrary.make(arbitraries[key]) : arbitraries[key];
        return result;
      },
      {} as Record<string, fc.Arbitrary<UnsafeAny>>
    )
  );

  return it(
    name,
    () =>
      fc.assert(
        fc.property(arbs, (as) => self(as, {})),
        isObject(timeout) ? (timeout as UnsafeAny)?.fastCheck : {}
      ),
    testOptions(timeout)
  );
};

export const layer = <R, E>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap;
    readonly timeout?: Duration.DurationInput;
    readonly excludeTestServices?: boolean;
  }
) => {
  return (...args: [name: string, f: (it: UnsafeAny) => void] | [f: (it: UnsafeAny) => void]) => {
    const excludeTestServices = options?.excludeTestServices ?? false;
    const withTestEnv = excludeTestServices
      ? (layer_ as Layer.Layer<R | TestServices.TestServices, E>)
      : Layer.provideMerge(layer_, TestEnv);
    const memoMap = options?.memoMap ?? Effect.runSync(Layer.makeMemoMap);
    const scope = Effect.runSync(Scope.make());
    const runtimeEffect = Layer.toRuntimeWithMemoMap(withTestEnv, memoMap).pipe(
      Scope.extend(scope),
      Effect.orDie,
      Effect.cached,
      Effect.runSync
    );

    const makeIt = () => ({
      ...it,
      effect: makeTester<TestServices.TestServices | R>((effect) =>
        Effect.flatMap(runtimeEffect, (runtime) => effect.pipe(Effect.provide(runtime)))
      ),
      flakyTest,
      layer: (
        nestedLayer: Layer.Layer<UnsafeAny, UnsafeAny, R>,
        options?: { readonly timeout?: Duration.DurationInput }
      ) => {
        return layer(Layer.provideMerge(nestedLayer, withTestEnv), {
          ...options,
          excludeTestServices,
          memoMap,
        });
      },
      live: makeTester<never>(identity),
      prop,
      scoped: makeTester<TestServices.TestServices | Scope.Scope | R>((effect) =>
        Effect.flatMap(runtimeEffect, (runtime) => effect.pipe(Effect.scoped, Effect.provide(runtime)))
      ),
      scopedLive: makeTester<Scope.Scope>(Effect.scoped),
    });

    if (args.length === 1) {
      args[0](makeIt());
      return;
    }

    return describe(args[0], () => {
      return args[1](makeIt());
    });
  };
};

export const flakyTest = <A, E, R>(
  self: Effect.Effect<A, E, R>,
  timeout: Duration.DurationInput = Duration.seconds(30)
) =>
  pipe(
    Effect.catchAllDefect(self, Effect.fail),
    Effect.retry(
      pipe(
        Schedule.recurs(10),
        Schedule.compose(Schedule.elapsed),
        Schedule.whileOutput(Duration.lessThanOrEqualTo(timeout))
      )
    ),
    Effect.orDie
  );

export const makeMethods = () => ({
  ...it,
  effect: makeTester<TestServices.TestServices>(Effect.provide(TestEnv)),
  flakyTest,
  layer,
  live: makeTester<never>(identity),
  prop,
  scoped: makeTester<TestServices.TestServices | Scope.Scope>(<A, E, R>(effect: Effect.Effect<A, E, R>) =>
    pipe(Effect.scoped(effect), Effect.provide(TestEnv))
  ),
  scopedLive: makeTester<Scope.Scope>(Effect.scoped),
});

export const { effect, live, scoped, scopedLive } = makeMethods();

export const describeWrapped = (name: string, f: (it: UnsafeAny) => void) => describe(name, () => f(makeMethods()));
