import { invariant } from "@beep/invariant";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";

export type ContextServiceMethodKeys<Service> = {
  [K in keyof Service]-?: Service[K] extends (
    ...args: infer _Args extends ReadonlyArray<unknown>
  ) => Effect.Effect<infer _A, infer _E, infer _R>
    ? K
    : never;
}[keyof Service];

export type ContextServiceMethodArgs<Service, Key extends ContextServiceMethodKeys<Service>> = Service[Key] extends (
  ...args: infer Args extends ReadonlyArray<unknown>
) => Effect.Effect<infer _A, infer _E, infer _R>
  ? Args
  : never;

export type ContextServiceMethodSuccess<Service, Key extends ContextServiceMethodKeys<Service>> = Service[Key] extends (
  ...args: infer _Args extends ReadonlyArray<unknown>
) => Effect.Effect<infer A, infer _E, infer _R>
  ? A
  : never;

export type ContextServiceMethodError<Service, Key extends ContextServiceMethodKeys<Service>> = Service[Key] extends (
  ...args: infer _Args extends ReadonlyArray<unknown>
) => Effect.Effect<infer _A, infer E, infer _R>
  ? E
  : never;

export type ContextServiceMethodContext<Service, Key extends ContextServiceMethodKeys<Service>> = Service[Key] extends (
  ...args: infer _Args extends ReadonlyArray<unknown>
) => Effect.Effect<infer _A, infer _E, infer R>
  ? R
  : never;

export type LiftedEffect<Service, Key extends ContextServiceMethodKeys<Service>, E, R> = Effect.Effect<
  ContextServiceMethodSuccess<Service, Key>,
  E | ContextServiceMethodError<Service, Key>,
  R | ContextServiceMethodContext<Service, Key>
>;

export const liftEffectMethod =
  <Service extends object, E, R>(serviceEffect: Effect.Effect<Service, E, R>) =>
  <Key extends ContextServiceMethodKeys<Service>>(key: Key) => {
    return (...args: Readonly<ContextServiceMethodArgs<Service, Key>>): LiftedEffect<Service, Key, E, R> =>
      Effect.flatMap(
        serviceEffect,
        (
          service
        ): Effect.Effect<
          ContextServiceMethodSuccess<Service, Key>,
          ContextServiceMethodError<Service, Key>,
          ContextServiceMethodContext<Service, Key>
        > => {
          // Defensive: preserves a clear runtime failure if the key is wrong at runtime (e.g. `as any`).
          const fn = service[key];
          invariant(P.isNotNullable(fn) && P.isFunction(fn), "not a valid service method", {
            args: [fn],
            line: 0,
            file: "packages/common/utils/src/effect/lift-context-method.ts",
          });

          return fn(...args);
        }
      );
  };

export const liftContextMethod = <Self, Service extends object>(tag: Context.ReadonlyTag<Self, Service>) =>
  liftEffectMethod(tag);
