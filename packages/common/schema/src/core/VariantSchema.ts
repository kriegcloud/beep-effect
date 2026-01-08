import { $SchemaId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import type { Effect } from "effect";
import { ParseResult, Pipeable } from "effect";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as _Struct from "effect/Struct";

const $I = $SchemaId.create("core/VariantSchema");

/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($I`TypeId`);

/**
 * @since 1.0.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

const cacheSymbol = Symbol.for($I`cache`);

/**
 * @since 1.0.0
 * @category models
 */
export interface Struct<in out A extends Field.Fields> extends Pipeable.Pipeable {
  readonly [TypeId]: A;
  /** @internal */
  [cacheSymbol]?: undefined | Record<string, S.Schema.All>;
}

/**
 * @since 1.0.0
 * @category guards
 */
export const isStruct = (u: unknown): u is Struct<UnsafeTypes.UnsafeAny> => P.hasProperty(u, TypeId);

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace Struct {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Any = { readonly [TypeId]: UnsafeTypes.UnsafeAny };

  /**
   * @since 1.0.0
   * @category models
   */
  export type Fields = {
    readonly [key: string]: S.Schema.All | S.PropertySignature.All | Field<UnsafeTypes.UnsafeAny> | Struct<UnsafeTypes.UnsafeAny> | undefined;
  };

  /**
   * @since 1.0.0
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

/**
 * @since 1.0.0
 * @category type ids
 */
export const FieldTypeId: unique symbol = Symbol.for($I`Field`);

/**
 * @since 1.0.0
 * @category type ids
 */
export type FieldTypeId = typeof FieldTypeId;

/**
 * @since 1.0.0
 * @category models
 */
export interface Field<in out A extends Field.Config> extends Pipeable.Pipeable {
  readonly [FieldTypeId]: FieldTypeId;
  readonly schemas: A;
}

/**
 * @since 1.0.0
 * @category guards
 */
export const isField = (u: unknown): u is Field<UnsafeTypes.UnsafeAny> => P.hasProperty(u, FieldTypeId);

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace Field {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Any = { readonly [FieldTypeId]: FieldTypeId };

  /**
   * @since 1.0.0
   * @category models
   */
  type ValueAny = S.Schema.All | S.PropertySignature.All;

  /**
   * @since 1.0.0
   * @category models
   */
  export type Config = {
    readonly [key: string]: S.Schema.All | S.PropertySignature.All | undefined;
  };

  /**
   * @since 1.0.0
   * @category models
   */
  export type ConfigWithKeys<K extends string> = {
    readonly [P in K]?: S.Schema.All | S.PropertySignature.All;
  };

  /**
   * @since 1.0.0
   * @category models
   */
  export type Fields = {
    readonly [key: string]: S.Schema.All | S.PropertySignature.All | Field<UnsafeTypes.UnsafeAny> | Struct<UnsafeTypes.UnsafeAny> | undefined;
  };
}

/**
 * @since 1.0.0
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
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]
        ? Config[V]
        : never
      : [Fields[K]] extends [S.Schema.All | S.PropertySignature.All]
        ? Fields[K]
        : never;
};

/**
 * @since 1.0.0
 * @category extractors
 */
export type Extract<V extends string, A extends Struct<UnsafeTypes.UnsafeAny>, IsDefault = false> = [A] extends [Struct<infer Fields>]
  ? IsDefault extends true
    ? [A] extends [S.Schema.Any]
      ? A
      : S.Struct<S.Simplify<ExtractFields<V, Fields>>>
    : S.Struct<S.Simplify<ExtractFields<V, Fields>>>
  : never;

const extract: {
  <V extends string, const IsDefault extends boolean = false>(
    variant: V,
    options?: {
      readonly isDefault?: IsDefault | undefined;
    }
  ): <A extends Struct<UnsafeTypes.UnsafeAny>>(self: A) => Extract<V, A, IsDefault>;
  <V extends string, A extends Struct<UnsafeTypes.UnsafeAny>, const IsDefault extends boolean = false>(
    self: A,
    variant: V,
    options?: {
      readonly isDefault?: IsDefault | undefined;
    }
  ): Extract<V, A, IsDefault>;
} = F.dual(
  (args) => isStruct(args[0]),
  <V extends string, A extends Struct<UnsafeTypes.UnsafeAny>>(
    self: A,
    variant: V,
    options?: {
      readonly isDefault?: boolean | undefined;
    }
  ): Extract<V, A> => {
    const cache = self[cacheSymbol] ?? (self[cacheSymbol] = {});
    const cacheKey = options?.isDefault === true ? "__default" : variant;
    if (cache[cacheKey] !== undefined) {
      return cache[cacheKey] as UnsafeTypes.UnsafeAny;
    }
    const fields: Record<string, UnsafeTypes.UnsafeAny> = {};
    for (const key of _Struct.keys(self[TypeId])) {
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
    return (cache[cacheKey] = S.Struct(fields) as UnsafeTypes.UnsafeAny);
  }
);

/**
 * @category accessors
 * @since 1.0.0
 */
export const fields = <A extends Struct<UnsafeTypes.UnsafeAny>>(self: A): A[TypeId] => self[TypeId];

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * @since 1.0.0
 * @category models
 */
export interface Class<Self, Fields extends Struct.Fields, SchemaFields extends S.Struct.Fields, A, I, R, C>
  extends S.Schema<Self, S.Simplify<I>, R>,
    Struct<S.Simplify<Fields>> {
  new (
    props: RequiredKeys<C> extends never ? void | S.Simplify<C> : S.Simplify<C>,
    options?: {
      readonly disableValidation?: boolean;
    }
  ): A;

  readonly ast: AST.Transformation;

  make<Args extends Array<UnsafeTypes.UnsafeAny>, X>(this: { new (...args: Args): X }, ...args: Args): X;

  annotations(annotations: S.Annotations.Schema<Self>): S.SchemaClass<Self, I, R>;

  readonly identifier: string;
  readonly fields: S.Simplify<SchemaFields>;
}

type ClassFromFields<Self, Fields extends Struct.Fields, SchemaFields extends S.Struct.Fields> = Class<
  Self,
  Fields,
  SchemaFields,
  S.Struct.Type<SchemaFields>,
  S.Struct.Encoded<SchemaFields>,
  S.Struct.Context<SchemaFields>,
  S.Struct.Constructor<SchemaFields>
>;

type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Class<Self>()(${Params}{ ... })\``;

/**
 * @since 1.0.0
 * @category models
 */
export interface Union<Members extends ReadonlyArray<Struct<UnsafeTypes.UnsafeAny>>>
  extends S.Union<{
    readonly [K in keyof Members]: [Members[K]] extends [S.Schema.All] ? Members[K] : never;
  }> {}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace Union {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Variants<Members extends ReadonlyArray<Struct<UnsafeTypes.UnsafeAny>>, Variants extends string> = {
    readonly [Variant in Variants]: S.Union<{
      [K in keyof Members]: Extract<Variant, Members[K]>;
    }>;
  };
}

/**
 * @since 1.0.0
 * @category models
 */
export interface fromKey<S extends S.Schema.All, Key extends string>
  extends S.PropertySignature<":", S.Schema.Type<S>, Key, ":", S.Schema.Encoded<S>, false, S.Schema.Context<S>> {}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace fromKey {
  /**
   * @since 1.0.0
   */
  export type Rename<S, Key extends string> = S extends S.PropertySignature<
    infer _TypeToken,
    infer _Type,
    infer _Key,
    infer _EncodedToken,
    infer _Encoded,
    infer _HasDefault,
    infer _R
  >
    ? S.PropertySignature<_TypeToken, _Type, Key, _EncodedToken, _Encoded, _HasDefault, _R>
    : S extends S.Schema.All
      ? fromKey<S, Key>
      : never;
}

/**
 * @since 1.0.0
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
    ...keys: Keys
  ) => <S extends S.Schema.All | S.PropertySignature.All>(schema: S) => Field<{ readonly [K in Keys[number]]: S }>;
  readonly FieldExcept: <const Keys extends ReadonlyArray<Variants[number]>>(
    ...keys: Keys
  ) => <S extends S.Schema.All | S.PropertySignature.All>(
    schema: S
  ) => Field<{ readonly [K in Exclude<Variants[number], Keys[number]>]: S }>;
  readonly fieldEvolve: {
    <
      Self extends Field<UnsafeTypes.UnsafeAny> | Field.ValueAny,
      const Mapping extends Self extends Field<infer S>
        ? { readonly [K in keyof S]?: (variant: S[K]) => Field.ValueAny }
        : { readonly [K in Variants[number]]?: (variant: Self) => Field.ValueAny },
    >(
      f: Mapping
    ): (self: Self) => Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends (arg: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny
                ? ReturnType<Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends (arg: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny
                ? ReturnType<Mapping[K]>
                : Self
              : Self;
          }
    >;
    <
      Self extends Field<UnsafeTypes.UnsafeAny> | Field.ValueAny,
      const Mapping extends Self extends Field<infer S>
        ? {
            readonly [K in keyof S]?: (variant: S[K]) => Field.ValueAny;
          }
        : { readonly [K in Variants[number]]?: (variant: Self) => Field.ValueAny },
    >(
      self: Self,
      f: Mapping
    ): Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends (arg: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny
                ? ReturnType<Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends (arg: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny
                ? ReturnType<Mapping[K]>
                : Self
              : Self;
          }
    >;
  };
  readonly fieldFromKey: {
    <
      Self extends Field<UnsafeTypes.UnsafeAny> | Field.ValueAny,
      const Mapping extends Self extends Field<infer S>
        ? { readonly [K in keyof S]?: string }
        : { readonly [K in Variants[number]]?: string },
    >(
      mapping: Mapping
    ): (self: Self) => Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends string
                ? fromKey.Rename<S[K], Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends string
                ? fromKey.Rename<Self, Mapping[K]>
                : Self
              : Self;
          }
    >;
    <
      Self extends Field<UnsafeTypes.UnsafeAny> | Field.ValueAny,
      const Mapping extends Self extends Field<infer S>
        ? { readonly [K in keyof S]?: string }
        : { readonly [K in Variants[number]]?: string },
    >(
      self: Self,
      mapping: Mapping
    ): Field<
      Self extends Field<infer S>
        ? {
            readonly [K in keyof S]: K extends keyof Mapping
              ? Mapping[K] extends string
                ? fromKey.Rename<S[K], Mapping[K]>
                : S[K]
              : S[K];
          }
        : {
            readonly [K in Variants[number]]: K extends keyof Mapping
              ? Mapping[K] extends string
                ? fromKey.Rename<Self, Mapping[K]>
                : Self
              : Self;
          }
    >;
  };
  readonly Class: <Self = never>(
    identifier: string
  ) => <const Fields extends Struct.Fields>(
    fields: Fields & Struct.Validate<Fields, Variants[number]>,
    annotations?: S.Annotations.Schema<Self>
  ) => [Self] extends [never]
    ? MissingSelfGeneric
    : ClassFromFields<Self, Fields, ExtractFields<Default, Fields, true>> & {
        readonly [V in Variants[number]]: Extract<V, Struct<Fields>>;
      };
  readonly Union: <const Members extends ReadonlyArray<Struct<UnsafeTypes.UnsafeAny>>>(
    ...members: Members
  ) => Union<Members> & Union.Variants<Members, Variants[number]>;
  readonly extract: {
    <V extends Variants[number]>(
      variant: V
    ): <A extends Struct<UnsafeTypes.UnsafeAny>>(self: A) => Extract<V, A, V extends Default ? true : false>;
    <V extends Variants[number], A extends Struct<UnsafeTypes.UnsafeAny>>(
      self: A,
      variant: V
    ): Extract<V, A, V extends Default ? true : false>;
  };
} => {
  function Class<Self>(identifier: string) {
    return (fields: Struct.Fields, annotations?: S.Annotations.Schema<Self>) => {
      const variantStruct = Struct(fields);
      const schema = extract(variantStruct, options.defaultVariant, {
        isDefault: true,
      });

      class Base extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(schema.fields, annotations) {
        static [TypeId] = fields;
      }
      for (const variant of options.variants) {
        Object.defineProperty(Base, variant, {
          value: extract(variantStruct, variant).annotations({
            identifier: `${identifier}.${variant}`,
            title: `${identifier}.${variant}`,
          }),
        });
      }
      return Base;
    };
  }
  function FieldOnly<Keys extends Variants>(...keys: Keys) {
    return <S extends S.Schema.All | S.PropertySignature.All>(schema: S) => {
      const obj: Record<string, S> = {};
      for (const key of keys) {
        obj[key] = schema;
      }
      return Field(obj);
    };
  }
  function FieldExcept<Keys extends Variants>(...keys: Keys) {
    return <S extends S.Schema.All | S.PropertySignature.All>(schema: S) => {
      const obj: Record<string, S> = {};
      for (const variant of options.variants) {
        if (!A.contains(variant)(keys)) {
          obj[variant] = schema;
        }
      }
      return Field(obj);
    };
  }
  function UnionVariants(...members: ReadonlyArray<Struct<UnsafeTypes.UnsafeAny>>) {
    return Union(members, options.variants);
  }
  const fieldEvolve = F.dual(
    2,
    (
      self: Field<UnsafeTypes.UnsafeAny> | S.Schema.All | S.PropertySignature.All,
      f: Record<string, (schema: Field.ValueAny) => Field.ValueAny>
    ): Field<UnsafeTypes.UnsafeAny> => {
      const field = isField(self) ? self : Field(R.fromEntries(A.map(options.variants, (variant) => [variant, self])));
      return Field(_Struct.evolve(field.schemas, f));
    }
  );
  const fieldFromKey = F.dual(
    2,
    (
      self:
        | Field<{
            readonly [key: string]: S.Schema.All | S.PropertySignature.Any | undefined;
          }>
        | S.Schema.All
        | S.PropertySignature.Any,
      mapping: Record<string, string>
    ): Field<UnsafeTypes.UnsafeAny> => {
      const obj: Record<string, UnsafeTypes.UnsafeAny> = {};
      if (isField(self)) {
        for (const [key, schema] of _Struct.entries(self.schemas)) {
          obj[key] = mapping[key] !== undefined ? renameFieldValue(schema as UnsafeTypes.UnsafeAny, mapping[key]) : schema;
        }
      } else {
        for (const key of options.variants) {
          obj[key] = mapping[key] !== undefined ? renameFieldValue(self as UnsafeTypes.UnsafeAny, mapping[key]) : self;
        }
      }
      return Field(obj);
    }
  );
  const extractVariants = F.dual(2, (self: Struct<UnsafeTypes.UnsafeAny>, variant: string): UnsafeTypes.UnsafeAny =>
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
    Union: UnionVariants,
    fieldEvolve,
    fieldFromKey,
    extract: extractVariants,
  } as UnsafeTypes.UnsafeAny;
};

/**
 * @since 1.0.0
 * @category overrideable
 */
export const Override = <A>(value: A): A & B.Brand<"Override"> => value as UnsafeTypes.UnsafeAny;

/**
 * @since 1.0.0
 * @category overrideable
 */
export interface Overrideable<To, From, R = never>
  extends S.PropertySignature<":", (To & B.Brand<"Override">) | undefined, never, ":", From, true, R> {}

/**
 * @since 1.0.0
 * @category overrideable
 */
export const Overrideable = <From, IFrom, RFrom, To, ITo, R>(
  from: S.Schema<From, IFrom, RFrom>,
  to: S.Schema<To, ITo>,
  options: {
    readonly generate: (_: O.Option<ITo>) => Effect.Effect<From, ParseResult.ParseIssue, R>;
    readonly decode?: S.Schema<ITo, From>;
    readonly constructorDefault?: () => To;
  }
): Overrideable<To, IFrom, RFrom | R> =>
  S.transformOrFail(from, S.Union(S.Undefined, to as S.brand<S.Schema<To, ITo>, "Override">), {
    decode: (_) => (options.decode ? ParseResult.decode(options.decode)(_) : ParseResult.succeed(undefined)),
    encode: (dt) => options.generate(dt === undefined ? O.none() : O.some(dt)),
  }).pipe(S.propertySignature, S.withConstructorDefault(options.constructorDefault ?? (F.constUndefined as UnsafeTypes.UnsafeAny)));

const StructProto = {
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
};

const Struct = <const A extends Field.Fields>(fields: A): Struct<A> => {
  const self = Object.create(StructProto);
  self[TypeId] = fields;
  return self;
};

const FieldProto = {
  [FieldTypeId]: FieldTypeId,
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  },
};

const Field = <const A extends Field.Config>(schemas: A): Field<A> => {
  const self = Object.create(FieldProto);
  self.schemas = schemas;
  return self;
};

const Union = <Members extends ReadonlyArray<Struct<UnsafeTypes.UnsafeAny>>, Variants extends ReadonlyArray<string>>(
  members: Members,
  variants: Variants
) => {
  class VariantUnion extends (S.Union(...A.filter(members, (member) => S.isSchema(member))) as UnsafeTypes.UnsafeAny) {}
  for (const variant of variants) {
    Object.defineProperty(VariantUnion, variant, {
      value: S.Union(...A.map(members, (member) => extract(member, variant))),
    });
  }
  return VariantUnion;
};

const renameFieldValue = <F extends S.Schema.All | S.PropertySignature.Any>(self: F, key: string) =>
  S.isPropertySignature(self) ? S.fromKey(self, key) : S.fromKey(S.propertySignature(self), key);
