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
import type * as _Geo from "@osdk/foundry.geo";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * ISO 8601 timestamps forming a range for a time series query. Start is inclusive and end is exclusive.
 *
 * Log Safety: UNSAFE
 */
export interface AbsoluteTimeRange {
  startTime?: string;
  endTime?: string;
}

/**
 * Calculates absolute value of a numeric value.
 *
 * Log Safety: UNSAFE
 */
export interface AbsoluteValuePropertyExpression {
  property: DerivedPropertyDefinition;
}

/**
 * Log Safety: UNSAFE
 */
export type Action = LooselyBrandedString<"Action">;

/**
 * An ISO 8601 timestamp.
 *
 * Log Safety: SAFE
 */
export type ActionExecutionTime = string;

/**
 * A detailed operation for an Action
 *
 * Log Safety: UNSAFE
 */
export type ActionLogicRule =
  | ({ type: "modifyInterface" } & ModifyInterfaceLogicRule)
  | ({ type: "createOrModifyObject" } & CreateOrModifyObjectLogicRule)
  | ({ type: "modifyObject" } & ModifyObjectLogicRule)
  | ({ type: "deleteLink" } & DeleteLinkLogicRule)
  | ({ type: "createObject" } & CreateObjectLogicRule)
  | ({ type: "createLink" } & CreateLinkLogicRule)
  | ({ type: "batchedFunction" } & BatchedFunctionLogicRule)
  | ({ type: "createOrModifyObjectV2" } & CreateOrModifyObjectLogicRuleV2)
  | ({ type: "deleteInterfaceLink" } & DeleteInterfaceLinkLogicRule)
  | ({ type: "deleteObject" } & DeleteObjectLogicRule)
  | ({ type: "function" } & FunctionLogicRule)
  | ({ type: "createInterfaceLink" } & CreateInterfaceLinkLogicRule)
  | ({ type: "createInterface" } & CreateInterfaceLogicRule);

/**
 * Log Safety: SAFE
 */
export type ActionMode = "ASYNC" | "RUN" | "VALIDATE";

/**
 * Log Safety: UNSAFE
 */
export interface ActionParameterArrayType {
  subType: ActionParameterType;
}

/**
 * A union of all the types supported by Ontology Action parameters.
 *
 * Log Safety: UNSAFE
 */
export type ActionParameterType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "interfaceObject" } & OntologyInterfaceObjectType)
  | ({ type: "struct" } & OntologyStructType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "geoshape" } & _Core.GeoShapeType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "objectType" } & OntologyObjectTypeReferenceType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "marking" } & _Core.MarkingType)
  | ({ type: "attachment" } & _Core.AttachmentType)
  | ({ type: "mediaReference" } & _Core.MediaReferenceType)
  | ({ type: "array" } & ActionParameterArrayType)
  | ({ type: "objectSet" } & OntologyObjectSetType)
  | ({ type: "geohash" } & _Core.GeohashType)
  | ({ type: "vector" } & _Core.VectorType)
  | ({ type: "object" } & OntologyObjectType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Details about a parameter of an action.
 *
 * Log Safety: UNSAFE
 */
export interface ActionParameterV2 {
  displayName: _Core.DisplayName;
  description?: string;
  dataType: ActionParameterType;
  required: boolean;
  typeClasses: Array<TypeClass>;
}

/**
 * Log Safety: UNSAFE
 */
export type ActionResults =
  | ({ type: "edits" } & ObjectEdits)
  | ({ type: "largeScaleEdits" } & ObjectTypeEdits);

/**
 * The unique resource identifier for an action.
 *
 * Log Safety: SAFE
 */
export type ActionRid = LooselyBrandedString<"ActionRid">;

/**
 * Represents an action type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface ActionType {
  apiName: ActionTypeApiName;
  description?: string;
  displayName?: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  parameters: Record<ParameterId, Parameter>;
  rid: ActionTypeRid;
  operations: Array<LogicRule>;
}

/**
   * The name of the action type in the API. To find the API name for your Action Type, use the List action types
endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type ActionTypeApiName = LooselyBrandedString<"ActionTypeApiName">;

/**
 * Returns the full metadata for an Action type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface ActionTypeFullMetadata {
  actionType: ActionTypeV2;
  fullLogicRules: Array<ActionLogicRule>;
}

/**
 * The unique resource identifier of an action type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type ActionTypeRid = LooselyBrandedString<"ActionTypeRid">;

/**
 * Represents an action type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface ActionTypeV2 {
  apiName: ActionTypeApiName;
  description?: string;
  displayName?: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  parameters: Record<ParameterId, ActionParameterV2>;
  rid: ActionTypeRid;
  operations: Array<LogicRule>;
  toolDescription?: string;
}

/**
   * This status indicates that the PropertyType will not change on short notice and should thus be safe to use in
user facing workflows.
   *
   * Log Safety: SAFE
   */
export interface ActivePropertyTypeStatus {}

/**
 * Log Safety: UNSAFE
 */
export interface AddLink {
  linkTypeApiNameAtoB: LinkTypeApiName;
  linkTypeApiNameBtoA: LinkTypeApiName;
  aSideObject: LinkSideObject;
  bSideObject: LinkSideObject;
}

/**
 * Log Safety: UNSAFE
 */
export interface AddLinkEdit {
  objectType: ObjectTypeApiName;
  primaryKey: PrimaryKeyValue;
  linkType: LinkTypeApiName;
  linkedObjectPrimaryKey: PrimaryKeyValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface AddObject {
  primaryKey: PropertyValue;
  objectType: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface AddObjectEdit {
  objectType: ObjectTypeApiName;
  properties: Record<PropertyApiName, DataValue | undefined>;
}

/**
 * Adds two or more numeric values.
 *
 * Log Safety: UNSAFE
 */
export interface AddPropertyExpression {
  properties: Array<DerivedPropertyDefinition>;
}

/**
 * Log Safety: UNSAFE
 */
export interface Affix {
  prefix?: PropertyTypeReferenceOrStringConstant;
  postfix?: PropertyTypeReferenceOrStringConstant;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectSetRequestV2 {
  aggregation: Array<AggregationV2>;
  objectSet: ObjectSet;
  groupBy: Array<AggregationGroupByV2>;
  accuracy?: AggregationAccuracyRequest;
  includeComputeUsage?: _Core.IncludeComputeUsage;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsRequest {
  aggregation: Array<Aggregation>;
  query?: SearchJsonQuery;
  groupBy: Array<AggregationGroupBy>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsRequestV2 {
  aggregation: Array<AggregationV2>;
  where?: SearchJsonQueryV2;
  groupBy: Array<AggregationGroupByV2>;
  accuracy?: AggregationAccuracyRequest;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsResponse {
  excludedItems?: number;
  nextPageToken?: _Core.PageToken;
  data: Array<AggregateObjectsResponseItem>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsResponseItem {
  group: Record<AggregationGroupKey, AggregationGroupValue>;
  metrics: Array<AggregationMetricResult>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsResponseItemV2 {
  group: Record<AggregationGroupKeyV2, AggregationGroupValueV2 | undefined>;
  metrics: Array<AggregationMetricResultV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateObjectsResponseV2 {
  excludedItems?: number;
  accuracy: AggregationAccuracy;
  data: Array<AggregateObjectsResponseItemV2>;
  computeUsage?: _Core.ComputeSeconds;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregateTimeSeries {
  method: TimeSeriesAggregationMethod;
  strategy: TimeSeriesAggregationStrategy;
}

/**
 * Specifies an aggregation function.
 *
 * Log Safety: UNSAFE
 */
export type Aggregation =
  | ({ type: "approximateDistinct" } & ApproximateDistinctAggregation)
  | ({ type: "min" } & MinAggregation)
  | ({ type: "avg" } & AvgAggregation)
  | ({ type: "max" } & MaxAggregation)
  | ({ type: "count" } & CountAggregation)
  | ({ type: "sum" } & SumAggregation);

/**
 * Log Safety: SAFE
 */
export type AggregationAccuracy = "ACCURATE" | "APPROXIMATE";

/**
 * Log Safety: SAFE
 */
export type AggregationAccuracyRequest =
  | "REQUIRE_ACCURATE"
  | "ALLOW_APPROXIMATE";

/**
   * Divides objects into groups according to an interval. Note that this grouping applies only on date types.
The interval uses the ISO 8601 notation. For example, "PT1H2M34S" represents a duration of 3754 seconds.
   *
   * Log Safety: UNSAFE
   */
export interface AggregationDurationGrouping {
  field: FieldNameV1;
  duration: Duration;
}

/**
   * Divides objects into groups according to an interval. Note that this grouping applies only on date and timestamp types.
When grouping by YEARS, QUARTERS, MONTHS, or WEEKS, the value must be set to 1.
   *
   * Log Safety: UNSAFE
   */
export interface AggregationDurationGroupingV2 {
  field: PropertyApiName;
  value: number;
  unit: TimeUnit;
}

/**
 * Divides objects into groups according to an exact value.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationExactGrouping {
  field: FieldNameV1;
  maxGroupCount?: number;
}

/**
 * Divides objects into groups according to an exact value.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationExactGroupingV2 {
  field: PropertyApiName;
  maxGroupCount?: number;
  defaultValue?: string;
  includeNullValues?: boolean;
}

/**
 * Divides objects into groups with the specified width.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationFixedWidthGrouping {
  field: FieldNameV1;
  fixedWidth: number;
}

/**
 * Divides objects into groups with the specified width.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationFixedWidthGroupingV2 {
  field: PropertyApiName;
  fixedWidth: number;
}

/**
 * Specifies a grouping for aggregation results.
 *
 * Log Safety: UNSAFE
 */
export type AggregationGroupBy =
  | ({ type: "duration" } & AggregationDurationGrouping)
  | ({ type: "fixedWidth" } & AggregationFixedWidthGrouping)
  | ({ type: "ranges" } & AggregationRangesGrouping)
  | ({ type: "exact" } & AggregationExactGrouping);

/**
 * Specifies a grouping for aggregation results.
 *
 * Log Safety: UNSAFE
 */
export type AggregationGroupByV2 =
  | ({ type: "duration" } & AggregationDurationGroupingV2)
  | ({ type: "fixedWidth" } & AggregationFixedWidthGroupingV2)
  | ({ type: "ranges" } & AggregationRangesGroupingV2)
  | ({ type: "exact" } & AggregationExactGroupingV2);

/**
 * Log Safety: UNSAFE
 */
export type AggregationGroupKey = LooselyBrandedString<"AggregationGroupKey">;

/**
 * Log Safety: UNSAFE
 */
export type AggregationGroupKeyV2 = LooselyBrandedString<
  "AggregationGroupKeyV2"
>;

/**
 * Log Safety: UNSAFE
 */
export type AggregationGroupValue = any;

/**
 * Log Safety: UNSAFE
 */
export type AggregationGroupValueV2 = any;

/**
 * A user-specified alias for an aggregation metric name.
 *
 * Log Safety: UNSAFE
 */
export type AggregationMetricName = LooselyBrandedString<
  "AggregationMetricName"
>;

/**
 * Log Safety: UNSAFE
 */
export interface AggregationMetricResult {
  name: string;
  value?: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface AggregationMetricResultV2 {
  name: string;
  value?: any;
}

/**
   * Divides objects into groups based on their object type. This grouping is only useful when aggregating across
multiple object types, such as when aggregating over an interface type.
   *
   * Log Safety: SAFE
   */
export interface AggregationObjectTypeGrouping {}

/**
 * Log Safety: UNSAFE
 */
export interface AggregationOrderBy {
  metricName: string;
}

/**
 * Specifies a date range from an inclusive start date to an exclusive end date.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationRange {
  lt?: any;
  lte?: any;
  gt?: any;
  gte?: any;
}

/**
 * Divides objects into groups according to specified ranges.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationRangesGrouping {
  field: FieldNameV1;
  ranges: Array<AggregationRange>;
}

/**
 * Divides objects into groups according to specified ranges.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationRangesGroupingV2 {
  field: PropertyApiName;
  ranges: Array<AggregationRangeV2>;
}

/**
 * Specifies a range from an inclusive start value to an exclusive end value.
 *
 * Log Safety: UNSAFE
 */
export interface AggregationRangeV2 {
  startValue: any;
  endValue: any;
}

/**
 * Specifies an aggregation function.
 *
 * Log Safety: UNSAFE
 */
export type AggregationV2 =
  | ({ type: "approximateDistinct" } & ApproximateDistinctAggregationV2)
  | ({ type: "min" } & MinAggregationV2)
  | ({ type: "avg" } & AvgAggregationV2)
  | ({ type: "max" } & MaxAggregationV2)
  | ({ type: "approximatePercentile" } & ApproximatePercentileAggregationV2)
  | ({ type: "count" } & CountAggregationV2)
  | ({ type: "sum" } & SumAggregationV2)
  | ({ type: "exactDistinct" } & ExactDistinctAggregationV2);

/**
 * Matches intervals satisfying all the rules in the query
 *
 * Log Safety: UNSAFE
 */
export interface AllOfRule {
  rules: Array<IntervalQueryRule>;
  maxGaps?: number;
  ordered: boolean;
}

/**
   * Returns objects where the specified field contains all of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching.
   *
   * Log Safety: UNSAFE
   */
export interface AllTermsQuery {
  field: FieldNameV1;
  value: string;
  fuzzy?: Fuzzy;
}

/**
 * Returns objects where every query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface AndQuery {
  value: Array<SearchJsonQuery>;
}

/**
 * Returns objects where every query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface AndQueryV2 {
  value: Array<SearchJsonQueryV2>;
}

/**
 * Matches intervals satisfying any of the rules in the query
 *
 * Log Safety: UNSAFE
 */
export interface AnyOfRule {
  rules: Array<IntervalQueryRule>;
}

/**
   * Returns objects where the specified field contains any of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching.
   *
   * Log Safety: UNSAFE
   */
export interface AnyTermQuery {
  field: FieldNameV1;
  value: string;
  fuzzy?: Fuzzy;
}

/**
 * If not specified, defaults to VALIDATE_AND_EXECUTE.
 *
 * Log Safety: SAFE
 */
export type ApplyActionMode = "VALIDATE_ONLY" | "VALIDATE_AND_EXECUTE";

/**
 * Log Safety: SAFE
 */
export interface ApplyActionOverrides {
  uniqueIdentifierLinkIdValues: Record<
    UniqueIdentifierLinkId,
    UniqueIdentifierValue
  >;
  actionExecutionTime?: ActionExecutionTime;
}

/**
 * Log Safety: UNSAFE
 */
export interface ApplyActionRequest {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: SAFE
 */
export interface ApplyActionRequestOptions {
  mode?: ApplyActionMode;
  returnEdits?: ReturnEditsMode;
}

/**
 * Log Safety: UNSAFE
 */
export interface ApplyActionRequestV2 {
  options?: ApplyActionRequestOptions;
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: SAFE
 */
export interface ApplyActionResponse {}

/**
 * Log Safety: UNSAFE
 */
export interface ApplyActionWithOverridesRequest {
  request: ApplyActionRequestV2;
  overrides: ApplyActionOverrides;
}

/**
 * Performs both apply reducers and extract main value to return the reduced main value.
 *
 * Log Safety: SAFE
 */
export interface ApplyReducersAndExtractMainValueLoadLevel {}

/**
 * Returns a single value of an array as configured in the ontology.
 *
 * Log Safety: SAFE
 */
export interface ApplyReducersLoadLevel {}

/**
 * Computes an approximate number of distinct values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface ApproximateDistinctAggregation {
  field: FieldNameV1;
  name?: AggregationMetricName;
}

/**
 * Computes an approximate number of distinct values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface ApproximateDistinctAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Computes the approximate percentile value for the provided field. Requires Object Storage V2.
 *
 * Log Safety: UNSAFE
 */
export interface ApproximatePercentileAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  approximatePercentile: number;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export interface Arg {
  name: string;
  value: string;
}

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
 * Evaluated constraints for entries of array parameters for which per-entry evaluation is supported.
 *
 * Log Safety: UNSAFE
 */
export type ArrayEntryEvaluatedConstraint = {
  type: "struct";
} & StructEvaluatedConstraint;

/**
 * Evaluated constraints of array parameters that support per-entry constraint evaluations.
 *
 * Log Safety: UNSAFE
 */
export interface ArrayEvaluatedConstraint {
  entries: Array<ArrayEntryEvaluatedConstraint>;
}

/**
 * The parameter expects an array of values and the size of the array must fall within the defined range.
 *
 * Log Safety: UNSAFE
 */
export interface ArraySizeConstraint {
  lt?: any;
  lte?: any;
  gt?: any;
  gte?: any;
}

/**
 * Log Safety: SAFE
 */
export type ArtifactRepositoryRid = LooselyBrandedString<
  "ArtifactRepositoryRid"
>;

/**
 * Log Safety: SAFE
 */
export type AsyncActionOperation = undefined; // {"locator":{"namespaceName":"Ontologies","localName":"AsyncActionOperation"},"type":{"type":"asyncOperation","asyncOperation":{"operationType":"applyActionAsync","resultType":{"locator":{"namespaceName":"Ontologies","localName":"AsyncApplyActionResponse"}},"stageType":{"locator":{"namespaceName":"Ontologies","localName":"AsyncActionStatus"}}}},"safety":"SAFE","documentation":{"example":[]}}

/**
 * Log Safety: SAFE
 */
export type AsyncActionStatus =
  | "RUNNING_SUBMISSION_CHECKS"
  | "EXECUTING_WRITE_BACK_WEBHOOK"
  | "COMPUTING_ONTOLOGY_EDITS"
  | "COMPUTING_FUNCTION"
  | "WRITING_ONTOLOGY_EDITS"
  | "EXECUTING_SIDE_EFFECT_WEBHOOK"
  | "SENDING_NOTIFICATIONS";

/**
 * Log Safety: SAFE
 */
export interface AsyncApplyActionOperationResponseV2 {}

/**
 * Log Safety: SAFE
 */
export type AsyncApplyActionOperationV2 = undefined; // {"locator":{"namespaceName":"Ontologies","localName":"AsyncApplyActionOperationV2"},"type":{"type":"asyncOperation","asyncOperation":{"operationType":"applyActionAsyncV2","resultType":{"locator":{"namespaceName":"Ontologies","localName":"AsyncApplyActionOperationResponseV2"}},"stageType":{"locator":{"namespaceName":"Ontologies","localName":"AsyncActionStatus"}}}},"safety":"SAFE","documentation":{"example":[]}}

/**
 * Log Safety: UNSAFE
 */
export interface AsyncApplyActionRequest {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: UNSAFE
 */
export interface AsyncApplyActionRequestV2 {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: SAFE
 */
export interface AsyncApplyActionResponse {}

/**
 * Log Safety: SAFE
 */
export interface AsyncApplyActionResponseV2 {
  operationId: string;
}

/**
 * The representation of an attachment.
 *
 * Log Safety: UNSAFE
 */
export interface Attachment {
  rid: AttachmentRid;
  filename: _Core.Filename;
  sizeBytes: _Core.SizeBytes;
  mediaType: _Core.MediaType;
}

/**
 * The attachment metadata response
 *
 * Log Safety: UNSAFE
 */
export type AttachmentMetadataResponse =
  | ({ type: "single" } & AttachmentV2)
  | ({ type: "multiple" } & ListAttachmentsResponseV2);

/**
 * The representation of an attachment as a data type.
 *
 * Log Safety: SAFE
 */
export interface AttachmentProperty {
  rid: AttachmentRid;
}

/**
 * Log Safety: UNSAFE
 */
export type AttachmentPropertyV2 = LooselyBrandedString<"AttachmentPropertyV2">;

/**
 * The unique resource identifier of an attachment.
 *
 * Log Safety: SAFE
 */
export type AttachmentRid = LooselyBrandedString<"AttachmentRid">;

/**
 * The representation of an attachment.
 *
 * Log Safety: UNSAFE
 */
export interface AttachmentV2 {
  rid: AttachmentRid;
  filename: _Core.Filename;
  sizeBytes: _Core.SizeBytes;
  mediaType: _Core.MediaType;
}

/**
 * Computes the average value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface AvgAggregation {
  field: FieldNameV1;
  name?: AggregationMetricName;
}

/**
 * Computes the average value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface AvgAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export type BatchActionObjectEdit =
  | ({ type: "modifyObject" } & ModifyObject)
  | ({ type: "addObject" } & AddObject)
  | ({ type: "addLink" } & AddLink);

/**
 * Log Safety: UNSAFE
 */
export interface BatchActionObjectEdits {
  edits: Array<BatchActionObjectEdit>;
  addedObjectCount: number;
  modifiedObjectsCount: number;
  deletedObjectsCount: number;
  addedLinksCount: number;
  deletedLinksCount: number;
}

/**
 * Log Safety: UNSAFE
 */
export type BatchActionResults =
  | ({ type: "edits" } & BatchActionObjectEdits)
  | ({ type: "largeScaleEdits" } & ObjectTypeEdits);

/**
 * Log Safety: UNSAFE
 */
export interface BatchApplyActionRequest {
  requests: Array<ApplyActionRequest>;
}

/**
 * Log Safety: UNSAFE
 */
export interface BatchApplyActionRequestItem {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: SAFE
 */
export interface BatchApplyActionRequestOptions {
  returnEdits?: BatchReturnEditsMode;
}

/**
 * Log Safety: UNSAFE
 */
export interface BatchApplyActionRequestV2 {
  options?: BatchApplyActionRequestOptions;
  requests: Array<BatchApplyActionRequestItem>;
}

/**
 * Log Safety: SAFE
 */
export interface BatchApplyActionResponse {}

/**
 * Log Safety: UNSAFE
 */
export interface BatchApplyActionResponseV2 {
  edits?: BatchActionResults;
}

/**
 * Log Safety: UNSAFE
 */
export interface BatchedFunctionLogicRule {
  objectSetRidInputName: FunctionParameterName;
  functionRule: FunctionLogicRule;
}

/**
 * If not specified, defaults to NONE.
 *
 * Log Safety: SAFE
 */
export type BatchReturnEditsMode = "ALL" | "NONE";

/**
 * Log Safety: UNSAFE
 */
export interface BlueprintIcon {
  color: string;
  name: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface BooleanValue {
  value: boolean;
}

/**
 * The top left and bottom right coordinate points that make up the bounding box.
 *
 * Log Safety: UNSAFE
 */
export interface BoundingBoxValue {
  topLeft: WithinBoundingBoxPoint;
  bottomRight: WithinBoundingBoxPoint;
}

/**
 * The coordinate point to use as the center of the distance query.
 *
 * Log Safety: UNSAFE
 */
export interface CenterPoint {
  center: CenterPointTypes;
  distance: _Core.Distance;
}

/**
 * Log Safety: UNSAFE
 */
export type CenterPointTypes = { type: "Point" } & _Geo.GeoPoint;

/**
 * Log Safety: UNSAFE
 */
export type CipherTextProperty = LooselyBrandedString<"CipherTextProperty">;

/**
   * The conjunctive set of markings required to access the property value.
All markings from a conjunctive set must be met for access.
   *
   * Log Safety: UNSAFE
   */
export type ConjunctiveMarkingSummary = Array<MarkingId>;

/**
   * The conjunctive set of markings for the container of this property value,
such as the project of a dataset. These markings may differ from the marking
on the actual property value, but still must be satisfied for accessing the property
All markings from a conjunctive set must be met for access.
   *
   * Log Safety: UNSAFE
   */
export type ContainerConjunctiveMarkingSummary = Array<MarkingId>;

/**
   * The disjunctive set of markings for the container of this property value,
such as the project of a dataset. These markings may differ from the marking
on the actual property value, but still must be satisfied for accessing the property

All markings from a conjunctive set must be met for access.
Disjunctive markings are represented as a conjunctive list of disjunctive sets.
The top-level set is a conjunction of sets, where each inner set should be
treated as a unit where any marking within the set can satisfy the set.
All sets within the top level set should be satisfied.
   *
   * Log Safety: UNSAFE
   */
export type ContainerDisjunctiveMarkingSummary = Array<Array<MarkingId>>;

/**
   * Returns objects where the specified field contains all of the terms in the order provided,
but they do have to be adjacent to each other.
The last term can be a partial prefix match. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier can be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAllTermsInOrderPrefixLastTerm {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
   * Returns objects where the specified field contains all of the terms in the order provided,
but they do have to be adjacent to each other. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAllTermsInOrderQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
   * Returns objects where the specified field contains all of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAllTermsQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
  fuzzy?: FuzzyV2;
}

/**
   * Returns objects where the specified field contains any of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAnyTermQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
  fuzzy?: FuzzyV2;
}

/**
 * Returns objects where the specified array contains a value.
 *
 * Log Safety: UNSAFE
 */
export interface ContainsQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified array contains a value. Allows you to specify a property to query on by a
variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Computes the total count of objects.
 *
 * Log Safety: UNSAFE
 */
export interface CountAggregation {
  name?: AggregationMetricName;
}

/**
 * Computes the total count of objects.
 *
 * Log Safety: UNSAFE
 */
export interface CountAggregationV2 {
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export interface CountObjectsResponseV2 {
  count?: number;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateEdit {
  properties: Record<PropertyApiName, PropertyValue>;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateInterfaceLinkLogicRule {
  interfaceTypeApiName: InterfaceTypeApiName;
  interfaceLinkTypeApiName: InterfaceLinkTypeApiName;
  sourceObject: ParameterId;
  targetObject: ParameterId;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateInterfaceLogicRule {
  interfaceTypeApiName: InterfaceTypeApiName;
  objectType: ParameterId;
  sharedPropertyArguments: Record<SharedPropertyTypeApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    SharedPropertyTypeApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateInterfaceObjectRule {
  interfaceTypeApiName: InterfaceTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateLinkLogicRule {
  linkTypeApiName: LinkTypeApiName;
  sourceObject: ParameterId;
  targetObject: ParameterId;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateLinkRule {
  linkTypeApiNameAtoB: LinkTypeApiName;
  linkTypeApiNameBtoA: LinkTypeApiName;
  aSideObjectTypeApiName: ObjectTypeApiName;
  bSideObjectTypeApiName: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateObjectLogicRule {
  objectTypeApiName: ObjectTypeApiName;
  propertyArguments: Record<PropertyApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    PropertyApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateObjectRule {
  objectTypeApiName: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateOrModifyObjectLogicRule {
  objectTypeApiName: ObjectTypeApiName;
  propertyArguments: Record<PropertyApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    PropertyApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateOrModifyObjectLogicRuleV2 {
  objectToModify: ParameterId;
  propertyArguments: Record<PropertyApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    PropertyApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface CreateTemporaryObjectSetRequestV2 {
  objectSet: ObjectSet;
}

/**
 * Log Safety: SAFE
 */
export interface CreateTemporaryObjectSetResponseV2 {
  objectSetRid: ObjectSetRid;
}

/**
 * Represents the current time argument in a logic rule.
 *
 * Log Safety: SAFE
 */
export interface CurrentTimeArgument {}

/**
 * Represents the current user argument in a logic rule.
 *
 * Log Safety: SAFE
 */
export interface CurrentUserArgument {}

/**
 * A UUID representing a custom type in a given Function.
 *
 * Log Safety: SAFE
 */
export type CustomTypeId = LooselyBrandedString<"CustomTypeId">;

/**
   * Represents the value of data in the following format. Note that these values can be nested, for example an array of structs.
| Type                                | JSON encoding                                         | Example                                                                                                                                                       |
|-------------------------------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Array                               | array                                                 | ["alpha", "bravo", "charlie"]                                                                                                                               |
| Attachment                          | string                                                | "ri.attachments.main.attachment.2f944bae-5851-4204-8615-920c969a9f2e"                                                                                       |
| Boolean                             | boolean                                               | true                                                                                                                                                        |
| Byte                                | number                                                | 31                                                                                                                                                          |
| CipherText                          | string                                                | "CIPHER::ri.bellaso.main.cipher-channel.e414ab9e-b606-499a-a0e1-844fa296ba7e::unzjs3VifsTxuIpf1fH1CJ7OaPBr2bzMMdozPaZJtCii8vVG60yXIEmzoOJaEl9mfFFe::CIPHER" |
| Date                                | ISO 8601 extended local date string                   | "2021-05-01"                                                                                                                                                |
| Decimal                             | string                                                | "2.718281828"                                                                                                                                               |
| Double                              | number                                                | 3.14159265                                                                                                                                                  |
| EntrySet                            | array of JSON objects                                 | [{"key": "EMP1234", "value": "true"}, {"key": "EMP4444", "value": "false"}]                                                                                 |
| Float                               | number                                                | 3.14159265                                                                                                                                                  |
| Integer                             | number                                                | 238940                                                                                                                                                      |
| Long                                | string                                                | "58319870951433"                                                                                                                                            |
| Marking                             | string                                                | "MU"                                                                                                                                                        |
| Null                                | null                                                  | null                                                                                                                                                        |
| Object Set                          | string OR the object set definition                   | ri.object-set.main.versioned-object-set.h13274m8-23f5-431c-8aee-a4554157c57z                                                                                |
| Ontology Object Reference           | JSON encoding of the object's primary key             | 10033123 or "EMP1234"                                                                                                                                     |
| Ontology Interface Object Reference | JSON encoding of the object's API name and primary key| {"objectTypeApiName":"Employee", "primaryKeyValue":"EMP1234"}                                                                                               |
| Ontology Object Type Reference      | string of the object type's api name                  | "Employee"                                                                                                                                                  |
| Set                                 | array                                                 | ["alpha", "bravo", "charlie"]                                                                                                                               |
| Short                               | number                                                | 8739                                                                                                                                                        |
| String                              | string                                                | "Call me Ishmael"                                                                                                                                           |
| Struct                              | JSON object                                           | {"name": "John Doe", "age": 42}                                                                                                                             |
| TwoDimensionalAggregation           | JSON object                                           | {"groups": [{"key": "alpha", "value": 100}, {"key": "beta", "value": 101}]}                                                                                 |
| ThreeDimensionalAggregation         | JSON object                                           | {"groups": [{"key": "NYC", "groups": [{"key": "Engineer", "value" : 100}]}]}                                                                                |
| Timestamp                           | ISO 8601 extended offset date-time string in UTC zone | "2021-01-04T05:00:00Z"                                                                                                                                      |
   *
   * Log Safety: UNSAFE
   */
export type DataValue = any;

/**
 * Log Safety: UNSAFE
 */
export type DatetimeFormat =
  | ({ type: "stringFormat" } & DatetimeStringFormat)
  | ({ type: "localizedFormat" } & DatetimeLocalizedFormat);

/**
 * Predefined localized formatting options.
 *
 * Log Safety: SAFE
 */
export interface DatetimeLocalizedFormat {
  format: DatetimeLocalizedFormatType;
}

/**
 * Localized date/time format types.
 *
 * Log Safety: SAFE
 */
export type DatetimeLocalizedFormatType =
  | "DATE_FORMAT_RELATIVE_TO_NOW"
  | "DATE_FORMAT_DATE"
  | "DATE_FORMAT_YEAR_AND_MONTH"
  | "DATE_FORMAT_DATE_TIME"
  | "DATE_FORMAT_DATE_TIME_SHORT"
  | "DATE_FORMAT_TIME"
  | "DATE_FORMAT_ISO_INSTANT";

/**
 * A strictly specified date format pattern.
 *
 * Log Safety: SAFE
 */
export interface DatetimeStringFormat {
  pattern: string;
}

/**
 * Log Safety: UNSAFE
 */
export type DatetimeTimezone =
  | ({ type: "static" } & DatetimeTimezoneStatic)
  | ({ type: "user" } & DatetimeTimezoneUser);

/**
 * Log Safety: UNSAFE
 */
export interface DatetimeTimezoneStatic {
  zoneId: PropertyTypeReferenceOrStringConstant;
}

/**
 * The user's local timezone.
 *
 * Log Safety: SAFE
 */
export interface DatetimeTimezoneUser {}

/**
 * Log Safety: UNSAFE
 */
export interface DateValue {
  value: string;
}

/**
 * The result of a CipherText decryption. If successful, the plaintext decrypted value will be returned. Otherwise, an error will be thrown.
 *
 * Log Safety: DO_NOT_LOG
 */
export interface DecryptionResult {
  plaintext?: Plaintext;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteEdit {
  previousProperties: Record<PropertyApiName, PropertyValue>;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteInterfaceLinkLogicRule {
  interfaceTypeApiName: InterfaceTypeApiName;
  interfaceLinkTypeApiName: InterfaceLinkTypeApiName;
  sourceObject: ParameterId;
  targetObject: ParameterId;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteInterfaceObjectRule {
  interfaceTypeApiName: InterfaceTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteLink {
  linkTypeApiNameAtoB: LinkTypeApiName;
  linkTypeApiNameBtoA: LinkTypeApiName;
  aSideObject: LinkSideObject;
  bSideObject: LinkSideObject;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteLinkEdit {
  objectType: ObjectTypeApiName;
  primaryKey: PrimaryKeyValue;
  linkType: LinkTypeApiName;
  linkedObjectPrimaryKey: PrimaryKeyValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteLinkLogicRule {
  linkTypeApiName: LinkTypeApiName;
  sourceObject: ParameterId;
  targetObject: ParameterId;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteLinkRule {
  linkTypeApiNameAtoB: LinkTypeApiName;
  linkTypeApiNameBtoA: LinkTypeApiName;
  aSideObjectTypeApiName: ObjectTypeApiName;
  bSideObjectTypeApiName: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteObject {
  primaryKey: PropertyValue;
  objectType: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteObjectEdit {
  objectType: ObjectTypeApiName;
  primaryKey: PropertyValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteObjectLogicRule {
  objectToDelete: ParameterId;
}

/**
 * Log Safety: UNSAFE
 */
export interface DeleteObjectRule {
  objectTypeApiName: ObjectTypeApiName;
}

/**
   * This status indicates that the PropertyType is reaching the end of its life and will be removed as per the
deadline specified.
   *
   * Log Safety: UNSAFE
   */
export interface DeprecatedPropertyTypeStatus {
  message: string;
  deadline: string;
  replacedBy?: PropertyTypeRid;
}

/**
 * The name of the derived property that will be returned.
 *
 * Log Safety: UNSAFE
 */
export type DerivedPropertyApiName = LooselyBrandedString<
  "DerivedPropertyApiName"
>;

/**
 * Definition of a derived property.
 *
 * Log Safety: UNSAFE
 */
export type DerivedPropertyDefinition =
  | ({ type: "add" } & AddPropertyExpression)
  | ({ type: "absoluteValue" } & AbsoluteValuePropertyExpression)
  | ({ type: "extract" } & ExtractPropertyExpression)
  | ({ type: "selection" } & SelectedPropertyExpression)
  | ({ type: "negate" } & NegatePropertyExpression)
  | ({ type: "subtract" } & SubtractPropertyExpression)
  | ({ type: "property" } & PropertyApiNameSelector)
  | ({ type: "least" } & LeastPropertyExpression)
  | ({ type: "divide" } & DividePropertyExpression)
  | ({ type: "multiply" } & MultiplyPropertyExpression)
  | ({ type: "greatest" } & GreatestPropertyExpression);

/**
 * The representation of a time series property backed by a derived time series calculated with a formula.
 *
 * Log Safety: UNSAFE
 */
export interface DerivedTimeSeriesProperty {
  templateRid: TimeseriesTemplateRid;
  templateVersion?: TimeseriesTemplateVersion;
}

/**
   * The disjunctive set of markings required to access the property value.
Disjunctive markings are represented as a conjunctive list of disjunctive sets.
The top-level set is a conjunction of sets, where each inner set should be
treated as a unit where any marking within the set can satisfy the set.
All sets within the top level set should be satisfied.
   *
   * Log Safety: UNSAFE
   */
export type DisjunctiveMarkingSummary = Array<Array<MarkingId>>;

/**
 * Divides the left numeric value by the right numeric value.
 *
 * Log Safety: UNSAFE
 */
export interface DividePropertyExpression {
  left: DerivedPropertyDefinition;
  right: DerivedPropertyDefinition;
}

/**
   * Returns objects where the specified field does not intersect the bounding box provided. Allows you to specify a
property to query on by a variety of means. Either field or propertyIdentifier must be supplied, but not
both.
   *
   * Log Safety: UNSAFE
   */
export interface DoesNotIntersectBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
   * Returns objects where the specified field does not intersect the polygon provided. Allows you to specify a
property to query on by a variety of means. Either field or propertyIdentifier must be supplied, but not
both.
   *
   * Log Safety: UNSAFE
   */
export interface DoesNotIntersectPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface DoubleValue {
  value: number;
}

/**
   * The vector to search with. The vector must be of the same dimension as the vectors stored in the provided
propertyIdentifier.
   *
   * Log Safety: UNSAFE
   */
export interface DoubleVector {
  value: Array<number>;
}

/**
 * An ISO 8601 formatted duration.
 *
 * Log Safety: UNSAFE
 */
export type Duration = LooselyBrandedString<"Duration">;

/**
 * Specifies the unit of the input duration value.
 *
 * Log Safety: SAFE
 */
export type DurationBaseValue = "SECONDS" | "MILLISECONDS";

/**
 * Log Safety: UNSAFE
 */
export type DurationFormatStyle =
  | ({ type: "humanReadable" } & HumanReadableFormat)
  | ({ type: "timecode" } & TimeCodeFormat);

/**
 * Specifies the maximum precision to apply when formatting a duration.
 *
 * Log Safety: SAFE
 */
export type DurationPrecision =
  | "DAYS"
  | "HOURS"
  | "MINUTES"
  | "SECONDS"
  | "AUTO";

/**
 * Log Safety: UNSAFE
 */
export type EditHistoryEdit =
  | ({ type: "createEdit" } & CreateEdit)
  | ({ type: "deleteEdit" } & DeleteEdit)
  | ({ type: "modifyEdit" } & ModifyEdit);

/**
 * Log Safety: UNSAFE
 */
export interface EditsHistoryFilters {
  startTime?: string;
  endTime?: string;
  actionTypes: Array<ActionTypeApiName>;
  editTypes: Array<EditTypeFilter>;
  userIds: Array<string>;
}

/**
 * Log Safety: SAFE
 */
export type EditsHistorySortOrder = "newest_first" | "oldest_first";

/**
 * Log Safety: SAFE
 */
export type EditTypeFilter = "create" | "modify" | "delete";

/**
 * Log Safety: UNSAFE
 */
export interface EntrySetType {
  keyType: QueryDataType;
  valueType: QueryDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface EnumConstraint {
  options: Array<PropertyValue | undefined>;
}

/**
   * Returns objects where the specified field is equal to a value.
For string properties, full term matching only works when Selectable is enabled for the property in Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export interface EqualsQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified field is equal to a value. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
For string properties, full term matching only works when Selectable is enabled for the property in Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export interface EqualsQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface Error {
  error: ErrorName;
  args: Array<Arg>;
}

/**
 * Indicates the server was not able to load the securities of the property.
 *
 * Log Safety: SAFE
 */
export interface ErrorComputingSecurity {}

/**
 * Log Safety: SAFE
 */
export type ErrorName = LooselyBrandedString<"ErrorName">;

/**
 * Computes an exact number of distinct values for the provided field. May be slower than an approximate distinct aggregation. Requires Object Storage V2.
 *
 * Log Safety: UNSAFE
 */
export interface ExactDistinctAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
   * This status indicates that the PropertyType is an example. It is backed by notional data that should not be
used for actual workflows, but can be used to test those workflows.
   *
   * Log Safety: SAFE
   */
export interface ExamplePropertyTypeStatus {}

/**
 * Log Safety: UNSAFE
 */
export interface ExecuteQueryRequest {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ExecuteQueryResponse {
  value: DataValue;
}

/**
 * This status indicates that the PropertyType is in development.
 *
 * Log Safety: SAFE
 */
export interface ExperimentalPropertyTypeStatus {}

/**
 * Log Safety: SAFE
 */
export type ExtractDatePart = "DAYS" | "MONTHS" | "QUARTERS" | "YEARS";

/**
 * Returns the main value of a struct as configured in the ontology.
 *
 * Log Safety: SAFE
 */
export interface ExtractMainValueLoadLevel {}

/**
 * Extracts the specified date part from a date or timestamp.
 *
 * Log Safety: UNSAFE
 */
export interface ExtractPropertyExpression {
  property: DerivedPropertyDefinition;
  part: ExtractDatePart;
}

/**
 * A reference to an Ontology object property with the form properties.{propertyApiName}.
 *
 * Log Safety: UNSAFE
 */
export type FieldNameV1 = LooselyBrandedString<"FieldNameV1">;

/**
   * Represents the value of a property filter. For instance, false is the FilterValue in
properties.{propertyApiName}.isNull=false.
   *
   * Log Safety: UNSAFE
   */
export type FilterValue = LooselyBrandedString<"FilterValue">;

/**
 * Integer key for fixed value mapping.
 *
 * Log Safety: SAFE
 */
export type FixedValuesMapKey = number;

/**
 * Log Safety: UNSAFE
 */
export interface FunctionLogicRule {
  functionRid: FunctionRid;
  functionVersion: FunctionVersion;
  functionInputValues: Record<FunctionParameterName, LogicRuleArgument>;
}

/**
 * The name of an input to a function.
 *
 * Log Safety: UNSAFE
 */
export type FunctionParameterName = LooselyBrandedString<
  "FunctionParameterName"
>;

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
 * Setting fuzzy to true allows approximate matching in search queries that support it.
 *
 * Log Safety: SAFE
 */
export type Fuzzy = boolean;

/**
 * Setting fuzzy to true allows approximate matching in search queries that support it.
 *
 * Log Safety: SAFE
 */
export type FuzzyV2 = boolean;

/**
 * A single geotemporal data point representing the location of an entity at a specific point in time.
 *
 * Log Safety: UNSAFE
 */
export interface GeotemporalSeriesEntry {
  time: string;
  position: _Geo.GeoPoint;
}

/**
 * Log Safety: UNSAFE
 */
export type GeotemporalSeriesProperty = LooselyBrandedString<
  "GeotemporalSeriesProperty"
>;

/**
 * The unique id of a geotime series (track) associated with a GTSR.
 *
 * Log Safety: UNSAFE
 */
export type GeotimeSeriesId = LooselyBrandedString<"GeotimeSeriesId">;

/**
 * The unique resource identifier of a geotime integration.
 *
 * Log Safety: SAFE
 */
export type GeotimeSeriesIntegrationRid = LooselyBrandedString<
  "GeotimeSeriesIntegrationRid"
>;

/**
 * The representation of a geotime series integration as a data type.
 *
 * Log Safety: UNSAFE
 */
export interface GeotimeSeriesProperty {
  geotimeSeriesId: GeotimeSeriesId;
  geotimeSeriesIntegrationRid: GeotimeSeriesIntegrationRid;
}

/**
 * The underlying data values pointed to by a GeotimeSeriesReference.
 *
 * Log Safety: UNSAFE
 */
export interface GeotimeSeriesValue {
  position: _Geo.Position;
  timestamp: string;
}

/**
   * Gets a single value of a property. Throws if the target object set is on the MANY side of the link and could
explode the cardinality.
Use collectList or collectSet which will return a list of values in that case.
   *
   * Log Safety: UNSAFE
   */
export interface GetSelectedPropertyOperation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * Finds greatest of two or more numeric, date or timestamp values.
 *
 * Log Safety: UNSAFE
 */
export interface GreatestPropertyExpression {
  properties: Array<DerivedPropertyDefinition>;
}

/**
 * The parameter value must be the user id of a member belonging to at least one of the groups defined by the constraint.
 *
 * Log Safety: SAFE
 */
export interface GroupMemberConstraint {}

/**
 * Returns objects where the specified field is greater than or equal to a value.
 *
 * Log Safety: UNSAFE
 */
export interface GteQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified field is greater than or equal to a value. Allows you to specify a property
to query on by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface GteQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Returns objects where the specified field is greater than a value.
 *
 * Log Safety: UNSAFE
 */
export interface GtQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified field is greater than a value. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface GtQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Formats the duration as a human-readable written string.
 *
 * Log Safety: SAFE
 */
export interface HumanReadableFormat {
  showFullUnits?: boolean;
}

/**
 * A union currently only consisting of the BlueprintIcon (more icon types may be added in the future).
 *
 * Log Safety: UNSAFE
 */
export type Icon = { type: "blueprint" } & BlueprintIcon;

/**
   * Returns objects where the specified field equals any of the provided values. Allows you to
specify a property to query on by a variety of means. If an empty array is provided as the value, then the filter will match all objects
in the object set. Either field or propertyIdentifier must be supplied, but not both.
For string properties, full term matching only works when Selectable is enabled for the property in Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export interface InQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: Array<PropertyValue>;
}

/**
 * Log Safety: UNSAFE
 */
export interface IntegerValue {
  value: number;
}

/**
   * An interface property type with an additional field to indicate constraints that need to be satisfied by
implementing object property types.
   *
   * Log Safety: UNSAFE
   */
export interface InterfaceDefinedPropertyType {
  rid: InterfacePropertyTypeRid;
  apiName: InterfacePropertyApiName;
  displayName: _Core.DisplayName;
  description?: string;
  dataType: ObjectPropertyType;
  valueTypeApiName?: ValueTypeApiName;
  requireImplementation: boolean;
  typeClasses: Array<TypeClass>;
}

/**
   * A link type constraint defined at the interface level where the implementation of the links is provided
by the implementing object types.
   *
   * Log Safety: UNSAFE
   */
export interface InterfaceLinkType {
  rid: InterfaceLinkTypeRid;
  apiName: InterfaceLinkTypeApiName;
  displayName: _Core.DisplayName;
  description?: string;
  linkedEntityApiName: InterfaceLinkTypeLinkedEntityApiName;
  cardinality: InterfaceLinkTypeCardinality;
  required: boolean;
}

/**
   * The name of the interface link type in the API. To find the API name for your Interface Link Type, check the
Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type InterfaceLinkTypeApiName = LooselyBrandedString<
  "InterfaceLinkTypeApiName"
>;

/**
   * The cardinality of the link in the given direction. Cardinality can be "ONE", meaning an object can
link to zero or one other objects, or "MANY", meaning an object can link to any number of other objects.
   *
   * Log Safety: SAFE
   */
export type InterfaceLinkTypeCardinality = "ONE" | "MANY";

/**
 * A reference to the linked entity. This can either be an object or an interface type.
 *
 * Log Safety: UNSAFE
 */
export type InterfaceLinkTypeLinkedEntityApiName =
  | ({ type: "objectTypeApiName" } & LinkedObjectTypeApiName)
  | ({ type: "interfaceTypeApiName" } & LinkedInterfaceTypeApiName);

/**
 * The unique resource identifier of an interface link type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type InterfaceLinkTypeRid = LooselyBrandedString<"InterfaceLinkTypeRid">;

/**
 * Represents an interface parameter property argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface InterfaceParameterPropertyArgument {
  parameterId: ParameterId;
  sharedPropertyTypeRid: string;
}

/**
   * The name of the interface property type in the API in lowerCamelCase format. To find the API name for your
interface property type, use the List interface types endpoint and check the allPropertiesV2 field or check
the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type InterfacePropertyApiName = LooselyBrandedString<
  "InterfacePropertyApiName"
>;

/**
 * An implementation of an interface property via a local property.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertyLocalPropertyImplementation {
  propertyApiName: PropertyApiName;
}

/**
 * An implementation of an interface property via applying reducers on the nested implementation.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertyReducedPropertyImplementation {
  implementation: NestedInterfacePropertyTypeImplementation;
}

/**
 * An implementation of an interface property via the field of a local struct property.
 *
 * Log Safety: UNSAFE
 */
export interface InterfacePropertyStructFieldImplementation {
  structFieldOfProperty: StructFieldOfPropertyImplementation;
}

/**
   * An implementation of a struct interface property via a local struct property. Specifies a mapping of interface
struct fields to local struct fields or properties.
   *
   * Log Safety: UNSAFE
   */
export interface InterfacePropertyStructImplementation {
  mapping: InterfacePropertyStructImplementationMapping;
}

/**
   * An implementation of a struct interface property via a local struct property. Specifies a mapping of interface
struct fields to local struct fields or properties.
   *
   * Log Safety: UNSAFE
   */
export type InterfacePropertyStructImplementationMapping = Record<
  StructFieldApiName,
  PropertyOrStructFieldOfPropertyImplementation
>;

/**
   * The definition of an interface property type on an interface. An interface property can either be backed by a
shared property type or defined on the interface directly.
   *
   * Log Safety: UNSAFE
   */
export type InterfacePropertyType =
  | ({ type: "interfaceDefinedPropertyType" } & InterfaceDefinedPropertyType)
  | ({ type: "interfaceSharedPropertyType" } & InterfaceSharedPropertyType);

/**
 * Describes how an object type implements an interface property.
 *
 * Log Safety: UNSAFE
 */
export type InterfacePropertyTypeImplementation =
  | ({
    type: "structFieldImplementation";
  } & InterfacePropertyStructFieldImplementation)
  | ({ type: "structImplementation" } & InterfacePropertyStructImplementation)
  | ({
    type: "localPropertyImplementation";
  } & InterfacePropertyLocalPropertyImplementation)
  | ({
    type: "reducedPropertyImplementation";
  } & InterfacePropertyReducedPropertyImplementation);

/**
 * The unique resource identifier of an interface property type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type InterfacePropertyTypeRid = LooselyBrandedString<
  "InterfacePropertyTypeRid"
>;

/**
   * A shared property type with an additional field to indicate whether the property must be included on every
object type that implements the interface, or whether it is optional.
   *
   * Log Safety: UNSAFE
   */
export interface InterfaceSharedPropertyType {
  rid: SharedPropertyTypeRid;
  apiName: SharedPropertyTypeApiName;
  displayName: _Core.DisplayName;
  description?: string;
  dataType: ObjectPropertyType;
  valueTypeApiName?: ValueTypeApiName;
  valueFormatting?: PropertyValueFormattingRule;
  required: boolean;
  typeClasses: Array<TypeClass>;
}

/**
 * Represents an implementation of an interface (the mapping of interface property to local property).
 *
 * Log Safety: UNSAFE
 */
export type InterfaceToObjectTypeMapping = Record<
  SharedPropertyTypeApiName,
  PropertyApiName
>;

/**
 * Map from object type to the interface-to-object-type mapping for that object type.
 *
 * Log Safety: UNSAFE
 */
export type InterfaceToObjectTypeMappings = Record<
  ObjectTypeApiName,
  InterfaceToObjectTypeMapping
>;

/**
 * Map from object type to the interface property implementations of that object type.
 *
 * Log Safety: UNSAFE
 */
export type InterfaceToObjectTypeMappingsV2 = Record<
  ObjectTypeApiName,
  InterfaceToObjectTypeMappingV2
>;

/**
 * Represents an implementation of an interface (the mapping of interface property to how it is implemented.
 *
 * Log Safety: UNSAFE
 */
export type InterfaceToObjectTypeMappingV2 = Record<
  InterfacePropertyApiName,
  InterfacePropertyTypeImplementation
>;

/**
 * Represents an interface type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface InterfaceType {
  rid: InterfaceTypeRid;
  apiName: InterfaceTypeApiName;
  displayName: _Core.DisplayName;
  description?: string;
  properties: Record<SharedPropertyTypeApiName, InterfaceSharedPropertyType>;
  allProperties: Record<SharedPropertyTypeApiName, InterfaceSharedPropertyType>;
  propertiesV2: Record<InterfacePropertyApiName, InterfacePropertyType>;
  allPropertiesV2: Record<
    InterfacePropertyApiName,
    ResolvedInterfacePropertyType
  >;
  extendsInterfaces: Array<InterfaceTypeApiName>;
  allExtendsInterfaces: Array<InterfaceTypeApiName>;
  implementedByObjectTypes: Array<ObjectTypeApiName>;
  links: Record<InterfaceLinkTypeApiName, InterfaceLinkType>;
  allLinks: Record<InterfaceLinkTypeApiName, InterfaceLinkType>;
}

/**
   * The name of the interface type in the API in UpperCamelCase format. To find the API name for your interface
type, use the List interface types endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type InterfaceTypeApiName = LooselyBrandedString<"InterfaceTypeApiName">;

/**
 * The unique resource identifier of an interface, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type InterfaceTypeRid = LooselyBrandedString<"InterfaceTypeRid">;

/**
   * Returns objects where the specified field intersects the bounding box provided. Allows you to specify a property
to query on by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface IntersectsBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
   * Returns objects where the specified field intersects the polygon provided. Allows you to specify a property to
query on by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface IntersectsPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}

/**
   * Returns objects where the specified field matches the sub-rule provided. This applies to the analyzed form of
text fields. Either field or propertyIdentifier can be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface IntervalQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  rule: IntervalQueryRule;
}

/**
 * Sub-rule used for evaluating an IntervalQuery
 *
 * Log Safety: UNSAFE
 */
export type IntervalQueryRule =
  | ({ type: "allOf" } & AllOfRule)
  | ({ type: "match" } & MatchRule)
  | ({ type: "anyOf" } & AnyOfRule)
  | ({ type: "prefixOnLastToken" } & PrefixOnLastTokenRule);

/**
 * Returns objects based on the existence of the specified field.
 *
 * Log Safety: UNSAFE
 */
export interface IsNullQuery {
  field: FieldNameV1;
  value: boolean;
}

/**
   * Returns objects based on the existence of the specified field. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface IsNullQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: boolean;
}

/**
   * Known Foundry types for specialized formatting:

userOrGroupRid: Format as user or group
resourceRid: Format as resource
artifactGid: Format as artifact
   *
   * Log Safety: SAFE
   */
export type KnownType = "USER_OR_GROUP_ID" | "RESOURCE_RID" | "ARTIFACT_GID";

/**
 * Finds least of two or more numeric, date or timestamp values.
 *
 * Log Safety: UNSAFE
 */
export interface LeastPropertyExpression {
  properties: Array<DerivedPropertyDefinition>;
}

/**
   * The unique ID of an object type. This is a legacy identifier and is not recommended for use in new applications.
To find the ID for your Object Type, check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type LegacyObjectTypeId = LooselyBrandedString<"LegacyObjectTypeId">;

/**
   * The unique ID of a property. This is a legacy identifier and is not recommended for use in new applications.
To find the ID for your property, check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type LegacyPropertyId = LooselyBrandedString<"LegacyPropertyId">;

/**
 * Log Safety: SAFE
 */
export interface LengthConstraint {
  minimumLength?: number;
  maximumLength?: number;
}

/**
 * A reference to the linked interface type.
 *
 * Log Safety: UNSAFE
 */
export interface LinkedInterfaceTypeApiName {
  apiName: InterfaceTypeApiName;
}

/**
   * Does not contain information about the source object. Should be used in a nested type that provides information about source objects.
The targetObject Ontology Object in this response will only ever have the __primaryKey and __apiName
fields present, thus functioning as object locators rather than full objects.
   *
   * Log Safety: UNSAFE
   */
export interface LinkedObjectLocator {
  targetObject?: OntologyObjectV2;
  linkType?: LinkTypeApiName;
}

/**
 * A reference to the linked object type.
 *
 * Log Safety: UNSAFE
 */
export interface LinkedObjectTypeApiName {
  apiName: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export type LinkedObjectV2 = LooselyBrandedString<"LinkedObjectV2">;

/**
   * The Ontology Objects in this response will only ever have the __primaryKey and __apiName
fields present, thus functioning as object locators rather than full objects.
   *
   * Log Safety: UNSAFE
   */
export interface LinksFromObject {
  sourceObject?: OntologyObjectV2;
  linkedObjects: Array<LinkedObjectLocator>;
}

/**
 * Log Safety: UNSAFE
 */
export interface LinkSideObject {
  primaryKey: PropertyValue;
  objectType: ObjectTypeApiName;
}

/**
   * The name of the link type in the API. To find the API name for your Link Type, check the Ontology Manager
application.
   *
   * Log Safety: UNSAFE
   */
export type LinkTypeApiName = LooselyBrandedString<"LinkTypeApiName">;

/**
 * The unique ID of a link type. To find the ID for your link type, check the Ontology Manager application.
 *
 * Log Safety: UNSAFE
 */
export type LinkTypeId = LooselyBrandedString<"LinkTypeId">;

/**
 * Log Safety: SAFE
 */
export type LinkTypeRid = LooselyBrandedString<"LinkTypeRid">;

/**
 * Log Safety: UNSAFE
 */
export interface LinkTypeSide {
  apiName: LinkTypeApiName;
  displayName: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  objectTypeApiName: ObjectTypeApiName;
  cardinality: LinkTypeSideCardinality;
  foreignKeyPropertyApiName?: PropertyApiName;
}

/**
 * Log Safety: SAFE
 */
export type LinkTypeSideCardinality = "ONE" | "MANY";

/**
   * foreignKeyPropertyApiName is the API name of the foreign key on this object type. If absent, the link is
either a m2m link or the linked object has the foreign key and this object type has the primary key.
   *
   * Log Safety: UNSAFE
   */
export interface LinkTypeSideV2 {
  apiName: LinkTypeApiName;
  displayName: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  objectTypeApiName: ObjectTypeApiName;
  cardinality: LinkTypeSideCardinality;
  foreignKeyPropertyApiName?: PropertyApiName;
  linkTypeRid: LinkTypeRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListActionTypesFullMetadataResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<ActionTypeFullMetadata>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListActionTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<ActionType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListActionTypesResponseV2 {
  nextPageToken?: _Core.PageToken;
  data: Array<ActionTypeV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListAttachmentsResponseV2 {
  data: Array<AttachmentV2>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListInterfaceLinkedObjectsResponse {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListInterfaceTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<InterfaceType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListLinkedObjectsResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<OntologyObject>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListLinkedObjectsResponseV2 {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListObjectsForInterfaceResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<OntologyObjectV2>;
  totalCount: _Core.TotalCount;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListObjectsResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<OntologyObject>;
  totalCount: _Core.TotalCount;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListObjectsResponseV2 {
  nextPageToken?: _Core.PageToken;
  data: Array<OntologyObjectV2>;
  totalCount: _Core.TotalCount;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListObjectTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<ObjectType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListObjectTypesV2Response {
  nextPageToken?: _Core.PageToken;
  data: Array<ObjectTypeV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOntologiesResponse {
  data: Array<Ontology>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOntologiesV2Response {
  data: Array<OntologyV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOntologyValueTypesResponse {
  data: Array<OntologyValueType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOutgoingInterfaceLinkTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<InterfaceLinkType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOutgoingLinkTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<LinkTypeSide>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListOutgoingLinkTypesResponseV2 {
  nextPageToken?: _Core.PageToken;
  data: Array<LinkTypeSideV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListQueryTypesResponse {
  nextPageToken?: _Core.PageToken;
  data: Array<QueryType>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ListQueryTypesResponseV2 {
  nextPageToken?: _Core.PageToken;
  data: Array<QueryTypeV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetLinksRequestV2 {
  objectSet: ObjectSet;
  links: Array<LinkTypeApiName>;
  pageToken?: _Core.PageToken;
  includeComputeUsage?: _Core.IncludeComputeUsage;
}

/**
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetLinksResponseV2 {
  data: Array<LinksFromObject>;
  nextPageToken?: _Core.PageToken;
  computeUsage?: _Core.ComputeSeconds;
}

/**
 * Represents the API POST body when loading an ObjectSet.
 *
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetRequestV2 {
  objectSet: ObjectSet;
  orderBy?: SearchOrderByV2;
  select: Array<SelectedPropertyApiName>;
  selectV2: Array<PropertyIdentifier>;
  pageToken?: _Core.PageToken;
  pageSize?: _Core.PageSize;
  excludeRid?: boolean;
  loadPropertySecurities?: boolean;
  snapshot?: boolean;
  includeComputeUsage?: _Core.IncludeComputeUsage;
}

/**
 * Represents the API response when loading an ObjectSet.
 *
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetResponseV2 {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
  totalCount: _Core.TotalCount;
  computeUsage?: _Core.ComputeSeconds;
  propertySecurities: Array<PropertySecurities>;
}

/**
 * Represents the API POST body when loading an ObjectSet. Used on the /loadObjectsMultipleObjectTypes endpoint only.
 *
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetV2MultipleObjectTypesRequest {
  objectSet: ObjectSet;
  orderBy?: SearchOrderByV2;
  select: Array<SelectedPropertyApiName>;
  selectV2: Array<PropertyIdentifier>;
  pageToken?: _Core.PageToken;
  pageSize?: _Core.PageSize;
  excludeRid?: boolean;
  loadPropertySecurities?: boolean;
  snapshot?: boolean;
  includeComputeUsage?: _Core.IncludeComputeUsage;
}

/**
   * Represents the API response when loading an ObjectSet. An interfaceToObjectTypeMappings field is
optionally returned if the type scope of the returned object set includes any interfaces. The "type scope"
of an object set refers to whether objects contain all their properties (object-type type scope) or just the
properties that implement interface properties (interface type scope). There can be multiple type scopes in a
single object set- some objects may have all their properties and some may only have interface properties.
The interfaceToObjectTypeMappings field contains mappings from SharedPropertyTypeApiNames on the interface(s) to
PropertyApiName for properties on the object(s).
The interfaceToObjectTypeMappingsV2 field contains mappings from InterfacePropertyApiNames on the
interface(s) to InterfacePropertyTypeImplementation for properties on the object(s). This therefore includes
implementations of both properties backed by SharedPropertyTypes as well as properties defined on the interface.
   *
   * Log Safety: UNSAFE
   */
export interface LoadObjectSetV2MultipleObjectTypesResponse {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
  totalCount: _Core.TotalCount;
  interfaceToObjectTypeMappings: Record<
    InterfaceTypeApiName,
    InterfaceToObjectTypeMappings
  >;
  interfaceToObjectTypeMappingsV2: Record<
    InterfaceTypeApiName,
    InterfaceToObjectTypeMappingsV2
  >;
  computeUsage?: _Core.ComputeSeconds;
  propertySecurities: Array<PropertySecurities>;
}

/**
 * Represents the API POST body when loading an ObjectSet. Used on the /loadObjectsOrInterfaces endpoint only.
 *
 * Log Safety: UNSAFE
 */
export interface LoadObjectSetV2ObjectsOrInterfacesRequest {
  objectSet: ObjectSet;
  orderBy?: SearchOrderByV2;
  select: Array<SelectedPropertyApiName>;
  selectV2: Array<PropertyIdentifier>;
  pageToken?: _Core.PageToken;
  pageSize?: _Core.PageSize;
  excludeRid?: boolean;
  snapshot?: boolean;
}

/**
   * Represents the API response when loading an ObjectSet. Objects in the returned set can either have properties
defined by an interface that the objects belong to or properties defined by the object type of the object.
   *
   * Log Safety: UNSAFE
   */
export interface LoadObjectSetV2ObjectsOrInterfacesResponse {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
  totalCount: _Core.TotalCount;
}

/**
 * The Ontology metadata (i.e., object, link, action, query, and interface types) to load.
 *
 * Log Safety: UNSAFE
 */
export interface LoadOntologyMetadataRequest {
  objectTypes: Array<ObjectTypeApiName>;
  linkTypes: Array<LinkTypeApiName>;
  actionTypes: Array<ActionTypeApiName>;
  queryTypes: Array<VersionedQueryTypeApiName>;
  interfaceTypes: Array<InterfaceTypeApiName>;
}

/**
 * Log Safety: UNSAFE
 */
export type LogicRule =
  | ({ type: "deleteInterfaceObject" } & DeleteInterfaceObjectRule)
  | ({ type: "modifyInterfaceObject" } & ModifyInterfaceObjectRule)
  | ({ type: "modifyObject" } & ModifyObjectRule)
  | ({ type: "deleteObject" } & DeleteObjectRule)
  | ({ type: "createInterfaceObject" } & CreateInterfaceObjectRule)
  | ({ type: "deleteLink" } & DeleteLinkRule)
  | ({ type: "createObject" } & CreateObjectRule)
  | ({ type: "createLink" } & CreateLinkRule);

/**
 * Represents an argument for a logic rule operation. An argument can be passed in via the action parameters, as a static value, or as some other value.
 *
 * Log Safety: UNSAFE
 */
export type LogicRuleArgument =
  | ({ type: "currentTime" } & CurrentTimeArgument)
  | ({ type: "staticValue" } & StaticArgument)
  | ({ type: "currentUser" } & CurrentUserArgument)
  | ({ type: "parameterId" } & ParameterIdArgument)
  | ({
    type: "interfaceParameterPropertyValue";
  } & InterfaceParameterPropertyArgument)
  | ({ type: "synchronousWebhookOutput" } & SynchronousWebhookOutputArgument)
  | ({ type: "objectParameterPropertyValue" } & ObjectParameterPropertyArgument)
  | ({ type: "uniqueIdentifier" } & UniqueIdentifierArgument);

/**
 * Log Safety: UNSAFE
 */
export interface LongValue {
  value: string;
}

/**
 * Returns objects where the specified field is less than or equal to a value.
 *
 * Log Safety: UNSAFE
 */
export interface LteQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified field is less than or equal to a value. Allows you to specify a property to
query on by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface LteQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Returns objects where the specified field is less than a value.
 *
 * Log Safety: UNSAFE
 */
export interface LtQuery {
  field: FieldNameV1;
  value: PropertyValue;
}

/**
   * Returns objects where the specified field is less than a value. Allows you to specify a property to query on
by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface LtQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * The id of a classification or mandatory marking.
 *
 * Log Safety: UNSAFE
 */
export type MarkingId = LooselyBrandedString<"MarkingId">;

/**
 * Matches intervals containing the terms in the query
 *
 * Log Safety: UNSAFE
 */
export interface MatchRule {
  query: string;
  maxGaps?: number;
  ordered: boolean;
}

/**
 * Computes the maximum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface MaxAggregation {
  field: FieldNameV1;
  name?: AggregationMetricName;
}

/**
 * Computes the maximum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface MaxAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export interface MediaMetadata {
  path?: _Core.MediaItemPath;
  sizeBytes: _Core.SizeBytes;
  mediaType: _Core.MediaType;
}

/**
 * Log Safety: UNSAFE
 */
export type MediaReferenceProperty = LooselyBrandedString<
  "MediaReferenceProperty"
>;

/**
 * Log Safety: UNSAFE
 */
export type MethodObjectSet = ObjectSet;

/**
 * Computes the minimum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface MinAggregation {
  field: FieldNameV1;
  name?: AggregationMetricName;
}

/**
 * Computes the minimum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface MinAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyEdit {
  includesAllPreviousValues?: boolean;
  previousProperties: Record<PropertyApiName, PropertyValue>;
  properties: Record<PropertyApiName, PropertyValue>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyInterfaceLogicRule {
  interfaceObjectToModify: ParameterId;
  sharedPropertyArguments: Record<SharedPropertyTypeApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    SharedPropertyTypeApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyInterfaceObjectRule {
  interfaceTypeApiName: InterfaceTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyObject {
  primaryKey: PropertyValue;
  objectType: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyObjectEdit {
  objectType: ObjectTypeApiName;
  primaryKey: PropertyValue;
  properties: Record<PropertyApiName, DataValue | undefined>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyObjectLogicRule {
  objectToModify: ParameterId;
  propertyArguments: Record<PropertyApiName, LogicRuleArgument>;
  structPropertyArguments: Record<
    PropertyApiName,
    Record<StructFieldApiName, StructFieldArgument>
  >;
}

/**
 * Log Safety: UNSAFE
 */
export interface ModifyObjectRule {
  objectTypeApiName: ObjectTypeApiName;
}

/**
 * Multiplies two or more numeric values.
 *
 * Log Safety: UNSAFE
 */
export interface MultiplyPropertyExpression {
  properties: Array<DerivedPropertyDefinition>;
}

/**
   * Queries support either a vector matching the embedding model defined on the property, or text that is
automatically embedded.
   *
   * Log Safety: UNSAFE
   */
export type NearestNeighborsQuery =
  | ({ type: "vector" } & DoubleVector)
  | ({ type: "text" } & NearestNeighborsQueryText);

/**
 * Automatically embed the text in a vector using the embedding model configured for the given propertyIdentifier.
 *
 * Log Safety: UNSAFE
 */
export interface NearestNeighborsQueryText {
  value: string;
}

/**
 * Negates a numeric value.
 *
 * Log Safety: UNSAFE
 */
export interface NegatePropertyExpression {
  property: DerivedPropertyDefinition;
}

/**
   * Describes how an object type implements an interface property when a reducer is applied to it. Is missing a
reduced property implementation to prevent arbitrarily nested implementations.
   *
   * Log Safety: UNSAFE
   */
export type NestedInterfacePropertyTypeImplementation =
  | ({
    type: "structFieldImplementation";
  } & InterfacePropertyStructFieldImplementation)
  | ({ type: "structImplementation" } & InterfacePropertyStructImplementation)
  | ({
    type: "localPropertyImplementation";
  } & InterfacePropertyLocalPropertyImplementation);

/**
 * Log Safety: UNSAFE
 */
export interface NestedQueryAggregation {
  key: any;
  groups: Array<QueryAggregation>;
}

/**
 * Returns objects where the query is not satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface NotQuery {
  value: SearchJsonQuery;
}

/**
 * Returns objects where the query is not satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface NotQueryV2 {
  value: SearchJsonQueryV2;
}

/**
   * Attach arbitrary text before and/or after the formatted number.
Example: prefix "USD " and postfix " total" displays as "USD 1,234.56 total"
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatAffix {
  baseFormatOptions: NumberFormatOptions;
  affix: Affix;
}

/**
   * Display the value as basis points. Multiplies by 10,000 and appends "bps" suffix.
Used in finance where 1 basis point = 0.01%.
Example: 0.0025 displays as "25 bps", 0.01 displays as "100 bps"
   *
   * Log Safety: SAFE
   */
export interface NumberFormatBasisPoints {
  baseFormatOptions: NumberFormatOptions;
}

/**
   * Format numbers as currency values with proper symbols and styling.
Example: 1234.56 with currency "USD" displays as "USD 1,234.56" (standard) or "USD 1.2K" (compact)
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatCurrency {
  baseFormatOptions: NumberFormatOptions;
  style: NumberFormatCurrencyStyle;
  currencyCode: PropertyTypeReferenceOrStringConstant;
}

/**
   * Currency rendering style options:

STANDARD: Full currency formatting (e.g., "USD 1,234.56")
COMPACT: Abbreviated currency formatting (e.g., "USD 1.2K")
   *
   * Log Safety: SAFE
   */
export type NumberFormatCurrencyStyle = "STANDARD" | "COMPACT";

/**
   * Format numbers with custom units not supported by standard formatting.
Use this for domain-specific units like "requests/sec", "widgets", etc.
Example: 1500 with unit "widgets" displays as "1,500 widgets"
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatCustomUnit {
  baseFormatOptions: NumberFormatOptions;
  unit: PropertyTypeReferenceOrStringConstant;
}

/**
   * Format numeric values representing time durations.

Human readable: 3661 seconds displays as "1h 1m 1s"
Timecode: 3661 seconds displays as "01:01:01"
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatDuration {
  formatStyle: DurationFormatStyle;
  precision?: DurationPrecision;
  baseValue: DurationBaseValue;
}

/**
   * Map integer values to custom human-readable strings.
Example: {1: "First", 2: "Second", 3: "Third"} would display 2 as "Second".
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatFixedValues {
  values: Record<FixedValuesMapKey, string>;
}

/**
   * Number notation style options:

STANDARD: Regular number display ("1,234")
SCIENTIFIC: Scientific notation ("1.234E3")
ENGINEERING: Engineering notation ("1.234E3")
COMPACT: Compact notation ("1.2K")
   *
   * Log Safety: SAFE
   */
export type NumberFormatNotation =
  | "STANDARD"
  | "SCIENTIFIC"
  | "ENGINEERING"
  | "COMPACT";

/**
   * Base number formatting options that can be applied to all number formatters.
Controls precision, grouping, rounding, and notation. Consistent with JavaScript's Intl.NumberFormat.
Examples:

useGrouping: true makes 1234567 display as "1,234,567"
maximumFractionDigits: 2 makes 3.14159 display as "3.14"
notation: SCIENTIFIC makes 1234 display as "1.234E3"
   *
   * Log Safety: SAFE
   */
export interface NumberFormatOptions {
  useGrouping?: boolean;
  convertNegativeToParenthesis?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  notation?: NumberFormatNotation;
  roundingMode?: NumberRoundingMode;
}

/**
   * Display the value as a ratio with different scaling factors and suffixes:

PERCENTAGE: Multiply by 100 and add "%" suffix (0.15 → "15%")
PER_MILLE: Multiply by 1000 and add "‰" suffix (0.015 → "15‰")
BASIS_POINTS: Multiply by 10000 and add "bps" suffix (0.0015 → "15bps")
   *
   * Log Safety: SAFE
   */
export interface NumberFormatRatio {
  ratioType: NumberRatioType;
  baseFormatOptions: NumberFormatOptions;
}

/**
   * Scale the numeric value by dividing by the specified factor and append an appropriate suffix.

THOUSANDS: 1500 displays as "1.5K"
MILLIONS: 2500000 displays as "2.5M"
BILLIONS: 3200000000 displays as "3.2B"
   *
   * Log Safety: SAFE
   */
export interface NumberFormatScale {
  scaleType: NumberScaleType;
  baseFormatOptions: NumberFormatOptions;
}

/**
   * Standard number formatting with configurable options.
This provides basic number formatting without any special units, scaling, or transformations.
   *
   * Log Safety: SAFE
   */
export interface NumberFormatStandard {
  baseFormatOptions: NumberFormatOptions;
}

/**
   * Format numbers with standard units supported by Intl.NumberFormat.
Examples: "meter", "kilogram", "celsius", "percent"
Input: 25 with unit "celsius" displays as "25 degrees C"
   *
   * Log Safety: UNSAFE
   */
export interface NumberFormatStandardUnit {
  baseFormatOptions: NumberFormatOptions;
  unit: PropertyTypeReferenceOrStringConstant;
}

/**
   * Ratio format options for displaying proportional values:

PERCENTAGE: Multiply by 100 and add "%" suffix
PER_MILLE: Multiply by 1000 and add "‰" suffix
BASIS_POINTS: Multiply by 10000 and add "bps" suffix
   *
   * Log Safety: SAFE
   */
export type NumberRatioType = "PERCENTAGE" | "PER_MILLE" | "BASIS_POINTS";

/**
   * Number rounding behavior:

CEIL: Always round up (3.1 becomes 4)
FLOOR: Always round down (3.9 becomes 3)
ROUND_CLOSEST: Round to nearest (3.4 becomes 3, 3.6 becomes 4)
   *
   * Log Safety: SAFE
   */
export type NumberRoundingMode = "CEIL" | "FLOOR" | "ROUND_CLOSEST";

/**
   * Scale factor options for large numbers:

THOUSANDS: Divide by 1,000 and add "K" suffix
MILLIONS: Divide by 1,000,000 and add "M" suffix
BILLIONS: Divide by 1,000,000,000 and add "B" suffix
   *
   * Log Safety: SAFE
   */
export type NumberScaleType = "THOUSANDS" | "MILLIONS" | "BILLIONS";

/**
 * Log Safety: UNSAFE
 */
export type ObjectEdit =
  | ({ type: "modifyObject" } & ModifyObject)
  | ({ type: "deleteObject" } & DeleteObject)
  | ({ type: "addObject" } & AddObject)
  | ({ type: "deleteLink" } & DeleteLink)
  | ({ type: "addLink" } & AddLink);

/**
   * Represents a single object edit operation in the history. This captures when an object was
created, modified, or deleted as part of an action execution.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectEditHistoryEntry {
  operationId: ActionRid;
  actionTypeRid: ActionTypeRid;
  userId: string;
  timestamp: string;
  edit: EditHistoryEdit;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectEdits {
  edits: Array<ObjectEdit>;
  addedObjectCount: number;
  modifiedObjectsCount: number;
  deletedObjectsCount: number;
  addedLinksCount: number;
  deletedLinksCount: number;
}

/**
 * Optional features to toggle when generating the object loading response.
 *
 * Log Safety: SAFE
 */
export interface ObjectLoadingResponseOptions {
  shouldLoadObjectRids?: boolean;
}

/**
 * An object identifier containing an object type API name and primary key.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectLocator {
  objectTypeApiName: ObjectTypeApiName;
  primaryKeyValue: PrimaryKeyValue;
}

/**
 * Represents an object parameter property argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectParameterPropertyArgument {
  parameterId: ParameterId;
  propertyTypeApiName: PropertyTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export type ObjectPrimaryKey = Record<PropertyApiName, PropertyValue>;

/**
 * Log Safety: UNSAFE
 */
export type ObjectPrimaryKeyV2 = Record<PropertyApiName, PrimaryKeyValueV2>;

/**
 * A union of all the types supported by Ontology Object properties.
 *
 * Log Safety: UNSAFE
 */
export type ObjectPropertyType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "struct" } & StructType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "byte" } & _Core.ByteType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "geopoint" } & _Core.GeoPointType)
  | ({ type: "geotimeSeriesReference" } & _Core.GeotimeSeriesReferenceType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "float" } & _Core.FloatType)
  | ({ type: "geoshape" } & _Core.GeoShapeType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "cipherText" } & _Core.CipherTextType)
  | ({ type: "marking" } & _Core.MarkingType)
  | ({ type: "attachment" } & _Core.AttachmentType)
  | ({ type: "mediaReference" } & _Core.MediaReferenceType)
  | ({ type: "timeseries" } & _Core.TimeseriesType)
  | ({ type: "array" } & OntologyObjectArrayType)
  | ({ type: "short" } & _Core.ShortType)
  | ({ type: "vector" } & _Core.VectorType)
  | ({ type: "decimal" } & _Core.DecimalType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * The parameter value must be a property value of an object found within an object set.
 *
 * Log Safety: SAFE
 */
export interface ObjectPropertyValueConstraint {}

/**
 * The parameter value must be the primary key of an object found within an object set.
 *
 * Log Safety: SAFE
 */
export interface ObjectQueryResultConstraint {}

/**
 * The unique resource identifier of an object, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type ObjectRid = LooselyBrandedString<"ObjectRid">;

/**
 * Represents the definition of an ObjectSet in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export type ObjectSet =
  | ({ type: "searchAround" } & ObjectSetSearchAroundType)
  | ({ type: "static" } & ObjectSetStaticType)
  | ({ type: "intersect" } & ObjectSetIntersectionType)
  | ({ type: "withProperties" } & ObjectSetWithPropertiesType)
  | ({
    type: "interfaceLinkSearchAround";
  } & ObjectSetInterfaceLinkSearchAroundType)
  | ({ type: "subtract" } & ObjectSetSubtractType)
  | ({ type: "nearestNeighbors" } & ObjectSetNearestNeighborsType)
  | ({ type: "union" } & ObjectSetUnionType)
  | ({ type: "asType" } & ObjectSetAsTypeType)
  | ({ type: "methodInput" } & ObjectSetMethodInputType)
  | ({ type: "reference" } & ObjectSetReferenceType)
  | ({ type: "filter" } & ObjectSetFilterType)
  | ({ type: "interfaceBase" } & ObjectSetInterfaceBaseType)
  | ({ type: "asBaseObjectTypes" } & ObjectSetAsBaseObjectTypesType)
  | ({ type: "base" } & ObjectSetBaseType);

/**
   * Casts the objects in the object set to their base type and thus ensures objects are returned with all of their
properties in the resulting object set, not just the properties that implement interface properties.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetAsBaseObjectTypesType {
  objectSet: ObjectSet;
}

/**
   * Casts an object set to a specified object type or interface type API name. Any object whose object type does
not match the object type provided or implement the interface type provided will be dropped from the resulting
object set.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetAsTypeType {
  entityType: string;
  objectSet: ObjectSet;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetBaseType {
  objectType: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetFilterType {
  objectSet: ObjectSet;
  where: SearchJsonQueryV2;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetInterfaceBaseType {
  interfaceType: string;
  includeAllBaseObjectProperties?: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetInterfaceLinkSearchAroundType {
  objectSet: ObjectSet;
  interfaceLink: InterfaceLinkTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetIntersectionType {
  objectSets: Array<ObjectSet>;
}

/**
   * ObjectSet which is the root of a MethodObjectSet definition.
This feature is experimental and not yet generally available.
   *
   * Log Safety: SAFE
   */
export interface ObjectSetMethodInputType {}

/**
   * ObjectSet containing the top numNeighbors objects with propertyIdentifier nearest to the input vector or
text. This can only be performed on a property with type vector that has been configured to be searched with
approximate nearest neighbors using a similarity function configured in the Ontology.
A non-zero score for each resulting object is returned when the orderType in the orderBy field is set to
relevance. Note that:

Scores will not be returned if a nearestNeighbors object set is composed through union, subtraction
or intersection with non-nearestNeighbors object sets.
If results have scores, the order of the scores will be decreasing (duplicate scores are possible).
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetNearestNeighborsType {
  objectSet: ObjectSet;
  propertyIdentifier: PropertyIdentifier;
  numNeighbors: number;
  similarityThreshold?: number;
  query: NearestNeighborsQuery;
}

/**
 * Log Safety: SAFE
 */
export interface ObjectSetReferenceType {
  reference: ObjectSetRid;
}

/**
 * Log Safety: SAFE
 */
export type ObjectSetRid = LooselyBrandedString<"ObjectSetRid">;

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetSearchAroundType {
  objectSet: ObjectSet;
  link: LinkTypeApiName;
}

/**
 * Log Safety: SAFE
 */
export interface ObjectSetStaticType {
  objects: Array<ObjectRid>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetStreamSubscribeRequest {
  objectSet: ObjectSet;
  propertySet: Array<SelectedPropertyApiName>;
  referenceSet: Array<SelectedPropertyApiName>;
  objectLoadingResponseOptions?: ObjectLoadingResponseOptions;
}

/**
   * The list of object sets that should be subscribed to. A client can stop subscribing to an object set
by removing the request from subsequent ObjectSetStreamSubscribeRequests.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetStreamSubscribeRequests {
  id: RequestId;
  requests: Array<ObjectSetStreamSubscribeRequest>;
}

/**
 * Log Safety: UNSAFE
 */
export type ObjectSetSubscribeResponse =
  | ({ type: "qos" } & QosError)
  | ({ type: "success" } & SubscriptionSuccess)
  | ({ type: "error" } & SubscriptionError);

/**
 * Returns a response for every request in the same order. Duplicate requests will be assigned the same SubscriberId.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetSubscribeResponses {
  responses: Array<ObjectSetSubscribeResponse>;
  id: RequestId;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetSubtractType {
  objectSets: Array<ObjectSet>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetUnionType {
  objectSets: Array<ObjectSet>;
}

/**
 * Log Safety: UNSAFE
 */
export type ObjectSetUpdate =
  | ({ type: "reference" } & ReferenceUpdate)
  | ({ type: "object" } & ObjectUpdate);

/**
 * Log Safety: UNSAFE
 */
export interface ObjectSetUpdates {
  id: SubscriptionId;
  updates: Array<ObjectSetUpdate>;
}

/**
   * ObjectSet which returns objects with additional derived properties.
This feature is experimental and not yet generally available.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetWithPropertiesType {
  objectSet: ObjectSet;
  derivedProperties: Record<DerivedPropertyApiName, DerivedPropertyDefinition>;
}

/**
   * Represents the state of the object within the object set. ADDED_OR_UPDATED indicates that the object was
added to the set or the object has updated and was previously in the set. REMOVED indicates that the object
was removed from the set due to the object being deleted or the object no longer meets the object set
definition.
   *
   * Log Safety: SAFE
   */
export type ObjectState = "ADDED_OR_UPDATED" | "REMOVED";

/**
 * Represents an object type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectType {
  apiName: ObjectTypeApiName;
  legacyObjectTypeId?: LegacyObjectTypeId;
  displayName?: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  description?: string;
  visibility?: ObjectTypeVisibility;
  primaryKey: Array<PropertyApiName>;
  properties: Record<PropertyApiName, Property>;
  rid: ObjectTypeRid;
}

/**
   * The name of the object type in the API in camelCase format. To find the API name for your Object Type, use the
List object types endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type ObjectTypeApiName = LooselyBrandedString<"ObjectTypeApiName">;

/**
 * Log Safety: UNSAFE
 */
export interface ObjectTypeEdits {
  editedObjectTypes: Array<ObjectTypeApiName>;
}

/**
   * Request object for querying object type edits history, containing both filters and pagination parameters
If objectPrimaryKey property is set, the method will return edits history for the particular object.
Otherwise, the method will return edits history for all objects of this object type.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectTypeEditsHistoryRequest {
  objectPrimaryKey?: ObjectPrimaryKeyV2;
  filters?: EditsHistoryFilters;
  sortOrder?: EditsHistorySortOrder;
  includeAllPreviousProperties?: boolean;
  pageSize?: number;
  pageToken?: string;
}

/**
   * Response containing the history of edits for objects of a specific object type.
Only contains object edits (create, modify, delete) - link edits are not included.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectTypeEditsHistoryResponse {
  data: Array<ObjectEditHistoryEntry>;
  totalCount?: number;
  nextPageToken?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ObjectTypeFullMetadata {
  objectType: ObjectTypeV2;
  linkTypes: Array<LinkTypeSideV2>;
  implementsInterfaces: Array<InterfaceTypeApiName>;
  implementsInterfaces2: Record<
    InterfaceTypeApiName,
    ObjectTypeInterfaceImplementation
  >;
  sharedPropertyTypeMapping: Record<SharedPropertyTypeApiName, PropertyApiName>;
}

/**
 * The unique identifier (ID) for an object type. This can be viewed in Ontology Manager.
 *
 * Log Safety: UNSAFE
 */
export type ObjectTypeId = LooselyBrandedString<"ObjectTypeId">;

/**
 * Log Safety: UNSAFE
 */
export interface ObjectTypeInterfaceImplementation {
  apiName?: InterfaceTypeApiName;
  rid?: InterfaceTypeRid;
  properties: Record<SharedPropertyTypeApiName, PropertyApiName>;
  propertiesV2: Record<
    InterfacePropertyApiName,
    InterfacePropertyTypeImplementation
  >;
  links: Record<InterfaceLinkTypeApiName, Array<LinkTypeApiName>>;
}

/**
 * The unique resource identifier of an object type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type ObjectTypeRid = LooselyBrandedString<"ObjectTypeRid">;

/**
 * Represents an object type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface ObjectTypeV2 {
  apiName: ObjectTypeApiName;
  displayName: _Core.DisplayName;
  status: _Core.ReleaseStatus;
  description?: string;
  pluralDisplayName: string;
  icon: Icon;
  primaryKey: PropertyApiName;
  properties: Record<PropertyApiName, PropertyV2>;
  rid: ObjectTypeRid;
  titleProperty: PropertyApiName;
  visibility?: ObjectTypeVisibility;
}

/**
 * The suggested visibility of the object type.
 *
 * Log Safety: SAFE
 */
export type ObjectTypeVisibility = "NORMAL" | "PROMINENT" | "HIDDEN";

/**
 * Log Safety: UNSAFE
 */
export interface ObjectUpdate {
  object: OntologyObjectV2;
  state: ObjectState;
}

/**
 * The parameter has a manually predefined set of options.
 *
 * Log Safety: UNSAFE
 */
export interface OneOfConstraint {
  options: Array<ParameterOption>;
  otherValuesAllowed: boolean;
}

/**
 * Metadata about an Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface Ontology {
  apiName: OntologyApiName;
  displayName: _Core.DisplayName;
  description: string;
  rid: OntologyRid;
}

/**
 * Log Safety: UNSAFE
 */
export type OntologyApiName = LooselyBrandedString<"OntologyApiName">;

/**
 * Log Safety: UNSAFE
 */
export interface OntologyArrayType {
  itemType: OntologyDataType;
}

/**
 * A union of all the primitive types used by Palantir's Ontology-based products.
 *
 * Log Safety: UNSAFE
 */
export type OntologyDataType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "struct" } & OntologyStructType)
  | ({ type: "set" } & OntologySetType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "byte" } & _Core.ByteType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "float" } & _Core.FloatType)
  | ({ type: "any" } & _Core.AnyType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "cipherText" } & _Core.CipherTextType)
  | ({ type: "marking" } & _Core.MarkingType)
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "array" } & OntologyArrayType)
  | ({ type: "objectSet" } & OntologyObjectSetType)
  | ({ type: "binary" } & _Core.BinaryType)
  | ({ type: "short" } & _Core.ShortType)
  | ({ type: "decimal" } & _Core.DecimalType)
  | ({ type: "map" } & OntologyMapType)
  | ({ type: "timestamp" } & _Core.TimestampType)
  | ({ type: "object" } & OntologyObjectType);

/**
 * Log Safety: UNSAFE
 */
export interface OntologyFullMetadata {
  ontology: OntologyV2;
  objectTypes: Record<ObjectTypeApiName, ObjectTypeFullMetadata>;
  actionTypes: Record<ActionTypeApiName, ActionTypeV2>;
  queryTypes: Record<VersionedQueryTypeApiName, QueryTypeV2>;
  interfaceTypes: Record<InterfaceTypeApiName, InterfaceType>;
  sharedPropertyTypes: Record<SharedPropertyTypeApiName, SharedPropertyType>;
  branch?: _Core.BranchMetadata;
  valueTypes: Record<ValueTypeApiName, OntologyValueType>;
}

/**
   * The API name or RID of the Ontology. To find the API name or RID, use the List Ontologies endpoint or
check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type OntologyIdentifier = LooselyBrandedString<"OntologyIdentifier">;

/**
 * Log Safety: UNSAFE
 */
export type OntologyInterface = LooselyBrandedString<"OntologyInterface">;

/**
 * Log Safety: UNSAFE
 */
export interface OntologyInterfaceObjectSetType {
  interfaceTypeApiName: InterfaceTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyInterfaceObjectType {
  interfaceTypeApiName?: InterfaceTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyMapType {
  keyType: OntologyDataType;
  valueType: OntologyDataType;
}

/**
 * Represents an object in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface OntologyObject {
  properties: Record<PropertyApiName, PropertyValue | undefined>;
  rid: ObjectRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyObjectArrayType {
  subType: ObjectPropertyType;
  reducers: Array<OntologyObjectArrayTypeReducer>;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyObjectArrayTypeReducer {
  direction: OntologyObjectArrayTypeReducerSortDirection;
  field?: StructFieldApiName;
}

/**
 * Log Safety: SAFE
 */
export type OntologyObjectArrayTypeReducerSortDirection =
  | "ASCENDING_NULLS_LAST"
  | "DESCENDING_NULLS_LAST";

/**
 * Log Safety: UNSAFE
 */
export type OntologyObjectSet = LooselyBrandedString<"OntologyObjectSet">;

/**
 * Log Safety: UNSAFE
 */
export interface OntologyObjectSetType {
  objectApiName?: ObjectTypeApiName;
  objectTypeApiName?: ObjectTypeApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyObjectType {
  objectApiName: ObjectTypeApiName;
  objectTypeApiName: ObjectTypeApiName;
}

/**
 * Log Safety: SAFE
 */
export interface OntologyObjectTypeReferenceType {}

/**
 * Represents an object in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export type OntologyObjectV2 = Record<PropertyApiName, PropertyValue>;

/**
   * The unique Resource Identifier (RID) of the Ontology. To look up your Ontology RID, please use the
List ontologies endpoint or check the Ontology Manager.
   *
   * Log Safety: SAFE
   */
export type OntologyRid = LooselyBrandedString<"OntologyRid">;

/**
 * Log Safety: UNSAFE
 */
export interface OntologySetType {
  itemType: OntologyDataType;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyStructField {
  name: _Core.StructFieldName;
  fieldType: OntologyDataType;
  required: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyStructType {
  fields: Array<OntologyStructField>;
}

/**
 * Log Safety: UNSAFE
 */
export type OntologyTransaction = LooselyBrandedString<"OntologyTransaction">;

/**
 * The ID identifying a transaction.
 *
 * Log Safety: SAFE
 */
export type OntologyTransactionId = LooselyBrandedString<
  "OntologyTransactionId"
>;

/**
 * Metadata about an Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface OntologyV2 {
  apiName: OntologyApiName;
  displayName: _Core.DisplayName;
  description: string;
  rid: OntologyRid;
}

/**
 * Log Safety: UNSAFE
 */
export interface OntologyValueType {
  apiName: ValueTypeApiName;
  displayName: _Core.DisplayName;
  description?: string;
  rid: ValueTypeRid;
  status?: ValueTypeStatus;
  fieldType: ValueTypeFieldType;
  version: string;
  constraints: Array<ValueTypeConstraint>;
}

/**
 * Log Safety: SAFE
 */
export type OntologyVersion = string;

/**
   * A command representing the list of properties to order by. Properties should be delimited by commas and
prefixed by p or properties. The format expected format is
orderBy=properties.{property}:{sortDirection},properties.{property}:{sortDirection}...
By default, the ordering for a property is ascending, and this can be explicitly specified by appending
:asc (for ascending) or :desc (for descending).
Example: use orderBy=properties.lastName:asc to order by a single property,
orderBy=properties.lastName,properties.firstName,properties.age:desc to order by multiple properties.
You may also use the shorthand p instead of properties such as orderBy=p.lastName:asc.
   *
   * Log Safety: UNSAFE
   */
export type OrderBy = LooselyBrandedString<"OrderBy">;

/**
 * Log Safety: SAFE
 */
export type OrderByDirection = "ASC" | "DESC";

/**
 * Returns objects where at least 1 query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface OrQuery {
  value: Array<SearchJsonQuery>;
}

/**
 * Returns objects where at least 1 query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface OrQueryV2 {
  value: Array<SearchJsonQueryV2>;
}

/**
 * Details about a parameter of an action or query.
 *
 * Log Safety: UNSAFE
 */
export interface Parameter {
  description?: string;
  baseType: ValueType;
  dataType?: OntologyDataType;
  required: boolean;
}

/**
   * A constraint that an action parameter value must satisfy in order to be considered valid.
Constraints can be configured on action parameters in the Ontology Manager.
Applicable constraints are determined dynamically based on parameter inputs.
Parameter values are evaluated against the final set of constraints.
The type of the constraint.
| Type                  | Description                                                                                                                                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| arraySize           | The parameter expects an array of values and the size of the array must fall within the defined range.                                                                                                                          |
| groupMember         | The parameter value must be the user id of a member belonging to at least one of the groups defined by the constraint.                                                                                                          |
| objectPropertyValue | The parameter value must be a property value of an object found within an object set.                                                                                                                                           |
| objectQueryResult   | The parameter value must be the primary key of an object found within an object set.                                                                                                                                            |
| oneOf               | The parameter has a manually predefined set of options.                                                                                                                                                                         |
| range               | The parameter value must be within the defined range.                                                                                                                                                                           |
| stringLength        | The parameter value must have a length within the defined range.                                                                                                                                                                |
| stringRegexMatch    | The parameter value must match a predefined regular expression.                                                                                                                                                                 |
| unevaluable         | The parameter cannot be evaluated because it depends on another parameter or object set that can't be evaluated. This can happen when a parameter's allowed values are defined by another parameter that is missing or invalid. |
   *
   * Log Safety: UNSAFE
   */
export type ParameterEvaluatedConstraint =
  | ({ type: "struct" } & StructEvaluatedConstraint)
  | ({ type: "oneOf" } & OneOfConstraint)
  | ({ type: "array" } & ArrayEvaluatedConstraint)
  | ({ type: "groupMember" } & GroupMemberConstraint)
  | ({ type: "objectPropertyValue" } & ObjectPropertyValueConstraint)
  | ({ type: "range" } & RangeConstraint)
  | ({ type: "arraySize" } & ArraySizeConstraint)
  | ({ type: "objectQueryResult" } & ObjectQueryResultConstraint)
  | ({ type: "stringLength" } & StringLengthConstraint)
  | ({ type: "stringRegexMatch" } & StringRegexMatchConstraint)
  | ({ type: "unevaluable" } & UnevaluableConstraint);

/**
 * Represents the validity of a parameter against the configured constraints.
 *
 * Log Safety: UNSAFE
 */
export interface ParameterEvaluationResult {
  result: ValidationResult;
  evaluatedConstraints: Array<ParameterEvaluatedConstraint>;
  required: boolean;
}

/**
   * The unique identifier of the parameter. Parameters are used as inputs when an action or query is applied.
Parameters can be viewed and managed in the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type ParameterId = LooselyBrandedString<"ParameterId">;

/**
 * Represents a parameter ID argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface ParameterIdArgument {
  parameterId: ParameterId;
}

/**
 * A possible value for the parameter. This is defined in the Ontology Manager by Actions admins.
 *
 * Log Safety: UNSAFE
 */
export interface ParameterOption {
  displayName?: _Core.DisplayName;
  value?: any;
}

/**
 * Returns objects where the specified field contains the provided value as a substring.
 *
 * Log Safety: UNSAFE
 */
export interface PhraseQuery {
  field: FieldNameV1;
  value: string;
}

/**
 * Log Safety: DO_NOT_LOG
 */
export type Plaintext = LooselyBrandedString<"Plaintext">;

/**
 * Log Safety: UNSAFE
 */
export type PolygonValue = { type: "Polygon" } & _Geo.Polygon;

/**
 * The request payload for staging edits to a transaction.
 *
 * Log Safety: UNSAFE
 */
export interface PostTransactionEditsRequest {
  edits: Array<TransactionEdit>;
}

/**
 * Log Safety: SAFE
 */
export interface PostTransactionEditsResponse {}

/**
 * A measurement of duration.
 *
 * Log Safety: SAFE
 */
export interface PreciseDuration {
  value: number;
  unit: PreciseTimeUnit;
}

/**
 * The unit of a fixed-width duration. Each day is 24 hours and each week is 7 days.
 *
 * Log Safety: SAFE
 */
export type PreciseTimeUnit =
  | "NANOSECONDS"
  | "SECONDS"
  | "MINUTES"
  | "HOURS"
  | "DAYS"
  | "WEEKS";

/**
   * Matches intervals containing all the terms, using exact match for all but the last term, and prefix match for
the last term. Ordering of the terms in the query is preserved.
   *
   * Log Safety: UNSAFE
   */
export interface PrefixOnLastTokenRule {
  query: string;
}

/**
 * Returns objects where the specified field starts with the provided value.
 *
 * Log Safety: UNSAFE
 */
export interface PrefixQuery {
  field: FieldNameV1;
  value: string;
}

/**
 * Represents the primary key value that is used as a unique identifier for an object.
 *
 * Log Safety: UNSAFE
 */
export type PrimaryKeyValue = any;

/**
 * Log Safety: UNSAFE
 */
export type PrimaryKeyValueV2 =
  | ({ type: "dateValue" } & DateValue)
  | ({ type: "stringValue" } & StringValue)
  | ({ type: "timestampValue" } & TimestampValue)
  | ({ type: "booleanValue" } & BooleanValue)
  | ({ type: "integerValue" } & IntegerValue)
  | ({ type: "doubleValue" } & DoubleValue)
  | ({ type: "longValue" } & LongValue);

/**
 * Details about some property of an object.
 *
 * Log Safety: UNSAFE
 */
export interface Property {
  description?: string;
  displayName?: _Core.DisplayName;
  baseType: ValueType;
  legacyPropertyId?: LegacyPropertyId;
}

/**
   * The name of the property in the API. To find the API name for your property, use the Get object type
endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type PropertyApiName = LooselyBrandedString<"PropertyApiName">;

/**
 * A property api name that references properties to query on.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyApiNameSelector {
  apiName: PropertyApiName;
}

/**
 * Formatting configuration for boolean property values.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyBooleanFormattingRule {
  valueIfTrue: string;
  valueIfFalse: string;
}

/**
 * Formatting configuration for date property values.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyDateFormattingRule {
  format: DatetimeFormat;
}

/**
   * Represents a filter used on properties.
Endpoints that accept this supports optional parameters that have the form:
properties.{propertyApiName}.{propertyFilter}={propertyValueEscapedString} to filter the returned objects.
For instance, you may use properties.firstName.eq=John to find objects that contain a property called
"firstName" that has the exact value of "John".
The following are a list of supported property filters:

properties.{propertyApiName}.contains - supported on arrays and can be used to filter array properties
that have at least one of the provided values. If multiple query parameters are provided, then objects
that have any of the given values for the specified property will be matched.
properties.{propertyApiName}.eq - used to filter objects that have the exact value for the provided
property. If multiple query parameters are provided, then objects that have any of the given values
will be matched. For instance, if the user provides a request by doing
?properties.firstName.eq=John&properties.firstName.eq=Anna, then objects that have a firstName property
of either John or Anna will be matched. This filter is supported on all property types except Arrays.
properties.{propertyApiName}.neq - used to filter objects that do not have the provided property values.
Similar to the eq filter, if multiple values are provided, then objects that have any of the given values
will be excluded from the result.
properties.{propertyApiName}.lt, properties.{propertyApiName}.lte, properties.{propertyApiName}.gt
properties.{propertyApiName}.gte - represent less than, less than or equal to, greater than, and greater
than or equal to respectively. These are supported on date, timestamp, byte, integer, long, double, decimal.
properties.{propertyApiName}.isNull - used to filter objects where the provided property is (or is not) null.
This filter is supported on all property types.
   *
   * Log Safety: SAFE
   */
export type PropertyFilter = LooselyBrandedString<"PropertyFilter">;

/**
   * The immutable ID of a property. Property IDs are only used to identify properties in the Ontology Manager
application and assign them API names. In every other case, API names should be used instead of property IDs.
   *
   * Log Safety: UNSAFE
   */
export type PropertyId = LooselyBrandedString<"PropertyId">;

/**
 * An identifier used to select properties or struct fields.
 *
 * Log Safety: UNSAFE
 */
export type PropertyIdentifier =
  | ({ type: "property" } & PropertyApiNameSelector)
  | ({ type: "structField" } & StructFieldSelector)
  | ({ type: "propertyWithLoadLevel" } & PropertyWithLoadLevelSelector);

/**
 * Log Safety: UNSAFE
 */
export interface PropertyImplementation {
  propertyApiName: PropertyApiName;
}

/**
 * Formatting configuration for known Foundry types.
 *
 * Log Safety: SAFE
 */
export interface PropertyKnownTypeFormattingRule {
  knownType: KnownType;
}

/**
   * The load level of the property:

APPLY_REDUCERS: Returns a single value of an array as configured in the ontology.
EXTRACT_MAIN_VALUE: Returns the main value of a struct as configured in the ontology.
APPLY_REDUCERS_AND_EXTRACT_MAIN_VALUE: Performs both to return the reduced main value.
   *
   * Log Safety: UNSAFE
   */
export type PropertyLoadLevel =
  | ({
    type: "applyReducersAndExtractMainValue";
  } & ApplyReducersAndExtractMainValueLoadLevel)
  | ({ type: "applyReducers" } & ApplyReducersLoadLevel)
  | ({ type: "extractMainValue" } & ExtractMainValueLoadLevel);

/**
 * All marking requirements applicable to a property value.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyMarkingSummary {
  conjunctive?: ConjunctiveMarkingSummary;
  disjunctive?: DisjunctiveMarkingSummary;
  containerConjunctive?: ContainerConjunctiveMarkingSummary;
  containerDisjunctive?: ContainerDisjunctiveMarkingSummary;
}

/**
 * Wrapper for numeric formatting options.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyNumberFormattingRule {
  numberType: PropertyNumberFormattingRuleType;
}

/**
 * Log Safety: UNSAFE
 */
export type PropertyNumberFormattingRuleType =
  | ({ type: "standard" } & NumberFormatStandard)
  | ({ type: "duration" } & NumberFormatDuration)
  | ({ type: "fixedValues" } & NumberFormatFixedValues)
  | ({ type: "affix" } & NumberFormatAffix)
  | ({ type: "scale" } & NumberFormatScale)
  | ({ type: "currency" } & NumberFormatCurrency)
  | ({ type: "standardUnit" } & NumberFormatStandardUnit)
  | ({ type: "customUnit" } & NumberFormatCustomUnit)
  | ({ type: "ratio" } & NumberFormatRatio);

/**
 * Log Safety: UNSAFE
 */
export type PropertyOrStructFieldOfPropertyImplementation =
  | ({ type: "structFieldOfProperty" } & StructFieldOfPropertyImplementation)
  | ({ type: "property" } & PropertyImplementation);

/**
 * A disjunctive set of security results for a property value.
 *
 * Log Safety: UNSAFE
 */
export interface PropertySecurities {
  disjunction: Array<PropertySecurity>;
}

/**
 * Log Safety: UNSAFE
 */
export type PropertySecurity =
  | ({ type: "propertyMarkingSummary" } & PropertyMarkingSummary)
  | ({ type: "unsupportedPolicy" } & UnsupportedPolicy)
  | ({ type: "errorComputingSecurity" } & ErrorComputingSecurity);

/**
 * Formatting configuration for timestamp property values.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyTimestampFormattingRule {
  format: DatetimeFormat;
  displayTimezone: DatetimeTimezone;
}

/**
 * Log Safety: UNSAFE
 */
export type PropertyTypeApiName = LooselyBrandedString<"PropertyTypeApiName">;

/**
 * Log Safety: UNSAFE
 */
export interface PropertyTypeReference {
  propertyApiName: string;
}

/**
 * Log Safety: UNSAFE
 */
export type PropertyTypeReferenceOrStringConstant =
  | ({ type: "constant" } & StringConstant)
  | ({ type: "propertyType" } & PropertyTypeReference);

/**
 * The unique resource identifier of a property.
 *
 * Log Safety: SAFE
 */
export type PropertyTypeRid = LooselyBrandedString<"PropertyTypeRid">;

/**
 * The status to indicate whether the PropertyType is either Experimental, Active, Deprecated, or Example.
 *
 * Log Safety: UNSAFE
 */
export type PropertyTypeStatus =
  | ({ type: "deprecated" } & DeprecatedPropertyTypeStatus)
  | ({ type: "active" } & ActivePropertyTypeStatus)
  | ({ type: "experimental" } & ExperimentalPropertyTypeStatus)
  | ({ type: "example" } & ExamplePropertyTypeStatus);

/**
 * Log Safety: SAFE
 */
export type PropertyTypeVisibility = "NORMAL" | "PROMINENT" | "HIDDEN";

/**
 * Details about some property of an object.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyV2 {
  description?: string;
  displayName?: _Core.DisplayName;
  dataType: ObjectPropertyType;
  rid: PropertyTypeRid;
  status?: PropertyTypeStatus;
  visibility?: PropertyTypeVisibility;
  valueTypeApiName?: ValueTypeApiName;
  valueFormatting?: PropertyValueFormattingRule;
  typeClasses: Array<TypeClass>;
}

/**
   * Represents the value of a property in the following format.
| Type                                                                                                                      | JSON encoding                                               | Example                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Array                                                                                                                     | array                                                       | ["alpha", "bravo", "charlie"]                                                                    |
| Attachment              | JSON encoded AttachmentProperty object                    | {"rid":"ri.blobster.main.attachment.2f944bae-5851-4204-8615-920c969a9f2e"}                       |
| Boolean                                                                                                                   | boolean                                                     | true                                                                                             |
| Byte                                                                                                                      | number                                                      | 31                                                                                               |
| CipherText                                                                                                                | string                                                      | "CIPHER::ri.bellaso.main.cipher-channel.e414ab9e-b606-499a-a0e1-844fa296ba7e::unzjs3VifsTxuIpf1fH1CJ7OaPBr2bzMMdozPaZJtCii8vVG60yXIEmzoOJaEl9mfFFe::CIPHER"                                                                                                                                                                                        |

| Date                                                                                                                      | ISO 8601 extended local date string                         | "2021-05-01"                                                                                     |
| Decimal                                                                                                                   | string                                                      | "2.718281828"                                                                                    |
| Double                                                                                                                    | number                                                      | 3.14159265                                                                                       |
| Float                                                                                                                     | number                                                      | 3.14159265                                                                                       |
| GeoPoint                                                                                                                  | geojson                                                     | {"type":"Point","coordinates":[102.0,0.5]}                                                       |
| GeoShape                                                                                                                  | geojson                                                     | {"type":"LineString","coordinates":[[102.0,0.0],[103.0,1.0],[104.0,0.0],[105.0,1.0]]}            |
| Integer                                                                                                                   | number                                                      | 238940                                                                                           |
| Long                                                                                                                      | string                                                      | "58319870951433"                                                                                 |
| MediaReference| JSON encoded MediaReference object                        | {"mimeType":"application/pdf","reference":{"type":"mediaSetViewItem","mediaSetViewItem":{"mediaSetRid":"ri.mio.main.media-set.4153d42f-ca4b-4e42-8ca5-8e6aa7edb642","mediaSetViewRid":"ri.mio.main.view.82a798ad-d637-4595-acc6-987bcf16629b","mediaItemRid":"ri.mio.main.media-item.001ec98b-1620-4814-9e17-8e9c4e536225"}}}                       |
| Secured Property Value                                                                                                    | JSON encoded SecuredPropertyValue object                  | {"value": 10, "propertySecurityIndex" : 5}                                                       |
| Short                                                                                                                     | number                                                      | 8739                                                                                             |
| String                                                                                                                    | string                                                      | "Call me Ishmael"                                                                                |
| Struct                                                                                                                    | JSON object of struct field API name -> value               | {"firstName": "Alex", "lastName": "Karp"}                                                          |
| Timestamp                                                                                                                 | ISO 8601 extended offset date-time string in UTC zone       | "2021-01-04T05:00:00Z"                                                                           |
| Timeseries            | JSON encoded TimeseriesProperty object or seriesId string | {"seriesId": "wellPressureSeriesId", "syncRid": ri.time-series-catalog.main.sync.04f5ac1f-91bf-44f9-a51f-4f34e06e42df"} or {"templateRid": "ri.codex-emu.main.template.367cac64-e53b-4653-b111-f61856a63df9", "templateVersion": "0.0.0"} or "wellPressureSeriesId"|                                                                           |
| Vector                                                                                                                    | array                                                       | [0.1, 0.3, 0.02, 0.05 , 0.8, 0.4]                                                                |
Note that for backwards compatibility, the Boolean, Byte, Double, Float, Integer, and Short types can also be encoded as JSON strings.
   *
   * Log Safety: UNSAFE
   */
export type PropertyValue = any;

/**
 * Represents the value of a property in string format. This is used in URL parameters.
 *
 * Log Safety: UNSAFE
 */
export type PropertyValueEscapedString = LooselyBrandedString<
  "PropertyValueEscapedString"
>;

/**
   * This feature is experimental and may change in a future release.
Comprehensive formatting configuration for displaying property values in user interfaces.
Supports different value types including numbers, dates, timestamps, booleans, and known Foundry types.
Each formatter type provides specific options tailored to that data type:

Numbers: Support for percentages, currencies, units, scaling, and custom formatting
Dates/Timestamps: Localized and custom formatting patterns
Booleans: Custom true/false display text
Known types: Special formatting for Foundry-specific identifiers
   *
   * Log Safety: UNSAFE
   */
export type PropertyValueFormattingRule =
  | ({ type: "date" } & PropertyDateFormattingRule)
  | ({ type: "number" } & PropertyNumberFormattingRule)
  | ({ type: "boolean" } & PropertyBooleanFormattingRule)
  | ({ type: "knownType" } & PropertyKnownTypeFormattingRule)
  | ({ type: "timestamp" } & PropertyTimestampFormattingRule);

/**
   * A combination of a property identifier and the load level to apply to the property. You can select a reduced
value for arrays and the main value for structs. If the provided load level cannot be applied to the property
type, then it will be ignored. This selector is experimental and may not work in filters or sorts.
   *
   * Log Safety: UNSAFE
   */
export interface PropertyWithLoadLevelSelector {
  propertyIdentifier: PropertyIdentifier;
  loadLevel: PropertyLoadLevel;
}

/**
 * An error indicating that the subscribe request should be attempted on a different node.
 *
 * Log Safety: SAFE
 */
export interface QosError {}

/**
 * The representation of a time series property backed by multiple time series syncs.
 *
 * Log Safety: UNSAFE
 */
export interface QualifiedTimeseriesProperty {
  seriesId: SeriesId;
  syncRid: TimeseriesSyncRid;
}

/**
 * Log Safety: UNSAFE
 */
export type Query = LooselyBrandedString<"Query">;

/**
 * Log Safety: UNSAFE
 */
export interface QueryAggregation {
  key: any;
  value: any;
}

/**
 * A union of all the types supported by query aggregation keys.
 *
 * Log Safety: UNSAFE
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
 * Specifies a range from an inclusive start value to an exclusive end value.
 *
 * Log Safety: UNSAFE
 */
export interface QueryAggregationRange {
  startValue?: any;
  endValue?: any;
}

/**
 * A union of all the types supported by query aggregation ranges.
 *
 * Log Safety: UNSAFE
 */
export type QueryAggregationRangeSubType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Log Safety: UNSAFE
 */
export interface QueryAggregationRangeType {
  subType: QueryAggregationRangeSubType;
}

/**
 * A union of all the types supported by query aggregation keys.
 *
 * Log Safety: UNSAFE
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
 * A union of all the types supported by Ontology Query parameters or outputs.
 *
 * Log Safety: UNSAFE
 */
export type QueryDataType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "interfaceObject" } & OntologyInterfaceObjectType)
  | ({ type: "struct" } & QueryStructType)
  | ({ type: "set" } & QuerySetType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "entrySet" } & EntrySetType)
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
  | ({ type: "objectSet" } & OntologyObjectSetType)
  | ({ type: "twoDimensionalAggregation" } & TwoDimensionalAggregation)
  | ({ type: "interfaceObjectSet" } & OntologyInterfaceObjectSetType)
  | ({ type: "object" } & OntologyObjectType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Details about the output of a query.
 *
 * Log Safety: UNSAFE
 */
export interface QueryOutputV2 {
  dataType: QueryDataType;
  required: boolean;
}

/**
 * Details about a parameter of a query.
 *
 * Log Safety: UNSAFE
 */
export interface QueryParameterV2 {
  description?: string;
  dataType: QueryDataType;
}

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
  name: _Core.StructFieldName;
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
export interface QueryThreeDimensionalAggregation {
  groups: Array<NestedQueryAggregation>;
}

/**
 * Log Safety: UNSAFE
 */
export interface QueryTwoDimensionalAggregation {
  groups: Array<QueryAggregation>;
}

/**
 * Represents a query type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface QueryType {
  apiName: QueryApiName;
  description?: string;
  displayName?: _Core.DisplayName;
  parameters: Record<ParameterId, Parameter>;
  output?: OntologyDataType;
  rid: FunctionRid;
  version: FunctionVersion;
}

/**
 * Represents a query type in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export interface QueryTypeV2 {
  apiName: QueryApiName;
  description?: string;
  displayName?: _Core.DisplayName;
  parameters: Record<ParameterId, QueryParameterV2>;
  output: QueryDataType;
  rid: FunctionRid;
  version: FunctionVersion;
}

/**
 * Log Safety: UNSAFE
 */
export interface QueryUnionType {
  unionTypes: Array<QueryDataType>;
}

/**
 * The parameter value must be within the defined range.
 *
 * Log Safety: UNSAFE
 */
export interface RangeConstraint {
  lt?: any;
  lte?: any;
  gt?: any;
  gte?: any;
}

/**
 * Log Safety: UNSAFE
 */
export interface RangesConstraint {
  minimumValue?: PropertyValue;
  maximumValue?: PropertyValue;
}

/**
 * Log Safety: SAFE
 */
export interface Reason {
  reason: ReasonType;
}

/**
 * Represents the reason a subscription was closed.
 *
 * Log Safety: SAFE
 */
export type ReasonType = "USER_CLOSED" | "CHANNEL_CLOSED";

/**
   * The updated data value associated with an object instance's external reference. The object instance
is uniquely identified by an object type and a primary key. Note that the value of the property
field returns a dereferenced value rather than the reference itself.
   *
   * Log Safety: UNSAFE
   */
export interface ReferenceUpdate {
  objectType: ObjectTypeApiName;
  primaryKey: ObjectPrimaryKey;
  property: PropertyApiName;
  value: ReferenceValue;
}

/**
 * Resolved data values pointed to by a reference.
 *
 * Log Safety: UNSAFE
 */
export type ReferenceValue = {
  type: "geotimeSeriesValue";
} & GeotimeSeriesValue;

/**
 * The list of updated Foundry Objects cannot be provided. The object set must be refreshed using Object Set Service.
 *
 * Log Safety: UNSAFE
 */
export interface RefreshObjectSet {
  id: SubscriptionId;
  objectType: ObjectTypeApiName;
}

/**
 * Log Safety: SAFE
 */
export interface RegexConstraint {
  pattern: string;
  partialMatch: boolean;
}

/**
   * Returns objects where the specified field matches the regex pattern provided. This applies to the non-analyzed
form of text fields and supports standard regex syntax of dot (.), star(*) and question mark(?).
Either field or propertyIdentifier can be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface RegexQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
 * Specifies a bound for a relative date range query.
 *
 * Log Safety: UNSAFE
 */
export type RelativeDateRangeBound = {
  type: "relativePoint";
} & RelativePointInTime;

/**
   * Returns objects where the specified date or timestamp property falls within a relative date range.
The bounds are calculated relative to query execution time and rounded to midnight in the specified timezone.
   *
   * Log Safety: UNSAFE
   */
export interface RelativeDateRangeQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  relativeStartTime?: RelativeDateRangeBound;
  relativeEndTime?: RelativeDateRangeBound;
  timeZoneId: string;
}

/**
 * A point in time specified relative to query execution time.
 *
 * Log Safety: UNSAFE
 */
export interface RelativePointInTime {
  value: number;
  timeUnit: RelativeTimeUnit;
}

/**
 * A relative time, such as "3 days before" or "2 hours after" the current moment.
 *
 * Log Safety: UNSAFE
 */
export interface RelativeTime {
  when: RelativeTimeRelation;
  value: number;
  unit: RelativeTimeSeriesTimeUnit;
}

/**
 * A relative time range for a time series query.
 *
 * Log Safety: UNSAFE
 */
export interface RelativeTimeRange {
  startTime?: RelativeTime;
  endTime?: RelativeTime;
}

/**
 * Log Safety: SAFE
 */
export type RelativeTimeRelation = "BEFORE" | "AFTER";

/**
 * Log Safety: SAFE
 */
export type RelativeTimeSeriesTimeUnit =
  | "MILLISECONDS"
  | "SECONDS"
  | "MINUTES"
  | "HOURS"
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

/**
 * Units for relative time calculations.
 *
 * Log Safety: SAFE
 */
export type RelativeTimeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

/**
 * Unique request id
 *
 * Log Safety: SAFE
 */
export type RequestId = string;

/**
   * An interface property type with additional fields to indicate constraints that need to be satisfied by
implementing object property types.
   *
   * Log Safety: UNSAFE
   */
export interface ResolvedInterfacePropertyType {
  rid: InterfacePropertyTypeRid;
  apiName: InterfacePropertyApiName;
  displayName: _Core.DisplayName;
  description?: string;
  dataType: ObjectPropertyType;
  valueTypeApiName?: ValueTypeApiName;
  valueFormatting?: PropertyValueFormattingRule;
  requireImplementation: boolean;
}

/**
 * If not specified, defaults to NONE.
 *
 * Log Safety: SAFE
 */
export type ReturnEditsMode = "ALL" | "ALL_V2_WITH_DELETIONS" | "NONE";

/**
 * The string must be a valid RID (Resource Identifier).
 *
 * Log Safety: SAFE
 */
export interface RidConstraint {}

/**
 * Number of points in each window.
 *
 * Log Safety: SAFE
 */
export interface RollingAggregateWindowPoints {
  count: number;
}

/**
 * Log Safety: UNSAFE
 */
export type SdkPackageName = LooselyBrandedString<"SdkPackageName">;

/**
 * Log Safety: SAFE
 */
export type SdkPackageRid = LooselyBrandedString<"SdkPackageRid">;

/**
 * Log Safety: SAFE
 */
export type SdkVersion = LooselyBrandedString<"SdkVersion">;

/**
 * Log Safety: UNSAFE
 */
export type SearchJsonQuery =
  | ({ type: "or" } & OrQuery)
  | ({ type: "prefix" } & PrefixQuery)
  | ({ type: "lt" } & LtQuery)
  | ({ type: "allTerms" } & AllTermsQuery)
  | ({ type: "eq" } & EqualsQuery)
  | ({ type: "gt" } & GtQuery)
  | ({ type: "contains" } & ContainsQuery)
  | ({ type: "not" } & NotQuery)
  | ({ type: "phrase" } & PhraseQuery)
  | ({ type: "and" } & AndQuery)
  | ({ type: "isNull" } & IsNullQuery)
  | ({ type: "gte" } & GteQuery)
  | ({ type: "anyTerm" } & AnyTermQuery)
  | ({ type: "lte" } & LteQuery);

/**
 * Log Safety: UNSAFE
 */
export type SearchJsonQueryV2 =
  | ({ type: "lt" } & LtQueryV2)
  | ({ type: "doesNotIntersectBoundingBox" } & DoesNotIntersectBoundingBoxQuery)
  | ({ type: "relativeDateRange" } & RelativeDateRangeQuery)
  | ({ type: "wildcard" } & WildcardQuery)
  | ({ type: "withinDistanceOf" } & WithinDistanceOfQuery)
  | ({ type: "withinBoundingBox" } & WithinBoundingBoxQuery)
  | ({ type: "not" } & NotQueryV2)
  | ({ type: "intersectsBoundingBox" } & IntersectsBoundingBoxQuery)
  | ({ type: "and" } & AndQueryV2)
  | ({
    type: "containsAllTermsInOrderPrefixLastTerm";
  } & ContainsAllTermsInOrderPrefixLastTerm)
  | ({ type: "gte" } & GteQueryV2)
  | ({ type: "containsAllTermsInOrder" } & ContainsAllTermsInOrderQuery)
  | ({ type: "withinPolygon" } & WithinPolygonQuery)
  | ({ type: "intersectsPolygon" } & IntersectsPolygonQuery)
  | ({ type: "lte" } & LteQueryV2)
  | ({ type: "or" } & OrQueryV2)
  | ({ type: "in" } & InQuery)
  | ({ type: "doesNotIntersectPolygon" } & DoesNotIntersectPolygonQuery)
  | ({ type: "eq" } & EqualsQueryV2)
  | ({ type: "containsAllTerms" } & ContainsAllTermsQuery)
  | ({ type: "gt" } & GtQueryV2)
  | ({ type: "contains" } & ContainsQueryV2)
  | ({ type: "regex" } & RegexQuery)
  | ({ type: "isNull" } & IsNullQueryV2)
  | ({ type: "containsAnyTerm" } & ContainsAnyTermQuery)
  | ({ type: "interval" } & IntervalQuery)
  | ({ type: "startsWith" } & StartsWithQuery);

/**
 * Log Safety: UNSAFE
 */
export interface SearchObjectsForInterfaceRequest {
  where?: SearchJsonQueryV2;
  orderBy?: SearchOrderByV2;
  augmentedProperties: Record<ObjectTypeApiName, Array<PropertyApiName>>;
  augmentedSharedPropertyTypes: Record<
    InterfaceTypeApiName,
    Array<SharedPropertyTypeApiName>
  >;
  augmentedInterfacePropertyTypes: Record<
    InterfaceTypeApiName,
    Array<InterfacePropertyApiName>
  >;
  selectedSharedPropertyTypes: Array<SharedPropertyTypeApiName>;
  selectedInterfacePropertyTypes: Array<InterfacePropertyApiName>;
  selectedObjectTypes: Array<ObjectTypeApiName>;
  otherInterfaceTypes: Array<InterfaceTypeApiName>;
  pageSize?: _Core.PageSize;
  pageToken?: _Core.PageToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchObjectsRequest {
  query: SearchJsonQuery;
  orderBy?: SearchOrderBy;
  pageSize?: _Core.PageSize;
  pageToken?: _Core.PageToken;
  fields: Array<PropertyApiName>;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchObjectsRequestV2 {
  where?: SearchJsonQueryV2;
  orderBy?: SearchOrderByV2;
  pageSize?: _Core.PageSize;
  pageToken?: _Core.PageToken;
  select: Array<PropertyApiName>;
  selectV2: Array<PropertyIdentifier>;
  excludeRid?: boolean;
  snapshot?: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchObjectsResponse {
  data: Array<OntologyObject>;
  nextPageToken?: _Core.PageToken;
  totalCount: _Core.TotalCount;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchObjectsResponseV2 {
  data: Array<OntologyObjectV2>;
  nextPageToken?: _Core.PageToken;
  totalCount: _Core.TotalCount;
}

/**
 * Specifies the ordering of search results by a field and an ordering direction.
 *
 * Log Safety: UNSAFE
 */
export interface SearchOrderBy {
  fields: Array<SearchOrdering>;
}

/**
 * Log Safety: SAFE
 */
export type SearchOrderByType = "fields" | "relevance";

/**
 * Specifies the ordering of search results by a field and an ordering direction or by relevance if scores are required in a nearestNeighbors query. By default orderType is set to fields.
 *
 * Log Safety: UNSAFE
 */
export interface SearchOrderByV2 {
  orderType?: SearchOrderByType;
  fields: Array<SearchOrderingV2>;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchOrdering {
  field: FieldNameV1;
  direction?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface SearchOrderingV2 {
  field: PropertyApiName;
  direction?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface SecuredPropertyValue {
  value?: PropertyValue;
  propertySecurityIndex?: number;
}

/**
   * By default, whenever an object is requested, all of its properties are returned, except for properties of the
following types:

Vector

The response can be filtered to only include certain properties using the properties query parameter. Note
that ontology object set endpoints refer to this parameter as select.
Properties to include can be specified in one of two ways.

A comma delimited list as the value for the properties query parameter
properties={property1ApiName},{property2ApiName}
Multiple properties query parameters.
properties={property1ApiName}&properties={property2ApiName}

The primary key of the object will always be returned even if it wasn't specified in the properties values.
Unknown properties specified in the properties list will result in a PropertiesNotFound error.
To find the API name for your property, use the Get object type endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type SelectedPropertyApiName = LooselyBrandedString<
  "SelectedPropertyApiName"
>;

/**
 * Computes an approximate number of distinct values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyApproximateDistinctAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * Computes the approximate percentile value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyApproximatePercentileAggregation {
  selectedPropertyApiName: PropertyApiName;
  approximatePercentile: number;
}

/**
 * Computes the average value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyAvgAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
   * Lists all values of a property up to the specified limit. The maximum supported limit is 100, by default.
NOTE: A separate count aggregation should be used to determine the total count of values, to account for
a possible truncation of the returned list.
Ignores objects for which a property is absent, so the returned list will contain non-null values only.
Returns an empty list when none of the objects have values for a provided property.
   *
   * Log Safety: UNSAFE
   */
export interface SelectedPropertyCollectListAggregation {
  selectedPropertyApiName: PropertyApiName;
  limit: number;
}

/**
   * Lists all distinct values of a property up to the specified limit. The maximum supported limit is 100.
NOTE: A separate cardinality / exactCardinality aggregation should be used to determine the total count of
values, to account for a possible truncation of the returned set.
Ignores objects for which a property is absent, so the returned list will contain non-null values only.
Returns an empty list when none of the objects have values for a provided property.
   *
   * Log Safety: UNSAFE
   */
export interface SelectedPropertyCollectSetAggregation {
  selectedPropertyApiName: PropertyApiName;
  limit: number;
}

/**
 * Computes the total count of objects.
 *
 * Log Safety: SAFE
 */
export interface SelectedPropertyCountAggregation {}

/**
 * Computes an exact number of distinct values for the provided field. May be slower than an approximate distinct aggregation.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyExactDistinctAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * Definition for a selected property over a MethodObjectSet.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyExpression {
  objectSet: MethodObjectSet;
  operation: SelectedPropertyOperation;
}

/**
 * Computes the maximum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyMaxAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * Computes the minimum value for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertyMinAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * Operation on a selected property, can be an aggregation function or retrieval of a single selected property
 *
 * Log Safety: UNSAFE
 */
export type SelectedPropertyOperation =
  | ({
    type: "approximateDistinct";
  } & SelectedPropertyApproximateDistinctAggregation)
  | ({ type: "min" } & SelectedPropertyMinAggregation)
  | ({ type: "avg" } & SelectedPropertyAvgAggregation)
  | ({ type: "max" } & SelectedPropertyMaxAggregation)
  | ({
    type: "approximatePercentile";
  } & SelectedPropertyApproximatePercentileAggregation)
  | ({ type: "get" } & GetSelectedPropertyOperation)
  | ({ type: "count" } & SelectedPropertyCountAggregation)
  | ({ type: "sum" } & SelectedPropertySumAggregation)
  | ({ type: "collectList" } & SelectedPropertyCollectListAggregation)
  | ({ type: "exactDistinct" } & SelectedPropertyExactDistinctAggregation)
  | ({ type: "collectSet" } & SelectedPropertyCollectSetAggregation);

/**
 * Computes the sum of values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SelectedPropertySumAggregation {
  selectedPropertyApiName: PropertyApiName;
}

/**
 * The unique codex id of a time series.
 *
 * Log Safety: UNSAFE
 */
export type SeriesId = LooselyBrandedString<"SeriesId">;

/**
 * A property type that can be shared across object types.
 *
 * Log Safety: UNSAFE
 */
export interface SharedPropertyType {
  rid: SharedPropertyTypeRid;
  apiName: SharedPropertyTypeApiName;
  displayName: _Core.DisplayName;
  description?: string;
  dataType: ObjectPropertyType;
  valueTypeApiName?: ValueTypeApiName;
  valueFormatting?: PropertyValueFormattingRule;
  typeClasses: Array<TypeClass>;
}

/**
   * The name of the shared property type in the API in lowerCamelCase format. To find the API name for your
shared property type, use the List shared property types endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type SharedPropertyTypeApiName = LooselyBrandedString<
  "SharedPropertyTypeApiName"
>;

/**
 * The unique resource identifier of an shared property type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type SharedPropertyTypeRid = LooselyBrandedString<
  "SharedPropertyTypeRid"
>;

/**
   * Deprecated alias for containsAllTermsInOrderPrefixLastTerm, which is preferred because the name startsWith is misleading.
Returns objects where the specified field starts with the provided value. Allows you to specify a property to
query on by a variety of means. Either field or propertyIdentifier must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface StartsWithQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
 * Represents a static argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface StaticArgument {
  value: DataValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface StreamGeotemporalSeriesValuesRequest {
  range?: TimeRange;
}

/**
 * Log Safety: UNSAFE
 */
export interface StreamGeotemporalSeriesValuesResponse {
  data: Array<GeotemporalSeriesEntry>;
}

/**
   * Which format to serialize the binary stream in.
ARROW is more efficient for streaming a large sized response.
   *
   * Log Safety: SAFE
   */
export type StreamingOutputFormat = "JSON" | "ARROW";

/**
 * Log Safety: UNSAFE
 */
export type StreamMessage =
  | ({ type: "objectSetChanged" } & ObjectSetUpdates)
  | ({ type: "refreshObjectSet" } & RefreshObjectSet)
  | ({ type: "subscriptionClosed" } & SubscriptionClosed)
  | ({ type: "subscribeResponses" } & ObjectSetSubscribeResponses);

/**
 * Log Safety: UNSAFE
 */
export interface StreamTimeSeriesPointsRequest {
  range?: TimeRange;
  aggregate?: AggregateTimeSeries;
}

/**
 * Log Safety: UNSAFE
 */
export interface StreamTimeSeriesPointsResponse {
  data: Array<TimeSeriesPoint>;
}

/**
 * Log Safety: UNSAFE
 */
export interface StreamTimeSeriesValuesRequest {
  range?: TimeRange;
}

/**
 * Log Safety: UNSAFE
 */
export interface StreamTimeSeriesValuesResponse {
  data: Array<TimeseriesEntry>;
}

/**
 * Log Safety: UNSAFE
 */
export interface StringConstant {
  value: string;
}

/**
   * The parameter value must have a length within the defined range.
This range is always inclusive.
   *
   * Log Safety: UNSAFE
   */
export interface StringLengthConstraint {
  lt?: any;
  lte?: any;
  gt?: any;
  gte?: any;
}

/**
 * The parameter value must match a predefined regular expression.
 *
 * Log Safety: UNSAFE
 */
export interface StringRegexMatchConstraint {
  regex: string;
  configuredFailureMessage?: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface StringValue {
  value: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructConstraint {
  properties: Record<PropertyApiName, ValueTypeApiName>;
}

/**
 * Represents the validity of a singleton struct parameter.
 *
 * Log Safety: UNSAFE
 */
export interface StructEvaluatedConstraint {
  structFields: Record<
    StructParameterFieldApiName,
    StructFieldEvaluationResult
  >;
}

/**
 * The name of a struct field in the Ontology.
 *
 * Log Safety: UNSAFE
 */
export type StructFieldApiName = LooselyBrandedString<"StructFieldApiName">;

/**
 * Represents an argument used for an individual struct field.
 *
 * Log Safety: UNSAFE
 */
export type StructFieldArgument =
  | ({
    type: "structListParameterFieldValue";
  } & StructListParameterFieldArgument)
  | ({ type: "structParameterFieldValue" } & StructParameterFieldArgument);

/**
   * A constraint that an action struct parameter field value must satisfy in order to be considered valid.
Constraints can be configured on fields of struct parameters in the Ontology Manager.
Applicable constraints are determined dynamically based on parameter inputs.
Parameter values are evaluated against the final set of constraints.
The type of the constraint.
| Type                  | Description                                                                                                                                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| oneOf               | The struct parameter field has a manually predefined set of options.                                                                                                                                                            |
| range               | The struct parameter field value must be within the defined range.                                                                                                                                                              |
| stringLength        | The struct parameter field value must have a length within the defined range.                                                                                                                                                   |
| stringRegexMatch    | The struct parameter field value must match a predefined regular expression.                                                                                                                                                    |
| objectQueryResult   | The struct parameter field value must be the primary key of an object found within an object set.                                                                                                                               |
   *
   * Log Safety: UNSAFE
   */
export type StructFieldEvaluatedConstraint =
  | ({ type: "oneOf" } & OneOfConstraint)
  | ({ type: "range" } & RangeConstraint)
  | ({ type: "objectQueryResult" } & ObjectQueryResultConstraint)
  | ({ type: "stringLength" } & StringLengthConstraint)
  | ({ type: "stringRegexMatch" } & StringRegexMatchConstraint);

/**
 * Represents the validity of a struct parameter's fields against the configured constraints.
 *
 * Log Safety: UNSAFE
 */
export interface StructFieldEvaluationResult {
  result: ValidationResult;
  evaluatedConstraints: Array<StructFieldEvaluatedConstraint>;
  required: boolean;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructFieldOfPropertyImplementation {
  propertyApiName: PropertyApiName;
  structFieldApiName: StructFieldApiName;
}

/**
   * A combination of a property identifier and the load level to apply to the property. You can select a reduced
value for arrays and the main value for structs. If the provided load level cannot be applied to the property
type, then it will be ignored. This selector is experimental and may not work in filters or sorts.
   *
   * Log Safety: UNSAFE
   */
export interface StructFieldSelector {
  propertyApiName: PropertyApiName;
  structFieldApiName: StructFieldApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructFieldType {
  apiName: StructFieldApiName;
  rid: StructFieldTypeRid;
  dataType: ObjectPropertyType;
  typeClasses: Array<TypeClass>;
}

/**
 * The unique resource identifier of a struct field, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type StructFieldTypeRid = LooselyBrandedString<"StructFieldTypeRid">;

/**
 * Represents a struct list parameter field argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface StructListParameterFieldArgument {
  parameterId: ParameterId;
  structParameterFieldApiName: StructParameterFieldApiName;
}

/**
 * The unique identifier of the struct parameter field.
 *
 * Log Safety: UNSAFE
 */
export type StructParameterFieldApiName = LooselyBrandedString<
  "StructParameterFieldApiName"
>;

/**
 * Represents a struct parameter field argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface StructParameterFieldArgument {
  parameterId: ParameterId;
  structParameterFieldApiName: StructParameterFieldApiName;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructType {
  structFieldTypes: Array<StructFieldType>;
  mainValue?: StructTypeMainValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface StructTypeMainValue {
  mainValueType: ObjectPropertyType;
  fields: Array<StructFieldApiName>;
}

/**
   * Contains the status of the submission criteria.
Submission criteria are the prerequisites that need to be satisfied before an Action can be applied.
These are configured in the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export interface SubmissionCriteriaEvaluation {
  configuredFailureMessage?: string;
  result: ValidationResult;
}

/**
 * The subscription has been closed due to an irrecoverable error during its lifecycle.
 *
 * Log Safety: UNSAFE
 */
export interface SubscriptionClosed {
  id: SubscriptionId;
  cause: SubscriptionClosureCause;
}

/**
 * Log Safety: UNSAFE
 */
export type SubscriptionClosureCause =
  | ({ type: "reason" } & Reason)
  | ({ type: "error" } & Error);

/**
 * Log Safety: UNSAFE
 */
export interface SubscriptionError {
  errors: Array<Error>;
}

/**
 * A unique identifier used to associate subscription requests with responses.
 *
 * Log Safety: SAFE
 */
export type SubscriptionId = string;

/**
 * Log Safety: SAFE
 */
export interface SubscriptionSuccess {
  id: SubscriptionId;
}

/**
 * Subtracts the right numeric value from the left numeric value.
 *
 * Log Safety: UNSAFE
 */
export interface SubtractPropertyExpression {
  left: DerivedPropertyDefinition;
  right: DerivedPropertyDefinition;
}

/**
 * Computes the sum of values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SumAggregation {
  field: FieldNameV1;
  name?: AggregationMetricName;
}

/**
 * Computes the sum of values for the provided field.
 *
 * Log Safety: UNSAFE
 */
export interface SumAggregationV2 {
  field: PropertyApiName;
  name?: AggregationMetricName;
  direction?: OrderByDirection;
}

/**
 * Log Safety: UNSAFE
 */
export interface SyncApplyActionResponseV2 {
  validation?: ValidateActionResponseV2;
  edits?: ActionResults;
}

/**
 * Represents a synchronous webhook output argument in a logic rule.
 *
 * Log Safety: UNSAFE
 */
export interface SynchronousWebhookOutputArgument {
  webhookOutputParamName: string;
}

/**
 * Log Safety: UNSAFE
 */
export interface ThreeDimensionalAggregation {
  keyType: QueryAggregationKeyType;
  valueType: TwoDimensionalAggregation;
}

/**
 * Formats the duration in a timecode format.
 *
 * Log Safety: SAFE
 */
export interface TimeCodeFormat {}

/**
 * An absolute or relative range for a time series query.
 *
 * Log Safety: UNSAFE
 */
export type TimeRange =
  | ({ type: "absolute" } & AbsoluteTimeRange)
  | ({ type: "relative" } & RelativeTimeRange);

/**
 * The aggregation function to use for aggregating time series data.
 *
 * Log Safety: SAFE
 */
export type TimeSeriesAggregationMethod =
  | "SUM"
  | "MEAN"
  | "STANDARD_DEVIATION"
  | "MAX"
  | "MIN"
  | "PERCENT_CHANGE"
  | "DIFFERENCE"
  | "PRODUCT"
  | "COUNT"
  | "FIRST"
  | "LAST";

/**
   * CUMULATIVE aggregates all points up to the current point.
ROLLING aggregates all points in a rolling window whose size is either the specified number of points or
time duration.
PERIODIC aggregates all points in specified time windows.
   *
   * Log Safety: UNSAFE
   */
export type TimeSeriesAggregationStrategy =
  | ({ type: "rolling" } & TimeSeriesRollingAggregate)
  | ({ type: "periodic" } & TimeSeriesPeriodicAggregate)
  | ({ type: "cumulative" } & TimeSeriesCumulativeAggregate);

/**
   * The cumulative aggregate is calculated progressively for each point in the input time series,
considering all preceding points up to and including the current point.
   *
   * Log Safety: SAFE
   */
export interface TimeSeriesCumulativeAggregate {}

/**
 * A time and value pair.
 *
 * Log Safety: UNSAFE
 */
export interface TimeseriesEntry {
  time: string;
  value: any;
}

/**
   * Aggregates values over discrete, periodic windows for a given time series.
A periodic window divides the time series into windows of fixed durations.
For each window, an aggregate function is applied to the points within that window. The result is a time series
with values representing the aggregate for each window. Windows with no data points are not included
in the output.
Periodic aggregation is useful for downsampling a continuous stream of data to larger granularities such as
hourly, daily, monthly.
   *
   * Log Safety: SAFE
   */
export interface TimeSeriesPeriodicAggregate {
  windowSize: PreciseDuration;
  alignmentTimestamp?: string;
  windowType: TimeSeriesWindowType;
}

/**
 * A time and value pair.
 *
 * Log Safety: UNSAFE
 */
export interface TimeSeriesPoint {
  time: string;
  value: any;
}

/**
 * Log Safety: UNSAFE
 */
export type TimeSeriesPropertyV2 = LooselyBrandedString<"TimeSeriesPropertyV2">;

/**
 * Log Safety: UNSAFE
 */
export interface TimeSeriesRollingAggregate {
  windowSize: TimeSeriesRollingAggregateWindow;
}

/**
   * A rolling window is a moving subset of data points that ends at the current timestamp (inclusive)
and spans a specified duration (window size). As new data points are added, old points fall out of the
window if they are outside the specified duration.
Rolling windows are commonly used for smoothing data, detecting trends, and reducing noise
in time series analysis.
   *
   * Log Safety: UNSAFE
   */
export type TimeSeriesRollingAggregateWindow =
  | ({ type: "duration" } & PreciseDuration)
  | ({ type: "pointsCount" } & RollingAggregateWindowPoints);

/**
 * The RID identifying a time series sync.
 *
 * Log Safety: SAFE
 */
export type TimeseriesSyncRid = LooselyBrandedString<"TimeseriesSyncRid">;

/**
 * The RID identifying a time series codex template that resolves to a derived series.
 *
 * Log Safety: SAFE
 */
export type TimeseriesTemplateRid = LooselyBrandedString<
  "TimeseriesTemplateRid"
>;

/**
 * The version corresponding to a codex template.
 *
 * Log Safety: UNSAFE
 */
export type TimeseriesTemplateVersion = LooselyBrandedString<
  "TimeseriesTemplateVersion"
>;

/**
 * Log Safety: UNSAFE
 */
export type TimeSeriesValueBankProperty = LooselyBrandedString<
  "TimeSeriesValueBankProperty"
>;

/**
 * Log Safety: SAFE
 */
export type TimeSeriesWindowType = "START" | "END";

/**
 * Log Safety: UNSAFE
 */
export interface TimestampValue {
  value: string;
}

/**
 * Log Safety: SAFE
 */
export type TimeUnit =
  | "MILLISECONDS"
  | "SECONDS"
  | "MINUTES"
  | "HOURS"
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS"
  | "QUARTERS";

/**
 * Log Safety: UNSAFE
 */
export type TransactionEdit =
  | ({ type: "modifyObject" } & ModifyObjectEdit)
  | ({ type: "deleteObject" } & DeleteObjectEdit)
  | ({ type: "addObject" } & AddObjectEdit)
  | ({ type: "removeLink" } & DeleteLinkEdit)
  | ({ type: "addLink" } & AddLinkEdit);

/**
 * Log Safety: UNSAFE
 */
export interface TwoDimensionalAggregation {
  keyType: QueryAggregationKeyType;
  valueType: QueryAggregationValueType;
}

/**
 * Additional metadata that can be interpreted by user applications that interact with the Ontology
 *
 * Log Safety: UNSAFE
 */
export interface TypeClass {
  kind: string;
  name: string;
}

/**
   * The parameter cannot be evaluated because it depends on another parameter or object set that can't be evaluated.
This can happen when a parameter's allowed values are defined by another parameter that is missing or invalid.
   *
   * Log Safety: SAFE
   */
export interface UnevaluableConstraint {}

/**
 * Represents a unique identifier argument in a logic rule.
 *
 * Log Safety: SAFE
 */
export interface UniqueIdentifierArgument {
  linkId?: string;
}

/**
 * A reference to a UniqueIdentifierArgument linkId defined for this action type.
 *
 * Log Safety: SAFE
 */
export type UniqueIdentifierLinkId = string;

/**
   * An override value to be used for a UniqueIdentifier action parameter, instead of
the value being automatically generated.
   *
   * Log Safety: SAFE
   */
export type UniqueIdentifierValue = string;

/**
 * Indicates the property is backed by a restricted view that does not support property securities.
 *
 * Log Safety: SAFE
 */
export interface UnsupportedPolicy {}

/**
 * The string must be a valid UUID (Universally Unique Identifier).
 *
 * Log Safety: SAFE
 */
export interface UuidConstraint {}

/**
 * Log Safety: UNSAFE
 */
export interface ValidateActionRequest {
  parameters: Record<ParameterId, DataValue | undefined>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValidateActionResponse {
  result: ValidationResult;
  submissionCriteria: Array<SubmissionCriteriaEvaluation>;
  parameters: Record<ParameterId, ParameterEvaluationResult>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValidateActionResponseV2 {
  result: ValidationResult;
  submissionCriteria: Array<SubmissionCriteriaEvaluation>;
  parameters: Record<ParameterId, ParameterEvaluationResult>;
}

/**
 * Represents the state of a validation.
 *
 * Log Safety: SAFE
 */
export type ValidationResult = "VALID" | "INVALID";

/**
   * A string indicating the type of each data value. Note that these types can be nested, for example an array of
structs.
| Type                | JSON value                                                                                                        |
|---------------------|-------------------------------------------------------------------------------------------------------------------|
| Array               | Array<T>, where T is the type of the array elements, e.g. Array<String>.                                    |
| Attachment          | Attachment                                                                                                      |
| Boolean             | Boolean                                                                                                         |
| Byte                | Byte                                                                                                            |
| CipherText          | CipherText                                                                                                      |
| Date                | LocalDate                                                                                                       |
| Decimal             | Decimal                                                                                                         |
| Double              | Double                                                                                                          |
| Float               | Float                                                                                                           |
| Integer             | Integer                                                                                                         |
| Long                | Long                                                                                                            |
| Marking             | Marking                                                                                                         |
| OntologyObject      | OntologyObject<T> where T is the API name of the referenced object type.                                      |
| Short               | Short                                                                                                           |
| String              | String                                                                                                          |
| Struct              | Struct<T> where T contains field name and type pairs, e.g. Struct<{ firstName: String, lastName: string }>  |
| Timeseries          | TimeSeries<T> where T is either String for an enum series or Double for a numeric series.                 |
| Timestamp           | Timestamp                                                                                                       |
   *
   * Log Safety: SAFE
   */
export type ValueType = LooselyBrandedString<"ValueType">;

/**
 * The name of the value type in the API in camelCase format.
 *
 * Log Safety: UNSAFE
 */
export type ValueTypeApiName = LooselyBrandedString<"ValueTypeApiName">;

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeArrayType {
  subType?: ValueTypeFieldType;
}

/**
 * Log Safety: UNSAFE
 */
export type ValueTypeConstraint =
  | ({ type: "struct" } & StructConstraint)
  | ({ type: "regex" } & RegexConstraint)
  | ({ type: "unsupported" } & _Core.UnsupportedType)
  | ({ type: "array" } & ArrayConstraint)
  | ({ type: "length" } & LengthConstraint)
  | ({ type: "range" } & RangesConstraint)
  | ({ type: "rid" } & RidConstraint)
  | ({ type: "uuid" } & UuidConstraint)
  | ({ type: "enum" } & EnumConstraint);

/**
 * Log Safety: SAFE
 */
export interface ValueTypeDecimalType {}

/**
 * Log Safety: UNSAFE
 */
export type ValueTypeFieldType =
  | ({ type: "date" } & _Core.DateType)
  | ({ type: "struct" } & ValueTypeStructType)
  | ({ type: "string" } & _Core.StringType)
  | ({ type: "byte" } & _Core.ByteType)
  | ({ type: "double" } & _Core.DoubleType)
  | ({ type: "optional" } & ValueTypeOptionalType)
  | ({ type: "integer" } & _Core.IntegerType)
  | ({ type: "union" } & ValueTypeUnionType)
  | ({ type: "float" } & _Core.FloatType)
  | ({ type: "long" } & _Core.LongType)
  | ({ type: "reference" } & ValueTypeReferenceType)
  | ({ type: "boolean" } & _Core.BooleanType)
  | ({ type: "array" } & ValueTypeArrayType)
  | ({ type: "binary" } & _Core.BinaryType)
  | ({ type: "short" } & _Core.ShortType)
  | ({ type: "decimal" } & ValueTypeDecimalType)
  | ({ type: "map" } & ValueTypeMapType)
  | ({ type: "timestamp" } & _Core.TimestampType);

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeMapType {
  keyType?: ValueTypeFieldType;
  valueType?: ValueTypeFieldType;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeOptionalType {
  wrappedType?: ValueTypeFieldType;
}

/**
 * Log Safety: SAFE
 */
export interface ValueTypeReferenceType {}

/**
 * Log Safety: SAFE
 */
export type ValueTypeRid = LooselyBrandedString<"ValueTypeRid">;

/**
 * Log Safety: SAFE
 */
export type ValueTypeStatus = "ACTIVE" | "DEPRECATED";

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeStructField {
  name?: _Core.StructFieldName;
  fieldType?: ValueTypeFieldType;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeStructType {
  fields: Array<ValueTypeStructField>;
}

/**
 * Log Safety: UNSAFE
 */
export interface ValueTypeUnionType {
  memberTypes: Array<ValueTypeFieldType>;
}

/**
   * The name of the Query in the API and an optional version identifier separated by a colon.
If the API name contains a colon, then a version identifier of either "latest" or a semantic version must
be included.
If the API does not contain a colon, then either the version identifier must be excluded or a version
identifier of a semantic version must be included.
Examples: 'myGroup:myFunction:latest', 'myGroup:myFunction:1.0.0', 'myFunction', 'myFunction:2.0.0'
   *
   * Log Safety: UNSAFE
   */
export type VersionedQueryTypeApiName = LooselyBrandedString<
  "VersionedQueryTypeApiName"
>;

/**
   * Returns objects where the specified field matches the wildcard pattern provided.
Either field or propertyIdentifier can be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface WildcardQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
 * Log Safety: UNSAFE
 */
export type WithinBoundingBoxPoint = { type: "Point" } & _Geo.GeoPoint;

/**
   * Returns objects where the specified field contains a point within the bounding box provided. Allows you to
specify a property to query on by a variety of means. Either field or propertyIdentifier must be supplied,
but not both.
   *
   * Log Safety: UNSAFE
   */
export interface WithinBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
   * Returns objects where the specified field contains a point within the distance provided of the center point.
Allows you to specify a property to query on by a variety of means. Either field or propertyIdentifier
must be supplied, but not both.
   *
   * Log Safety: UNSAFE
   */
export interface WithinDistanceOfQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: CenterPoint;
}

/**
   * Returns objects where the specified field contains a point within the polygon provided. Allows you to specify a
property to query on by a variety of means. Either field or propertyIdentifier must be supplied, but not
both.
   *
   * Log Safety: UNSAFE
   */
export interface WithinPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}
