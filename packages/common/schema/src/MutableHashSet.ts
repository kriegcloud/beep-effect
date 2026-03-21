/**
 * Schemas for Effect `MutableHashSet` values.
 *
 * @since 0.0.0
 * @module @beep/schema/MutableHashSet
 */

import { $SchemaId } from "@beep/identity/packages"
import { Effect, Option, pipe, SchemaIssue, SchemaTransformation } from "effect"
import * as A from "effect/Array"
import * as MutableHashSet_ from "effect/MutableHashSet"
import * as S from "effect/Schema"
import * as SchemaParser from "effect/SchemaParser"
import * as Str from "effect/String"

const $I = $SchemaId.create("MutableHashSet")

const formatValues = <A>(values: ReadonlyArray<A>, formatValue: (value: A) => string): string =>
  pipe(values, A.map(formatValue), A.sort(Str.Order), A.join(", "))

const makeMutableHashSetEquivalence = <A>(equivalence: (self: A, that: A) => boolean) =>
  (self: Iterable<A>, that: Iterable<A>): boolean => {
    const selfValues = A.fromIterable(self)
    const thatValues = A.fromIterable(that)

    return selfValues.length === thatValues.length &&
      pipe(
        selfValues,
        A.every((selfValue) => pipe(thatValues, A.some((thatValue) => equivalence(selfValue, thatValue))))
      )
  }

/**
 * `MutableHashSet` iso representation used by {@link MutableHashSetFromSelf}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MutableHashSetIso<Value extends S.Top> = ReadonlyArray<Value["Iso"]>

/**
 * Schema for validating an existing `MutableHashSet` instance.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableHashSetFromSelf<Value extends S.Top> extends
  S.declareConstructor<
    MutableHashSet_.MutableHashSet<Value["Type"]>,
    MutableHashSet_.MutableHashSet<Value["Encoded"]>,
    readonly [Value],
    MutableHashSetIso<Value>
  >
{
  readonly value: Value
}

/**
 * Schema for transforming arrays into `MutableHashSet` instances.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableHashSet<Value extends S.Top> extends
  S.decodeTo<MutableHashSetFromSelf<S.toType<Value>>, S.$Array<Value>>
{
  readonly value: Value
}

/**
 * Guard for Effect `MutableHashSet` values.
 *
 * @param value - Unknown input to test.
 * @returns `true` when `value` is a `MutableHashSet`.
 * @since 0.0.0
 * @category Guards
 */
export const isMutableHashSet = <Value>(value: unknown): value is MutableHashSet_.MutableHashSet<Value> =>
  MutableHashSet_.isMutableHashSet(value)

/**
 * Schema for validating existing `MutableHashSet` instances while applying the
 * provided member schema to each element.
 *
 * @param value - Element schema for set members.
 * @returns Schema whose encoded side is another `MutableHashSet` carrying the
 * encoded member type.
 * @since 0.0.0
 * @category Validation
 */
export const MutableHashSetFromSelf = <Value extends S.Top>(value: Value): MutableHashSetFromSelf<Value> => {
  const schema = S.declareConstructor<
    MutableHashSet_.MutableHashSet<Value["Type"]>,
    MutableHashSet_.MutableHashSet<Value["Encoded"]>,
    MutableHashSetIso<Value>
  >()(
    [value],
    ([value]) => {
      const values = S.Array(value)

      return (input, ast, options) => {
        if (!MutableHashSet_.isMutableHashSet(input)) {
          return Effect.fail(new SchemaIssue.InvalidType(ast, Option.some(input)))
        }

        return Effect.mapBothEager(SchemaParser.decodeUnknownEffect(values)(A.fromIterable(input), options), {
          onSuccess: MutableHashSet_.fromIterable,
          onFailure: (issue) =>
            new SchemaIssue.Composite(ast, Option.some(input), [new SchemaIssue.Pointer(["values"], issue)]),
        })
      }
    },
    {
      typeConstructor: {
        _tag: "effect/MutableHashSet",
      },
      generation: {
        runtime: "MutableHashSetFromSelf(?)",
        Type: "MutableHashSet.MutableHashSet<?>",
        importDeclaration: 'import * as MutableHashSet from "effect/MutableHashSet"',
      },
      expected: "MutableHashSet",
      description: "Schema for existing MutableHashSet instances.",
      toCodec: ([value]) =>
        S.link<MutableHashSet_.MutableHashSet<Value["Encoded"]>>()(
          S.Array(value),
          SchemaTransformation.transform({
            decode: MutableHashSet_.fromIterable,
            encode: A.fromIterable,
          })
        ),
      toArbitrary: ([value]) => (fc, ctx) =>
        fc
          .oneof(
            ctx?.isSuspend === true ? { maxDepth: 2, depthIdentifier: "MutableHashSet" } : {},
            fc.constant([]),
            fc.array(value, ctx?.constraints?.array)
          )
          .map(MutableHashSet_.fromIterable),
      toEquivalence: ([value]) => makeMutableHashSetEquivalence(value),
      toFormatter: ([value]) => (set) => {
        const size = MutableHashSet_.size(set)
        if (size === 0) {
          return "MutableHashSet(0) {}"
        }

        return `MutableHashSet(${size}) { ${formatValues(A.fromIterable(set), value)} }`
      },
    }
  )

  return S.make<MutableHashSetFromSelf<Value>>(schema.ast, { value }).pipe(
    $I.annoteSchema("MutableHashSetFromSelf", {
      description: "Schema for validating existing MutableHashSet runtime values.",
    })
  )
}

/**
 * Schema for decoding arrays into `MutableHashSet` instances and encoding sets
 * back to arrays.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MutableHashSet } from "@beep/schema/MutableHashSet"
 *
 * const StringSet = MutableHashSet(S.String)
 *
 * const decoded = S.decodeUnknownSync(StringSet)(["a", "b", "a"])
 * const encoded = S.encodeSync(StringSet)(decoded)
 * ```
 *
 * @param value - Element schema for set members.
 * @returns Array-backed schema for mutable hash sets.
 * @since 0.0.0
 * @category Validation
 */
export const MutableHashSet = <Value extends S.Top>(value: Value): MutableHashSet<Value> => {
  const schema = S.Array(value).pipe(
    S.decodeTo(
      MutableHashSetFromSelf(S.toType(value)),
      SchemaTransformation.transform({
        decode: MutableHashSet_.fromIterable,
        encode: A.fromIterable,
      })
    )
  )

  return S.make<MutableHashSet<Value>>(schema.ast, {
    from: schema.from,
    to: schema.to,
    value,
  }).pipe(
    $I.annoteSchema("MutableHashSet", {
      description: "Array-backed schema for Effect MutableHashSet values.",
    })
  )
}
