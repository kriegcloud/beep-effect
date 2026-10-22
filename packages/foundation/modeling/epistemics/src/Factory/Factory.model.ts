/**
 * Shared parameter types for `@beep/epistemics` schema factories.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { IdentityComposer } from "@beep/identity";
import type * as S from "effect/Schema";

/**
 * Schema for a caller-supplied identifier whose decoded type is a string or a
 * number.
 *
 * **Details**
 *
 * Branded string ids (`S.String.pipe(S.brand("..."))`) and branded integer
 * ids (number-encoded entity ids) are both assignable, so a builder generic
 * `<Id extends IdCodec>` keeps the caller's brand and encoding. Builders take
 * only the schema; behavior that orders ids or generates them takes explicit
 * `order` / `make` inputs from the binding, so foundation never assumes an
 * encoding or inspects a brand.
 *
 * **Example** (Accept branded string and number ids)
 *
 * ```ts
 * import type { IdCodec } from "@beep/epistemics/Factory"
 * import * as S from "effect/Schema"
 *
 * const PartyId: IdCodec = S.String.pipe(S.brand("PartyId"))
 * const RowId: IdCodec = S.Int.pipe(S.brand("RowId"))
 * console.log(S.is(PartyId)("party-1"), S.is(RowId)(1)) // true true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type IdCodec = S.Top & { readonly Type: string | number };

/**
 * Identity composer a factory annotates its schemas with.
 *
 * **Details**
 *
 * The caller passes its own composer, for example
 * `$EpistemicDomainId.create("values/EdgeEndpoint/EdgeEndpoint.model")`, so
 * schema identifiers stay caller-owned and a second binding gets distinct
 * identifiers. Any `$XId.create(...)` composer is assignable.
 *
 * **Example** (Pass a package composer as a factory identity)
 *
 * ```ts
 * import type { SchemaIdentity } from "@beep/epistemics/Factory"
 * import { $ScratchpadId } from "@beep/identity/packages"
 *
 * const $I: SchemaIdentity = $ScratchpadId.create("party/Claim")
 * console.log($I.make("Claim"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SchemaIdentity = IdentityComposer<string>;

/**
 * A caller-bound schema seen through its decoded, encoded and constructor
 * input types.
 *
 * **Details**
 *
 * Factories whose own logic reads the values of a caller-bound schema type
 * that parameter as a `FieldSchema`. Its field flags stay the non-generic ones
 * of `S.Top`, so a struct built from it keeps a resolvable `Type` inside the
 * generic factory and checks and behavior can read its fields. Every type is inferred from the
 * bound schema, so a binding's result types equal the ones a direct
 * definition would have. `Rebuilt` is what `annotateKey` returns: the schema
 * itself for brands and plain schemas, the underlying struct for an
 * `S.Opaque` class.
 *
 * **Example** (Infer a bound class through FieldSchema)
 *
 * ```ts
 * import type { FieldSchema } from "@beep/epistemics/Factory"
 * import * as S from "effect/Schema"
 *
 * const versionOf = <T extends { readonly version: number }, E, M>(schema: FieldSchema<T, E, M>) =>
 *   (input: M): number => schema.make(input).version
 *
 * class Ref extends S.Opaque<Ref, { readonly brand: unique symbol }>()(S.Struct({ version: S.Finite })) {}
 * console.log(versionOf(Ref)({ version: 2 })) // 2
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FieldSchema<T, E = T, MakeIn = T, Rebuilt extends S.Top = S.Top> extends S.Top {
  readonly "~type.make": MakeIn;
  readonly "~type.make.in": MakeIn;
  readonly DecodingServices: never;
  readonly Encoded: E;
  readonly EncodingServices: never;
  readonly Rebuild: Rebuilt;
  readonly Type: T;
}

/**
 * A {@link FieldSchema} whose `annotateKey` result keeps the same types, as
 * for brands, ids and other non-class schemas.
 *
 * **Example** (Accept a branded id as a keyed field)
 *
 * ```ts
 * import type { KeyedFieldSchema } from "@beep/epistemics/Factory"
 * import * as S from "effect/Schema"
 *
 * const describeKey = <T, E, M>(field: KeyedFieldSchema<T, E, M>) => field.annotateKey({ description: "Row id." })
 *
 * const RowId = S.Int.pipe(S.brand("RowId"))
 * console.log(S.is(describeKey(RowId))(1)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyedFieldSchema<T, E = T, MakeIn = T> = FieldSchema<T, E, MakeIn, FieldSchema<T, E, MakeIn>>;

/**
 * Configuration of a factory that needs only the caller's identity composer.
 *
 * **Example** (Bind an identity-only factory config)
 *
 * ```ts
 * import type { IdentityConfig } from "@beep/epistemics/Factory"
 * import { $ScratchpadId } from "@beep/identity/packages"
 *
 * const config: IdentityConfig = { $I: $ScratchpadId.create("party/Contradiction") }
 * console.log(config.$I.make("Contradiction"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type IdentityConfig = { readonly $I: SchemaIdentity };
