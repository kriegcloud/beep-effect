/**
 * UUID utilities powering schema entity id builders.
 *
 * Provides the literal encodings and branded helpers required to construct
 * deterministic `EntityId` schemas throughout the monorepo.
 *
 * @example
 * import { UUIDLiteral } from "@beep/schema/identity/entity-id/uuid";
 * import * as S from "effect/Schema";
 *
 * const parsed = S.decodeSync(UUIDLiteral)("8d23e4b7-d0b3-4f10-9a52-5f4e39b76a5b");
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";

const $I = $SchemaId.create("identity/entity-id/uuid");
/**
 * Factory that brands RFC4122 UUID strings with a concrete identifier tag.
 *
 * Useful for representing model-private identifiers (for example, Postgres row
 * ids or external reference IDs) while retaining the ergonomic parsing helpers
 * provided by Effect schemas.
 *
 * @example
 * import { BrandedUUID } from "@beep/schema/identity/entity-id/uuid";
 * import * as S from "effect/Schema";
 *
 * const TenantUUID = BrandedUUID("TenantUUID");
 * const parsed = S.decodeSync(TenantUUID)("f4daba0f-68d4-4941-a5c7-3af90f528e22");
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export const BrandedUUID = <const Brand extends string>(brand: Brand) => S.UUID.pipe(S.brand(brand));

const UUIDLiteralEncodedBase = S.TemplateLiteral(
  S.String,
  "-",
  S.String,
  "-",
  S.String,
  "-",
  S.String,
  "-",
  S.String
).annotations(
  $I.annotations("UUIDLiteralEncoded", {
    identifier: "UUIDLiteralEncoded",
    title: "UUID Literal (Encoded)",
    description: "Template literal schema describing an RFC4122 UUID string.",
  })
);

/**
 * Template literal schema representing canonical UUID strings.
 *
 * Emits the encoded literal form used across entity id schemas and includes a
 * helper for generating compliant identifiers during testing.
 *
 * @category Identity/EntityId
 * @since 0.1.0
 * @example
 * import { UUIDLiteralEncoded } from "@beep/schema/identity/entity-id/uuid";
 *
 * const value = UUIDLiteralEncoded.create();
 */
export class UUIDLiteralEncoded extends UUIDLiteralEncodedBase {
  /**
   * Generates a valid UUID string that satisfies the literal template.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  static readonly create = (): UUIDLiteralEncoded.Type => uuid() as `${string}-${string}-${string}-${string}-${string}`;
}

/**
 * Namespace describing runtime and encoded types for {@link UUIDLiteralEncoded}.
 *
 * @category Identity/EntityId
 * @since 0.1.0
 * @example
 * import type { UUIDLiteralEncoded } from "@beep/schema/identity/entity-id/uuid";
 *
 * type Value = UUIDLiteralEncoded.Type;
 */
export declare namespace UUIDLiteralEncoded {
  /**
   * Runtime type inferred from {@link UUIDLiteralEncoded}.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof UUIDLiteralEncoded>;
  /**
   * Encoded representation produced by {@link UUIDLiteralEncoded}.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof UUIDLiteralEncoded>;
}

const UUIDLiteralBase = S.transformOrFail(UUIDLiteralEncoded, S.UUID, {
  strict: true,
  decode: (input, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(S.UUID)(input),
      catch: () => new ParseResult.Type(ast, input, "Invalid UUID"),
    }),
  encode: (input, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(UUIDLiteralEncoded)(input),
      catch: () => new ParseResult.Type(ast, input, "Invalid UUID"),
    }),
}).annotations(
  $I.annotations("UUIDLiteral", {
    identifier: "UUIDLiteral",
    title: "UUID Literal",
    description: "Transform schema that bridges `S.UUID` with literal encodings.",
  })
);

/**
 * Bidirectional schema bridging `S.UUID` into the literal encoded template.
 *
 * Enables parsing raw UUID strings into Effect schemas while retaining a typed
 * factory that emits deterministic literal encodings for JSON Schema output.
 *
 * @category Identity/EntityId
 * @since 0.1.0
 * @example
 * import { UUIDLiteral } from "@beep/schema/identity/entity-id/uuid";
 * import * as S from "effect/Schema";
 *
 * const decode = S.decodeSync(UUIDLiteral);
 * const uuidValue = decode("8a2422be-a8f6-4c83-bd4c-af5e0f7d8168");
 */
export class UUIDLiteral extends UUIDLiteralBase {
  /**
   * Generates a valid UUID literal value.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  static readonly create: () => UUIDLiteral.Type = () => UUIDLiteralEncoded.create();
}

/**
 * Namespace describing runtime and encoded types for {@link UUIDLiteral}.
 *
 * @category Identity/EntityId
 * @since 0.1.0
 * @example
 * import type { UUIDLiteral } from "@beep/schema/identity/entity-id/uuid";
 *
 * type Value = UUIDLiteral.Type;
 */
export declare namespace UUIDLiteral {
  /**
   * Runtime type produced by {@link UUIDLiteral}.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof UUIDLiteral>;
  /**
   * Encoded representation emitted by {@link UUIDLiteral}.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof UUIDLiteral>;
}
