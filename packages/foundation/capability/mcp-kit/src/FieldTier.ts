/**
 * Progressive field-tier projector and columnar reshaper.
 *
 * Large MCP tool results (a USPTO `documentBag`-shaped response is the
 * canonical example) blow past client output ceilings when returned in full.
 * This module names three progressive-disclosure field tiers —
 * `minimal`/`balanced`/`complete` — as actual `Schema.Struct` variants (per
 * `uspto_pfw_mcp#4`, port-with-attribution), projects a payload down to a
 * tier's field set, strips null-valued fields, and reshapes row-oriented
 * arrays into a columnar envelope (per `us-gov-open-data-mcp#4`,
 * port-with-attribution) to shrink JSON size further. When even the
 * `minimal` tier does not fit a caller's budget, {@link FetchableHandle}
 * names the escape valve: a UUID+TTL handle a caller can fetch instead of
 * receiving the payload inline (per `patents-mcp-server#3`,
 * reimplement-only).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $McpKitId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { HashSet } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $McpKitId.create("FieldTier");

/**
 * Named progressive-disclosure field tier.
 *
 * @example
 * ```ts
 * import { FieldTierName } from "@beep/mcp-kit"
 *
 * const tier = FieldTierName.Enum.minimal
 * console.log(tier)
 * // "minimal"
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FieldTierName = LiteralKit(["minimal", "balanced", "complete"]).pipe(
  $I.annoteSchema("FieldTierName", {
    description: "Named progressive-disclosure field tier: minimal, balanced, or complete.",
  })
);

/**
 * Runtime type for {@link FieldTierName}.
 *
 * @example
 * ```ts
 * import type { FieldTierName } from "@beep/mcp-kit"
 *
 * const tier = "balanced" satisfies FieldTierName
 * console.log(tier)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type FieldTierName = typeof FieldTierName.Type;

/**
 * A set of three named `Schema.Struct` field-tier variants over the same
 * conceptual payload: `minimal` (smallest), `balanced`, and `complete`
 * (largest).
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldTierSet<
  Minimal extends S.Struct.Fields,
  Balanced extends S.Struct.Fields,
  Complete extends S.Struct.Fields,
> {
  readonly balanced: S.Struct<Balanced>;
  readonly complete: S.Struct<Complete>;
  readonly minimal: S.Struct<Minimal>;
}

/**
 * Names a {@link FieldTierSet}. This is an identity constructor — it exists
 * to give the three tier schemas a single documented entry point and to
 * anchor the generic constraint that all three tiers describe the same
 * conceptual payload.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { defineFieldTiers } from "@beep/mcp-kit"
 *
 * const tiers = defineFieldTiers({
 *   minimal: S.Struct({ id: S.String, title: S.String }),
 *   balanced: S.Struct({ id: S.String, title: S.String, summary: S.String }),
 *   complete: S.Struct({ id: S.String, title: S.String, summary: S.String, body: S.String })
 * })
 * console.log(Object.keys(tiers.minimal.fields))
 * // ["id", "title"]
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const defineFieldTiers = <
  Minimal extends S.Struct.Fields,
  Balanced extends S.Struct.Fields,
  Complete extends S.Struct.Fields,
>(
  tiers: FieldTierSet<Minimal, Balanced, Complete>
): FieldTierSet<Minimal, Balanced, Complete> => tiers;

const fieldNamesOf = (struct: S.Struct<S.Struct.Fields>): ReadonlyArray<string> => R.keys(struct.fields);

/**
 * Removes null- and undefined-valued keys from a plain record, shrinking its
 * encoded JSON size.
 *
 * @example
 * ```ts
 * import { stripNulls } from "@beep/mcp-kit"
 *
 * const stripped = stripNulls({ a: 1, b: null, c: undefined, d: 0 })
 * console.log(stripped)
 * // { a: 1, d: 0 }
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const stripNulls = (value: Record<string, unknown>): Record<string, unknown> =>
  R.filter(value, (fieldValue) => fieldValue !== null && fieldValue !== undefined);

const pickFields = (value: Record<string, unknown>, fields: ReadonlyArray<string>): Record<string, unknown> => {
  const allow = HashSet.fromIterable(fields);
  return R.filter(value, (_fieldValue, key) => HashSet.has(allow, key));
};

/**
 * Projects a plain payload record down to one named field tier's field set,
 * then strips null-valued fields.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { defineFieldTiers, projectFieldTier } from "@beep/mcp-kit"
 *
 * const tiers = defineFieldTiers({
 *   minimal: S.Struct({ id: S.String }),
 *   balanced: S.Struct({ id: S.String, summary: S.String }),
 *   complete: S.Struct({ id: S.String, summary: S.String, body: S.String })
 * })
 *
 * const projected = projectFieldTier(tiers, "minimal", { id: "doc-1", summary: "s", body: "b" })
 * console.log(projected)
 * // { id: "doc-1" }
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const projectFieldTier = (
  tiers: FieldTierSet<S.Struct.Fields, S.Struct.Fields, S.Struct.Fields>,
  tier: FieldTierName,
  value: Record<string, unknown>
): Record<string, unknown> => stripNulls(pickFields(value, fieldNamesOf(tiers[tier])));

/**
 * Estimates a value's serialized JSON size in bytes/characters, used as a
 * proxy for a caller's token/size budget.
 *
 * @example
 * ```ts
 * import { estimateJsonSize } from "@beep/mcp-kit"
 *
 * console.log(estimateJsonSize({ a: 1 }))
 * // 8
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const estimateJsonSize = (value: unknown): number => JSON.stringify(value).length;

const TIER_ORDER: ReadonlyArray<FieldTierName> = ["complete", "balanced", "minimal"];

/**
 * Projects a payload to the most complete field tier that fits within
 * `budgetBytes`, falling back to `minimal` when even that tier does not fit.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { defineFieldTiers, projectWithinBudget } from "@beep/mcp-kit"
 *
 * const tiers = defineFieldTiers({
 *   minimal: S.Struct({ id: S.String }),
 *   balanced: S.Struct({ id: S.String, summary: S.String }),
 *   complete: S.Struct({ id: S.String, summary: S.String, body: S.String })
 * })
 *
 * const projected = projectWithinBudget(tiers, { id: "doc-1", summary: "s", body: "b".repeat(100) }, 40)
 * console.log(projected.tier)
 * // "minimal"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const projectWithinBudget = (
  tiers: FieldTierSet<S.Struct.Fields, S.Struct.Fields, S.Struct.Fields>,
  value: Record<string, unknown>,
  budgetBytes: number
): { readonly tier: FieldTierName; readonly value: Record<string, unknown> } => {
  for (const tier of TIER_ORDER) {
    const projected = projectFieldTier(tiers, tier, value);
    if (estimateJsonSize(projected) <= budgetBytes) {
      return { tier, value: projected };
    }
  }
  return { tier: "minimal", value: projectFieldTier(tiers, "minimal", value) };
};

/**
 * Columnar reshaping of row-oriented records: instead of repeating every
 * field name once per row, `columns` lists each field name once and `rows`
 * carries only the values, in `columns` order.
 *
 * @example
 * ```ts
 * import { ColumnarEnvelope } from "@beep/mcp-kit"
 *
 * const envelope = ColumnarEnvelope.make({ columns: ["id", "title"], rows: [["doc-1", "Title"]] })
 * console.log(envelope.columns)
 * // ["id", "title"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ColumnarEnvelope extends S.Class<ColumnarEnvelope>($I`ColumnarEnvelope`)(
  {
    columns: S.Array(S.String).annotateKey({
      description: "Field names, in the order each row's values appear.",
    }),
    rows: S.Unknown.pipe(S.Array, S.Array).annotateKey({
      description: "Row values, one array per row, in `columns` order.",
    }),
  },
  $I.annote("ColumnarEnvelope", {
    description: "Columnar reshaping of row-oriented records: one column-name list plus value-only rows.",
  })
) {}

/**
 * Reshapes an array of row-oriented records into a {@link ColumnarEnvelope},
 * using the first row's key order as the column list.
 *
 * @example
 * ```ts
 * import { toColumnarEnvelope } from "@beep/mcp-kit"
 *
 * const envelope = toColumnarEnvelope([{ id: "doc-1", title: "A" }, { id: "doc-2", title: "B" }])
 * console.log(envelope.rows)
 * // [["doc-1", "A"], ["doc-2", "B"]]
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const toColumnarEnvelope = (rows: ReadonlyArray<Record<string, unknown>>): ColumnarEnvelope => {
  const [first] = rows;
  const columns = first === undefined ? [] : R.keys(first);
  return ColumnarEnvelope.make({
    columns,
    rows: rows.map((row) => columns.map((column) => row[column])),
  });
};

/**
 * A fetchable handle for a payload too large to return inline: a UUID
 * identifier plus a TTL expiry the caller can use to fetch the full payload
 * out-of-band, instead of receiving it embedded in a tool result.
 *
 * @example
 * ```ts
 * import { FetchableHandle } from "@beep/mcp-kit"
 * import { NonNegativeInt } from "@beep/schema"
 *
 * const handle = FetchableHandle.make({
 *   handleId: "5b1d6a3e-8f3e-4a1a-9c1e-2e6b7a2f9c10",
 *   expiresAt: "2026-07-01T01:00:00.000Z",
 *   sizeBytes: NonNegativeInt.make(2_000_000),
 *   tier: "complete"
 * })
 * console.log(handle.tier)
 * // "complete"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FetchableHandle extends S.Class<FetchableHandle>($I`FetchableHandle`)(
  {
    handleId: S.NonEmptyString.annotateKey({
      description: "UUID identifying the out-of-band payload.",
    }),
    expiresAt: S.NonEmptyString.annotateKey({
      description: "ISO-8601 timestamp after which the handle is no longer fetchable.",
    }),
    sizeBytes: NonNegativeInt.annotateKey({
      description: "Approximate serialized size of the full payload, in bytes.",
    }),
    tier: FieldTierName.annotateKey({
      description: "Field tier the full payload was projected at before storage.",
    }),
  },
  $I.annote("FetchableHandle", {
    description: "UUID+TTL fetchable handle standing in for a payload too large to return inline.",
  })
) {}
