/**
 * OSDK instance and property-conversion generic helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkObjectFrom
 */
import type { DefaultToFalse, OsdkObjectLinksObject } from "./definitions/LinkDefinitions.js";
import type { OsdkBase } from "./OsdkBase.js";
import type { NullabilityAdherence, ObjectSetArgs } from "./object/FetchPageArgs.js";
import type { UnionIfTrue } from "./object/FetchPageResult.js";
import type { PropertySecurity } from "./object/PropertySecurity.js";
import type { InterfaceDefinition, InterfaceMetadata } from "./ontology/InterfaceDefinition.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "./ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata, ObjectMetadata, ObjectTypeDefinition } from "./ontology/ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "./ontology/SimplePropertyDef.js";

type SpecialOsdkPropParams = "$all" | "$rid" | "$strict" | "$notStrict";
type ValidOsdkPropParams<Q extends ObjectOrInterfaceDefinition> = SpecialOsdkPropParams | PropertyKeys<Q>;

/**
 * Resolve apiName metadata as a string literal.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ApiNameAsString<T extends ObjectOrInterfaceDefinition> = CompileTimeMetadata<T>["apiName"];

/**
 * Resolve selected property keys, handling special `$all` option.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JustProps<T extends ObjectOrInterfaceDefinition, P extends ValidOsdkPropParams<T>> = P extends "$all"
  ? PropertyKeys<T>
  : Exclude<P, SpecialOsdkPropParams>;

/**
 * Map interface property names to object property names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PropMapToObject<FROM extends ObjectOrInterfaceDefinition, TO extends ObjectTypeDefinition> = NonNullable<
  CompileTimeMetadata<TO>["interfaceMap"]
>[ApiNameAsString<FROM>];

/**
 * Convert selected properties from source definition to object target definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MapPropNamesToObjectType<
  FROM extends ObjectOrInterfaceDefinition,
  TO extends ObjectTypeDefinition,
  P extends ValidOsdkPropParams<FROM>,
  OPTIONS extends never | "$rid" | "$allBaseProperties" | "$propertySecurities" = never,
> = "$allBaseProperties" extends OPTIONS
  ? PropertyKeys<FROM> extends P
    ? PropertyKeys<TO>
    : PropMapToObject<FROM, TO>[JustProps<FROM, P> & keyof PropMapToObject<FROM, TO>]
  : PropMapToObject<FROM, TO>[JustProps<FROM, P> & keyof PropMapToObject<FROM, TO>];

type NamespaceOf<S extends string> = S extends `${infer Before}.${infer After}`
  ? After extends `${string}.${string}`
    ? `${Before}.${NamespaceOf<After>}`
    : Before
  : never;

type MaybeStripNamespaces<
  S extends string,
  TO extends InterfaceDefinition,
> = S extends `${NamespaceOf<S>}.${infer Rest}`
  ? NamespaceOf<S> extends NamespaceOf<ApiNameAsString<TO>>
    ? Rest
    : S
  : S;

/**
 * Map object property names to interface property names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PropMapToInterface<FROM extends ObjectTypeDefinition, TO extends InterfaceDefinition> = NonNullable<
  CompileTimeMetadata<FROM>["inverseInterfaceMap"]
>[ApiNameAsString<TO>];

/**
 * Convert selected properties from object definition to interface definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MapPropNamesToInterface<
  FROM extends ObjectTypeDefinition,
  TO extends InterfaceDefinition,
  P extends ValidOsdkPropParams<FROM>,
> = MaybeStripNamespaces<PropMapToInterface<FROM, TO>[JustProps<FROM, P> & keyof PropMapToInterface<FROM, TO>], TO>;

/**
 * Convert selected property keys across object/interface casts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ConvertProps<
  FROM extends ObjectOrInterfaceDefinition,
  TO extends ValidToFrom<FROM>,
  P extends ValidOsdkPropParams<FROM>,
  OPTIONS extends never | "$rid" | "$allBaseProperties" | "$propertySecurities" = never,
> = TO extends FROM
  ? P
  : TO extends ObjectTypeDefinition
    ? UnionIfTrue<MapPropNamesToObjectType<FROM, TO, P, OPTIONS>, P extends "$rid" ? true : false, "$rid">
    : TO extends InterfaceDefinition
      ? FROM extends ObjectTypeDefinition
        ? UnionIfTrue<MapPropNamesToInterface<FROM, TO, P>, P extends "$rid" ? true : false, "$rid">
        : never
      : never;

/**
 * Valid conversion targets for `$as` object/interface casting.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ValidToFrom<FROM extends ObjectOrInterfaceDefinition> = FROM extends InterfaceDefinition
  ? ObjectOrInterfaceDefinition
  : InterfaceDefinition;

/**
 * Detect whether a type resolves to `never`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type IsNever<T> = [T] extends [never] ? true : false;

type ExtractPropsKeysFromOldPropsStyle<
  Q extends ObjectOrInterfaceDefinition,
  P extends ValidOsdkPropParams<Q>,
> = P extends "$all" ? PropertyKeys<Q> : Exclude<P, "$strict" | "$notStrict" | "$rid">;

/**
 * Detect whether a type resolves to `any`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type IsAny<T> = unknown extends T ? ([keyof T] extends [never] ? false : true) : false;

/**
 * Resolve selected property keys with `never` / `any` fallback semantics.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GetPropsKeys<Q extends ObjectOrInterfaceDefinition, P extends PropertyKeys<Q>, N extends boolean = false> =
  IsNever<P> extends true ? (N extends true ? never : PropertyKeys<Q>) : IsAny<P> extends true ? PropertyKeys<Q> : P;

/**
 * Backward-compatible `Osdk` alias helper.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Osdk<
  Q extends ObjectOrInterfaceDefinition,
  OPTIONS extends string = never,
  P extends PropertyKeys<Q> = PropertyKeys<Q>,
> =
  IsNever<OPTIONS> extends true
    ? Osdk.Instance<Q, never, P>
    : IsAny<OPTIONS> extends true
      ? Osdk.Instance<Q, never, P>
      : IsNever<Exclude<OPTIONS, "$rid">> extends true
        ? Osdk.Instance<Q, OPTIONS & "$rid", P>
        : Osdk.Instance<Q, "$rid" extends OPTIONS ? "$rid" : never, ExtractPropsKeysFromOldPropsStyle<Q, OPTIONS>>;

/**
 * Conditionally add `$score` when ordered by relevance.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MaybeScore<
  T,
  ORDER_BY_OPTIONS extends ObjectSetArgs.OrderByOptions<string>,
> = ORDER_BY_OPTIONS extends "relevance" ? T & { $score: number } : T;

type RuntimeProps<Q extends ObjectOrInterfaceDefinition> =
  NonNullable<CompileTimeMetadata<Q>["props"]> extends Record<string, unknown>
    ? NonNullable<CompileTimeMetadata<Q>["props"]>
    : { readonly [K in PropertyKeys<Q>]: unknown };

type AnyOptionInstance<Q extends ObjectOrInterfaceDefinition, P extends PropertyKeys<Q>> =
  | Osdk.Instance<Q, never, P>
  | Osdk.Instance<Q, "$rid", P>
  | Osdk.Instance<Q, "$allBaseProperties", P>
  | Osdk.Instance<Q, "$propertySecurities", P>
  | Osdk.Instance<Q, "$rid" | "$allBaseProperties", P>
  | Osdk.Instance<Q, "$rid" | "$propertySecurities", P>
  | Osdk.Instance<Q, "$allBaseProperties" | "$propertySecurities", P>
  | Osdk.Instance<Q, "$rid" | "$allBaseProperties" | "$propertySecurities", P>;

/**
 * OSDK instance namespace.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export namespace Osdk {
  /**
   * Canonical OSDK instance shape derived from compile-time metadata.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type Instance<
    Q extends ObjectOrInterfaceDefinition,
    OPTIONS extends never | "$rid" | "$allBaseProperties" | "$propertySecurities" = never,
    P extends PropertyKeys<Q> = PropertyKeys<Q>,
    R extends Record<string, SimplePropertyDef> = {},
  > = OsdkBase<Q> &
    Pick<RuntimeProps<Q>, GetPropsKeys<Q, P, [R] extends [{}] ? false : true>> &
    ([R] extends [never] ? {} : { [A in keyof R]: SimplePropertyDef.ToRuntimeProperty<R[A]> }) & {
      readonly $link: Q extends { linksType?: unknown }
        ? Q["linksType"]
        : Q extends ObjectOrInterfaceDefinition
          ? OsdkObjectLinksObject<Q>
          : never;

      readonly $as: <NEW_Q extends ValidToFrom<Q>>(
        type: NEW_Q | string
      ) => Osdk.Instance<NEW_Q, OPTIONS, ConvertProps<Q, NEW_Q, P, OPTIONS>>;

      readonly $clone: <NEW_PROPS extends PropertyKeys<Q>>(
        updatedObject?:
          | AnyOptionInstance<Q, NEW_PROPS>
          | {
              [K in NEW_PROPS]?: RuntimeProps<Q>[K];
            }
      ) => Osdk.Instance<Q, OPTIONS, P | NEW_PROPS>;

      readonly $__EXPERIMENTAL__NOT_SUPPORTED_YET__metadata: Q extends ObjectTypeDefinition
        ? {
            ObjectMetadata: ObjectMetadata;
          }
        : {
            ObjectMetadata: ObjectMetadata;
            InterfaceMetadata: InterfaceMetadata;
          };

      readonly $__EXPERIMENTAL__NOT_SUPPORTED_YET__getFormattedValue: <PropertyApiName extends PropertyKeys<Q>>(
        propertyApiName: PropertyApiName,
        options?: { locale?: string; timezoneId?: string }
      ) => string | undefined;
    } & (IsNever<OPTIONS> extends true
      ? {}
      : IsAny<OPTIONS> extends true
        ? {}
        : "$propertySecurities" extends OPTIONS
          ? {
              readonly $propertySecurities: ObjectPropertySecurities<
                Q,
                GetPropsKeys<Q, P, [R] extends [{}] ? false : true>
              >;
            }
          : {}) &
    (IsNever<OPTIONS> extends true
      ? {}
      : IsAny<OPTIONS> extends true
        ? {}
        : "$rid" extends OPTIONS
          ? { readonly $rid: string }
          : {});
}

/**
 * Extract strict-mode option token from nullability adherence.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractStrictOption<S extends NullabilityAdherence> =
  IsNever<S> extends true ? never : "throw" extends S ? never : "drop" extends S ? never : "$notStrict";

/**
 * Extract `$rid` option token from include-rid boolean.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractRidOption<R extends boolean> =
  IsNever<R> extends true ? never : DefaultToFalse<R> extends false ? never : "$rid";

/**
 * Extract property-security option token from boolean flag.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractPropertySecurityOption<S extends boolean> =
  IsNever<S> extends true ? never : DefaultToFalse<S> extends false ? never : "$propertySecurities";

/**
 * Extract all-base-properties option token from boolean flag.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractAllPropertiesOption<T extends boolean> =
  IsNever<T> extends true ? never : DefaultToFalse<T> extends false ? never : "$allBaseProperties";

/**
 * Convert fetch/select option flags into instance option tokens.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ExtractOptions<
  RID extends boolean,
  _UNUSED extends NullabilityAdherence = NullabilityAdherence.Default,
  ALL_PROPERTIES extends boolean = false,
  PROPERTY_SECURITIES extends boolean = false,
> =
  | ExtractRidOption<RID>
  | ExtractAllPropertiesOption<ALL_PROPERTIES>
  | ExtractPropertySecurityOption<PROPERTY_SECURITIES>;

type ObjectPropertySecurities<Q extends ObjectOrInterfaceDefinition, T extends PropertyKeys<Q>> = {
  [K in T]: CompileTimeMetadata<Q>["properties"][K]["multiplicity"] extends true
    ? PropertySecurity[][]
    : PropertySecurity[];
};
