/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under Palantir's License;
you may not use this file except in compliance with the License.
You may obtain a copy of the License from the root of this repository at LICENSE.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
import { ObjectSetLocators } from "../types";

/**
 * Available variable types in the context and Workshop.
 */
export type IVariableType_WithDefaultValue =
  | IVariableType_String_WithDefaultValue
  | IVariableType_Boolean_WithDefaultValue
  | IVariableType_Number_WithDefaultValue
  | IVariableType_Date_WithDefaultValue
  | IVariableType_Timestamp_WithDefaultValue
  | IVariableType_StringList_WithDefaultValue
  | IVariableType_BooleanList_WithDefaultValue
  | IVariableType_NumberList_WithDefaultValue
  | IVariableType_DateList_WithDefaultValue
  | IVariableType_TimestampList_WithDefaultValue
  // | IVariableType_Struct // TODO: Struct support is coming, but is not fully supported yet
  | IVariableType_ObjectSet_WithDefaultValue
  | IVariableType_TemporaryObjectSetRidWithDefaultValue; 

// Workshop only supports struct fields containing the following types. Nested structs are not yet supported
export type IStructVariableFieldType_WithDefaultValue =
  | IVariableType_String_WithDefaultValue
  | IVariableType_Boolean_WithDefaultValue
  | IVariableType_Number_WithDefaultValue
  | IVariableType_Date_WithDefaultValue
  | IVariableType_Timestamp_WithDefaultValue
  | IVariableType_StringList_WithDefaultValue
  | IVariableType_BooleanList_WithDefaultValue
  | IVariableType_NumberList_WithDefaultValue
  | IVariableType_DateList_WithDefaultValue
  | IVariableType_TimestampList_WithDefaultValue
  | IVariableType_ObjectSet_WithDefaultValue
  | IVariableType_TemporaryObjectSetRidWithDefaultValue;

export interface IVariableType_String_WithDefaultValue {
  type: "string";
  defaultValue?: string;
}

export interface IVariableType_Boolean_WithDefaultValue {
  type: "boolean";
  defaultValue?: boolean;
}

export interface IVariableType_Number_WithDefaultValue {
  type: "number";
  defaultValue?: number;
}

export interface IVariableType_Date_WithDefaultValue {
  type: "date";
  defaultValue?: Date; // Represented as a Date, in Workshop the time property will be dropped
}

export interface IVariableType_Timestamp_WithDefaultValue {
  type: "timestamp";
  defaultValue?: Date;
}

export interface IVariableType_StringList_WithDefaultValue {
  type: "string-list";
  defaultValue?: string[];
}

export interface IVariableType_BooleanList_WithDefaultValue {
  type: "boolean-list";
  defaultValue?: boolean[];
}

export interface IVariableType_NumberList_WithDefaultValue {
  type: "number-list";
  defaultValue?: number[];
}

export interface IVariableType_DateList_WithDefaultValue {
  type: "date-list";
  defaultValue?: Date[];
}

export interface IVariableType_TimestampList_WithDefaultValue {
  type: "timestamp-list";
  defaultValue?: Date[]; // Represented as a Date, in Workshop the time property will be dropped
}

export interface IVariableType_Struct_WithDefaultValue {
  type: "struct";
  structFieldTypes: readonly IStructVariableFieldTypes_WithDefaultValue[];
}

export interface IStructVariableFieldTypes_WithDefaultValue {
  fieldId: string;
  fieldType: IStructVariableFieldType_WithDefaultValue;
}

export interface IVariableType_ObjectSet_WithDefaultValue {
  type: "objectSet";
  objectTypeId: string;
  defaultValue?: ObjectSetLocators;
}

export interface IVariableType_TemporaryObjectSetRidWithDefaultValue {
  type: "temporaryObjectSetRid"; 
  defaultValue?: string;
}