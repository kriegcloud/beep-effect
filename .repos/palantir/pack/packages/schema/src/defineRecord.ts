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

import type { RecordDef, UnionDef } from "./defs.js";
import { ModelDefType } from "./defs.js";
import type { Ref, Type } from "./primitives.js";
import { isRecordDef, isUnionDef, modelToRef } from "./utils.js";

export type FieldArgExplicit =
  | Type
  | RecordDef
  | UnionDef;

export type FieldArg =
  | FieldArgExplicit
  | (() => FieldArgExplicit);

export type FieldArgExplicitOf<T extends FieldArg> = T extends () => infer R ? R
  : T;

export type FieldArgs = Record<string, FieldArg>;

export type ResolvedFieldArgExplicit<T extends FieldArgExplicit> = T extends RecordDef | UnionDef
  ? Ref
  : T;

export type ResolvedFieldArg<T extends FieldArg> = ResolvedFieldArgExplicit<FieldArgExplicitOf<T>>;

export type ResolvedFields<T extends FieldArgs> = {
  readonly [K in keyof T]: ResolvedFieldArg<T[K]>;
};

export type RecordArgs<T extends FieldArgs> = {
  readonly docs: string;
  readonly fields: T;
};

/**
 * Helper function to resolve a field value, handling functions and transforming
 * types as needed.
 */
function resolveFieldArg<T extends FieldArg>(value: T): ResolvedFieldArg<T> {
  // Handle function values
  const resolved = typeof value === "function" ? value() : value;

  if (isRecordDef(resolved) || isUnionDef(resolved)) {
    return modelToRef(resolved) as ResolvedFieldArg<T>;
  }

  // For primitive types and other Types
  return resolved as ResolvedFieldArg<T>;
}

export function defineRecord<const T extends FieldArgs>(
  name: string,
  record: RecordArgs<T>,
): RecordDef<ResolvedFields<T>> {
  const entries = Object.entries(record.fields).map(
    ([key, value]) => [key, resolveFieldArg(value)] as const,
  );

  const fields = Object.fromEntries(entries) as ResolvedFields<T>;

  return {
    type: ModelDefType.RECORD,
    name: name,
    docs: record.docs,
    fields,
  };
}
