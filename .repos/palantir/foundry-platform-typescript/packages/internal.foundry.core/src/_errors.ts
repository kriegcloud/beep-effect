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

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * @deprecated Use `ActionContainsDuplicateEdits` in the `internal.foundry.ontologies` package
 *
 * The given action request has multiple edits on the same object.
 *
 * Log Safety: SAFE
 */
export interface ActionContainsDuplicateEdits {
  errorCode: "CONFLICT";
  errorName: "ActionContainsDuplicateEdits";
  errorDescription:
    "The given action request has multiple edits on the same object.";
  errorInstanceId: string;
  parameters: {};
}

/**
* @deprecated Use `ActionEditedPropertiesNotFound` in the `internal.foundry.ontologies` package
*
   * Actions attempted to edit properties that could not be found on the object type.
Please contact the Ontology administrator to resolve this issue.
   *
   * Log Safety: SAFE
   */
export interface ActionEditedPropertiesNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ActionEditedPropertiesNotFound";
  errorDescription:
    "Actions attempted to edit properties that could not be found on the object type. Please contact the Ontology administrator to resolve this issue.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `ActionEditsReadOnlyEntity` in the `internal.foundry.ontologies` package
 *
 * The given action request performs edits on a type that is read-only or does not allow edits.
 *
 * Log Safety: SAFE
 */
export interface ActionEditsReadOnlyEntity {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ActionEditsReadOnlyEntity";
  errorDescription:
    "The given action request performs edits on a type that is read-only or does not allow edits.";
  errorInstanceId: string;
  parameters: {
    entityTypeRid: unknown;
  };
}

/**
 * @deprecated Use `ActionNotFound` in the `internal.foundry.ontologies` package
 *
 * The action is not found, or the user does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface ActionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ActionNotFound";
  errorDescription:
    "The action is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    actionRid: unknown;
  };
}

/**
 * @deprecated Use `ActionParameterInterfaceTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The parameter references an interface type that could not be found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ActionParameterInterfaceTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ActionParameterInterfaceTypeNotFound";
  errorDescription:
    "The parameter references an interface type that could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    parameterId: unknown;
  };
}

/**
 * @deprecated Use `ActionParameterObjectNotFound` in the `internal.foundry.ontologies` package
 *
 * The parameter object reference or parameter default value is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ActionParameterObjectNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ActionParameterObjectNotFound";
  errorDescription:
    "The parameter object reference or parameter default value is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    parameterId: unknown;
  };
}

/**
 * @deprecated Use `ActionParameterObjectTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The parameter references an object type that could not be found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ActionParameterObjectTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ActionParameterObjectTypeNotFound";
  errorDescription:
    "The parameter references an object type that could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    parameterId: unknown;
  };
}

/**
 * @deprecated Use `ActionTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The action type is not found, or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ActionTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ActionTypeNotFound";
  errorDescription:
    "The action type is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    actionType: unknown;
    rid: unknown;
  };
}

/**
* @deprecated Use `ActionValidationFailed` in the `internal.foundry.ontologies` package
*
   * The validation failed for the given action parameters. Please use the validateAction endpoint for more
details.
   *
   * Log Safety: UNSAFE
   */
export interface ActionValidationFailed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ActionValidationFailed";
  errorDescription:
    "The validation failed for the given action parameters. Please use the validateAction endpoint for more details.";
  errorInstanceId: string;
  parameters: {
    actionType: unknown;
  };
}

/**
* @deprecated Use `AggregationGroupCountExceededLimit` in the `internal.foundry.ontologies` package
*
   * The number of groups in the aggregations grouping exceeded the allowed limit. This can typically be fixed by
adjusting your query to reduce the number of groups created by your aggregation. For instance:

If you are using multiple groupBy clauses, try reducing the number of clauses.
If you are using a groupBy clause with a high cardinality property, try filtering the data first
to reduce the number of groups.
   *
   * Log Safety: SAFE
   */
export interface AggregationGroupCountExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AggregationGroupCountExceededLimit";
  errorDescription:
    "The number of groups in the aggregations grouping exceeded the allowed limit. This can typically be fixed by adjusting your query to reduce the number of groups created by your aggregation. For instance:  If you are using multiple groupBy clauses, try reducing the number of clauses. If you are using a groupBy clause with a high cardinality property, try filtering the data first to reduce the number of groups.";
  errorInstanceId: string;
  parameters: {
    groupsCount: unknown;
    groupsLimit: unknown;
  };
}

/**
* @deprecated Use `AggregationMemoryExceededLimit` in the `internal.foundry.ontologies` package
*
   * The amount of memory used in the request exceeded the limit. This can typically be fixed by
adjusting your query to reduce the number of groups created by your aggregation. For instance:

If you are using multiple groupBy clauses, try reducing the number of clauses.
If you are using a groupBy clause with a high cardinality property, try filtering the data first
to reduce the number of groups.
   *
   * Log Safety: SAFE
   */
export interface AggregationMemoryExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AggregationMemoryExceededLimit";
  errorDescription:
    "The amount of memory used in the request exceeded the limit. This can typically be fixed by adjusting your query to reduce the number of groups created by your aggregation. For instance:  If you are using multiple groupBy clauses, try reducing the number of clauses. If you are using a groupBy clause with a high cardinality property, try filtering the data first to reduce the number of groups.";
  errorInstanceId: string;
  parameters: {
    memoryUsedBytes: unknown;
    memoryLimitBytes: unknown;
  };
}

/**
* @deprecated Use `AggregationNestedObjectSetSizeExceededLimit` in the `internal.foundry.ontologies` package
*
   * A nested object set within the aggregation exceeded the allowed limit.
This can be fixed by aggregating over fewer objects, such as by applying a filter.
   *
   * Log Safety: SAFE
   */
export interface AggregationNestedObjectSetSizeExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AggregationNestedObjectSetSizeExceededLimit";
  errorDescription:
    "A nested object set within the aggregation exceeded the allowed limit. This can be fixed by aggregating over fewer objects, such as by applying a filter.";
  errorInstanceId: string;
  parameters: {
    objectsCount: unknown;
    objectsLimit: unknown;
  };
}

/**
   * This feature is only supported in preview mode. Please use preview=true in the query
parameters to call this endpoint.
   *
   * Log Safety: SAFE
   */
export interface ApiFeaturePreviewUsageOnly {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ApiFeaturePreviewUsageOnly";
  errorDescription:
    "This feature is only supported in preview mode. Please use preview=true in the query parameters to call this endpoint.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * You are not allowed to use Palantir APIs.
 *
 * Log Safety: SAFE
 */
export interface ApiUsageDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ApiUsageDenied";
  errorDescription: "You are not allowed to use Palantir APIs.";
  errorInstanceId: string;
  parameters: {
    missingScope: unknown;
  };
}

/**
 * @deprecated Use `ApplyActionFailed` in the `internal.foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ApplyActionFailed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ApplyActionFailed";
  errorDescription: "";
  errorInstanceId: string;
  parameters: {};
}

/**
* @deprecated Use `AttachmentNotFound` in the `internal.foundry.ontologies` package
*
   * The requested attachment is not found, or the client token does not have access to it.
Attachments that are not attached to any objects are deleted after two weeks.
Attachments that have not been attached to an object can only be viewed by the user who uploaded them.
Attachments that have been attached to an object can be viewed by users who can view the object.
   *
   * Log Safety: SAFE
   */
export interface AttachmentNotFound {
  errorCode: "NOT_FOUND";
  errorName: "AttachmentNotFound";
  errorDescription:
    "The requested attachment is not found, or the client token does not have access to it. Attachments that are not attached to any objects are deleted after two weeks. Attachments that have not been attached to an object can only be viewed by the user who uploaded them. Attachments that have been attached to an object can be viewed by users who can view the object.";
  errorInstanceId: string;
  parameters: {
    attachmentRid: unknown;
  };
}

/**
* @deprecated Use `AttachmentSizeExceededLimit` in the `internal.foundry.ontologies` package
*
   * The file is too large to be uploaded as an attachment.
The maximum attachment size is 200MB.
   *
   * Log Safety: UNSAFE
   */
export interface AttachmentSizeExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AttachmentSizeExceededLimit";
  errorDescription:
    "The file is too large to be uploaded as an attachment. The maximum attachment size is 200MB.";
  errorInstanceId: string;
  parameters: {
    fileSizeBytes: unknown;
    fileLimitBytes: unknown;
  };
}

/**
* @deprecated Use `CompositePrimaryKeyNotSupported` in the `internal.foundry.ontologies` package
*
   * Primary keys consisting of multiple properties are not supported by this API. If you need support for this,
please reach out to Palantir Support.
   *
   * Log Safety: UNSAFE
   */
export interface CompositePrimaryKeyNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "CompositePrimaryKeyNotSupported";
  errorDescription:
    "Primary keys consisting of multiple properties are not supported by this API. If you need support for this, please reach out to Palantir Support.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    primaryKey: unknown;
  };
}

/**
 * @deprecated Use `DerivedPropertyApiNamesNotUnique` in the `internal.foundry.ontologies` package
 *
 * At least one of the requested derived property API names already exist on the object set.
 *
 * Log Safety: UNSAFE
 */
export interface DerivedPropertyApiNamesNotUnique {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DerivedPropertyApiNamesNotUnique";
  errorDescription:
    "At least one of the requested derived property API names already exist on the object set.";
  errorInstanceId: string;
  parameters: {
    derivedPropertyApiNames: unknown;
  };
}

/**
 * @deprecated Use `DuplicateOrderBy` in the `internal.foundry.ontologies` package
 *
 * The requested sort order includes duplicate properties.
 *
 * Log Safety: UNSAFE
 */
export interface DuplicateOrderBy {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DuplicateOrderBy";
  errorDescription: "The requested sort order includes duplicate properties.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
 * @deprecated Use `EditObjectPermissionDenied` in the `internal.foundry.ontologies` package
 *
 * The user does not have permission to edit this ObjectType.
 *
 * Log Safety: SAFE
 */
export interface EditObjectPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "EditObjectPermissionDenied";
  errorDescription:
    "The user does not have permission to edit this ObjectType.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested folder could not be found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface FolderNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FolderNotFound";
  errorDescription:
    "The requested folder could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    folderRid: unknown;
  };
}

/**
 * The requested foundry branch could not be found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface FoundryBranchNotFound {
  errorCode: "NOT_FOUND";
  errorName: "FoundryBranchNotFound";
  errorDescription:
    "The requested foundry branch could not be found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    branch: unknown;
  };
}

/**
* @deprecated Use `FunctionEncounteredUserFacingError` in the `internal.foundry.ontologies` package
*
   * The authored function failed to execute because of a user induced error. The message argument
is meant to be displayed to the user.
   *
   * Log Safety: UNSAFE
   */
export interface FunctionEncounteredUserFacingError {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FunctionEncounteredUserFacingError";
  errorDescription:
    "The authored function failed to execute because of a user induced error. The message argument is meant to be displayed to the user.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
    message: unknown;
  };
}

/**
 * @deprecated Use `FunctionExecutionFailed` in the `internal.foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface FunctionExecutionFailed {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FunctionExecutionFailed";
  errorDescription: "";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
    message: unknown;
    stacktrace: unknown;
  };
}

/**
 * @deprecated Use `FunctionExecutionTimedOut` in the `internal.foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface FunctionExecutionTimedOut {
  errorCode: "TIMEOUT";
  errorName: "FunctionExecutionTimedOut";
  errorDescription: "";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
 * @deprecated Use `FunctionInvalidInput` in the `internal.foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface FunctionInvalidInput {
  errorCode: "INVALID_ARGUMENT";
  errorName: "FunctionInvalidInput";
  errorDescription: "";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
 * @deprecated Use `InterfaceTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested interface type is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface InterfaceTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "InterfaceTypeNotFound";
  errorDescription:
    "The requested interface type is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    apiName: unknown;
    rid: unknown;
  };
}

/**
 * @deprecated Use `InterfaceTypesNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested interface types were not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface InterfaceTypesNotFound {
  errorCode: "NOT_FOUND";
  errorName: "InterfaceTypesNotFound";
  errorDescription:
    "The requested interface types were not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    apiName: unknown;
    rid: unknown;
  };
}

/**
 * @deprecated Use `InvalidAggregationOrdering` in the `internal.foundry.ontologies` package
 *
 * Aggregation ordering can only be applied to metrics with exactly one groupBy clause.
 *
 * Log Safety: SAFE
 */
export interface InvalidAggregationOrdering {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationOrdering";
  errorDescription:
    "Aggregation ordering can only be applied to metrics with exactly one groupBy clause.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `InvalidAggregationRange` in the `internal.foundry.ontologies` package
 *
 * Aggregation range should include one lt or lte and one gt or gte.
 *
 * Log Safety: SAFE
 */
export interface InvalidAggregationRange {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationRange";
  errorDescription:
    "Aggregation range should include one lt or lte and one gt or gte.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `InvalidAggregationRangePropertyType` in the `internal.foundry.ontologies` package
 *
 * Range group by is not supported by property type.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidAggregationRangePropertyType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationRangePropertyType";
  errorDescription: "Range group by is not supported by property type.";
  errorInstanceId: string;
  parameters: {
    property: unknown;
    objectType: unknown;
    propertyBaseType: unknown;
  };
}

/**
 * @deprecated Use `InvalidAggregationRangeValue` in the `internal.foundry.ontologies` package
 *
 * Aggregation value does not conform to the expected underlying type.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidAggregationRangeValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationRangeValue";
  errorDescription:
    "Aggregation value does not conform to the expected underlying type.";
  errorInstanceId: string;
  parameters: {
    property: unknown;
    objectType: unknown;
    propertyBaseType: unknown;
  };
}

/**
 * @deprecated Use `InvalidApplyActionOptionCombination` in the `internal.foundry.ontologies` package
 *
 * The given options are individually valid but cannot be used in the given combination.
 *
 * Log Safety: SAFE
 */
export interface InvalidApplyActionOptionCombination {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidApplyActionOptionCombination";
  errorDescription:
    "The given options are individually valid but cannot be used in the given combination.";
  errorInstanceId: string;
  parameters: {
    invalidCombination: unknown;
  };
}

/**
 * @deprecated Use `InvalidContentLength` in the `internal.foundry.ontologies` package
 *
 * A Content-Length header is required for all uploads, but was missing or invalid.
 *
 * Log Safety: SAFE
 */
export interface InvalidContentLength {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidContentLength";
  errorDescription:
    "A Content-Length header is required for all uploads, but was missing or invalid.";
  errorInstanceId: string;
  parameters: {};
}

/**
* @deprecated Use `InvalidContentType` in the `internal.foundry.ontologies` package
*
   * The Content-Type cannot be inferred from the request content and filename.
Please check your request content and filename to ensure they are compatible.
   *
   * Log Safety: SAFE
   */
export interface InvalidContentType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidContentType";
  errorDescription:
    "The Content-Type cannot be inferred from the request content and filename. Please check your request content and filename to ensure they are compatible.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `InvalidDurationGroupByPropertyType` in the `internal.foundry.ontologies` package
 *
 * Invalid property type for duration groupBy.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidDurationGroupByPropertyType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDurationGroupByPropertyType";
  errorDescription: "Invalid property type for duration groupBy.";
  errorInstanceId: string;
  parameters: {
    property: unknown;
    objectType: unknown;
    propertyBaseType: unknown;
  };
}

/**
* @deprecated Use `InvalidDurationGroupByValue` in the `internal.foundry.ontologies` package
*
   * Duration groupBy value is invalid. Units larger than day must have value 1 and date properties do not support
filtering on units smaller than day. As examples, neither bucketing by every two weeks nor bucketing a date by
every two hours are allowed.
   *
   * Log Safety: SAFE
   */
export interface InvalidDurationGroupByValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDurationGroupByValue";
  errorDescription:
    "Duration groupBy value is invalid. Units larger than day must have value 1 and date properties do not support filtering on units smaller than day. As examples, neither bucketing by every two weeks nor bucketing a date by every two hours are allowed.";
  errorInstanceId: string;
  parameters: {};
}

/**
* @deprecated Use `InvalidFields` in the `internal.foundry.ontologies` package
*
   * The value of the given field does not match the expected pattern. For example, an Ontology object property id
should be written properties.id.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidFields {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFields";
  errorDescription:
    "The value of the given field does not match the expected pattern. For example, an Ontology object property id should be written properties.id.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
 * The provided file path is not valid.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidFilePath {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidFilePath";
  errorDescription: "The provided file path is not valid.";
  errorInstanceId: string;
  parameters: {
    filePath: unknown;
  };
}

/**
 * @deprecated Use `InvalidGroupId` in the `internal.foundry.ontologies` package
 *
 * The provided value for a group id must be a UUID.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidGroupId {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidGroupId";
  errorDescription: "The provided value for a group id must be a UUID.";
  errorInstanceId: string;
  parameters: {
    groupId: unknown;
  };
}

/**
 * @deprecated Use `InvalidOrderType` in the `internal.foundry.ontologies` package
 *
 * This query type does not support the provided order type
 *
 * Log Safety: SAFE
 */
export interface InvalidOrderType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidOrderType";
  errorDescription: "This query type does not support the provided order type";
  errorInstanceId: string;
  parameters: {
    orderType: unknown;
  };
}

/**
 * The provided page size was zero or negative. Page sizes must be greater than zero.
 *
 * Log Safety: SAFE
 */
export interface InvalidPageSize {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPageSize";
  errorDescription:
    "The provided page size was zero or negative. Page sizes must be greater than zero.";
  errorInstanceId: string;
  parameters: {
    pageSize: unknown;
  };
}

/**
 * The provided page token could not be used to retrieve the next page of results.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidPageToken {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPageToken";
  errorDescription:
    "The provided page token could not be used to retrieve the next page of results.";
  errorInstanceId: string;
  parameters: {
    pageToken: unknown;
  };
}

/**
 * The given parameters are individually valid but cannot be used in the given combination.
 *
 * Log Safety: SAFE
 */
export interface InvalidParameterCombination {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidParameterCombination";
  errorDescription:
    "The given parameters are individually valid but cannot be used in the given combination.";
  errorInstanceId: string;
  parameters: {
    validCombinations: unknown;
    providedParameters: unknown;
  };
}

/**
* @deprecated Use `InvalidParameterValue` in the `internal.foundry.ontologies` package
*
   * The value of the given parameter is invalid. See the documentation of DataValue for details on
how parameters are represented.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidParameterValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidParameterValue";
  errorDescription:
    "The value of the given parameter is invalid. See the documentation of DataValue for details on how parameters are represented.";
  errorInstanceId: string;
  parameters: {
    parameterBaseType: unknown;
    parameterDataType: unknown;
    parameterId: unknown;
    parameterValue: unknown;
  };
}

/**
 * @deprecated Use `InvalidPropertyFiltersCombination` in the `internal.foundry.ontologies` package
 *
 * The provided filters cannot be used together.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidPropertyFiltersCombination {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPropertyFiltersCombination";
  errorDescription: "The provided filters cannot be used together.";
  errorInstanceId: string;
  parameters: {
    propertyFilters: unknown;
    property: unknown;
  };
}

/**
* @deprecated Use `InvalidPropertyFilterValue` in the `internal.foundry.ontologies` package
*
   * The value of the given property filter is invalid. For instance, 2 is an invalid value for
isNull in properties.address.isNull=2 because the isNull filter expects a value of boolean type.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidPropertyFilterValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPropertyFilterValue";
  errorDescription:
    "The value of the given property filter is invalid. For instance, 2 is an invalid value for isNull in properties.address.isNull=2 because the isNull filter expects a value of boolean type.";
  errorInstanceId: string;
  parameters: {
    expectedType: unknown;
    propertyFilter: unknown;
    propertyFilterValue: unknown;
    property: unknown;
  };
}

/**
 * @deprecated Use `InvalidPropertyType` in the `internal.foundry.ontologies` package
 *
 * The given property type is not of the expected type.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidPropertyType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPropertyType";
  errorDescription: "The given property type is not of the expected type.";
  errorInstanceId: string;
  parameters: {
    propertyBaseType: unknown;
    property: unknown;
  };
}

/**
* @deprecated Use `InvalidPropertyValue` in the `internal.foundry.ontologies` package
*
   * The value of the given property is invalid. See the documentation of PropertyValue for details on
how properties are represented.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidPropertyValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidPropertyValue";
  errorDescription:
    "The value of the given property is invalid. See the documentation of PropertyValue for details on how properties are represented.";
  errorInstanceId: string;
  parameters: {
    propertyBaseType: unknown;
    property: unknown;
    propertyValue: unknown;
  };
}

/**
* @deprecated Use `InvalidQueryParameterValue` in the `internal.foundry.ontologies` package
*
   * The value of the given parameter is invalid. See the documentation of DataValue for details on
how parameters are represented.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidQueryParameterValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidQueryParameterValue";
  errorDescription:
    "The value of the given parameter is invalid. See the documentation of DataValue for details on how parameters are represented.";
  errorInstanceId: string;
  parameters: {
    parameterDataType: unknown;
    parameterId: unknown;
    parameterValue: unknown;
  };
}

/**
 * @deprecated Use `InvalidRangeQuery` in the `internal.foundry.ontologies` package
 *
 * The specified query range filter is invalid.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidRangeQuery {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidRangeQuery";
  errorDescription: "The specified query range filter is invalid.";
  errorInstanceId: string;
  parameters: {
    lt: unknown;
    gt: unknown;
    lte: unknown;
    gte: unknown;
    field: unknown;
  };
}

/**
* @deprecated Use `InvalidSortOrder` in the `internal.foundry.ontologies` package
*
   * The requested sort order of one or more properties is invalid. Valid sort orders are 'asc' or 'desc'. Sort
order can also be omitted, and defaults to 'asc'.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidSortOrder {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidSortOrder";
  errorDescription:
    "The requested sort order of one or more properties is invalid. Valid sort orders are 'asc' or 'desc'. Sort order can also be omitted, and defaults to 'asc'.";
  errorInstanceId: string;
  parameters: {
    invalidSortOrder: unknown;
  };
}

/**
 * @deprecated Use `InvalidSortType` in the `internal.foundry.ontologies` package
 *
 * The requested sort type of one or more clauses is invalid. Valid sort types are 'p' or 'properties'.
 *
 * Log Safety: SAFE
 */
export interface InvalidSortType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidSortType";
  errorDescription:
    "The requested sort type of one or more clauses is invalid. Valid sort types are 'p' or 'properties'.";
  errorInstanceId: string;
  parameters: {
    invalidSortType: unknown;
  };
}

/**
 * @deprecated Use `InvalidUserId` in the `internal.foundry.ontologies` package
 *
 * The provided value for a user id must be a UUID.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidUserId {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidUserId";
  errorDescription: "The provided value for a user id must be a UUID.";
  errorInstanceId: string;
  parameters: {
    userId: unknown;
  };
}

/**
 * @deprecated Use `LinkAlreadyExists` in the `internal.foundry.ontologies` package
 *
 * The link the user is attempting to create already exists.
 *
 * Log Safety: SAFE
 */
export interface LinkAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "LinkAlreadyExists";
  errorDescription: "The link the user is attempting to create already exists.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `LinkedObjectNotFound` in the `internal.foundry.ontologies` package
 *
 * The linked object with the given primary key is not found, or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface LinkedObjectNotFound {
  errorCode: "NOT_FOUND";
  errorName: "LinkedObjectNotFound";
  errorDescription:
    "The linked object with the given primary key is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    linkType: unknown;
    linkedObjectType: unknown;
    linkedObjectPrimaryKey: unknown;
  };
}

/**
 * @deprecated Use `LinkTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The link type is not found, or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface LinkTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "LinkTypeNotFound";
  errorDescription:
    "The link type is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    linkType: unknown;
  };
}

/**
 * @deprecated Use `MalformedPropertyFilters` in the `internal.foundry.ontologies` package
 *
 * At least one of requested filters are malformed. Please look at the documentation of PropertyFilter.
 *
 * Log Safety: UNSAFE
 */
export interface MalformedPropertyFilters {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MalformedPropertyFilters";
  errorDescription:
    "At least one of requested filters are malformed. Please look at the documentation of PropertyFilter.";
  errorInstanceId: string;
  parameters: {
    malformedPropertyFilter: unknown;
  };
}

/**
 * @deprecated Use `MarketplaceActionMappingNotFound` in the `internal.foundry.ontologies` package
 *
 * The given action could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceActionMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceActionMappingNotFound";
  errorDescription:
    "The given action could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    actionType: unknown;
    artifactRepository: unknown;
    packageName: unknown;
  };
}

/**
 * @deprecated Use `MarketplaceInstallationNotFound` in the `internal.foundry.ontologies` package
 *
 * The given marketplace installation could not be found or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceInstallationNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceInstallationNotFound";
  errorDescription:
    "The given marketplace installation could not be found or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    artifactRepository: unknown;
    packageName: unknown;
  };
}

/**
 * @deprecated Use `MarketplaceLinkMappingNotFound` in the `internal.foundry.ontologies` package
 *
 * The given link could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceLinkMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceLinkMappingNotFound";
  errorDescription:
    "The given link could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    linkType: unknown;
    artifactRepository: unknown;
    packageName: unknown;
  };
}

/**
 * @deprecated Use `MarketplaceObjectMappingNotFound` in the `internal.foundry.ontologies` package
 *
 * The given object could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceObjectMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceObjectMappingNotFound";
  errorDescription:
    "The given object could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    artifactRepository: unknown;
    packageName: unknown;
  };
}

/**
 * @deprecated Use `MarketplaceQueryMappingNotFound` in the `internal.foundry.ontologies` package
 *
 * The given query could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceQueryMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceQueryMappingNotFound";
  errorDescription:
    "The given query could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    queryType: unknown;
    artifactRepository: unknown;
    packageName: unknown;
  };
}

/**
* @deprecated Use `MissingParameter` in the `internal.foundry.ontologies` package
*
   * Required parameters are missing. Please look at the parameters field to see which required parameters are
missing from the request.
   *
   * Log Safety: UNSAFE
   */
export interface MissingParameter {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingParameter";
  errorDescription:
    "Required parameters are missing. Please look at the parameters field to see which required parameters are missing from the request.";
  errorInstanceId: string;
  parameters: {
    parameters: unknown;
  };
}

/**
 * A post body is required for this endpoint, but was not found in the request.
 *
 * Log Safety: SAFE
 */
export interface MissingPostBody {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MissingPostBody";
  errorDescription:
    "A post body is required for this endpoint, but was not found in the request.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `MultipleGroupByOnFieldNotSupported` in the `internal.foundry.ontologies` package
 *
 * Aggregation cannot group by on the same field multiple times.
 *
 * Log Safety: UNSAFE
 */
export interface MultipleGroupByOnFieldNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MultipleGroupByOnFieldNotSupported";
  errorDescription:
    "Aggregation cannot group by on the same field multiple times.";
  errorInstanceId: string;
  parameters: {
    duplicateFields: unknown;
  };
}

/**
* @deprecated Use `MultiplePropertyValuesNotSupported` in the `internal.foundry.ontologies` package
*
   * One of the requested property filters does not support multiple values. Please include only a single value for
it.
   *
   * Log Safety: UNSAFE
   */
export interface MultiplePropertyValuesNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "MultiplePropertyValuesNotSupported";
  errorDescription:
    "One of the requested property filters does not support multiple values. Please include only a single value for it.";
  errorInstanceId: string;
  parameters: {
    propertyFilter: unknown;
    property: unknown;
  };
}

/**
 * @deprecated Use `ObjectAlreadyExists` in the `internal.foundry.ontologies` package
 *
 * The object the user is attempting to create already exists.
 *
 * Log Safety: SAFE
 */
export interface ObjectAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "ObjectAlreadyExists";
  errorDescription:
    "The object the user is attempting to create already exists.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `ObjectChanged` in the `internal.foundry.ontologies` package
 *
 * An object used by this Action was changed by someone else while the Action was running.
 *
 * Log Safety: SAFE
 */
export interface ObjectChanged {
  errorCode: "CONFLICT";
  errorName: "ObjectChanged";
  errorDescription:
    "An object used by this Action was changed by someone else while the Action was running.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `ObjectNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested object is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ObjectNotFound";
  errorDescription:
    "The requested object is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    primaryKey: unknown;
  };
}

/**
 * @deprecated Use `ObjectSetNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested object set is not found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface ObjectSetNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ObjectSetNotFound";
  errorDescription:
    "The requested object set is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectSetRid: unknown;
  };
}

/**
* @deprecated Use `ObjectsExceededLimit` in the `internal.foundry.ontologies` package
*
   * There are more objects, but they cannot be returned by this API. Only 10,000 objects are available through this
API for a given request.
   *
   * Log Safety: SAFE
   */
export interface ObjectsExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ObjectsExceededLimit";
  errorDescription:
    "There are more objects, but they cannot be returned by this API. Only 10,000 objects are available through this API for a given request.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `ObjectTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested object type is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ObjectTypeNotFound";
  errorDescription:
    "The requested object type is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    objectTypeRid: unknown;
  };
}

/**
* @deprecated Use `ObjectTypeNotSynced` in the `internal.foundry.ontologies` package
*
   * The requested object type is not synced into the ontology. Please reach out to your Ontology
Administrator to re-index the object type in Ontology Management Application.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectTypeNotSynced {
  errorCode: "CONFLICT";
  errorName: "ObjectTypeNotSynced";
  errorDescription:
    "The requested object type is not synced into the ontology. Please reach out to your Ontology Administrator to re-index the object type in Ontology Management Application.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
  };
}

/**
* @deprecated Use `ObjectTypesNotSynced` in the `internal.foundry.ontologies` package
*
   * One or more of the requested object types are not synced into the ontology. Please reach out to your Ontology
Administrator to re-index the object type(s) in Ontology Management Application.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectTypesNotSynced {
  errorCode: "CONFLICT";
  errorName: "ObjectTypesNotSynced";
  errorDescription:
    "One or more of the requested object types are not synced into the ontology. Please reach out to your Ontology Administrator to re-index the object type(s) in Ontology Management Application.";
  errorInstanceId: string;
  parameters: {
    objectTypes: unknown;
  };
}

/**
 * @deprecated Use `OntologyApiNameNotUnique` in the `internal.foundry.ontologies` package
 *
 * The given Ontology API name is not unique. Use the Ontology RID in place of the Ontology API name.
 *
 * Log Safety: UNSAFE
 */
export interface OntologyApiNameNotUnique {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OntologyApiNameNotUnique";
  errorDescription:
    "The given Ontology API name is not unique. Use the Ontology RID in place of the Ontology API name.";
  errorInstanceId: string;
  parameters: {
    ontologyApiName: unknown;
  };
}

/**
* @deprecated Use `OntologyEditsExceededLimit` in the `internal.foundry.ontologies` package
*
   * The number of edits to the Ontology exceeded the allowed limit.
This may happen because of the request or because the Action is modifying too many objects.
Please change the size of your request or contact the Ontology administrator.
   *
   * Log Safety: UNSAFE
   */
export interface OntologyEditsExceededLimit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "OntologyEditsExceededLimit";
  errorDescription:
    "The number of edits to the Ontology exceeded the allowed limit. This may happen because of the request or because the Action is modifying too many objects. Please change the size of your request or contact the Ontology administrator.";
  errorInstanceId: string;
  parameters: {
    editsCount: unknown;
    editsLimit: unknown;
  };
}

/**
 * @deprecated Use `OntologyNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested Ontology is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface OntologyNotFound {
  errorCode: "NOT_FOUND";
  errorName: "OntologyNotFound";
  errorDescription:
    "The requested Ontology is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    ontologyRid: unknown;
    apiName: unknown;
  };
}

/**
* @deprecated Use `OntologySyncing` in the `internal.foundry.ontologies` package
*
   * The requested object type has been changed in the Ontology Manager and changes are currently being applied. Wait a
few seconds and try again.
   *
   * Log Safety: UNSAFE
   */
export interface OntologySyncing {
  errorCode: "CONFLICT";
  errorName: "OntologySyncing";
  errorDescription:
    "The requested object type has been changed in the Ontology Manager and changes are currently being applied. Wait a few seconds and try again.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
  };
}

/**
* @deprecated Use `OntologySyncingObjectTypes` in the `internal.foundry.ontologies` package
*
   * One or more requested object types have been changed in the Ontology Manager and changes are currently being
applied. Wait a few seconds and try again.
   *
   * Log Safety: UNSAFE
   */
export interface OntologySyncingObjectTypes {
  errorCode: "CONFLICT";
  errorName: "OntologySyncingObjectTypes";
  errorDescription:
    "One or more requested object types have been changed in the Ontology Manager and changes are currently being applied. Wait a few seconds and try again.";
  errorInstanceId: string;
  parameters: {
    objectTypes: unknown;
  };
}

/**
 * @deprecated Use `ParameterObjectNotFound` in the `internal.foundry.ontologies` package
 *
 * The parameter object reference or parameter default value is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ParameterObjectNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ParameterObjectNotFound";
  errorDescription:
    "The parameter object reference or parameter default value is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    primaryKey: unknown;
  };
}

/**
 * @deprecated Use `ParameterObjectSetRidNotFound` in the `internal.foundry.ontologies` package
 *
 * The parameter object set RID is not found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface ParameterObjectSetRidNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ParameterObjectSetRidNotFound";
  errorDescription:
    "The parameter object set RID is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectSetRid: unknown;
  };
}

/**
* @deprecated Use `ParametersNotFound` in the `internal.foundry.ontologies` package
*
   * The provided parameter ID was not found for the action. Please look at the configuredParameterIds field
to see which ones are available.
   *
   * Log Safety: UNSAFE
   */
export interface ParametersNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ParametersNotFound";
  errorDescription:
    "The provided parameter ID was not found for the action. Please look at the configuredParameterIds field to see which ones are available.";
  errorInstanceId: string;
  parameters: {
    actionType: unknown;
    unknownParameterIds: unknown;
    configuredParameterIds: unknown;
  };
}

/**
* @deprecated Use `ParameterTypeNotSupported` in the `internal.foundry.ontologies` package
*
   * The type of the requested parameter is not currently supported by this API. If you need support for this,
please reach out to Palantir Support.
   *
   * Log Safety: UNSAFE
   */
export interface ParameterTypeNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "ParameterTypeNotSupported";
  errorDescription:
    "The type of the requested parameter is not currently supported by this API. If you need support for this, please reach out to Palantir Support.";
  errorInstanceId: string;
  parameters: {
    parameterId: unknown;
    parameterBaseType: unknown;
  };
}

/**
 * @deprecated Use `ParentAttachmentPermissionDenied` in the `internal.foundry.ontologies` package
 *
 * The user does not have permission to parent attachments.
 *
 * Log Safety: SAFE
 */
export interface ParentAttachmentPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ParentAttachmentPermissionDenied";
  errorDescription: "The user does not have permission to parent attachments.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `PropertiesHaveDifferentIds` in the `internal.foundry.ontologies` package
 *
 * Properties used in ordering must have the same ids. Temporary restriction imposed due to OSS limitations.
 *
 * Log Safety: UNSAFE
 */
export interface PropertiesHaveDifferentIds {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertiesHaveDifferentIds";
  errorDescription:
    "Properties used in ordering must have the same ids. Temporary restriction imposed due to OSS limitations.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
* @deprecated Use `PropertiesNotFilterable` in the `internal.foundry.ontologies` package
*
   * Results could not be filtered by the requested properties. Please mark the properties as Searchable and
Selectable in the Ontology Manager to be able to filter on those properties. There may be a short delay
between the time a property is marked Searchable and Selectable and when it can be used.
   *
   * Log Safety: UNSAFE
   */
export interface PropertiesNotFilterable {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertiesNotFilterable";
  errorDescription:
    "Results could not be filtered by the requested properties. Please mark the properties as Searchable and Selectable in the Ontology Manager to be able to filter on those properties. There may be a short delay between the time a property is marked Searchable and Selectable and when it can be used.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
 * @deprecated Use `PropertiesNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested properties are not found on the object type.
 *
 * Log Safety: UNSAFE
 */
export interface PropertiesNotFound {
  errorCode: "NOT_FOUND";
  errorName: "PropertiesNotFound";
  errorDescription:
    "The requested properties are not found on the object type.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    properties: unknown;
  };
}

/**
* @deprecated Use `PropertiesNotSearchable` in the `internal.foundry.ontologies` package
*
   * Search is not enabled on the specified properties. Please mark the properties as Searchable
in the Ontology Manager to enable search on them. There may be a short delay
between the time a property is marked Searchable and when it can be used.
   *
   * Log Safety: UNSAFE
   */
export interface PropertiesNotSearchable {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertiesNotSearchable";
  errorDescription:
    "Search is not enabled on the specified properties. Please mark the properties as Searchable in the Ontology Manager to enable search on them. There may be a short delay between the time a property is marked Searchable and when it can be used.";
  errorInstanceId: string;
  parameters: {
    propertyApiNames: unknown;
  };
}

/**
* @deprecated Use `PropertiesNotSortable` in the `internal.foundry.ontologies` package
*
   * Results could not be ordered by the requested properties. Please mark the properties as Searchable and
Sortable in the Ontology Manager to enable their use in orderBy parameters. There may be a short delay
between the time a property is set to Searchable and Sortable and when it can be used.
   *
   * Log Safety: UNSAFE
   */
export interface PropertiesNotSortable {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertiesNotSortable";
  errorDescription:
    "Results could not be ordered by the requested properties. Please mark the properties as Searchable and Sortable in the Ontology Manager to enable their use in orderBy parameters. There may be a short delay between the time a property is set to Searchable and Sortable and when it can be used.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
* @deprecated Use `PropertyApiNameNotFound` in the `internal.foundry.ontologies` package
*
   * A property that was required to have an API name, such as a primary key, is missing one. You can set an API
name for it using the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export interface PropertyApiNameNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyApiNameNotFound";
  errorDescription:
    "A property that was required to have an API name, such as a primary key, is missing one. You can set an API name for it using the Ontology Manager.";
  errorInstanceId: string;
  parameters: {
    propertyId: unknown;
    propertyBaseType: unknown;
  };
}

/**
* @deprecated Use `PropertyBaseTypeNotSupported` in the `internal.foundry.ontologies` package
*
   * The type of the requested property is not currently supported by this API. If you need support for this,
please reach out to Palantir Support.
   *
   * Log Safety: UNSAFE
   */
export interface PropertyBaseTypeNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyBaseTypeNotSupported";
  errorDescription:
    "The type of the requested property is not currently supported by this API. If you need support for this, please reach out to Palantir Support.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    property: unknown;
    propertyBaseType: unknown;
  };
}

/**
* @deprecated Use `PropertyFiltersNotSupported` in the `internal.foundry.ontologies` package
*
   * At least one of the requested property filters are not supported. See the documentation of PropertyFilter for
a list of supported property filters.
   *
   * Log Safety: UNSAFE
   */
export interface PropertyFiltersNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyFiltersNotSupported";
  errorDescription:
    "At least one of the requested property filters are not supported. See the documentation of PropertyFilter for a list of supported property filters.";
  errorInstanceId: string;
  parameters: {
    propertyFilters: unknown;
    property: unknown;
  };
}

/**
 * @deprecated Use `PropertyNotFound` in the `internal.foundry.ontologies` package
 *
 * Failed to find a provided property for a given object.
 *
 * Log Safety: SAFE
 */
export interface PropertyNotFound {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyNotFound";
  errorDescription: "Failed to find a provided property for a given object.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `PropertyTypeDoesNotSupportNearestNeighbors` in the `internal.foundry.ontologies` package
 *
 * The provided propertyIdentifier is not configured with an embedding model in the ontology.
 *
 * Log Safety: SAFE
 */
export interface PropertyTypeDoesNotSupportNearestNeighbors {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyTypeDoesNotSupportNearestNeighbors";
  errorDescription:
    "The provided propertyIdentifier is not configured with an embedding model in the ontology.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `PropertyTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested property type is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "PropertyTypeNotFound";
  errorDescription:
    "The requested property type is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    objectTypeApiName: unknown;
    propertyApiName: unknown;
  };
}

/**
* @deprecated Use `PropertyTypesSearchNotSupported` in the `internal.foundry.ontologies` package
*
   * The search on the property types are not supported. See the Search Objects documentation for
a list of supported search queries on different property types.
   *
   * Log Safety: UNSAFE
   */
export interface PropertyTypesSearchNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyTypesSearchNotSupported";
  errorDescription:
    "The search on the property types are not supported. See the Search Objects documentation for a list of supported search queries on different property types.";
  errorInstanceId: string;
  parameters: {
    parameters: unknown;
  };
}

/**
* @deprecated Use `QueryEncounteredUserFacingError` in the `internal.foundry.ontologies` package
*
   * The authored Query failed to execute because of a user induced error. The message argument
is meant to be displayed to the user.
   *
   * Log Safety: UNSAFE
   */
export interface QueryEncounteredUserFacingError {
  errorCode: "CONFLICT";
  errorName: "QueryEncounteredUserFacingError";
  errorDescription:
    "The authored Query failed to execute because of a user induced error. The message argument is meant to be displayed to the user.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
    message: unknown;
  };
}

/**
 * @deprecated Use `QueryMemoryExceededLimit` in the `internal.foundry.ontologies` package
 *
 * Memory limits were exceeded for the Query execution.
 *
 * Log Safety: UNSAFE
 */
export interface QueryMemoryExceededLimit {
  errorCode: "TIMEOUT";
  errorName: "QueryMemoryExceededLimit";
  errorDescription: "Memory limits were exceeded for the Query execution.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
 * @deprecated Use `QueryNotFound` in the `internal.foundry.ontologies` package
 *
 * The query is not found, or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface QueryNotFound {
  errorCode: "NOT_FOUND";
  errorName: "QueryNotFound";
  errorDescription:
    "The query is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    query: unknown;
  };
}

/**
 * @deprecated Use `QueryRuntimeError` in the `internal.foundry.ontologies` package
 *
 * The authored Query failed to execute because of a runtime error.
 *
 * Log Safety: UNSAFE
 */
export interface QueryRuntimeError {
  errorCode: "INVALID_ARGUMENT";
  errorName: "QueryRuntimeError";
  errorDescription:
    "The authored Query failed to execute because of a runtime error.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
    message: unknown;
    stacktrace: unknown;
    parameters: unknown;
  };
}

/**
 * @deprecated Use `QueryTimeExceededLimit` in the `internal.foundry.ontologies` package
 *
 * Time limits were exceeded for the Query execution.
 *
 * Log Safety: UNSAFE
 */
export interface QueryTimeExceededLimit {
  errorCode: "TIMEOUT";
  errorName: "QueryTimeExceededLimit";
  errorDescription: "Time limits were exceeded for the Query execution.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
 * The provided resource name is already in use by another resource in the same folder.
 *
 * Log Safety: UNSAFE
 */
export interface ResourceNameAlreadyExists {
  errorCode: "CONFLICT";
  errorName: "ResourceNameAlreadyExists";
  errorDescription:
    "The provided resource name is already in use by another resource in the same folder.";
  errorInstanceId: string;
  parameters: {
    parentFolderRid: unknown;
    resourceName: unknown;
  };
}

/**
 * @deprecated Use `SearchVectorDimensionsDiffer` in the `internal.foundry.ontologies` package
 *
 * The dimensions of the provided vector don't match the dimensions of the embedding model being queried.
 *
 * Log Safety: SAFE
 */
export interface SearchVectorDimensionsDiffer {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SearchVectorDimensionsDiffer";
  errorDescription:
    "The dimensions of the provided vector don't match the dimensions of the embedding model being queried.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * @deprecated Use `SharedPropertiesNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested shared property types are not present on every object type.
 *
 * Log Safety: UNSAFE
 */
export interface SharedPropertiesNotFound {
  errorCode: "NOT_FOUND";
  errorName: "SharedPropertiesNotFound";
  errorDescription:
    "The requested shared property types are not present on every object type.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    missingSharedProperties: unknown;
  };
}

/**
 * @deprecated Use `SharedPropertyTypeNotFound` in the `internal.foundry.ontologies` package
 *
 * The requested shared property type is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface SharedPropertyTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "SharedPropertyTypeNotFound";
  errorDescription:
    "The requested shared property type is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    apiName: unknown;
    rid: unknown;
  };
}

/**
 * @deprecated Use `TooManyNearestNeighborsRequested` in the `internal.foundry.ontologies` package
 *
 * The value of numNeighbors must be in the range 1 <= numNeighbors <= 500.
 *
 * Log Safety: SAFE
 */
export interface TooManyNearestNeighborsRequested {
  errorCode: "INVALID_ARGUMENT";
  errorName: "TooManyNearestNeighborsRequested";
  errorDescription:
    "The value of numNeighbors must be in the range 1 <= numNeighbors <= 500.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * An unknown distance unit was provided.
 *
 * Log Safety: UNSAFE
 */
export interface UnknownDistanceUnit {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnknownDistanceUnit";
  errorDescription: "An unknown distance unit was provided.";
  errorInstanceId: string;
  parameters: {
    unknownUnit: unknown;
    knownUnits: unknown;
  };
}

/**
* @deprecated Use `UnknownParameter` in the `internal.foundry.ontologies` package
*
   * The provided parameters were not found. Please look at the knownParameters field
to see which ones are available.
   *
   * Log Safety: UNSAFE
   */
export interface UnknownParameter {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnknownParameter";
  errorDescription:
    "The provided parameters were not found. Please look at the knownParameters field to see which ones are available.";
  errorInstanceId: string;
  parameters: {
    unknownParameters: unknown;
    expectedParameters: unknown;
  };
}

/**
 * @deprecated Use `UnsupportedObjectSet` in the `internal.foundry.ontologies` package
 *
 * The requested object set is not supported.
 *
 * Log Safety: SAFE
 */
export interface UnsupportedObjectSet {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnsupportedObjectSet";
  errorDescription: "The requested object set is not supported.";
  errorInstanceId: string;
  parameters: {};
}

/**
* @deprecated Use `ViewObjectPermissionDenied` in the `internal.foundry.ontologies` package
*
   * The provided token does not have permission to view any data sources backing this object type. Ensure the object
type has backing data sources configured and visible.
   *
   * Log Safety: UNSAFE
   */
export interface ViewObjectPermissionDenied {
  errorCode: "PERMISSION_DENIED";
  errorName: "ViewObjectPermissionDenied";
  errorDescription:
    "The provided token does not have permission to view any data sources backing this object type. Ensure the object type has backing data sources configured and visible.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
  };
}
