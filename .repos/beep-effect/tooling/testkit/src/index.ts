/**
 * @since 0.1.0
 */

import { test as bunTest } from "bun:test";
import { Effect, TestContext } from "effect";
import type * as Duration from "effect/Duration";
import type * as FC from "effect/FastCheck";
import type * as Layer from "effect/Layer";
import type * as Schema from "effect/Schema";
import type * as Scope from "effect/Scope";
import type * as TestServices from "effect/TestServices";
import * as internal from "./internal/internal";
import type { UnsafeAny } from "./internal/types";

type TestEnv = TestServices.TestServices;

/**
 * @since 0.1.0
 */

export type {
  AsymmetricMatcher,
  AsymmetricMatchers,
  AsymmetricMatchersBuiltin,
  CustomMatcher,
  CustomMatchersDetected,
  Describe,
  EqualsFunction,
  Expect,
  ExpectExtendMatchers,
  MatcherResult,
  Matchers,
  MatchersBuiltin,
  Mock,
  Test,
  Tester,
  TesterContext,
  TestOptions,
} from "bun:test";
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  jest,
  mock,
  onTestFinished,
  setDefaultTimeout,
  setSystemTime,
  spyOn,
  test,
  vi,
  xdescribe,
  xit,
  xtest,
} from "bun:test";
export * from "./assert";

/**
 * RLS (Row-Level Security) test helpers namespace export
 * @since 0.1.0
 */
export * as RLS from "./rls";

/**
 * @since 0.1.0
 */
export declare namespace BunTest {
  /**
   * @since 0.1.0
   */
  export type TestFunction<A, E, R, TestArgs extends Array<UnsafeAny>> = (...args: TestArgs) => Effect.Effect<A, E, R>;

  /**
   * @since 0.1.0
   */
  export type Test<R> = <A, E>(
    name: string,
    self: TestFunction<A, E, R, [UnsafeAny]>,
    timeout?: number | { timeout?: number }
  ) => void;

  /**
   * @since 0.1.0
   */
  export type Arbitraries =
    | Array<Schema.Schema.Any | FC.Arbitrary<UnsafeAny>>
    | { [K in string]: Schema.Schema.Any | FC.Arbitrary<UnsafeAny> };

  /**
   * @since 0.1.0
   */
  export interface Tester<R> extends BunTest.Test<R> {
    skip: BunTest.Test<R>;
    skipIf: (condition: unknown) => BunTest.Test<R>;
    runIf: (condition: unknown) => BunTest.Test<R>;
    only: BunTest.Test<R>;
    each: <T>(
      cases: ReadonlyArray<T>
    ) => <A, E>(name: string, self: TestFunction<A, E, R, Array<T>>, timeout?: number | { timeout?: number }) => void;
    fails: BunTest.Test<R>;
    prop: <const Arbs extends Arbitraries, A, E>(
      name: string,
      arbitraries: Arbs,
      self: TestFunction<A, E, R, [UnsafeAny, UnsafeAny]>,
      timeout?: number | { timeout?: number; fastCheck?: UnsafeAny }
    ) => void;
  }

  /**
   * Methods available within a layer() context (excludes live/scopedLive).
   * @since 0.1.0
   */
  export interface MethodsNonLive<R, ExcludeTestServices extends boolean = false> {
    readonly effect: BunTest.Tester<ExcludeTestServices extends true ? R : TestServices.TestServices | R>;
    readonly flakyTest: <A, E, R2>(
      self: Effect.Effect<A, E, R2>,
      timeout?: Duration.DurationInput
    ) => Effect.Effect<A, never, R2>;
    readonly scoped: BunTest.Tester<
      ExcludeTestServices extends true ? Scope.Scope | R : TestServices.TestServices | Scope.Scope | R
    >;
    readonly layer: <R2, E2>(
      layer: Layer.Layer<R2, E2, R>,
      options?: {
        readonly timeout?: Duration.DurationInput;
      }
    ) => {
      (f: (it: MethodsNonLive<R2, ExcludeTestServices>) => void): void;
      (name: string, f: (it: MethodsNonLive<R2, ExcludeTestServices>) => void): void;
    };
    readonly prop: <const Arbs extends Arbitraries>(
      name: string,
      arbitraries: Arbs,
      self: (properties: UnsafeAny, ctx: UnsafeAny) => void,
      timeout?: number | { timeout?: number; fastCheck?: UnsafeAny }
    ) => void;
  }

  /**
   * @since 0.1.0
   */
  export interface Methods {
    readonly effect: BunTest.Tester<TestServices.TestServices>;
    readonly flakyTest: <A, E, R>(
      self: Effect.Effect<A, E, R>,
      timeout?: Duration.DurationInput
    ) => Effect.Effect<A, never, R>;
    readonly scoped: BunTest.Tester<TestServices.TestServices | Scope.Scope>;
    readonly live: BunTest.Tester<never>;
    readonly scopedLive: BunTest.Tester<Scope.Scope>;
    readonly layer: <R, E, const ExcludeTestServices extends boolean = false>(
      layer: Layer.Layer<R, E>,
      options?: {
        readonly memoMap?: Layer.MemoMap;
        readonly timeout?: Duration.DurationInput;
        readonly excludeTestServices?: ExcludeTestServices;
      }
    ) => {
      (f: (it: MethodsNonLive<R, ExcludeTestServices>) => void): void;
      (name: string, f: (it: MethodsNonLive<R, ExcludeTestServices>) => void): void;
    };
    readonly prop: <const Arbs extends Arbitraries>(
      name: string,
      arbitraries: Arbs,
      self: (properties: UnsafeAny, ctx: UnsafeAny) => void,
      timeout?: number | { timeout?: number; fastCheck?: UnsafeAny }
    ) => void;
  }
}

/**
 * @since 0.1.0
 */
export const addEqualityTesters: () => void = internal.addEqualityTesters;

/**
 * @since 0.1.0
 */
export const effect: BunTest.Tester<TestServices.TestServices> = internal.effect;

/**
 * @since 0.1.0
 */
export const scoped: BunTest.Tester<TestServices.TestServices | Scope.Scope> = internal.scoped;

/**
 * @since 0.1.0
 */
export const live: BunTest.Tester<never> = internal.live;

/**
 * @since 0.1.0
 */
export const scopedLive: BunTest.Tester<Scope.Scope> = internal.scopedLive;

/**
 * Share a `Layer` between multiple tests, optionally wrapping
 * the tests in a `describe` block if a name is provided.
 *
 * @since 0.1.0
 */
export const layer: <R, E, const ExcludeTestServices extends boolean = false>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap;
    readonly timeout?: Duration.DurationInput;
    readonly excludeTestServices?: ExcludeTestServices;
  }
) => {
  (f: (it: BunTest.MethodsNonLive<R, ExcludeTestServices>) => void): void;
  (name: string, f: (it: BunTest.MethodsNonLive<R, ExcludeTestServices>) => void): void;
} = internal.layer;

/**
 * @since 0.1.0
 */
export const flakyTest: <A, E, R>(
  self: Effect.Effect<A, E, R>,
  timeout?: Duration.DurationInput
) => Effect.Effect<A, never, R> = internal.flakyTest;

/**
 * @since 0.1.0
 */
export const prop: BunTest.Methods["prop"] = internal.prop;

/**
 * @since 0.1.0
 */
export const makeMethods: (it: UnsafeAny) => BunTest.Methods = internal.makeMethods;

/**
 * @since 0.1.0
 */
export const describeWrapped: (name: string, f: (it: BunTest.Methods) => void) => void = internal.describeWrapped;
/**
 * Yield to allow forked fibers to process.
 * Use after `send()` or when waiting for async effects.
 * Multiple yields handle delay timer registration.
 */
export const yieldFibers = Effect.yieldNow().pipe(Effect.repeatN(9));

/**
 * Effect-aware test helpers.
 *
 * - `it.effect` - Run with TestContext (includes TestClock)
 * - `it.scoped` - Run scoped effect with TestContext
 * - `it.live` - Run with real clock (no TestContext)
 * - `it.scopedLive` - Run scoped effect with real clock
 */
export const it = Object.assign(bunTest, {
  /**
   * Run effect with TestContext (includes TestClock).
   * Use for tests that need time control.
   */
  effect: <E>(name: string, fn: () => Effect.Effect<void, E, TestEnv>, timeout?: number) =>
    bunTest(name, () => Effect.runPromise(fn().pipe(Effect.provide(TestContext.TestContext))), timeout),

  /**
   * Run scoped effect with TestContext.
   * Use for tests with resources that need cleanup.
   */
  scoped: <E>(name: string, fn: () => Effect.Effect<void, E, TestEnv | Scope.Scope>, timeout?: number) =>
    bunTest(name, () => Effect.runPromise(fn().pipe(Effect.scoped, Effect.provide(TestContext.TestContext))), timeout),

  /**
   * Run effect with real clock (no TestContext).
   * Use for tests that need actual time delays.
   */
  live: <E>(name: string, fn: () => Effect.Effect<void, E, never>, timeout?: number) =>
    bunTest(name, () => Effect.runPromise(fn()), timeout),

  /**
   * Run scoped effect with real clock.
   * Use for tests with resources that need real time.
   */
  scopedLive: <E>(name: string, fn: () => Effect.Effect<void, E, Scope.Scope>, timeout?: number) =>
    bunTest(name, () => Effect.runPromise(fn().pipe(Effect.scoped)), timeout),
});
