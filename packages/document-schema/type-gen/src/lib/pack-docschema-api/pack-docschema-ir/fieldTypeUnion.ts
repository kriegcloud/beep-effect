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

import type { IFieldTypeCollection } from "./fieldTypeCollection.js";
import type { IFieldTypeMap } from "./fieldTypeMap.js";
import type * as IFieldValueUnion from "./fieldValueUnion.js";

export interface IFieldTypeUnion_Array {
  readonly "array": IFieldTypeCollection;
  readonly "type": "array";
}

export interface IFieldTypeUnion_Map {
  readonly "map": IFieldTypeMap;
  readonly "type": "map";
}

export interface IFieldTypeUnion_Set {
  readonly "set": IFieldTypeCollection;
  readonly "type": "set";
}

export interface IFieldTypeUnion_Value {
  readonly "value": IFieldValueUnion.IFieldValueUnion;
  readonly "type": "value";
}

export type IFieldTypeUnion =
  | IFieldTypeUnion_Array
  | IFieldTypeUnion_Map
  | IFieldTypeUnion_Set
  | IFieldTypeUnion_Value;

export interface IFieldTypeUnionVisitor<T> {
  readonly "array": (obj: IFieldTypeCollection) => T;
  readonly "map": (obj: IFieldTypeMap) => T;
  readonly "set": (obj: IFieldTypeCollection) => T;
  readonly "value": (obj: IFieldValueUnion.IFieldValueUnion) => T;
  readonly "unknown": (obj: IFieldTypeUnion) => T;
}

function isArray(obj: IFieldTypeUnion): obj is IFieldTypeUnion_Array {
  return (obj.type === "array");
}

function array(obj: IFieldTypeCollection): IFieldTypeUnion_Array {
  return {
    array: obj,
    type: "array",
  };
}

function isMap(obj: IFieldTypeUnion): obj is IFieldTypeUnion_Map {
  return (obj.type === "map");
}

function map(obj: IFieldTypeMap): IFieldTypeUnion_Map {
  return {
    map: obj,
    type: "map",
  };
}

function isSet(obj: IFieldTypeUnion): obj is IFieldTypeUnion_Set {
  return (obj.type === "set");
}

function set(obj: IFieldTypeCollection): IFieldTypeUnion_Set {
  return {
    set: obj,
    type: "set",
  };
}

function isValue(obj: IFieldTypeUnion): obj is IFieldTypeUnion_Value {
  return (obj.type === "value");
}

function value(obj: IFieldValueUnion.IFieldValueUnion): IFieldTypeUnion_Value {
  return {
    value: obj,
    type: "value",
  };
}

function visit<T>(obj: IFieldTypeUnion, visitor: IFieldTypeUnionVisitor<T>): T {
  if (isArray(obj)) {
    return visitor.array(obj.array);
  }
  if (isMap(obj)) {
    return visitor.map(obj.map);
  }
  if (isSet(obj)) {
    return visitor.set(obj.set);
  }
  if (isValue(obj)) {
    return visitor.value(obj.value);
  }
  return visitor.unknown(obj);
}

export const IFieldTypeUnion: {
  isArray: typeof isArray;
  array: typeof array;
  isMap: typeof isMap;
  map: typeof map;
  isSet: typeof isSet;
  set: typeof set;
  isValue: typeof isValue;
  value: typeof value;
  visit: typeof visit;
} = {
  isArray: isArray,
  array: array,
  isMap: isMap,
  map: map,
  isSet: isSet,
  set: set,
  isValue: isValue,
  value: value,
  visit: visit,
};
