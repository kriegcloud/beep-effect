/**
 * @see { @link effect }
 * @see {@link "effect/Function#F.pipe" }
 * @module @beep/schema/Timestamp
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { type Brand, DateTime, Effect, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as Num from "effect/Number";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { PosInt } from "./Int.ts";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("Timestamp");

const stripMilliseconds = (value: string): string => pipe(value, Str.replace(/\.\d{3}Z$/, "Z"));

/**
 * Branded ISO 8601 datetime string
 *
 * @example
 * import { ISOStr } from "@beep/schema/Timestamp";
 * import * as S from "effect/Schema";
 *
 * const validValue = "2024-01-01T00:00:00.000Z";
 * const decoded = S.decodeUnknownSync(ISOStr)(validValue);
 * const encoded = S.encodeSync(ISOStr)(decoded);
 *
 * @since 0.0.0
 * @category DomainModel
 * @type {@link S.brand<S.brand<S.Trim, "NonEmptyTrimmedStr">, "ISOStr">}
 */
export const ISOStr = NonEmptyTrimmedStr.check(S.makeFilter((i) => S.is(S.DateValid)(new Date(i)))).pipe(
  S.brand("ISOStr"),
  $I.annoteSchema("ISOStr", {
    description: "ISO 8601 datetime string",
  })
);

/**
 * type of @link {ISOStr}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ISOStr = typeof ISOStr.Type;

/**
 * EpochMillis - Epoch milliseconds since 1970-01-01T00:00:00.000Z
 *
 * Stores the epoch milliseconds internally.
 * Encoded as ISO 8601 datetime string.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Effect } from "effect";
 *
 * const JanuaryFirst1970 = new Date("1970-01-01T00:00:00.000Z").getTime()
 * const program = Effect.gen(function* () {
 *   const decoded = yield* S.decodeEffect(EpochMillis)(EpochMillis.makeUnsafe(JanuarFirst1970));
 *   const encoded = yield* S.encodeEffect(EpochMillis)(decoded);
 * })
 *
 * program.pipe(Effect.runPromise);
 *
 * @Category DomainModel
 * @since 0.0.0
 * @type @link S.brand<S.brand<S.brand<S.Int, "Int">, "PosInt">, "EpochMillis">
 */
export const EpochMillis = PosInt.pipe(
  S.brand("EpochMillis"),
  $I.annoteSchema("EpochMillis", {
    description: "Epoch milliseconds since 1970-01-01T00:00:00.000Z",
    documentation: "Stores the epoch milliseconds internally.\nEncoded as ISO 8601 datetime string.",
  })
);

/**
 * type of {@link @beep/schema/Timestamp#L69-75  | EpochMillis}
 *
 * @import { Brand } from "effect/Schema";
 * @since 0.0.0
 * @category DomainModel
 * @type {@link effect/Brand |  number & Brand.Brand<"Int"> & Brand.Brand<"PosInt"> & Brand.Brand<"EpochMillis">}
 */
export type EpochMillis = typeof EpochMillis.Type;

/**
 * Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.
 *
 * Always emits ISO strings without fractional seconds to keep storage consistent.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ToIsoString } from "@beep/schema/Timestamp";
 *
 * const iso = S.decodeSync(ToIsoString)("2024-01-01T00:00:00.123Z");
 *
 * Uses {@link effect/Schema#S.decodeTo | }
 * @category DomainModel
 * @since 0.0.0
 * @type {@link effect/Schema#S.decodeTo | S.decodeTo<S.String, S.Union<readonly [S.String, S.Number]>, never, never>}
 */
export const ToIsoStr = S.Union([ISOStr, S.Number]).pipe(
  S.decodeTo(
    ISOStr,
    SchemaTransformation.transform({
      decode: (input) => pipe(new Date(input).toISOString(), stripMilliseconds),
      encode: (isoStr) => pipe(new Date(isoStr).toISOString(), stripMilliseconds, ISOStr.makeUnsafe),
    })
  ),
  $I.annoteSchema("ToIsoStr", {
    description: "Schema transformer converting timestamps (numbers or ISO strings) into normalized ISO strings.",
    documentation:
      'Always emits ISO strings without fractional seconds to keep storage consistent.\n\n@example\nimport * as S from "effect/Schema";\nimport { ToIsoString } from "@beep/schema/primitives/temporal/dates/timestamp";\n\nconst iso = S.decodeSync(ToIsoString)("2024-01-01T00:00:00.123Z");',
  })
);

/**
 * type for @link {ToIsoStr}
 *
 * @category DomainModel
 * @since 0.0.0
 * @example
 * import { ToIsoStr } from "@beep/schema/Timestamp";
 *
 * const val: ToIsoStr = "2024-01-01T00:00:00.123Z" as {@link effect/Brand#Brand | string & Brand<"NonEmptyTrimmedStr"> & Brand<"ISOStr">};
 *
 * const
 */
export type ToIsoString = typeof ToIsoStr.Type;

/**
 * The `ToIsoStr` namespace provides utilities for working with encoded ISO strings.
 *
 * This namespace is designed to define and work with a specific encoded type representation.
 *
 * ## Key Features
 *
 * - **Type definitions**: Encoded ISO string representation
 * - **Type safety**: Ensures encoded values conform to the defined type
 *
 * @example
 * ```ts-morph
 * import { ToIsoStr } from "effect";
 *
 * // Access Encoded Type
 * type EncodedIsoString = ToIsoStr.Encoded;
 *
 * // Example use case: enforcing encoded type in a function
 * const processEncodedString = (value: EncodedIsoString) => {
 *   console.log(`Processing encoded string: ${value}`);
 * };
 *
 * // Example usage: encoding a value
 * const valueEpochMillis: EncodedIsoString = 1730419200000; // Nov 1, 2024
 * const valueIsoString: EncodedIsoString = "2024-11-01T00:00:00.000Z";
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace ToIsoStr {
  /**
   * encoded type fro @link {ToIsoStr}
   *
   * @since 0.0.0
   * @category DomainModel
   * @example
   * import { ToIsoStr } from "@beep/schema/Timestamp";
   *
   * const encoded: ToIsoStr.Encoded = "2024-11-01T00:00:00.000Z";
   */
  export type Encoded = typeof ToIsoStr.Encoded;
}

/**
 * Timestamp - A Schema.Class wrapping DateTime.Utc for UTC timestamps
 *
 * Stores the epoch milliseconds internally.
 * Encoded as ISO 8601 datetime string.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Timestamp extends S.Class<Timestamp>("Timestamp")(
  {
    epochMillis: S.Int.check(S.isGreaterThanOrEqualTo(1)),
  },
  $I.annote("Timestamp", {
    description: "Timestamp - A Schema.Class wrapping DateTime.Utc for UTC timestamps",
    documentation: "Stores the epoch milliseconds internally.\nEncoded as ISO 8601 datetime string.",
  })
) {
  /**
   * Get the underlying DateTime.Utc instance
   *
   * @since 0.0.0
   * @category Utility
   * @returns {DateTime.Utc}
   */
  readonly toDateTime: () => DateTime.Utc = (): DateTime.Utc => DateTime.makeUnsafe(this.epochMillis);

  /**
   * Convert to JavaScript Date
   *
   * @since 0.0.0
   * @category Utility
   * @returns {Date}
   */
  readonly toDate: () => Date = (): Date => new Date(this.epochMillis);

  /**
   * Converts a timestamp or date object to its ISO 8601 string representation.
   *
   * The resulting string adheres to the `ISOStr` branded type, ensuring that it:
   * - Represents a valid ISO 8601-compliant datetime string.
   * - Is non-empty and trimmed, satisfying the `NonEmptyTrimmedStr` constraint.
   *
   * @example
   * ```ts-morph
   * import { ISOStr } from "effect/Date" // Hypothetical module path; update as needed.
   *
   * // Assume a valid date object
   * const date = new Date("2023-01-01T12:00:00Z")
   *
   * // Generate an ISO 8601 string from the date
   * const isoString = ISOStr.toISOStr(date)
   * console.log(isoString) // Outputs: "2023-01-01T12:00:00.000Z"
   *
   * // Use the branded type safely
   * type CheckBranding = typeof isoString extends Brand.Branded<string, "ISOStr"> ? true : false
   * ```
   *
   *
   * @category utilities
   */
  readonly toISOStr: () => Brand.Branded<Brand.Branded<string, "NonEmptyTrimmedStr">, "ISOStr"> = (): Brand.Branded<
    Brand.Branded<string, "NonEmptyTrimmedStr">,
    "ISOStr"
  > => ISOStr.makeUnsafe(this.toDate().toISOString());
}
