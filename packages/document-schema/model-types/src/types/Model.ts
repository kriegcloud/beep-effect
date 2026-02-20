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

import type { ZodType } from "zod";
import type { WithMetadata } from "./Metadata.js";

/**
 * A Model defines the structure of a document record or union.
 *
 * It includes a zod schema for validation and type information.
 */
// TODO: I think we can/should hide the zod types
export interface Model<
  T = unknown,
  Z extends ZodType<T> = ZodType<T>,
  M extends ModelMetadata<T> = ModelMetadata<T>,
> extends WithMetadata<M> {
  readonly __type: T;
  readonly zodSchema: Readonly<Z>;
}

export type RecordModel<T = unknown, Z extends ZodType<T> = ZodType<T>> = Model<
  T,
  Z,
  RecordModelMetadata<T>
>;

export type UnionModel<T = unknown, Z extends ZodType<T> = ZodType<T>> = Model<
  T,
  Z,
  UnionModelMetadata<T>
>;

export type ModelData<M extends Model> = M["__type"];

/**
 * Describes an edit made to a document.
 */
export interface EditDescription<M extends Model = Model> {
  readonly data: ModelData<M>;
  readonly model: M;
}

export const ExternalRefType = {
  DOC_REF: "docRef",
  MEDIA_REF: "mediaRef",
  OBJECT_REF: "objectRef",
  USER_REF: "userRef",
} as const;

export type ExternalRefType = typeof ExternalRefType[keyof typeof ExternalRefType];

export interface RecordModelMetadata<T = unknown> {
  /**
   * Which fields in the model are external references (e.g. UserRef, DocumentRef, etc).
   */
  readonly externalRefFieldTypes?: Readonly<Record<keyof T, ExternalRefType>>;
  /**
   * The name of the model (should match the typescript symbol).
   */
  readonly name: string;
}

export interface UnionModelMetadata<T = unknown> {
  /**
   * The field name used to discriminate between union variants.
   */
  readonly discriminant: keyof T;
  /**
   * The name of the model (should match the typescript symbol).
   */
  readonly name: string;
}

export type ModelMetadata<T = unknown> = RecordModelMetadata<T> | UnionModelMetadata<T>;
