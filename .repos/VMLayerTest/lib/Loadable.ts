import type { Equivalence } from "effect/Equivalence"
import * as Equivalence_ from "effect/Equivalence"
import { dual, identity } from "effect/Function"
import type { Inspectable } from "effect/Inspectable"
import type { Pipeable } from "effect/Pipeable"
import type { Covariant } from "effect/Types"
import * as DateTime from "effect/DateTime"
import * as Option from "effect/Option"
import * as Effect from "effect/Effect"
import { Predicate } from "effect"

const TypeId: unique symbol = Symbol.for("@effect/Loadable")

type TypeId = typeof TypeId

export type Loadable<A> = Pending | Ready<A>

export interface Pending extends Pipeable, Inspectable {
  readonly _tag: "Pending"
  readonly since: DateTime.Utc
  readonly [TypeId]: {
    readonly _A: Covariant<never>
  }
}

export interface Ready<out A> extends Pipeable, Inspectable {
  readonly _tag: "Ready"
  readonly value: A
  readonly [TypeId]: {
    readonly _A: Covariant<A>
  }
}

const pendingProto: Omit<Pending, "_tag" | "since"> = {
  [TypeId]: { _A: identity },
  ...Option.none().constructor.prototype
}

const readyProto: Omit<Ready<never>, "_tag" | "value"> = {
  [TypeId]: { _A: identity },
  ...Option.some(null).constructor.prototype
}

/**
 * @category constructors
 */
export const pending = (since?: DateTime.DateTime): Loadable<never> => {
  if (since !== undefined) {
    const out = Object.create(pendingProto)
    out._tag = "Pending"
    out.since = DateTime.toUtc(since)
    return out
  }
  return Effect.runSync(
    Effect.map(DateTime.now, (utc) => {
      const out = Object.create(pendingProto)
      out._tag = "Pending"
      out.since = utc
      return out
    })
  )
}

/**
 * @category constructors
 */
export const ready = <A>(value: A): Loadable<A> => {
  const out = Object.create(readyProto)
  out._tag = "Ready"
  out.value = value
  return out
}

/**
 * @category guards
 */
export const isLoadable = (u: unknown): u is Loadable<unknown> =>
  Predicate.hasProperty(u, TypeId)
/**
 * @category guards
 */
export const isPending = <A>(self: Loadable<A>): self is Pending =>
  self._tag === "Pending"

/**
 * @category guards
 */
export const isReady = <A>(self: Loadable<A>): self is Ready<A> =>
  self._tag === "Ready"

/**
 * @category mapping
 */
export const map: {
  <A, B>(f: (a: A) => B): (self: Loadable<A>) => Loadable<B>
  <A, B>(self: Loadable<A>, f: (a: A) => B): Loadable<B>
} = dual(
  2,
  <A, B>(self: Loadable<A>, f: (a: A) => B): Loadable<B> =>
    isReady(self) ? ready(f(self.value)) : pending(self.since)
)

/**
 * @category sequencing
 */
export const flatMap: {
  <A, B>(f: (a: A) => Loadable<B>): (self: Loadable<A>) => Loadable<B>
  <A, B>(self: Loadable<A>, f: (a: A) => Loadable<B>): Loadable<B>
} = dual(
  2,
  <A, B>(self: Loadable<A>, f: (a: A) => Loadable<B>): Loadable<B> =>
    isPending(self) ? pending(self.since) : f(self.value)
)

/**
 * @category pattern matching
 */
export const match: {
  <A, B>(options: {
    readonly onPending: (since: DateTime.DateTime) => B
    readonly onReady: (value: A) => B
  }): (self: Loadable<A>) => B
  <A, B>(
    self: Loadable<A>,
    options: {
      readonly onPending: (since: DateTime.DateTime) => B
      readonly onReady: (value: A) => B
    }
  ): B
} = dual(
  2,
  <A, B>(
    self: Loadable<A>,
    { onPending, onReady }: {
      readonly onPending: (since: DateTime.DateTime) => B
      readonly onReady: (value: A) => B
    }
  ): B => isPending(self) ? onPending(self.since) : onReady(self.value)
)

/**
 * @category getters
 */
export const getOrElse: {
  <A>(fallback: () => A): (self: Loadable<A>) => A
  <A>(self: Loadable<A>, fallback: () => A): A
} = dual(
  2,
  <A>(self: Loadable<A>, fallback: () => A): A =>
    isPending(self) ? fallback() : self.value
)

/**
 * @category conversions
 */
export const fromOption = <A>(
  option: Option.Option<A>,
  since?: DateTime.DateTime
): Loadable<A> =>
  Option.isNone(option) ? pending(since) : ready(option.value)

/**
 * @category conversions
 */
export const toOption = <A>(self: Loadable<A>): Option.Option<A> =>
  isReady(self) ? Option.some(self.value) : Option.none()

/**
 * @category equivalence
 */
export const getEquivalence = <A>(
  equivalence: Equivalence<A>
): Equivalence<Loadable<A>> =>
  Equivalence_.make((x, y) =>
    isPending(x)
      ? isPending(y) && DateTime.Equivalence(x.since, y.since)
      : isReady(y) && equivalence(x.value, y.value)
  )
