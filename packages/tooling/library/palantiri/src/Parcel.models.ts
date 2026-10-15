/**
 * The generic parcel vocabulary: keys, ids, sources, specs, budgets and
 * receipts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $PalantiriId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $PalantiriId.create("Parcel.models");

/**
 * What a parcel is keyed by.
 *
 * **Example** (Narrow a parcel key)
 *
 * ```ts
 * import { ParcelKey } from "@beep/palantiri/Parcel.models"
 *
 * console.log(ParcelKey.is.account("account")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ParcelKey = LiteralKit(["session", "lane", "host", "pr", "app", "account"]).pipe(
  $I.annoteSchema("ParcelKey", { description: "The subject a parcel is keyed by." })
);

/**
 * Runtime type for {@link ParcelKey}.
 *
 * @category models
 * @since 0.0.0
 */
export type ParcelKey = typeof ParcelKey.Type;

/**
 * The parcels Palantiri serves.
 *
 * **Example** (Narrow a parcel id)
 *
 * ```ts
 * import { ParcelId } from "@beep/palantiri/Parcel.models"
 *
 * console.log(ParcelId.Enum["account-headroom"]) // "account-headroom"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ParcelId = LiteralKit(["account-headroom"]).pipe(
  $I.annoteSchema("ParcelId", { description: "Identifier of a parcel Palantiri serves." })
);

/**
 * Runtime type for {@link ParcelId}.
 *
 * @category models
 * @since 0.0.0
 */
export type ParcelId = typeof ParcelId.Type;

/**
 * A source a parcel reads from.
 *
 * **Details**
 *
 * `accounts-poll` is a live poll of an account; `accounts-retained` is an
 * earlier reading the accounts report kept (a collector snapshot, or the last
 * good poll of an account whose newest poll failed).
 *
 * **Example** (Narrow a source)
 *
 * ```ts
 * import { ParcelSource } from "@beep/palantiri/Parcel.models"
 *
 * console.log(ParcelSource.is["accounts-poll"]("accounts-poll")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ParcelSource = LiteralKit(["accounts-poll", "accounts-retained"]).pipe(
  $I.annoteSchema("ParcelSource", { description: "A source a parcel reads from." })
);

/**
 * Runtime type for {@link ParcelSource}.
 *
 * @category models
 * @since 0.0.0
 */
export type ParcelSource = typeof ParcelSource.Type;

/**
 * The static description of one parcel: its id, key, freshness bound and
 * sources.
 *
 * **Example** (Make a spec)
 *
 * ```ts
 * import { ParcelSpec } from "@beep/palantiri/Parcel.models"
 * import * as Duration from "effect/Duration"
 *
 * const spec = ParcelSpec.make({
 *   id: "account-headroom",
 *   key: "account",
 *   freshnessBound: Duration.minutes(5),
 *   sources: ["accounts-poll"]
 * })
 * console.log(spec.key) // "account"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParcelSpec extends S.Opaque<ParcelSpec, { readonly brand: unique symbol }>()(
  S.Struct({
    id: ParcelId,
    key: ParcelKey,
    freshnessBound: S.Duration,
    sources: S.NonEmptyArray(ParcelSource),
  }).pipe(
    $I.annoteSchema("ParcelSpec", {
      description: "A parcel's id, key, freshness bound and sources.",
    })
  )
) {}

/**
 * The most items one parcel response carries, at least 1.
 *
 * **Example** (Guard a budget)
 *
 * ```ts
 * import { ParcelBudget } from "@beep/palantiri/Parcel.models"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(ParcelBudget)(20)) // true
 * console.log(S.is(ParcelBudget)(0)) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ParcelBudget = S.Int.check(S.isBetween({ minimum: 1, maximum: 500 })).pipe(
  $I.annoteSchema("ParcelBudget", { description: "The most items one parcel response carries." })
);

/**
 * Runtime type for {@link ParcelBudget}.
 *
 * @category models
 * @since 0.0.0
 */
export type ParcelBudget = typeof ParcelBudget.Type;

/**
 * Options for one parcel read. The budget defaults to 20 items.
 *
 * **Example** (Default the budget)
 *
 * ```ts
 * import { ParcelReadOptions } from "@beep/palantiri/Parcel.models"
 *
 * console.log(ParcelReadOptions.make({}).budget) // 20
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParcelReadOptions extends S.Opaque<ParcelReadOptions, { readonly brand: unique symbol }>()(
  S.Struct({
    budget: ParcelBudget.pipe(
      S.withDecodingDefaultKey(Effect.succeed(20)),
      S.withConstructorDefault(Effect.succeed(20))
    ),
  }).pipe($I.annoteSchema("ParcelReadOptions", { description: "Options for one parcel read." }))
) {}

/**
 * How many items a response shows of how many the parcel holds.
 *
 * **Example** (Make a receipt)
 *
 * ```ts
 * import { ParcelReceipt } from "@beep/palantiri/Parcel.models"
 *
 * console.log(ParcelReceipt.make({ shown: 20, total: 31 }).total) // 31
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParcelReceipt extends S.Opaque<ParcelReceipt, { readonly brand: unique symbol }>()(
  S.Struct({ shown: S.Int.check(S.isGreaterThanOrEqualTo(0)), total: S.Int.check(S.isGreaterThanOrEqualTo(0)) }).pipe(
    $I.annoteSchema("ParcelReceipt", { description: "How many items a response shows of how many the parcel holds." })
  )
) {}
