/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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

import type * as _Core from "@osdk/foundry.core";
import type * as _Ontologies from "@osdk/foundry.ontologies";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * Log Safety: UNSAFE
 */
export interface ArrayConstraint {
  minimumSize?: number;
  maximumSize?: number;
  uniqueValues: boolean;
  valueConstraint?: ValueTypeConstraint;
}

/**
   * Represents the value of data in the following format. Note that these values can be nested, for example an array of structs.
| Type                        | JSON encoding                                         | Example                                                                       |
|-----------------------------|-------------------------------------------------------|-------------------------------------------------------------------------------|
| Array                       | array                                                 | ["alpha", "bravo", "charlie"]                                               |
| Attachment                  | string                                                | "ri.attachments.main.attachment.2f944bae-5851-4204-8615-920c969a9f2e"       |
| Boolean                     | boolean                                               | true                                                                        |
| Byte                        | number                                                | 31                                                                          |
| Date                        | ISO 8601 extended local date string                   | "2021-05-01"                                                                |
| Decimal                     | string                                                | "2.718281828"                                                               |
| Float                       | number                                                | 3.14159265                                                                  |
| Double                      | number                                                | 3.14159265                                                                  |
| Integer                     | number                                                | 238940                                                                      |
| Long                        | string                                                | "58319870951433"                                                            |
| Marking                     | string                                                | "MU"                                                                        |
| Null                        | null                                                  | null                                                                        |
| Set                         | array                                                 | ["alpha", "bravo", "charlie"]                                               |
| Short                       | number                                                | 8739                                                                        |
| String                      | string                                                | "Call me Ishmael"                                                           |
| Struct                      | JSON object                                           | {"name": "John Doe", "age": 42}                                             |
| TwoDimensionalAggregation   | JSON object                                           | {"groups": [{"key": "alpha", "value": 100}, {"key": "beta", "value": 101}]} |
| ThreeDimensionalAggregation | JSON object                                           | {"groups": [{"key": "NYC", "groups": [{"key": "Engineer", "value" : 100}]}]}|
| Timestamp                   | ISO 8601 extended offset date-time string in UTC zone | "2021-01-04T05:00:00Z"                                                      |
   *
   * Log Safety: UNSAFE
   */
export type DataValue = any;

/**
 * Log Safety: SAFE
 */
export interface EnumConstraint {
  options: Array<any>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ExecuteQueryRequest {
  parameters: Record<ParameterId, DataValue | undefined>;
  version?: FunctionVersion;
}

/**
 * Log Safety: UNSAFE
 */
export interface ExecuteQueryResponse {
  value: DataValue;
}

/**
 * The unique resource identifier of a Function, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type FunctionRid = LooselyBrandedString<"FunctionRid">;

/**
   * The version of the given Function, written <major>.<minor>.<patch>-<tag>, where -<tag> is optional.
Examples: 1.2.3, 1.2.3-rc1.
   *
   * Log Safety: UNSAFE
   */
export type FunctionVersion = LooselyBrandedString<"FunctionVersion">;

/**
 * Log Safety: UNSAFE
 */
export interface GetByRidQueriesRequest {
  rid: FunctionRid;
  version?: FunctionVersion;
  includePrerelease?: boolean;
}

/**
 * Log Safety: SAFE
 */
export interface LengthConstraint {
  minimumLength?: number;
  maximumLength?: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface MapConstraint {
  keyConstraints: Array<ValueTypeConstraint>;
  valueConstraints: Array<ValueTypeConstraint>;
  uniqueValues: boolean;
}

/**
 * Log Safety: SAFE
 */
export interface NullableConstraint {
  value: NullableConstraintValue;
}

/**
 * Log Safety: SAFE
 */
export type NullableConstraintValue = "NULLABLE" | "NOT_NULLABLE";

/**
 * Details about a parameter of a query.
 *
 * Log Safety: UNSAFE
 */
export interface Parameter {
  description?: string;
  dataType: QueryDataType;
}

/**
   * The unique identifier of the parameter. Parameters are used as inputs when an action or query is applied.
Parameters can be viewed and managed in the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type ParameterId = LooselyBrandedString<"ParameterId">;

/**
 * Log Safety: UNSAFE
 */
export interface Query {
  apiName: QueryApiName;
  description?: string;
  displayName?: _Core.DisplayName;
  parameters: Record<ParameterId, Parameter>;
  output: QueryDataType;
  rid: FunctionRid;
  version: FunctionVersion;
}

/**
 * A union of all the types supported by query aggregation keys.
 *
 * Log Safety: SAFE
 */
export type QueryAggregationKeyType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "range" } & QueryAggregationRangeType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * A union of all the types supported by query aggregation ranges.
 *
 * Log Safety: SAFE
 */
export type QueryAggregationRangeSubType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Log Safety: SAFE
 */
export interface QueryAggregationRangeType {
  subType: QueryAggregationRangeSubType;
}

/**
 * A union of all the types supported by query aggregation keys.
 *
 * Log Safety: SAFE
 */
export type QueryAggregationValueType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * The name of the Query in the API.
 *
 * Log Safety: UNSAFE
 */
export type QueryApiName = LooselyBrandedString<"QueryApiName">;

/**
 * Log Safety: UNSAFE
 */
export interface QueryArrayType {
  subType: QueryDataType;
}

/**
 * A union of all the types supported by Query parameters or outputs.
 *
 * Log Safety: UNSAFE
 */
export type QueryDataType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "struct" } & QueryStructType)
  | ({ type: "set" } & QuerySetType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "threeDimensionalAggregation" } & ThreeDimensionalAggregation)
  | ({ type: "union" } & QueryUnionType)
  | ({ type: "float" } & _Core.FloatType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "attachment" } & _Core.AttachmentType)
  | ({ type: "null" } & _Core.NullType)
  | ({ type: "array" } & QueryArrayType)
  | ({ type: "twoDimensionalAggregation" } & TwoDimensionalAggregation)
  | ({ type: "valueTypeReference" } & ValueTypeReference)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Log Safety: UNSAFE
 */
export type QueryRuntimeErrorParameter = LooselyBrandedString<
  "QueryRuntimeErrorParameter"
>;

/**
 * Log Safety: UNSAFE
 */
export interface QuerySetType {
  subType: QueryDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface QueryStructField {
  name: StructFieldName;
  fieldType: QueryDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface QueryStructType {
  fields: Array<QueryStructField>;
}

/**
 * Log Safety: UNSAFE
 */
export interface QueryUnionType {
  unionTypes: Array<QueryDataType>;
}

/**
 * Log Safety: SAFE
 */
export interface RangesConstraint {
  minimumValue?: any;
  maximumValue?: any;
}

/**
 * Log Safety: SAFE
 */
export interface RegexConstraint {
  pattern: string;
  partialMatch: boolean;
}

/**
 * Log Safety: SAFE
 */
export interface RidConstraint {}

/**
 * Log Safety: UNSAFE
 */
export interface StreamingExecuteQueryRequest {
  ontology?: _Ontologies.OntologyIdentifier;
  parameters: Record<ParameterId, DataValue | undefined>;
  version?: FunctionVersion;
}

/**
 * A single line in the NDJSON response stream from streamingExecute. Each line contains either a data batch or an error.
 *
 * Log Safety: UNSAFE
 */
export type StreamingExecuteQueryResponse =
  | ({ type: "data" } & StreamingQueryData)
  | ({ type: "error" } & StreamingQueryError);

/**
 * A batch of query results.
 *
 * Log Safety: UNSAFE
 */
export interface StreamingQueryData {
  value: DataValue;
}

/**
 * An error that occurred during query execution.
 *
 * Log Safety: UNSAFE
 */
export interface StreamingQueryError {
  errorCode: string;
  errorName: string;
  errorInstanceId: string;
  errorDescription?: string;
  parameters: Record<string, any>;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructConstraint {
  fields: Record<StructFieldApiName, ValueTypeApiName>;
}

/**
 * Log Safety: UNSAFE
 */
export type StructFieldApiName = LooselyBrandedString<"StructFieldApiName">;

/**
 * The name of a field in a Struct.
 *
 * Log Safety: UNSAFE
 */
export type StructFieldName = LooselyBrandedString<"StructFieldName">;

/**
 * Log Safety: UNSAFE
 */
export interface StructV1Constraint {
  fields: Record<StructFieldApiName, ValueTypeConstraint>;
}

/**
 * Log Safety: SAFE
 */
export interface ThreeDimensionalAggregation {
  keyType: QueryAggregationKeyType;
  valueType: TwoDimensionalAggregation;
}

/**
 * The ID identifying a transaction.
 *
 * Log Safety: SAFE
 */
export type TransactionId = LooselyBrandedString<"TransactionId">;

/**
 * Log Safety: SAFE
 */
export interface TwoDimensionalAggregation {
  keyType: QueryAggregationKeyType;
  valueType: QueryAggregationValueType;
}

/**
 * Log Safety: SAFE
 */
export interface UuidConstraint {}

/**
 * Log Safety: UNSAFE
 */
export interface ValueType {
  rid: ValueTypeRid;
  version: ValueTypeVersion;
  versionId: ValueTypeVersionId;
  apiName: ValueTypeApiName;
  displayName: _Core.DisplayName;
  description?: ValueTypeDescription;
  baseType?: ValueTypeDataType;
  constraints: Array<ValueTypeConstraint>;
}

/**
 * The registered API name for the value type.
 *
 * Log Safety: UNSAFE
 */
export type ValueTypeApiName = LooselyBrandedString<"ValueTypeApiName">;

/**
 * Log Safety: UNSAFE
 */
export type ValueTypeConstraint =
  | ({ type: "struct" } & StructConstraint)
  | ({ type: "structV1" } & StructV1Constraint)
  | ({ type: "regex" } & RegexConstraint)
  | ({ type: "nullable" } & NullableConstraint)
  | ({ type: "array" } & ArrayConstraint)
  | ({ type: "length" } & LengthConstraint)
  | ({ type: "range" } & RangesConstraint)
  | ({ type: "rid" } & RidConstraint)
  | ({ type: "map" } & MapConstraint)
  | ({ type: "uuid" } & UuidConstraint)
  | ({ type: "enum" } & EnumConstraint);

/**
 * The underlying base type of a value type.
 *
 * Log Safety: UNSAFE
 */
export type ValueTypeDataType =
  | ({ type: "date" } & ValueTypeDataTypeDateType)
  | ({ type: "struct" } & ValueTypeDataTypeStructType)
  | ({ type: "string" } & ValueTypeDataTypeStringType)
  | ({ type: "byte" } & ValueTypeDataTypeByteType)
  | ({ type: "double" } & ValueTypeDataTypeDoubleType)
  | ({ type: "optional" } & ValueTypeDataTypeOptionalType)
  | ({ type: "integer" } & ValueTypeDataTypeIntegerType)
  | ({ type: "union" } & ValueTypeDataTypeUnionType)
  | ({ type: "float" } & ValueTypeDataTypeFloatType)
  | ({ type: "long" } & ValueTypeDataTypeLongType)
  | ({ type: "boolean" } & ValueTypeDataTypeBooleanType)
  | ({ type: "array" } & ValueTypeDataTypeArrayType)
  | ({ type: "binary" } & ValueTypeDataTypeBinaryType)
  | ({ type: "valueTypeReference" } & ValueTypeDataTypeValueTypeReference)
  | ({ type: "short" } & ValueTypeDataTypeShortType)
  | ({ type: "decimal" } & ValueTypeDataTypeDecimalType)
  | ({ type: "map" } & ValueTypeDataTypeMapType)
  | ({ type: "timestamp" } & ValueTypeDataTypeTimestampType);

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeArrayType {
  subType: ValueTypeDataType;
}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeBinaryType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeBooleanType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeByteType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeDateType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeDecimalType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeDoubleType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeFloatType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeIntegerType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeLongType {}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeMapType {
  keyType: ValueTypeDataType;
  valueType: ValueTypeDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeOptionalType {
  wrappedType: ValueTypeDataType;
}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeShortType {}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeStringType {}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeStructElement {
  name: ValueTypeDataTypeStructFieldIdentifier;
  fieldType: ValueTypeDataType;
}

/**
 * Log Safety: UNSAFE
 */
export type ValueTypeDataTypeStructFieldIdentifier = LooselyBrandedString<
  "ValueTypeDataTypeStructFieldIdentifier"
>;

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeStructType {
  fields: Array<ValueTypeDataTypeStructElement>;
}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeTimestampType {}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeDataTypeUnionType {
  memberTypes: Array<ValueTypeDataType>;
}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDataTypeValueTypeReference {
  rid: ValueTypeRid;
  versionId: ValueTypeVersionId;
}

/**
 * A description of the value type.
 *
 * Log Safety: UNSAFE
 */
export type ValueTypeDescription = LooselyBrandedString<"ValueTypeDescription">;

/**
 * A reference to a value type that has been registered in the Ontology.
 *
 * Log Safety: SAFE
 */
export interface ValueTypeReference {
  rid: ValueTypeRid;
  versionId: ValueTypeVersionId;
}

/**
 * The RID of a value type that has been registered in the Ontology.
 *
 * Log Safety: SAFE
 */
export type ValueTypeRid = LooselyBrandedString<"ValueTypeRid">;

/**
 * The version of a value type that has been registered in the Ontology.
 *
 * Log Safety: SAFE
 */
export type ValueTypeVersion = LooselyBrandedString<"ValueTypeVersion">;

/**
 * The version ID of a value type that has been registered in the Ontology.
 *
 * Log Safety: SAFE
 */
export type ValueTypeVersionId = string;

/**
 * Log Safety: UNSAFE
 */
export interface VersionId {
  rid: ValueTypeRid;
  version: ValueTypeVersion;
  versionId: ValueTypeVersionId;
  apiName: ValueTypeApiName;
  displayName: _Core.DisplayName;
  description?: ValueTypeDescription;
  baseType?: ValueTypeDataType;
  constraints: Array<ValueTypeConstraint>;
}
