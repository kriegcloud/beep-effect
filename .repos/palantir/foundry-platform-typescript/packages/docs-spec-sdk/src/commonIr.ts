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

type BooleanValueType = { type: "boolean"; value: boolean };
type StringType = { type: "string"; value: string };
type DateType = { type: "date"; daysOffset: number };
type TimestampType = { type: "timestamp"; daysOffset: number };
type IntegerValueType = { type: "integer"; value: number };
type LongValueType = { type: "long"; value: number };
type DoubleValueType = { type: "double"; value: number };
type ByteValueType = { type: "byte"; value: number };
type ShortValueType = { type: "short"; value: number };
type DecimalValueType = { type: "decimal"; value: number };
type FloatValueType = { type: "float"; value: number };
type ObjectType = {
  type: "object";
  primaryKeyType: "string" | "other";
  apiName?: string;
};
type AttachmentType = { type: "attachment"; hasAttachments: boolean };
type MediaReferenceType = {
  type: "mediaReference";
  hasMediaParameter: boolean;
};
type ObjectTypeValueType = { type: "objectType"; objectTypeApiName: string };
type InterfaceType = { type: "interface" };
type MarkingType = { type: "marking" };
type ObjectSetType = {
  type: "objectSet";
  objectTypeApiName: string;
};
type UnknownType = { type: "unknown"; value?: string };
type AnonymousCustomType = { type: "anonymousCustomType" };
type CustomType = { type: "customType" };

export type ActionParameterSampleValueTypeIR =
  | BooleanValueType
  | IntegerValueType
  | LongValueType
  | DoubleValueType
  | DateType
  | TimestampType
  | StringType
  | ObjectType
  | ObjectSetType
  | AttachmentType
  | MediaReferenceType
  | ObjectTypeValueType
  | InterfaceType
  | MarkingType
  | UnknownType
  | {
    type: "list";
    subtype: ActionParameterSampleValueTypeIR;
  }
  | {
    type: "set";
    subtype: ActionParameterSampleValueTypeIR;
  };

export type ActionParameterSampleValuesIR = Array<{
  key: string;
  value: ActionParameterSampleValueTypeIR;
  last: boolean;
}>;

export type FunctionSampleValueTypeIR =
  | BooleanValueType
  | IntegerValueType
  | LongValueType
  | DoubleValueType
  | DecimalValueType
  | FloatValueType
  | DateType
  | TimestampType
  | StringType
  | ObjectType
  | AttachmentType
  | AnonymousCustomType
  | CustomType
  | UnknownType
  | {
    type: "map";
    keyType: FunctionSampleValueTypeIR;
    valueType: FunctionSampleValueTypeIR;
  }
  | {
    type: "list";
    subtype: FunctionSampleValueTypeIR;
  }
  | {
    type: "set";
    subtype: FunctionSampleValueTypeIR;
  };

export interface FunctionSampleParametersIR {
  parameters: Record<string, FunctionSampleValueTypeIR>;
}

export type PropertySampleValueTypeIR =
  | BooleanValueType
  | ByteValueType
  | IntegerValueType
  | ShortValueType
  | LongValueType
  | DecimalValueType
  | DoubleValueType
  | FloatValueType
  | DateType
  | TimestampType
  | StringType
  | UnknownType
  | {
    type: "array";
    subtype: PropertySampleValueTypeIR;
  };

export type PropertySampleIR = {
  apiName: string;
  value: PropertySampleValueTypeIR;
};
