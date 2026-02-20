/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { UnionVariantArg } from "./defineUnion.js";
import { resolveUnionVariantArg } from "./defineUnion.js";
import type { RecordDef, RecordFields, UnionDef, UnionVariants } from "./defs.js";
import { ModelDefType } from "./defs.js";
import type { Ref, Type } from "./primitives.js";
import { isRecordDef, isUnionDef } from "./utils.js";

export type ReturnedSchema = Record<string, RecordDef | UnionDef>;

export type Schema<T extends ReturnedSchema> = T;

export type SchemaBuilder<T extends ReturnedSchema> = {
  [k in keyof T]: T[k] extends UnionDef<infer R> ? UnionBuilder<R>
    : T[k] extends RecordDef<infer R> ? RecordBuilder<R>
    : never;
};

export interface RecordBuilder<T extends Record<string, Type>> {
  // TODO: builders should support arg types and resolveModels to refs
  addField<const K extends string, V extends Type>(
    name: K,
    type: V,
  ): RecordBuilder<T & { [k in K]: V }>;
  build(): RecordDef<T>;
}

export interface UnionBuilder<S extends UnionVariants> {
  // TODO: builders should support arg types and resolveModels to refs
  addVariant<const K extends string>(
    name: K,
    modelDefOrRef: UnionVariantArg,
  ): UnionBuilder<S & { [k in K]: Ref }>;
  build(): UnionDef<S>;
}

class UnionBuilderImpl<S extends UnionVariants> implements UnionBuilder<S> {
  private readonly name: string;
  private readonly docs: string | undefined;
  private readonly variants: S;
  constructor({ name, docs, variants }: UnionDef<S>) {
    this.name = name;
    this.docs = docs;
    this.variants = { ...variants };
  }
  addVariant<const K extends string>(
    variantName: K,
    modelDefOrRef: UnionVariantArg,
  ): UnionBuilder<S & Record<K, Ref>> {
    const ref: Ref = resolveUnionVariantArg(modelDefOrRef);
    const newVariants = { ...this.variants, [variantName]: ref };

    return new UnionBuilderImpl({
      type: ModelDefType.UNION,
      name: this.name,
      variants: newVariants,
      discriminant: "type",
    });
  }
  build(): UnionDef<S> {
    return {
      type: ModelDefType.UNION,
      variants: this.variants,
      discriminant: "type",
      name: this.name,
    };
  }
}

class RecordBuilderImpl<T extends RecordFields> implements RecordBuilder<T> {
  private readonly name: string;
  private readonly fields: T;

  constructor(initialRecordDef: RecordDef<T>) {
    this.name = initialRecordDef.name;
    this.fields = { ...initialRecordDef.fields };
  }

  // TODO: resolve field value from arg instead
  addField<const K extends string, const V extends Type>(
    name: K,
    value: V,
  ): RecordBuilder<T & Record<K, V>> {
    return new RecordBuilderImpl({
      type: ModelDefType.RECORD,
      name: this.name,
      fields: { ...this.fields, [name]: value },
      docs: "",
    });
  }
  build(): RecordDef<T> {
    return {
      type: ModelDefType.RECORD,
      name: this.name,
      fields: this.fields,
      docs: "",
    };
  }
}

export function defineMigration<
  const T extends ReturnedSchema,
  const S extends ReturnedSchema,
>(
  previous: Schema<T>,
  migration: (schema: SchemaBuilder<T>) => S,
): Schema<T & S> {
  /**
   * Create a map of builders for the schema.
   *
   * Note about type assertions:
   * We use a type assertion here (SchemaBuilder<T>) because TypeScript cannot
   * track the relationship between the keys in the original schema and the
   * corresponding builder types. This is a fundamental limitation of TypeScript's
   * type system when dealing with dynamically constructed objects.
   *
   * The assertion is safe because:
   * 1. We're only adding keys that exist in the original schema
   * 2. For each key, we're creating a builder of the correct type
   * 3. The resulting object exactly matches the SchemaBuilder<T> type
   */
  const builders = {} as SchemaBuilder<T>;

  for (const key in previous) {
    const v = previous[key];

    // Use our type guards for safer type narrowing
    if (isRecordDef(v)) {
      // This assertion is necessary because TypeScript can't track the field types
      // through the dynamic property access and object construction
      const recordBuilder = new RecordBuilderImpl(v);
      builders[key] = recordBuilder as unknown as SchemaBuilder<T>[typeof key];
    } else if (isUnionDef(v)) {
      // Similar assertion needed for union builders
      const unionBuilder = new UnionBuilderImpl(v);
      builders[key] = unionBuilder as unknown as SchemaBuilder<T>[typeof key];
    }
  }

  return {
    ...previous,
    ...migration(builders),
  };
}
