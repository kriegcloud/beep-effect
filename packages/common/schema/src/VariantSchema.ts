/**
 * Multi-variant schema system for defining field sets that project to different schemas per variant.
 *
 * The core API is {@link make}, which accepts a list of variant names and returns
 * `Class`, `Field`, `Struct`, `Union`, `extract`, and `fieldEvolve` constructors
 * scoped to those variants.
 *
 * @module
 * @since 0.0.0
 */

import type { TUnsafe } from "@beep/types";
import {
  Effect,
  Function as Fn,
  SchemaGetter as Getter,
  Pipeable,
  Struct as Struct_,
  SchemaTransformation as Transformation,
} from "effect";
import * as A from "effect/Array";
import type { Brand } from "effect/Brand";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
/**
 * Unique symbol key used to store variant field records on `Struct` instances.
 *
 * @since 0.0.0
 * @category symbols
 */
export const TypeId = "~effect/schema/VariantSchema";

const cacheSymbol = Symbol.for(`${TypeId}/cache`);

/**
 * A pipeable container holding variant-aware fields keyed by {@link TypeId}.
 *
 * @since 0.0.0
 * @category models
 */
export interface Struct<in out A extends Field.Fields> extends Pipeable.Pipeable {
  readonly [TypeId]: A;
  /** @internal */
  [cacheSymbol]?: Record<string, S.Top>;
}

/**
 * Type guard for variant `Struct` instances.
 *
 * @since 0.0.0
 * @category guards
 */
export const isStruct = (u: unknown): u is Struct<TUnsafe.Any> => P.hasProperty(u, TypeId);

/**
 * @since 0.0.0
 * @category models
 */
export declare namespace Struct {
  /**
   * @since 0.0.0
   * @category models
   */
  export type Any = Readonly<{ readonly [TypeId]: TUnsafe.Any }>;

  /**
   * @since 0.0.0
   * @category models
   */
  export type Fields = Readonly<{
    readonly [key: string]: S.Top | Field<TUnsafe.Any> | Struct<TUnsafe.Any> | undefined;
  }>;

  /**
   * @since 0.0.0
   * @category models
   */
  export type Validate<A, Variant extends string> = {
    readonly [K in keyof A]: A[K] extends { readonly [TypeId]: infer _ }
      ? Validate<A[K], Variant>
      : A[K] extends Field<infer Config>
        ? [keyof Config] extends [Variant]
          ? {}
          : "field must have valid variants"
        : {};
  };
}

const FieldTypeId = "~effect/schema/VariantSchema/Field";

/**
 * A variant-aware field mapping variant keys to their respective schemas.
 *
 * @since 0.0.0
 * @category models
 */
export interface Field<in out A extends Field.Config> extends Pipeable.Pipeable {
  readonly schemas: A;
  readonly [FieldTypeId]: typeof FieldTypeId;
}

/**
 * Type guard for variant `Field` instances.
 *
 * @since 0.0.0
 * @category guards
 */
export const isField = (u: unknown): u is Field<TUnsafe.Any> => P.hasProperty(u, FieldTypeId);

/**
 * @since 0.0.0
 * @category models
 */
export declare namespace Field {
  /**
   * @since 0.0.0
   * @category models
   */
  export type Any = Readonly<{ readonly [FieldTypeId]: typeof FieldTypeId }>;

  /**
   * @since 0.0.0
   * @category models
   */
  export type Config = Readonly<{
    readonly [key: string]: S.Top | undefined;
  }>;

  /**
   * @since 0.0.0
   * @category models
   */
  export type ConfigWithKeys<K extends string> = {
    readonly [P in K]?: S.Top;
  };

  /**
   * @since 0.0.0
   * @category models
   */
  export type Fields = Readonly<{
    readonly [key: string]: S.Top | Field<TUnsafe.Any> | Struct<TUnsafe.Any> | undefined;
  }>;
}

/**
 * Extract the fields object for a specific variant from a `Struct.Fields` record.
 *
 * @since 0.0.0
 * @category extractors
 */
export type ExtractFields<V extends string, Fields extends Struct.Fields, IsDefault = false> = {
  readonly [K in keyof Fields as [Fields[K]] extends [Field<infer Config>]
    ? V extends keyof Config
      ? K
      : never
    : K]: [Fields[K]] extends [Struct<infer _>]
    ? Extract<V, Fields[K], IsDefault>
    : [Fields[K]] extends [Field<infer Config>]
      ? [Config[V]] extends [S.Top]
        ? Config[V]
        : never
      : [Fields[K]] extends [S.Top]
        ? Fields[K]
        : never;
};

/**
 * Extract a concrete `S.Struct` schema for a specific variant from a variant `Struct`.
 *
 * @since 0.0.0
 * @category extractors
 */
export type Extract<V extends string, A extends Struct<TUnsafe.Any>, IsDefault = false> = [A] extends [
  Struct<infer Fields>,
]
  ? IsDefault extends true
    ? [A] extends [S.Top]
      ? A
      : S.Struct<Struct_.Simplify<ExtractFields<V, Fields>>>
    : S.Struct<Struct_.Simplify<ExtractFields<V, Fields>>>
  : never;

const extract: {
  <V extends string, const IsDefault extends boolean = false>(
    variant: V,
    options?: {
      readonly isDefault?: IsDefault | undefined;
    }
  ): <A extends Struct<TUnsafe.Any>>(self: A) => Extract<V, A, IsDefault>;
  <V extends string, A extends Struct<TUnsafe.Any>, const IsDefault extends boolean = false>(
    self: A,
    variant: V,
    options?: {
      readonly isDefault?: IsDefault | undefined;
    }
  ): Extract<V, A, IsDefault>;
} = Fn.dual(
  (args) => isStruct(args[0]),
  <V extends string, A extends Struct<TUnsafe.Any>>(
    self: A,
    variant: V,
    options?: {
      readonly isDefault?: boolean | undefined;
    }
  ): Extract<V, A> => {
    const cache = self[cacheSymbol] ?? (self[cacheSymbol] = {});
    const cacheKey = options?.isDefault === true ? "__default" : variant;
    if (cache[cacheKey] !== undefined) {
      return cache[cacheKey] as TUnsafe.Any;
    }
    const fields: Record<string, TUnsafe.Any> = {};
    for (const key of R.keys(self[TypeId])) {
      const value = self[TypeId][key];
      if (TypeId in value) {
        if (options?.isDefault === true && S.isSchema(value)) {
          fields[key] = value;
        } else {
          fields[key] = extract(value, variant);
        }
      } else if (FieldTypeId in value) {
        if (variant in value.schemas) {
          fields[key] = value.schemas[variant];
        }
      } else {
        fields[key] = value;
      }
    }
    return (cache[cacheKey] = S.Struct(fields) as TUnsafe.Any);
  }
);

/**
 * Access the raw variant field record from a `Struct`.
 *
 * @since 0.0.0
 * @category accessors
 */
export const fields = <A extends Struct<TUnsafe.Any>>(self: A): A[typeof TypeId] => self[TypeId];

/**
 * Interface for a variant-aware model class that extends `S.Class` with variant struct support.
 *
 * @since 0.0.0
 * @category models
 */
export interface Class<
  Self,
  Fields extends Struct.Fields,
  S extends S.Top & {
    readonly fields: S.Struct.Fields;
  },
> extends S.Bottom<
      Self,
      S["Encoded"],
      S["DecodingServices"],
      S["EncodingServices"],
      AST.Declaration,
      S.decodeTo<S.declareConstructor<Self, S["Encoded"], readonly [S], S["Iso"]>, S>,
      S["~type.make.in"],
      S["Iso"],
      readonly [S],
      Self,
      S["~type.mutability"],
      S["~type.optionality"],
      S["~type.constructor.default"],
      S["~encoded.mutability"],
      S["~encoded.optionality"]
    >,
    Struct<Struct_.Simplify<Fields>> {
  readonly fields: S["fields"];

  make<Args extends Array<TUnsafe.Any>, X>(this: { new (...args: Args): X }, ...args: Args): X;
  new (
    props: S["~type.make.in"],
    options?:
      | {
          readonly disableValidation?: boolean;
        }
      | undefined
  ): S["Type"];
}

type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Class<Self>()(${Params}{ ... })\``;

type MergeFields<Defaults extends Struct.Fields, Fields extends Struct.Fields> = Struct_.Simplify<
  Omit<Defaults, keyof Fields> & Fields
>;

type ClassAnnotations<Self, Default extends string, Fields extends Struct.Fields> = S.Annotations.Declaration<
  Self,
  readonly [S.Struct<ExtractFields<Default, Fields, true>>]
>;

type ClassShape<Self, Variants extends string, Default extends Variants, Fields extends Struct.Fields> = [
  Self,
] extends [never]
  ? MissingSelfGeneric
  : Class<Self, Fields, S.Struct<ExtractFields<Default, Fields, true>>> & {
      readonly [V in Variants]: Extract<V, Struct<Fields>>;
    };

/**
 * A discriminated union of variant structs.
 *
 * @since 0.0.0
 * @category models
 */
export interface Union<Members extends ReadonlyArray<Struct<TUnsafe.Any>>>
  extends S.Union<{
    readonly [K in keyof Members]: [Members[K]] extends [S.Top] ? Members[K] : never;
  }> {}

/**
 * @since 0.0.0
 * @category models
 */
export declare namespace Union {
  /**
   * @since 0.0.0
   * @category models
   */
  export type Variants<Members extends ReadonlyArray<Struct<TUnsafe.Any>>, Variants extends string> = {
    readonly [Variant in Variants]: S.Union<{
      [K in keyof Members]: Extract<Variant, Members[K]>;
    }>;
  };
}

/**
 * Create a variant schema toolkit scoped to the provided variant names.
 *
 * Returns `Class`, `Field`, `FieldOnly`, `FieldExcept`, `fieldEvolve`,
 * `Struct`, `Union`, and `extract` helpers, all constrained to the
 * declared variant set.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as VariantSchema from "@beep/schema/VariantSchema"
 *
 * const { Class, Field } = VariantSchema.make({
 * 
 * 
 * })
 *
 * class Item extends Class<Item>("Item")({
 * 
 * 
 * }) {}
 *
 * void Item
 * ```
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as VariantSchema from "@beep/schema/VariantSchema"
 *
 * const { Struct, extract } = VariantSchema.make({
 * 
 * 
 * })
 *
 * const vs = Struct({
 * 
 * })
 *
 * const schemaA = extract(vs, "a")
 * void schemaA
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = <const Variants extends ReadonlyArray<string>, const Default extends Variants[number]>(options: {
  readonly variants: Variants;
  readonly defaultVariant: Default;
}): {
  readonly Struct: <const A extends Struct.Fields>(fields: A & Struct.Validate<A, Variants[number]>) => Struct<A>;
  readonly Field: <const A extends Field.ConfigWithKeys<Variants[number]>>(
    config: A & { readonly [K in Exclude<keyof A, Variants[number]>]: never }
  ) => Field<A>;
  readonly FieldOnly: <const Keys extends ReadonlyArray<Variants[number]>>(
    keys: Keys
  ) => <S extends S.Top>(schema: S) => Field<{ readonly [K in Keys[number]]: S }>;
  readonly FieldExcept: <const Keys extends ReadonlyArray<Variants[number]>>(
    keys: Keys
  ) => <S extends S.Top>(schema: S) => Field<{ readonly [K in Exclude<Variants[number], Keys[number]>]: S }>;
  readonly fieldEvolve: {
    <
      Self extends Field<TUnsafe.Any> | S.Top,
      const Mapping extends Self extends Field<infer S>
        ? { readonly [K in keyof S]?: (variant: S[K]) => S.Top }
        : { readonly [K in Variants[number]]?: (variant: Self) => S.Top },
    >(
      f: Mapping
    ): (self: Self) => Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends (arg: TUnsafe.Any) => TUnsafe.Any
                ? ReturnType<Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends (arg: TUnsafe.Any) => TUnsafe.Any
                ? ReturnType<Mapping[K]>
                : Self
              : Self;
          }
    >;
    <
      Self extends Field<TUnsafe.Any> | S.Top,
      const Mapping extends Self extends Field<infer S>
        ? {
            readonly [K in keyof S]?: (variant: S[K]) => S.Top;
          }
        : { readonly [K in Variants[number]]?: (variant: Self) => S.Top },
    >(
      self: Self,
      f: Mapping
    ): Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends (arg: TUnsafe.Any) => TUnsafe.Any
                ? ReturnType<Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends (arg: TUnsafe.Any) => TUnsafe.Any
                ? ReturnType<Mapping[K]>
                : Self
              : Self;
          }
    >;
  };
  readonly Class: <Self = never>(
    identifier: string
  ) => <const Fields extends Struct.Fields>(
    fields: Fields & Struct.Validate<Fields, Variants[number]>,
    annotations?: ClassAnnotations<Self, Default, Fields> | undefined
  ) => ClassShape<Self, Variants[number], Default, Fields>;
  readonly ClassFactory: <const DefaultFields extends Struct.Fields>(
    defaultFields: DefaultFields & Struct.Validate<DefaultFields, Variants[number]>
  ) => <Self = never>(
    identifier: string
  ) => <const Fields extends Struct.Fields>(
    fields: Fields & Struct.Validate<Fields, Variants[number]>,
    annotations?: ClassAnnotations<Self, Default, MergeFields<DefaultFields, Fields>> | undefined
  ) => ClassShape<Self, Variants[number], Default, MergeFields<DefaultFields, Fields>>;
  readonly Union: <const Members extends ReadonlyArray<Struct<TUnsafe.Any>>>(
    members: Members
  ) => Union<Members> & Union.Variants<Members, Variants[number]>;
  readonly extract: {
    <V extends Variants[number]>(
      variant: V
    ): <A extends Struct<TUnsafe.Any>>(self: A) => Extract<V, A, V extends Default ? true : false>;
    <V extends Variants[number], A extends Struct<TUnsafe.Any>>(
      self: A,
      variant: V
    ): Extract<V, A, V extends Default ? true : false>;
  };
} => {
  function Class<Self>(identifier: string) {
    return (fields: Struct.Fields, annotations?: ClassAnnotations<Self, Default, typeof fields>) => {
      const variantStruct = Struct(fields);
      const schema = extract(variantStruct, options.defaultVariant, {
        isDefault: true,
      });
      const SClass = S.Class as TUnsafe.Any;
      class Base extends SClass(identifier)(schema.fields, annotations) {
        static [TypeId] = fields;
      }
      for (const variant of options.variants) {
        Object.defineProperty(Base, variant, {
          value: extract(variantStruct, variant).annotate({
            id: `${identifier}.${variant}`,
            title: `${identifier}.${variant}`,
          }),
        });
      }
      return Base;
    };
  }
  function mergeFields<const DefaultFields extends Struct.Fields, const Fields extends Struct.Fields>(
    defaultFields: DefaultFields,
    fields: Fields
  ): MergeFields<DefaultFields, Fields> {
    return {
      ...defaultFields,
      ...fields,
    } as TUnsafe.Any;
  }
  function ClassFactory<const DefaultFields extends Struct.Fields>(
    defaultFields: DefaultFields & Struct.Validate<DefaultFields, Variants[number]>
  ) {
    return function ClassWithDefaults<Self = never>(identifier: string) {
      return <const Fields extends Struct.Fields>(
        fields: Fields & Struct.Validate<Fields, Variants[number]>,
        annotations?: ClassAnnotations<Self, Default, MergeFields<DefaultFields, Fields>>
      ): ClassShape<Self, Variants[number], Default, MergeFields<DefaultFields, Fields>> => {
        const ClassBuilder = Class<Self>(identifier) as TUnsafe.Any;
        return ClassBuilder(mergeFields(defaultFields, fields), annotations) as TUnsafe.Any;
      };
    };
  }
  function FieldOnly<const Keys extends ReadonlyArray<Variants[number]>>(keys: Keys) {
    return <S extends S.Top>(schema: S) => {
      const obj: Record<string, S> = {};
      for (const key of keys) {
        obj[key] = schema;
      }
      return Field(obj);
    };
  }
  function FieldExcept<const Keys extends ReadonlyArray<Variants[number]>>(keys: Keys) {
    return <S extends S.Top>(schema: S) => {
      const obj: Record<string, S> = {};
      for (const variant of options.variants) {
        if (!keys.includes(variant)) {
          obj[variant] = schema;
        }
      }
      return Field(obj);
    };
  }
  function UnionVariants(members: ReadonlyArray<Struct<TUnsafe.Any>>) {
    return Union(members, options.variants);
  }
  const fieldEvolve = Fn.dual(
    2,
    (self: Field<TUnsafe.Any> | S.Top, f: Record<string, (schema: S.Top) => S.Top>): Field<TUnsafe.Any> => {
      const field = isField(self)
        ? self
        : Field(R.fromEntries(A.map(options.variants, (variant) => [variant, self] as const)));
      return Field(Struct_.evolve(field.schemas, f));
    }
  );
  const extractVariants = Fn.dual(
    2,
    (self: Struct<TUnsafe.Any>, variant: string): TUnsafe.Any =>
      extract(self, variant, {
        isDefault: variant === options.defaultVariant,
      })
  );
  return {
    Struct,
    Field,
    FieldOnly,
    FieldExcept,
    Class,
    ClassFactory,
    Union: UnionVariants,
    fieldEvolve,
    // fieldFromKey,
    extract: extractVariants,
  } as TUnsafe.Any;
};

/**
 * Wrap a value so it overrides the default produced by an {@link Overridable} field.
 *
 * @since 0.0.0
 * @category overridable
 */
export const Override = <A>(value: A): A & Brand<"Override"> => value as TUnsafe.Any;

/**
 * A schema whose decoded type is optional with a default value injected during encoding.
 *
 * @since 0.0.0
 * @category overridable
 */
export interface Overridable<S extends S.Top & S.WithoutConstructorDefault>
  extends S.Bottom<
    (S["Type"] & Brand<"Override">) | undefined,
    S["Encoded"],
    S["DecodingServices"],
    S["EncodingServices"],
    S["ast"],
    Overridable<S>,
    S["~type.make.in"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.parameters"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.mutability"],
    "optional",
    "with-default",
    S["~encoded.mutability"],
    S["~encoded.optionality"]
  > {}

/**
 * Build an `Overridable` schema that falls back to `defaultValue` when no override is provided.
 *
 * @since 0.0.0
 * @category overridable
 */
export const Overridable = <S extends S.Top & S.WithoutConstructorDefault>(
  schema: S,
  options: {
    readonly defaultValue: Effect.Effect<S["~type.make.in"]>;
  }
): Overridable<S> =>
  schema.pipe(
    S.decodeTo(
      S.toType(schema).pipe(S.brand("Override"), S.optional),
      Transformation.make({
        decode: Getter.passthrough(),
        encode: new Getter.Getter((o) => {
          if (O.isSome(o) && o.value !== undefined) {
            return Effect.succeed(o);
          }
          return Effect.asSome(options.defaultValue);
        }),
      })
    )
  ) as TUnsafe.Any;

const Struct = <const A extends Field.Fields>(fields: A): Struct<A> => {
  return {
    [TypeId]: fields,
    pipe() {
      return Pipeable.pipeArguments(this, arguments);
    },
  };
};

const Field = <const A extends Field.Config>(schemas: A): Field<A> => {
  return {
    schemas,
    [FieldTypeId]: FieldTypeId,
    pipe() {
      return Pipeable.pipeArguments(this, arguments);
    },
  };
};

const Union = <Members extends ReadonlyArray<Struct<TUnsafe.Any>>, Variants extends ReadonlyArray<string>>(
  members: Members,
  variants: Variants
) => {
  const VariantUnion = S.Union(members.filter((member) => S.isSchema(member))) as TUnsafe.Any;
  for (const variant of variants) {
    Object.defineProperty(VariantUnion, variant, {
      value: S.Union(members.map((member) => extract(member, variant))),
    });
  }
  return VariantUnion;
};
