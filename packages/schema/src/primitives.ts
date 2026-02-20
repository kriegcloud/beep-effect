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

export const TypeKind = {
  ARRAY: "array",
  BOOLEAN: "boolean",
  DOC_REF: "docRef",
  DOUBLE: "double",
  MEDIA_REF: "mediaRef",
  OBJECT_REF: "objectRef",
  OPTIONAL: "optional",
  REF: "ref",
  STRING: "string",
  UNKNOWN: "unknown",
  USER_REF: "userRef",
} as const;

export type TypeKind = typeof TypeKind[keyof typeof TypeKind];

export type String = {
  readonly type: typeof TypeKind.STRING;
};

export type Double = {
  readonly type: typeof TypeKind.DOUBLE;
};

export type Boolean = {
  readonly type: typeof TypeKind.BOOLEAN;
};

// Forward declaration to avoid circular reference
interface TypeBase {
  readonly type: TypeKind;
}

export type Array<T extends TypeBase = TypeBase> = {
  readonly type: typeof TypeKind.ARRAY;
  readonly items: T;
};

// A reference to a record or a union type
export type Ref = {
  readonly type: typeof TypeKind.REF;
  readonly refType: "record" | "union"; // TODO: do we care?
  readonly name: string;
};

export type Optional<T extends TypeBase = TypeBase> = {
  readonly type: typeof TypeKind.OPTIONAL;
  readonly item: T;
};

export type Unknown = {
  readonly type: typeof TypeKind.UNKNOWN;
};

export type DocRef = {
  readonly type: typeof TypeKind.DOC_REF;
};

export type MediaRef = {
  readonly type: typeof TypeKind.MEDIA_REF;
};

export type ObjectRef = {
  readonly type: typeof TypeKind.OBJECT_REF;
};

export type UserRef = {
  readonly type: typeof TypeKind.USER_REF;
};

export type Type =
  | Array
  | Boolean
  | DocRef
  | Double
  | MediaRef
  | ObjectRef
  | Optional
  | Ref
  | String
  | Unknown
  | UserRef;

export const String: String = { type: TypeKind.STRING };
export const Double: Double = { type: TypeKind.DOUBLE };
export const Boolean: Boolean = { type: TypeKind.BOOLEAN };
export const Unknown: Unknown = { type: TypeKind.UNKNOWN };
export const Array = <T extends TypeBase>(item: T): Array<T> => ({
  type: TypeKind.ARRAY,
  items: item,
});
export const Optional = <T extends TypeBase>(item: T): Optional<T> => ({
  type: TypeKind.OPTIONAL,
  item,
});
