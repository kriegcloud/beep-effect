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
   * The given aggregation cannot be performed with the requested accuracy.
Try allowing approximate results or adjust your aggregation request.
   *
   * Log Safety: SAFE
   */
export interface AggregationAccuracyNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AggregationAccuracyNotSupported";
  errorDescription:
    "The given aggregation cannot be performed with the requested accuracy. Try allowing approximate results or adjust your aggregation request.";
  errorInstanceId: string;
  parameters: {};
}

/**
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
   * The requested aggregation metric is not supported by the storage backend.
Consider migrating queried object types to Object Storage V2. See
https://www.palantir.com/docs/foundry/object-backend/osv1-osv2-migration
for more details.
   *
   * Log Safety: SAFE
   */
export interface AggregationMetricNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "AggregationMetricNotSupported";
  errorDescription:
    "The requested aggregation metric is not supported by the storage backend. Consider migrating queried object types to Object Storage V2. See https://www.palantir.com/docs/foundry/object-backend/osv1-osv2-migration for more details.";
  errorInstanceId: string;
  parameters: {
    metricType: unknown;
  };
}

/**
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
 * The provided attachment RID already exists and cannot be overwritten.
 *
 * Log Safety: SAFE
 */
export interface AttachmentRidAlreadyExists {
  errorCode: "NOT_FOUND";
  errorName: "AttachmentRidAlreadyExists";
  errorDescription:
    "The provided attachment RID already exists and cannot be overwritten.";
  errorInstanceId: string;
  parameters: {
    attachmentRid: unknown;
  };
}

/**
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
   * The Cipher Channel was not found.
It either does not exist, or you do not have permission to see it.
   *
   * Log Safety: SAFE
   */
export interface CipherChannelNotFound {
  errorCode: "NOT_FOUND";
  errorName: "CipherChannelNotFound";
  errorDescription:
    "The Cipher Channel was not found. It either does not exist, or you do not have permission to see it.";
  errorInstanceId: string;
  parameters: {
    cipherChannel: unknown;
  };
}

/**
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
   * An Ontology objects read failed because the Ontology snapshot snapshot used for consistent reads became
stale. Retrying the request typically resolves this.
   *
   * Log Safety: SAFE
   */
export interface ConsistentSnapshotError {
  errorCode: "CONFLICT";
  errorName: "ConsistentSnapshotError";
  errorDescription:
    "An Ontology objects read failed because the Ontology snapshot snapshot used for consistent reads became stale. Retrying the request typically resolves this.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * Exact match groupBy clause cannot specify a default value and allow null values.
 *
 * Log Safety: SAFE
 */
export interface DefaultAndNullGroupsNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "DefaultAndNullGroupsNotSupported";
  errorDescription:
    "Exact match groupBy clause cannot specify a default value and allow null values.";
  errorInstanceId: string;
  parameters: {};
}

/**
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
 * High-scale compute was required for this Ontology query but is not enabled on this enrollment.
 *
 * Log Safety: SAFE
 */
export interface HighScaleComputationNotEnabled {
  errorCode: "TIMEOUT";
  errorName: "HighScaleComputationNotEnabled";
  errorDescription:
    "High-scale compute was required for this Ontology query but is not enabled on this enrollment.";
  errorInstanceId: string;
  parameters: {};
}

/**
   * A wrapper object set type is incompatible with one or more of the nested object set types.
For example, an interfaceLinkSearchAround object set wrapping a non-interface object set.
   *
   * Log Safety: SAFE
   */
export interface IncompatibleNestedObjectSet {
  errorCode: "INVALID_ARGUMENT";
  errorName: "IncompatibleNestedObjectSet";
  errorDescription:
    "A wrapper object set type is incompatible with one or more of the nested object set types. For example, an interfaceLinkSearchAround object set wrapping a non-interface object set.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested object set type is not supported for interface-based object sets.
 *
 * Log Safety: SAFE
 */
export interface InterfaceBasedObjectSetNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InterfaceBasedObjectSetNotSupported";
  errorDescription:
    "The requested object set type is not supported for interface-based object sets.";
  errorInstanceId: string;
  parameters: {};
}

/**
 * The requested interface link type is not found, or the client token does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface InterfaceLinkTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "InterfaceLinkTypeNotFound";
  errorDescription:
    "The requested interface link type is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    interfaceTypeApiName: unknown;
    interfaceTypeRid: unknown;
    interfaceLinkTypeApiName: unknown;
    interfaceLinkTypeRid: unknown;
  };
}

/**
 * Properties used in ordering must have the same ids.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertiesHaveDifferentIds {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InterfacePropertiesHaveDifferentIds";
  errorDescription: "Properties used in ordering must have the same ids.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
 * The requested interface property types are not present on every object type.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertiesNotFound {
  errorCode: "NOT_FOUND";
  errorName: "InterfacePropertiesNotFound";
  errorDescription:
    "The requested interface property types are not present on every object type.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    missingInterfaceProperties: unknown;
  };
}

/**
 * The requested interface property was not found on the interface type.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertyNotFound {
  errorCode: "NOT_FOUND";
  errorName: "InterfacePropertyNotFound";
  errorDescription:
    "The requested interface property was not found on the interface type.";
  errorInstanceId: string;
  parameters: {
    interfaceType: unknown;
    interfaceProperty: unknown;
  };
}

/**
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
 * Aggregation ordering cannot be applied for groupBy clauses that allow null values.
 *
 * Log Safety: SAFE
 */
export interface InvalidAggregationOrderingWithNullValues {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationOrderingWithNullValues";
  errorDescription:
    "Aggregation ordering cannot be applied for groupBy clauses that allow null values.";
  errorInstanceId: string;
  parameters: {};
}

/**
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
 * Range group by is not supported by interface property type.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidAggregationRangePropertyTypeForInterface {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationRangePropertyTypeForInterface";
  errorDescription:
    "Range group by is not supported by interface property type.";
  errorInstanceId: string;
  parameters: {
    interfaceProperty: unknown;
    interfaceType: unknown;
    propertyBaseType: unknown;
  };
}

/**
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
 * Aggregation value does not conform to the expected underlying type.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidAggregationRangeValueForInterface {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidAggregationRangeValueForInterface";
  errorDescription:
    "Aggregation value does not conform to the expected underlying type.";
  errorInstanceId: string;
  parameters: {
    interfaceProperty: unknown;
    interfaceType: unknown;
    propertyBaseType: unknown;
  };
}

/**
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
 * Derived property definition was invalid due to shape of query or type checking.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidDerivedPropertyDefinition {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDerivedPropertyDefinition";
  errorDescription:
    "Derived property definition was invalid due to shape of query or type checking.";
  errorInstanceId: string;
  parameters: {
    objectType: unknown;
    derivedProperty: unknown;
  };
}

/**
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
 * Invalid interface property type for duration groupBy.
 *
 * Log Safety: UNSAFE
 */
export interface InvalidDurationGroupByPropertyTypeForInterface {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidDurationGroupByPropertyTypeForInterface";
  errorDescription: "Invalid interface property type for duration groupBy.";
  errorInstanceId: string;
  parameters: {
    interfaceProperty: unknown;
    interfaceType: unknown;
    propertyBaseType: unknown;
  };
}

/**
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
   * The value of the query's output is invalid. This may be because the return value did not match the specified
output type or constraints.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidQueryOutputValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidQueryOutputValue";
  errorDescription:
    "The value of the query's output is invalid. This may be because the return value did not match the specified output type or constraints.";
  errorInstanceId: string;
  parameters: {
    outputDataType: unknown;
    outputValue: unknown;
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
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
   * The value of the given property is invalid. See the documentation of DataValue for details on
how properties are represented for transaction edits.
   *
   * Log Safety: UNSAFE
   */
export interface InvalidTransactionEditPropertyValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidTransactionEditPropertyValue";
  errorDescription:
    "The value of the given property is invalid. See the documentation of DataValue for details on how properties are represented for transaction edits.";
  errorInstanceId: string;
  parameters: {
    propertyApiName: unknown;
    propertyBaseType: unknown;
    propertyValue: unknown;
  };
}

/**
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
 * The dimensions of the provided vector don't match the dimensions of the embedding model being queried.
 *
 * Log Safety: SAFE
 */
export interface InvalidVectorDimension {
  errorCode: "INVALID_ARGUMENT";
  errorName: "InvalidVectorDimension";
  errorDescription:
    "The dimensions of the provided vector don't match the dimensions of the embedding model being queried.";
  errorInstanceId: string;
  parameters: {
    expectedSize: unknown;
    providedSize: unknown;
  };
}

/**
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
    linkTypeId: unknown;
  };
}

/**
 * Bulk loading object set links is not supported by Object Storage v1.
 *
 * Log Safety: SAFE
 */
export interface LoadObjectSetLinksNotSupported {
  errorCode: "FAILED_PRECONDITION";
  errorName: "LoadObjectSetLinksNotSupported";
  errorDescription:
    "Bulk loading object set links is not supported by Object Storage v1.";
  errorInstanceId: string;
  parameters: {};
}

/**
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
 * The given action could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceSdkActionMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkActionMappingNotFound";
  errorDescription:
    "The given action could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    actionType: unknown;
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
 * The given marketplace installation could not be found or the user does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface MarketplaceSdkInstallationNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkInstallationNotFound";
  errorDescription:
    "The given marketplace installation could not be found or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
 * The given link could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceSdkLinkMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkLinkMappingNotFound";
  errorDescription:
    "The given link could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    linkType: unknown;
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
 * The given object could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceSdkObjectMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkObjectMappingNotFound";
  errorDescription:
    "The given object could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    localObjectType: unknown;
    objectType: unknown;
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
 * The given property could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceSdkPropertyMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkPropertyMappingNotFound";
  errorDescription:
    "The given property could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    propertyType: unknown;
    objectType: unknown;
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
 * The given query could not be mapped to a Marketplace installation.
 *
 * Log Safety: UNSAFE
 */
export interface MarketplaceSdkQueryMappingNotFound {
  errorCode: "NOT_FOUND";
  errorName: "MarketplaceSdkQueryMappingNotFound";
  errorDescription:
    "The given query could not be mapped to a Marketplace installation.";
  errorInstanceId: string;
  parameters: {
    queryType: unknown;
    sdkPackageRid: unknown;
    sdkVersion: unknown;
  };
}

/**
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
   * The value intended for decryption with Cipher is not formatted correctly.
It may already be a plaintext value and not require decryption.
Ensure it is correctly formatted (CIPHERCIPHER).
   *
   * Log Safety: UNSAFE
   */
export interface NotCipherFormatted {
  errorCode: "INVALID_ARGUMENT";
  errorName: "NotCipherFormatted";
  errorDescription:
    "The value intended for decryption with Cipher is not formatted correctly. It may already be a plaintext value and not require decryption. Ensure it is correctly formatted (CIPHERCIPHER).";
  errorInstanceId: string;
  parameters: {
    value: unknown;
  };
}

/**
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
 * An object used by this Action was changed by someone else while the Action was running.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectChanged {
  errorCode: "CONFLICT";
  errorName: "ObjectChanged";
  errorDescription:
    "An object used by this Action was changed by someone else while the Action was running.";
  errorInstanceId: string;
  parameters: {
    primaryKey: unknown;
    objectType: unknown;
  };
}

/**
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
   * The provided objects are being modified concurrently and the operation would result in a conflict.
The client should retry the request later.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectsModifiedConcurrently {
  errorCode: "CONFLICT";
  errorName: "ObjectsModifiedConcurrently";
  errorDescription:
    "The provided objects are being modified concurrently and the operation would result in a conflict. The client should retry the request later.";
  errorInstanceId: string;
  parameters: {
    functionRid: unknown;
    functionVersion: unknown;
  };
}

/**
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
 * Properties used in ordering must have the same ids.
 *
 * Log Safety: UNSAFE
 */
export interface PropertiesHaveDifferentIds {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertiesHaveDifferentIds";
  errorDescription: "Properties used in ordering must have the same ids.";
  errorInstanceId: string;
  parameters: {
    properties: unknown;
  };
}

/**
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
 * A property that does not support exact matching is used in a setting that requires exact matching.
 *
 * Log Safety: SAFE
 */
export interface PropertyExactMatchingNotSupported {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyExactMatchingNotSupported";
  errorDescription:
    "A property that does not support exact matching is used in a setting that requires exact matching.";
  errorInstanceId: string;
  parameters: {
    propertyBaseType: unknown;
    propertyTypeRid: unknown;
  };
}

/**
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
 * Could not find the given property on the object. The user may not have permissions to see this property or it may be configured incorrectly.
 *
 * Log Safety: SAFE
 */
export interface PropertyNotFoundOnObject {
  errorCode: "INVALID_ARGUMENT";
  errorName: "PropertyNotFoundOnObject";
  errorDescription:
    "Could not find the given property on the object. The user may not have permissions to see this property or it may be configured incorrectly.";
  errorInstanceId: string;
  parameters: {
    objectTypeRid: unknown;
    objectRid: unknown;
    objectPropertyRid: unknown;
  };
}

/**
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
 * The requested property type RID is not found, or the client token does not have access to it.
 *
 * Log Safety: SAFE
 */
export interface PropertyTypeRidNotFound {
  errorCode: "NOT_FOUND";
  errorName: "PropertyTypeRidNotFound";
  errorDescription:
    "The requested property type RID is not found, or the client token does not have access to it.";
  errorInstanceId: string;
  parameters: {
    propertyTypeRid: unknown;
  };
}

/**
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
 * The query could not be found at the provided version.
 *
 * Log Safety: UNSAFE
 */
export interface QueryVersionNotFound {
  errorCode: "NOT_FOUND";
  errorName: "QueryVersionNotFound";
  errorDescription: "The query could not be found at the provided version.";
  errorInstanceId: string;
  parameters: {
    apiName: unknown;
    version: unknown;
  };
}

/**
 * Unable to decrypt this CipherText because the available rate limits in Cipher licenses were reached.
 *
 * Log Safety: SAFE
 */
export interface RateLimitReached {
  errorCode: "PERMISSION_DENIED";
  errorName: "RateLimitReached";
  errorDescription:
    "Unable to decrypt this CipherText because the available rate limits in Cipher licenses were reached.";
  errorInstanceId: string;
  parameters: {
    cipherChannel: unknown;
  };
}

/**
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
 * The value of the similarity threshold must be in the range 0 <= threshold <= 1.
 *
 * Log Safety: SAFE
 */
export interface SimilarityThresholdOutOfRange {
  errorCode: "INVALID_ARGUMENT";
  errorName: "SimilarityThresholdOutOfRange";
  errorDescription:
    "The value of the similarity threshold must be in the range 0 <= threshold <= 1.";
  errorInstanceId: string;
  parameters: {
    providedThreshold: unknown;
  };
}

/**
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
  parameters: {
    requestedNumNeighbors: unknown;
    maxNumNeighbors: unknown;
  };
}

/**
 * The provided token does not have permission to take a specific Cipher operation.
 *
 * Log Safety: SAFE
 */
export interface UnauthorizedCipherOperation {
  errorCode: "PERMISSION_DENIED";
  errorName: "UnauthorizedCipherOperation";
  errorDescription:
    "The provided token does not have permission to take a specific Cipher operation.";
  errorInstanceId: string;
  parameters: {
    cipherChannel: unknown;
  };
}

/**
   * The value intended for decryption with Cipher cannot be decrypted.
Ensure it is correctly formatted (CIPHER::CIPHER).
   *
   * Log Safety: UNSAFE
   */
export interface UndecryptableValue {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UndecryptableValue";
  errorDescription:
    "The value intended for decryption with Cipher cannot be decrypted. Ensure it is correctly formatted (CIPHER::CIPHER).";
  errorInstanceId: string;
  parameters: {
    value: unknown;
  };
}

/**
   * One or more unique identifier link IDs specified in apply action overrides could not be found
in the ActionType definition.
   *
   * Log Safety: SAFE
   */
export interface UniqueIdentifierLinkIdsDoNotExistInActionType {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UniqueIdentifierLinkIdsDoNotExistInActionType";
  errorDescription:
    "One or more unique identifier link IDs specified in apply action overrides could not be found in the ActionType definition.";
  errorInstanceId: string;
  parameters: {
    unknownUniqueIdentifierLinkIds: unknown;
  };
}

/**
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
 * Aggregations on interface-based object sets are not supported for object sets with OSv1 objects.
 *
 * Log Safety: UNSAFE
 */
export interface UnsupportedInterfaceBasedObjectSet {
  errorCode: "INVALID_ARGUMENT";
  errorName: "UnsupportedInterfaceBasedObjectSet";
  errorDescription:
    "Aggregations on interface-based object sets are not supported for object sets with OSv1 objects.";
  errorInstanceId: string;
  parameters: {
    interfaceType: unknown;
  };
}

/**
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
 * The value type is not found, or the user does not have access to it.
 *
 * Log Safety: UNSAFE
 */
export interface ValueTypeNotFound {
  errorCode: "NOT_FOUND";
  errorName: "ValueTypeNotFound";
  errorDescription:
    "The value type is not found, or the user does not have access to it.";
  errorInstanceId: string;
  parameters: {
    valueType: unknown;
    rid: unknown;
  };
}

/**
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
