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

import type { IFieldValueBoolean } from "./fieldValueBoolean.js";
import type { IFieldValueDatetime } from "./fieldValueDatetime.js";
import type { IFieldValueDocumentRef } from "./fieldValueDocumentRef.js";
import type { IFieldValueDouble } from "./fieldValueDouble.js";
import type { IFieldValueInteger } from "./fieldValueInteger.js";
import type { IFieldValueMediaRef } from "./fieldValueMediaRef.js";
import type { IFieldValueModelRef } from "./fieldValueModelRef.js";
import type { IFieldValueObjectRef } from "./fieldValueObjectRef.js";
import type { IFieldValueString } from "./fieldValueString.js";
import type { IFieldValueText } from "./fieldValueText.js";
import type { IFieldValueUnmanagedJson } from "./fieldValueUnmanagedJson.js";
import type { IFieldValueUserRef } from "./fieldValueUserRef.js";

export interface IFieldValueUnion_Boolean {
  readonly "boolean": IFieldValueBoolean;
  readonly "type": "boolean";
}

export interface IFieldValueUnion_Datetime {
  readonly "datetime": IFieldValueDatetime;
  readonly "type": "datetime";
}

export interface IFieldValueUnion_DocRef {
  readonly "docRef": IFieldValueDocumentRef;
  readonly "type": "docRef";
}

export interface IFieldValueUnion_Double {
  readonly "double": IFieldValueDouble;
  readonly "type": "double";
}

export interface IFieldValueUnion_Integer {
  readonly "integer": IFieldValueInteger;
  readonly "type": "integer";
}

export interface IFieldValueUnion_MediaRef {
  readonly "mediaRef": IFieldValueMediaRef;
  readonly "type": "mediaRef";
}

export interface IFieldValueUnion_ModelRef {
  readonly "modelRef": IFieldValueModelRef;
  readonly "type": "modelRef";
}

export interface IFieldValueUnion_Object {
  readonly "object": IFieldValueObjectRef;
  readonly "type": "object";
}

export interface IFieldValueUnion_String {
  readonly "string": IFieldValueString;
  readonly "type": "string";
}

export interface IFieldValueUnion_Text {
  readonly "text": IFieldValueText;
  readonly "type": "text";
}

export interface IFieldValueUnion_UnmanagedJson {
  readonly "unmanagedJson": IFieldValueUnmanagedJson;
  readonly "type": "unmanagedJson";
}

export interface IFieldValueUnion_UserRef {
  readonly "userRef": IFieldValueUserRef;
  readonly "type": "userRef";
}

export type IFieldValueUnion =
  | IFieldValueUnion_Boolean
  | IFieldValueUnion_Datetime
  | IFieldValueUnion_DocRef
  | IFieldValueUnion_Double
  | IFieldValueUnion_Integer
  | IFieldValueUnion_MediaRef
  | IFieldValueUnion_ModelRef
  | IFieldValueUnion_Object
  | IFieldValueUnion_String
  | IFieldValueUnion_Text
  | IFieldValueUnion_UnmanagedJson
  | IFieldValueUnion_UserRef;

export interface IFieldValueUnionVisitor<T> {
  readonly "boolean": (obj: IFieldValueBoolean) => T;
  readonly "datetime": (obj: IFieldValueDatetime) => T;
  readonly "docRef": (obj: IFieldValueDocumentRef) => T;
  readonly "double": (obj: IFieldValueDouble) => T;
  readonly "integer": (obj: IFieldValueInteger) => T;
  readonly "mediaRef": (obj: IFieldValueMediaRef) => T;
  readonly "modelRef": (obj: IFieldValueModelRef) => T;
  readonly "object": (obj: IFieldValueObjectRef) => T;
  readonly "string": (obj: IFieldValueString) => T;
  readonly "text": (obj: IFieldValueText) => T;
  readonly "unmanagedJson": (obj: IFieldValueUnmanagedJson) => T;
  readonly "userRef": (obj: IFieldValueUserRef) => T;
  readonly "unknown": (obj: IFieldValueUnion) => T;
}

function isBoolean(obj: IFieldValueUnion): obj is IFieldValueUnion_Boolean {
  return (obj.type === "boolean");
}

function boolean(obj: IFieldValueBoolean): IFieldValueUnion_Boolean {
  return {
    boolean: obj,
    type: "boolean",
  };
}

function isDatetime(obj: IFieldValueUnion): obj is IFieldValueUnion_Datetime {
  return (obj.type === "datetime");
}

function datetime(obj: IFieldValueDatetime): IFieldValueUnion_Datetime {
  return {
    datetime: obj,
    type: "datetime",
  };
}

function isDocRef(obj: IFieldValueUnion): obj is IFieldValueUnion_DocRef {
  return (obj.type === "docRef");
}

function docRef(obj: IFieldValueDocumentRef): IFieldValueUnion_DocRef {
  return {
    docRef: obj,
    type: "docRef",
  };
}

function isDouble(obj: IFieldValueUnion): obj is IFieldValueUnion_Double {
  return (obj.type === "double");
}

function double(obj: IFieldValueDouble): IFieldValueUnion_Double {
  return {
    double: obj,
    type: "double",
  };
}

function isInteger(obj: IFieldValueUnion): obj is IFieldValueUnion_Integer {
  return (obj.type === "integer");
}

function integer(obj: IFieldValueInteger): IFieldValueUnion_Integer {
  return {
    integer: obj,
    type: "integer",
  };
}

function isMediaRef(obj: IFieldValueUnion): obj is IFieldValueUnion_MediaRef {
  return (obj.type === "mediaRef");
}

function mediaRef(obj: IFieldValueMediaRef): IFieldValueUnion_MediaRef {
  return {
    mediaRef: obj,
    type: "mediaRef",
  };
}

function isModelRef(obj: IFieldValueUnion): obj is IFieldValueUnion_ModelRef {
  return (obj.type === "modelRef");
}

function modelRef(obj: IFieldValueModelRef): IFieldValueUnion_ModelRef {
  return {
    modelRef: obj,
    type: "modelRef",
  };
}

function isObject(obj: IFieldValueUnion): obj is IFieldValueUnion_Object {
  return (obj.type === "object");
}

function object(obj: IFieldValueObjectRef): IFieldValueUnion_Object {
  return {
    object: obj,
    type: "object",
  };
}

function isString(obj: IFieldValueUnion): obj is IFieldValueUnion_String {
  return (obj.type === "string");
}

function string(obj: IFieldValueString): IFieldValueUnion_String {
  return {
    string: obj,
    type: "string",
  };
}

function isText(obj: IFieldValueUnion): obj is IFieldValueUnion_Text {
  return (obj.type === "text");
}

function text(obj: IFieldValueText): IFieldValueUnion_Text {
  return {
    text: obj,
    type: "text",
  };
}

function isUnmanagedJson(obj: IFieldValueUnion): obj is IFieldValueUnion_UnmanagedJson {
  return (obj.type === "unmanagedJson");
}

function unmanagedJson(obj: IFieldValueUnmanagedJson): IFieldValueUnion_UnmanagedJson {
  return {
    unmanagedJson: obj,
    type: "unmanagedJson",
  };
}

function isUserRef(obj: IFieldValueUnion): obj is IFieldValueUnion_UserRef {
  return (obj.type === "userRef");
}

function userRef(obj: IFieldValueUserRef): IFieldValueUnion_UserRef {
  return {
    userRef: obj,
    type: "userRef",
  };
}

function visit<T>(obj: IFieldValueUnion, visitor: IFieldValueUnionVisitor<T>): T {
  if (isBoolean(obj)) {
    return visitor.boolean(obj.boolean);
  }
  if (isDatetime(obj)) {
    return visitor.datetime(obj.datetime);
  }
  if (isDocRef(obj)) {
    return visitor.docRef(obj.docRef);
  }
  if (isDouble(obj)) {
    return visitor.double(obj.double);
  }
  if (isInteger(obj)) {
    return visitor.integer(obj.integer);
  }
  if (isMediaRef(obj)) {
    return visitor.mediaRef(obj.mediaRef);
  }
  if (isModelRef(obj)) {
    return visitor.modelRef(obj.modelRef);
  }
  if (isObject(obj)) {
    return visitor.object(obj.object);
  }
  if (isString(obj)) {
    return visitor.string(obj.string);
  }
  if (isText(obj)) {
    return visitor.text(obj.text);
  }
  if (isUnmanagedJson(obj)) {
    return visitor.unmanagedJson(obj.unmanagedJson);
  }
  if (isUserRef(obj)) {
    return visitor.userRef(obj.userRef);
  }
  return visitor.unknown(obj);
}

export const IFieldValueUnion: {
  isBoolean: typeof isBoolean;
  boolean: typeof boolean;
  isDatetime: typeof isDatetime;
  datetime: typeof datetime;
  isDocRef: typeof isDocRef;
  docRef: typeof docRef;
  isDouble: typeof isDouble;
  double: typeof double;
  isInteger: typeof isInteger;
  integer: typeof integer;
  isMediaRef: typeof isMediaRef;
  mediaRef: typeof mediaRef;
  isModelRef: typeof isModelRef;
  modelRef: typeof modelRef;
  isObject: typeof isObject;
  object: typeof object;
  isString: typeof isString;
  string: typeof string;
  isText: typeof isText;
  text: typeof text;
  isUnmanagedJson: typeof isUnmanagedJson;
  unmanagedJson: typeof unmanagedJson;
  isUserRef: typeof isUserRef;
  userRef: typeof userRef;
  visit: typeof visit;
} = {
  isBoolean: isBoolean,
  boolean: boolean,
  isDatetime: isDatetime,
  datetime: datetime,
  isDocRef: isDocRef,
  docRef: docRef,
  isDouble: isDouble,
  double: double,
  isInteger: isInteger,
  integer: integer,
  isMediaRef: isMediaRef,
  mediaRef: mediaRef,
  isModelRef: isModelRef,
  modelRef: modelRef,
  isObject: isObject,
  object: object,
  isString: isString,
  string: string,
  isText: isText,
  text: text,
  isUnmanagedJson: isUnmanagedJson,
  unmanagedJson: unmanagedJson,
  isUserRef: isUserRef,
  userRef: userRef,
  visit: visit,
};
