import { $BslId } from "@beep/identity/packages";
import * as F from "effect/Function";
import * as Pipeable from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $BslId.create("models/mod");

export const TypeId: unique symbol = Symbol.for($I`Struct`);
export type TypeId = typeof TypeId;

export const FieldTypeId: unique symbol = Symbol.for($I`Field`);
export type FieldTypeId = typeof FieldTypeId;

export interface Field<in out A extends Field.Config> extends Pipeable.Pipeable {
  readonly [FieldTypeId]: FieldTypeId
  readonly schemas: A
}

const cacheSymbol = Symbol.for($I`cache`);

export interface Struct<in out A extends Field.Fields> extends Pipeable.Pipeable {
  readonly [TypeId]: A
  [cacheSymbol]?: Record<string, S.Schema.All>
}

export declare namespace Struct {
  export interface Any {
    readonly [TypeId]: any
  }

  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | Field<any>
      | Struct<any>
      | undefined
  }

  export type Validate<A, Variant extends string> = {
    readonly [K in keyof A]: A[K] extends { readonly [TypeId]: infer _ } ? Validate<A[K], Variant> :
      A[K] extends Field<infer Config> ? [keyof Config] extends [Variant] ? {} : "field must have valid variants"
      : {}
  }
}

export interface Field<in out A extends Field.Config> extends Pipeable.Pipeable {
  readonly [FieldTypeId]: FieldTypeId
  readonly schemas: A
}

export declare namespace Field {
  export interface Any {
    readonly [FieldTypeId]: FieldTypeId;
  }

  type ValueAny = S.Schema.All | S.PropertySignature.All;

  export interface Config {
    readonly [key: string]: S.Schema.All | S.PropertySignature.All | undefined
  }


  export type ConfigWithKeys<K extends string> = {
    readonly [P in K]?: S.Schema.All | S.PropertySignature.All
  }

  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | Field<any>
      | Struct<any>
      | undefined
  }
}

export const isField = (u: unknown): u is Field<any> => P.hasProperty(u, FieldTypeId)

export const isStruct = (u: unknown): u is Struct<any> => P.hasProperty(u, TypeId)
/**
 * @since 1.0.0
 * @category extractors
 */
export type ExtractFields<V extends string, Fields extends Struct.Fields, IsDefault = false> = {
  readonly [
    K in keyof Fields as [Fields[K]] extends [Field<infer Config>] ? V extends keyof Config ? K
      : never
      : K
  ]: [Fields[K]] extends [Struct<infer _>] ? Extract<V, Fields[K], IsDefault>
    : [Fields[K]] extends [Field<infer Config>]
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All] ? Config[V]
      : never
    : [Fields[K]] extends [S.Schema.All | S.PropertySignature.All] ? Fields[K]
    : never
}

/**
 * @since 1.0.0
 * @category extractors
 */
export type Extract<V extends string, A extends Struct<any>, IsDefault = false> = [A] extends [
  Struct<infer Fields>
] ?
  IsDefault extends true
    ? [A] extends [S.Schema.Any] ? A : S.Struct<S.Simplify<ExtractFields<V, Fields>>>
  : S.Struct<S.Simplify<ExtractFields<V, Fields>>>
  : never


const extract: {
  <V extends string, const IsDefault extends boolean = false>(
    variant: V,
    options?: {
      readonly isDefault?: IsDefault | undefined
    }
  ): <A extends Struct<any>>(self: A) => Extract<V, A, IsDefault>
  <V extends string, A extends Struct<any>, const IsDefault extends boolean = false>(self: A, variant: V, options?: {
    readonly isDefault?: IsDefault | undefined
  }): Extract<V, A, IsDefault>
} = F.dual(
  (args) => isStruct(args[0]),
  <V extends string, A extends Struct<any>>(
    self: A,
    variant: V,
    options?: {
      readonly isDefault?: boolean | undefined
    }
  ): Extract<V, A> => {
    const cache = self[cacheSymbol] ?? (self[cacheSymbol] = {})
    const cacheKey = options?.isDefault === true ? "__default" : variant
    if (cache[cacheKey] !== undefined) {
      return cache[cacheKey] as any
    }
    const fields: Record<string, any> = {}
    for (const key of Object.keys(self[TypeId])) {
      const value = self[TypeId][key]
      if (TypeId in value) {
        if (options?.isDefault === true && S.isSchema(value)) {
          fields[key] = value
        } else {
          fields[key] = extract(value, variant)
        }
      } else if (FieldTypeId in value) {
        if (variant in value.schemas) {
          fields[key] = value.schemas[variant]
        }
      } else {
        fields[key] = value
      }
    }
    return cache[cacheKey] = S.Struct(fields) as any
  }
)

const FieldProto = {
  [FieldTypeId]: FieldTypeId,
  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }
}

export const Field = <const A extends Field.Config>(schemas: A): Field<A> => {
  const self = Object.create(FieldProto)
  self.schemas = schemas
  return self
}

const StructProto = {
  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }
}

const Struct = <const A extends Field.Fields>(fields: A): Struct<A> => {
  const self = Object.create(StructProto)
  self[TypeId] = fields
  return self
}


