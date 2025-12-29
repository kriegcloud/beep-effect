/**
 * Option field helpers for struct schemas.
 *
 * Provides utilities to transform optional/nullable fields into Effect Option types.
 * This is particularly useful when bridging database schemas (which use null/undefined)
 * with Effect-first application logic (which uses Option).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeFieldOption } from "@beep/schema/core/generics";
 *
 * const UserSchema = S.Struct({
 *   id: S.String,
 *   nickname: makeFieldOption(S.String),
 *   age: makeFieldOption(S.Number)
 * });
 *
 * // Decoded type: { id: string, nickname: Option<string>, age: Option<number> }
 * // Encoded type: { id: string, nickname: string | null, age: number | null }
 *
 * @category Core/Generics
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import type * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SchemaId.create("core/generics/option-fields");

/**
 * Namespace for type utilities related to Option fields.
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export declare namespace OptionFields {
  /**
   * The decoded type of a makeFieldOption schema (Option<A>).
   *
   * @example
   * import * as S from "effect/Schema";
   * import { makeFieldOption, OptionFields } from "@beep/schema/core/generics";
   *
   * const NameOption = makeFieldOption(S.String);
   * type Name = OptionFields.Type<typeof NameOption>; // Option<string>
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Type<F extends S.Schema.All> = O.Option<S.Schema.Type<F>>;

  /**
   * The encoded type of a makeFieldOption schema (I | null).
   *
   * @example
   * import * as S from "effect/Schema";
   * import { makeFieldOption, OptionFields } from "@beep/schema/core/generics";
   *
   * const NameOption = makeFieldOption(S.String);
   * type NameEncoded = OptionFields.Encoded<typeof NameOption>; // string | null
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Encoded<F extends S.Schema.All> = S.Schema.Encoded<F> | null;
}

/**
 * Wraps a schema to decode from nullish values to Option.
 *
 * This is a convenience wrapper around `S.OptionFromNullishOr` with consistent
 * null-encoding behavior (Option.none() encodes to null).
 *
 * - Decoding: `null | undefined | I` → `Option<A>`
 * - Encoding: `Option<A>` → `I | null`
 *
 * @example
 * import * as S from "effect/Schema";
 * import * as O from "effect/Option";
 * import { makeFieldOption } from "@beep/schema/core/generics";
 *
 * const schema = S.Struct({
 *   name: makeFieldOption(S.String),
 *   age: makeFieldOption(S.Number)
 * });
 *
 * const decode = S.decodeUnknownSync(schema);
 * const encode = S.encodeSync(schema);
 *
 * // Decoding
 * decode({ name: "Alice", age: null });
 * // { name: Option.some("Alice"), age: Option.none() }
 *
 * decode({ name: undefined, age: 30 });
 * // { name: Option.none(), age: Option.some(30) }
 *
 * // Encoding
 * encode({ name: O.some("Bob"), age: O.none() });
 * // { name: "Bob", age: null }
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export const makeFieldOption = <A, I, R>(schema: S.Schema<A, I, R>): S.OptionFromNullishOr<S.Schema<A, I, R>> =>
  S.OptionFromNullishOr(schema, null).annotations(
    $I.annotations("makeFieldOption", {
      description: "Optional field that decodes to Effect Option type",
    })
  );
