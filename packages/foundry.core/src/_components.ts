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

import type * as _Geo from "@osdk/foundry.geo";

export type LooselyBrandedString<T extends string> = string & {
  __LOOSE_BRAND?: T;
};

/**
 * @deprecated Use `AndQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where every query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface AndQueryV2 {
  value: Array<SearchJsonQueryV2>;
}

/**
 * Log Safety: SAFE
 */
export interface AnyType {}

/**
 * The format of an archive file.
 *
 * Log Safety: SAFE
 */
export type ArchiveFileFormat = "ZIP";

/**
 * Log Safety: UNSAFE
 */
export interface ArrayFieldType {
  itemsSchema: FieldSchema;
}

/**
 * The globally unique identifier of an artifact.
 *
 * Log Safety: SAFE
 */
export type ArtifactGid = LooselyBrandedString<"ArtifactGid">;

/**
 * Log Safety: SAFE
 */
export interface AttachmentType {}

/**
 * Attribution for a request
 *
 * Log Safety: UNSAFE
 */
export type Attribution = LooselyBrandedString<"Attribution">;

/**
 * Log Safety: SAFE
 */
export interface BinaryType {}

/**
 * Log Safety: SAFE
 */
export interface BooleanType {}

/**
 * @deprecated Use `BoundingBoxValue` in the `foundry.ontologies` package
 *
 * The top left and bottom right coordinate points that make up the bounding box.
 *
 * Log Safety: UNSAFE
 */
export interface BoundingBoxValue {
  topLeft: WithinBoundingBoxPoint;
  bottomRight: WithinBoundingBoxPoint;
}

/**
 * Metadata about a Foundry branch.
 *
 * Log Safety: SAFE
 */
export interface BranchMetadata {
  rid: FoundryBranch;
}

/**
 * The name of a Branch.
 *
 * Log Safety: UNSAFE
 */
export type BranchName = LooselyBrandedString<"BranchName">;

/**
 * The RID of a Build.
 *
 * Log Safety: SAFE
 */
export type BuildRid = LooselyBrandedString<"BuildRid">;

/**
 * Log Safety: SAFE
 */
export interface ByteType {}

/**
 * @deprecated Use `CenterPoint` in the `foundry.ontologies` package
 *
 * The coordinate point to use as the center of the distance query.
 *
 * Log Safety: UNSAFE
 */
export interface CenterPoint {
  center: CenterPointTypes;
  distance: Distance;
}

/**
 * @deprecated Use `CenterPointTypes` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export type CenterPointTypes = { type: "Point" } & _Geo.GeoPoint;

/**
   * Configuration for utilizing the stream as a change data capture (CDC) dataset. To configure CDC on a stream, at
least one key needs to be provided.
For more information on CDC in
Foundry, see the Change Data Capture user documentation.
   *
   * Log Safety: UNSAFE
   */
export type ChangeDataCaptureConfiguration = {
  type: "fullRow";
} & FullRowChangeDataCaptureConfiguration;

/**
 * The unique resource identifier (RID) of a Data Health Check Report.
 *
 * Log Safety: SAFE
 */
export type CheckReportRid = LooselyBrandedString<"CheckReportRid">;

/**
 * The unique resource identifier (RID) of a Data Health Check.
 *
 * Log Safety: SAFE
 */
export type CheckRid = LooselyBrandedString<"CheckRid">;

/**
 * Log Safety: SAFE
 */
export interface CipherTextType {
  defaultCipherChannel?: string;
}

/**
 * The name of a column in a dataset.
 *
 * Log Safety: UNSAFE
 */
export type ColumnName = LooselyBrandedString<"ColumnName">;

/**
 * A measurement of compute usage expressed in compute-seconds. For more information, please refer to the Usage types documentation.
 *
 * Log Safety: SAFE
 */
export type ComputeSeconds = number;

/**
* @deprecated Use `ContainsAllTermsInOrderPrefixLastTerm` in the `foundry.ontologies` package
*
   * Returns objects where the specified field contains all of the terms in the order provided,
but they do have to be adjacent to each other.
The last term can be a partial prefix match.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAllTermsInOrderPrefixLastTerm {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
* @deprecated Use `ContainsAllTermsInOrderQuery` in the `foundry.ontologies` package
*
   * Returns objects where the specified field contains all of the terms in the order provided,
but they do have to be adjacent to each other.
   *
   * Log Safety: UNSAFE
   */
export interface ContainsAllTermsInOrderQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
* @deprecated Use `ContainsAllTermsQuery` in the `foundry.ontologies` package
*
   * Returns objects where the specified field contains all of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching.
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
* @deprecated Use `ContainsAnyTermQuery` in the `foundry.ontologies` package
*
   * Returns objects where the specified field contains any of the whitespace separated words in any
order in the provided value. This query supports fuzzy matching.
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
 * @deprecated Use `ContainsQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified array contains a value.
 *
 * Log Safety: UNSAFE
 */
export interface ContainsQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Log Safety: SAFE
 */
export type ContentLength = string;

/**
 * Log Safety: SAFE
 */
export type ContentType = LooselyBrandedString<"ContentType">;

/**
 * The Foundry user who created this resource
 *
 * Log Safety: SAFE
 */
export type CreatedBy = PrincipalId;

/**
 * The time at which the resource was created.
 *
 * Log Safety: SAFE
 */
export type CreatedTime = string;

/**
 * Log Safety: UNSAFE
 */
export type CustomMetadata = Record<string, any>;

/**
 * A field in a Foundry dataset.
 *
 * Log Safety: UNSAFE
 */
export interface DatasetFieldSchema {
  type: SchemaFieldType;
  name?: FieldName;
  nullable: boolean;
  userDefinedTypeClass?: string;
  customMetadata?: CustomMetadata;
  arraySubtype?: DatasetFieldSchema;
  precision?: number;
  scale?: number;
  mapKeyType?: DatasetFieldSchema;
  mapValueType?: DatasetFieldSchema;
  subSchemas?: Array<DatasetFieldSchema>;
}

/**
 * The Resource Identifier (RID) of a Dataset.
 *
 * Log Safety: SAFE
 */
export type DatasetRid = LooselyBrandedString<"DatasetRid">;

/**
 * The schema for a Foundry dataset. Files uploaded to this dataset must match this schema.
 *
 * Log Safety: UNSAFE
 */
export interface DatasetSchema {
  fieldSchemaList: Array<DatasetFieldSchema>;
}

/**
 * Log Safety: SAFE
 */
export interface DateType {}

/**
 * Log Safety: SAFE
 */
export interface DecimalType {
  precision?: number;
  scale?: number;
}

/**
 * The display name of the entity.
 *
 * Log Safety: UNSAFE
 */
export type DisplayName = LooselyBrandedString<"DisplayName">;

/**
 * A measurement of distance.
 *
 * Log Safety: UNSAFE
 */
export interface Distance {
  value: number;
  unit: DistanceUnit;
}

/**
 * Log Safety: SAFE
 */
export type DistanceUnit =
  | "MILLIMETERS"
  | "CENTIMETERS"
  | "METERS"
  | "KILOMETERS"
  | "INCHES"
  | "FEET"
  | "YARDS"
  | "MILES"
  | "NAUTICAL_MILES";

/**
 * @deprecated Use `DoesNotIntersectBoundingBoxQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field does not intersect the bounding box provided.
 *
 * Log Safety: UNSAFE
 */
export interface DoesNotIntersectBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
 * @deprecated Use `DoesNotIntersectPolygonQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field does not intersect the polygon provided.
 *
 * Log Safety: UNSAFE
 */
export interface DoesNotIntersectPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}

/**
 * Log Safety: SAFE
 */
export interface DoubleType {}

/**
 * A measurement of duration.
 *
 * Log Safety: SAFE
 */
export interface Duration {
  value: number;
  unit: TimeUnit;
}

/**
 * A duration of time measured in seconds.
 *
 * Log Safety: SAFE
 */
export type DurationSeconds = string;

/**
 * Log Safety: UNSAFE
 */
export type EmbeddingModel =
  | ({ type: "lms" } & LmsEmbeddingModel)
  | ({ type: "foundryLiveDeployment" } & FoundryLiveDeployment);

/**
 * Log Safety: SAFE
 */
export type EnrollmentRid = LooselyBrandedString<"EnrollmentRid">;

/**
 * @deprecated Use `EqualsQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field is equal to a value.
 *
 * Log Safety: UNSAFE
 */
export interface EqualsQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
   * A field in a Foundry schema. For more information on supported data types, see the
supported field types user documentation.
   *
   * Log Safety: UNSAFE
   */
export interface Field {
  name: FieldName;
  schema: FieldSchema;
}

/**
 * Log Safety: UNSAFE
 */
export type FieldDataType =
  | ({ type: "struct" } & StructFieldType)
  | ({ type: "date" } & DateType)
  | ({ type: "string" } & StringType)
  | ({ type: "byte" } & ByteType)
  | ({ type: "double" } & DoubleType)
  | ({ type: "integer" } & IntegerType)
  | ({ type: "float" } & FloatType)
  | ({ type: "long" } & LongType)
  | ({ type: "boolean" } & BooleanType)
  | ({ type: "array" } & ArrayFieldType)
  | ({ type: "binary" } & BinaryType)
  | ({ type: "short" } & ShortType)
  | ({ type: "decimal" } & DecimalType)
  | ({ type: "map" } & MapFieldType)
  | ({ type: "timestamp" } & TimestampType);

/**
 * Log Safety: UNSAFE
 */
export type FieldName = LooselyBrandedString<"FieldName">;

/**
 * The specification of the type of a Foundry schema field.
 *
 * Log Safety: UNSAFE
 */
export interface FieldSchema {
  nullable: boolean;
  customMetadata?: CustomMetadata;
  dataType: FieldDataType;
}

/**
 * The name of a File within Foundry. Examples: my-file.txt, my-file.jpg, dataframe.snappy.parquet.
 *
 * Log Safety: UNSAFE
 */
export type Filename = LooselyBrandedString<"Filename">;

/**
   * The path to a File within Foundry. Paths are relative and must not start with a leading slash.
Examples: my-file.txt, path/to/my-file.jpg, dataframe.snappy.parquet.
   *
   * Log Safety: UNSAFE
   */
export type FilePath = LooselyBrandedString<"FilePath">;

/**
 * Log Safety: SAFE
 */
export interface FilesystemResource {}

/**
 * Log Safety: SAFE
 */
export interface FilterBinaryType {}

/**
 * Log Safety: SAFE
 */
export interface FilterBooleanType {}

/**
 * Log Safety: SAFE
 */
export interface FilterDateTimeType {}

/**
 * Log Safety: SAFE
 */
export interface FilterDateType {}

/**
 * Log Safety: SAFE
 */
export interface FilterDoubleType {}

/**
 * Log Safety: SAFE
 */
export interface FilterEnumType {
  values: Array<string>;
}

/**
 * Log Safety: SAFE
 */
export interface FilterFloatType {}

/**
 * Log Safety: SAFE
 */
export interface FilterIntegerType {}

/**
 * Log Safety: SAFE
 */
export interface FilterLongType {}

/**
 * Log Safety: SAFE
 */
export interface FilterRidType {}

/**
 * Log Safety: SAFE
 */
export interface FilterStringType {}

/**
 * Log Safety: SAFE
 */
export type FilterType =
  | ({ type: "dateTime" } & FilterDateTimeType)
  | ({ type: "date" } & FilterDateType)
  | ({ type: "boolean" } & FilterBooleanType)
  | ({ type: "string" } & FilterStringType)
  | ({ type: "double" } & FilterDoubleType)
  | ({ type: "binary" } & FilterBinaryType)
  | ({ type: "integer" } & FilterIntegerType)
  | ({ type: "float" } & FilterFloatType)
  | ({ type: "rid" } & FilterRidType)
  | ({ type: "uuid" } & FilterUuidType)
  | ({ type: "enum" } & FilterEnumType)
  | ({ type: "long" } & FilterLongType);

/**
 * Log Safety: SAFE
 */
export interface FilterUuidType {}

/**
 * Log Safety: SAFE
 */
export interface FloatType {}

/**
 * Log Safety: SAFE
 */
export type FolderRid = LooselyBrandedString<"FolderRid">;

/**
 * The Foundry branch identifier, specifically its rid. Different identifier types may be used in the future as values.
 *
 * Log Safety: SAFE
 */
export type FoundryBranch = LooselyBrandedString<"FoundryBranch">;

/**
 * Log Safety: UNSAFE
 */
export interface FoundryLiveDeployment {
  rid?: string;
  inputParamName?: string;
  outputParamName?: string;
}

/**
 * A unique identifier of a Foundry object property.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectPropertyTypeRid = LooselyBrandedString<
  "FoundryObjectPropertyTypeRid"
>;

/**
 * A unique identifier of a Foundry object type.
 *
 * Log Safety: SAFE
 */
export type FoundryObjectTypeRid = LooselyBrandedString<"FoundryObjectTypeRid">;

/**
   * Configuration for change data capture which resolves the latest state of the dataset based on new full rows
being pushed to the stream. For example, if a value for a row is updated, it is only sufficient to publish
the entire new state of that row to the stream.
   *
   * Log Safety: UNSAFE
   */
export interface FullRowChangeDataCaptureConfiguration {
  deletionFieldName: FieldName;
  orderingFieldName: FieldName;
}

/**
 * @deprecated Use `FuzzyV2` in the `foundry.ontologies` package
 *
 * Setting fuzzy to true allows approximate matching in search queries that support it.
 *
 * Log Safety: SAFE
 */
export type FuzzyV2 = boolean;

/**
 * Log Safety: SAFE
 */
export interface GeohashType {}

/**
 * A point representing a latitude-longitude pair, with an option of adding elevation.
 *
 * Log Safety: UNSAFE
 */
export interface GeoPoint {
  longitude: number;
  latitude: number;
  elevation?: number;
}

/**
 * Log Safety: SAFE
 */
export interface GeoPointType {}

/**
 * Log Safety: SAFE
 */
export interface GeoShapeType {}

/**
 * Log Safety: SAFE
 */
export interface GeotimeSeriesReferenceType {}

/**
 * A Foundry Group ID.
 *
 * Log Safety: SAFE
 */
export type GroupId = string;

/**
 * The display name of a multipass group.
 *
 * Log Safety: UNSAFE
 */
export type GroupName = LooselyBrandedString<"GroupName">;

/**
 * The unique resource identifier (RID) of a multipass group.
 *
 * Log Safety: UNSAFE
 */
export type GroupRid = LooselyBrandedString<"GroupRid">;

/**
 * @deprecated Use `GteQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field is greater than or equal to a value.
 *
 * Log Safety: UNSAFE
 */
export interface GteQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * @deprecated Use `GtQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field is greater than a value.
 *
 * Log Safety: UNSAFE
 */
export interface GtQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
   * Indicates whether the response should include compute usage details for the request. This feature is currently
only available for OSDK applications.
Note: Enabling this flag may slow down query performance and is not recommended for use in production.
   *
   * Log Safety: SAFE
   */
export type IncludeComputeUsage = boolean;

/**
 * @deprecated Use `InQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field equals any of the provided values.
 *
 * Log Safety: UNSAFE
 */
export interface InQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: Array<PropertyValue>;
}

/**
 * Log Safety: SAFE
 */
export interface IntegerType {}

/**
 * @deprecated Use `IntersectsBoundingBoxQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field intersects the bounding box provided.
 *
 * Log Safety: UNSAFE
 */
export interface IntersectsBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
 * @deprecated Use `IntersectsPolygonQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field intersects the polygon provided.
 *
 * Log Safety: UNSAFE
 */
export interface IntersectsPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}

/**
 * @deprecated Use `IsNullQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects based on the existence of the specified field.
 *
 * Log Safety: UNSAFE
 */
export interface IsNullQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: boolean;
}

/**
 * The RID of a Job.
 *
 * Log Safety: SAFE
 */
export type JobRid = LooselyBrandedString<"JobRid">;

/**
 * @deprecated Use `LinkTypeApiName` in the `foundry.ontologies` package
 *
 * The name of the link type in the API. To find the API name for your Link Type, check the Ontology Manager.
 *
 * Log Safety: UNSAFE
 */
export type LinkTypeApiName = LooselyBrandedString<"LinkTypeApiName">;

/**
 * A model provided by Language Model Service.
 *
 * Log Safety: SAFE
 */
export interface LmsEmbeddingModel {
  value: LmsEmbeddingModelValue;
}

/**
 * Log Safety: SAFE
 */
export type LmsEmbeddingModelValue =
  | "OPENAI_TEXT_EMBEDDING_ADA_002"
  | "TEXT_EMBEDDING_3_LARGE"
  | "TEXT_EMBEDDING_3_SMALL"
  | "SNOWFLAKE_ARCTIC_EMBED_M"
  | "INSTRUCTOR_LARGE"
  | "BGE_BASE_EN_V1_5";

/**
 * A string representation of a BCP 47 language tag (java.util.Locale.toLanguageTag)
 *
 * Log Safety: SAFE
 */
export type Locale = LooselyBrandedString<"Locale">;

/**
 * Log Safety: SAFE
 */
export interface LocalFilePath {}

/**
 * Log Safety: SAFE
 */
export interface LongType {}

/**
 * @deprecated Use `LteQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field is less than or equal to a value.
 *
 * Log Safety: UNSAFE
 */
export interface LteQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * @deprecated Use `LtQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field is less than a value.
 *
 * Log Safety: UNSAFE
 */
export interface LtQueryV2 {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PropertyValue;
}

/**
 * Log Safety: UNSAFE
 */
export interface MapFieldType {
  keySchema: FieldSchema;
  valueSchema: FieldSchema;
}

/**
 * The ID of a security marking.
 *
 * Log Safety: UNSAFE
 */
export type MarkingId = LooselyBrandedString<"MarkingId">;

/**
 * Log Safety: SAFE
 */
export interface MarkingType {}

/**
   * A user-specified identifier for a media item within a media set.
Paths must be less than 256 characters long.
If multiple items are written to the same media set at the same path, then when retrieving by path the media
item which was written last is returned.
   *
   * Log Safety: UNSAFE
   */
export type MediaItemPath = LooselyBrandedString<"MediaItemPath">;

/**
 * A token that grants access to read specific media items.
 *
 * Log Safety: UNSAFE
 */
export type MediaItemReadToken = LooselyBrandedString<"MediaItemReadToken">;

/**
 * The Resource Identifier (RID) of an individual Media Item within a Media Set in Foundry.
 *
 * Log Safety: SAFE
 */
export type MediaItemRid = LooselyBrandedString<"MediaItemRid">;

/**
 * The representation of a media reference.
 *
 * Log Safety: UNSAFE
 */
export interface MediaReference {
  mimeType: MediaType;
  reference: Reference;
}

/**
 * Log Safety: SAFE
 */
export interface MediaReferenceType {}

/**
 * The Resource Identifier (RID) of a Media Set in Foundry.
 *
 * Log Safety: SAFE
 */
export type MediaSetRid = LooselyBrandedString<"MediaSetRid">;

/**
 * Log Safety: UNSAFE
 */
export interface MediaSetViewItem {
  mediaSetRid: MediaSetRid;
  mediaSetViewRid: MediaSetViewRid;
  mediaItemRid: MediaItemRid;
  token?: MediaItemReadToken;
}

/**
 * Log Safety: UNSAFE
 */
export interface MediaSetViewItemWrapper {
  mediaSetViewItem: MediaSetViewItem;
}

/**
 * The Resource Identifier (RID) of a single View of a Media Set. A Media Set View is an independent collection of Media Items.
 *
 * Log Safety: SAFE
 */
export type MediaSetViewRid = LooselyBrandedString<"MediaSetViewRid">;

/**
   * The media type of the file or attachment.
Examples: application/json, application/pdf, application/octet-stream, image/jpeg
   *
   * Log Safety: SAFE
   */
export type MediaType = LooselyBrandedString<"MediaType">;

/**
 * @deprecated Use `NotQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where the query is not satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface NotQueryV2 {
  value: SearchJsonQueryV2;
}

/**
 * Log Safety: SAFE
 */
export interface NullType {}

/**
   * The time series property can either contain either numeric or non-numeric data. This enables mixed sensor types
where some sensor time series are numeric and others are categorical. A boolean property reference can be used
to determine if the series is numeric or non-numeric. Without this property, the series type can be either
numeric or non-numeric and must be inferred from the result of a time series query.
   *
   * Log Safety: UNSAFE
   */
export interface NumericOrNonNumericType {
  isNonNumericPropertyTypeId?: string;
}

/**
 * @deprecated Use `ObjectRid` in the `foundry.ontologies` package
 *
 * The Resource Identifier (RID) for an ontology object instance.
 *
 * Log Safety: SAFE
 */
export type ObjectRid = LooselyBrandedString<"ObjectRid">;

/**
 * @deprecated Use `ObjectSet` in the `foundry.ontologies` package
 *
 * Represents the definition of an ObjectSet in the ontology.
 *
 * Log Safety: UNSAFE
 */
export type ObjectSet =
  | ({ type: "searchAround" } & ObjectSetSearchAroundType)
  | ({ type: "static" } & ObjectSetStaticType)
  | ({ type: "intersect" } & ObjectSetIntersectionType)
  | ({ type: "withProperties" } & ObjectSetWithPropertiesType)
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
 * @deprecated Use `ObjectSetAsBaseObjectTypesType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetAsBaseObjectTypesType {
  objectSet: ObjectSet;
}

/**
* @deprecated Use `ObjectSetAsTypeType` in the `foundry.ontologies` package
*
   * Casts an object set to a specified object type or interface type API name. Any object whose object type does
not match the object type provided or implement the interface type provided will be dropped from the resulting
object set. This is currently unsupported and an exception will be thrown if used.
   *
   * Log Safety: UNSAFE
   */
export interface ObjectSetAsTypeType {
  entityType: string;
  objectSet: ObjectSet;
}

/**
 * @deprecated Use `ObjectSetBaseType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetBaseType {
  objectType: string;
}

/**
 * @deprecated Use `ObjectSetFilterType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetFilterType {
  objectSet: ObjectSet;
  where: SearchJsonQueryV2;
}

/**
 * @deprecated Use `ObjectSetInterfaceBaseType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetInterfaceBaseType {
  interfaceType: string;
}

/**
 * @deprecated Use `ObjectSetIntersectionType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetIntersectionType {
  objectSets: Array<ObjectSet>;
}

/**
 * @deprecated Use `ObjectSetMethodInputType` in the `foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ObjectSetMethodInputType {}

/**
 * @deprecated Use `ObjectSetNearestNeighborsType` in the `foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ObjectSetNearestNeighborsType {}

/**
 * @deprecated Use `ObjectSetReferenceType` in the `foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ObjectSetReferenceType {
  reference: ObjectSetRid;
}

/**
 * @deprecated Use `ObjectSetRid` in the `foundry.ontologies` package
 *
 * The Resource Identifier (RID) for an object set.
 *
 * Log Safety: SAFE
 */
export type ObjectSetRid = LooselyBrandedString<"ObjectSetRid">;

/**
 * @deprecated Use `ObjectSetSearchAroundType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetSearchAroundType {
  objectSet: ObjectSet;
  link: LinkTypeApiName;
}

/**
 * @deprecated Use `ObjectSetStaticType` in the `foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ObjectSetStaticType {
  objects: Array<ObjectRid>;
}

/**
 * @deprecated Use `ObjectSetSubtractType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetSubtractType {
  objectSets: Array<ObjectSet>;
}

/**
 * @deprecated Use `ObjectSetUnionType` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export interface ObjectSetUnionType {
  objectSets: Array<ObjectSet>;
}

/**
 * @deprecated Use `ObjectSetWithPropertiesType` in the `foundry.ontologies` package
 *
 * Log Safety: SAFE
 */
export interface ObjectSetWithPropertiesType {}

/**
 * @deprecated Use `ObjectTypeId` in the `foundry.ontologies` package
 *
 * The unique identifier (ID) for an object type. This can be viewed in Ontology Manager.
 *
 * Log Safety: UNSAFE
 */
export type ObjectTypeId = LooselyBrandedString<"ObjectTypeId">;

/**
 * @deprecated Use `ObjectTypeRid` in the `foundry.ontologies` package
 *
 * The unique Resource Identifier (RID) of an object type, useful for interacting with other Foundry APIs.
 *
 * Log Safety: SAFE
 */
export type ObjectTypeRid = LooselyBrandedString<"ObjectTypeRid">;

/**
 * @deprecated Use `OntologyIdentifier` in the `foundry.ontologies` package
 *
 * Either an ontology RID or an ontology API name.
 *
 * Log Safety: UNSAFE
 */
export type OntologyIdentifier = LooselyBrandedString<"OntologyIdentifier">;

/**
   * An operation that can be performed on a resource. Operations are used to define the permissions that a Role has.
Operations are typically in the format service:action, where service is related to the type of resource and action is the action being performed.
   *
   * Log Safety: SAFE
   */
export type Operation = LooselyBrandedString<"Operation">;

/**
 * Log Safety: SAFE
 */
export type OperationScope = LooselyBrandedString<"OperationScope">;

/**
 * Specifies the ordering direction (can be either ASC or DESC)
 *
 * Log Safety: SAFE
 */
export type OrderByDirection = "ASC" | "DESC";

/**
 * Log Safety: SAFE
 */
export type OrganizationRid = LooselyBrandedString<"OrganizationRid">;

/**
 * @deprecated Use `OrQueryV2` in the `foundry.ontologies` package
 *
 * Returns objects where at least 1 query is satisfied.
 *
 * Log Safety: UNSAFE
 */
export interface OrQueryV2 {
  value: Array<SearchJsonQueryV2>;
}

/**
 * The page size to use for the endpoint.
 *
 * Log Safety: SAFE
 */
export type PageSize = number;

/**
   * The page token indicates where to start paging. This should be omitted from the first page's request.
To fetch the next page, clients should take the value from the nextPageToken field of the previous response
and use it to populate the pageToken field of the next request.
   *
   * Log Safety: UNSAFE
   */
export type PageToken = LooselyBrandedString<"PageToken">;

/**
 * @deprecated Use `PolygonValue` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export type PolygonValue = { type: "Polygon" } & _Geo.Polygon;

/**
 * Enables the use of preview functionality.
 *
 * Log Safety: SAFE
 */
export type PreviewMode = boolean;

/**
 * The ID of a Foundry Group or User.
 *
 * Log Safety: SAFE
 */
export type PrincipalId = string;

/**
 * Log Safety: SAFE
 */
export type PrincipalType = "USER" | "GROUP";

/**
* @deprecated Use `PropertyApiName` in the `foundry.ontologies` package
*
   * The name of the property in the API. To find the API name for your property, use the Get object type
endpoint or check the Ontology Manager.
   *
   * Log Safety: UNSAFE
   */
export type PropertyApiName = LooselyBrandedString<"PropertyApiName">;

/**
 * @deprecated Use `PropertyApiNameSelector` in the `foundry.ontologies` package
 *
 * A property api name that references properties to query on.
 *
 * Log Safety: UNSAFE
 */
export interface PropertyApiNameSelector {
  apiName: PropertyApiName;
}

/**
 * @deprecated Use `PropertyIdentifier` in the `foundry.ontologies` package
 *
 * An identifier used to select properties or struct fields.
 *
 * Log Safety: UNSAFE
 */
export type PropertyIdentifier =
  | ({ type: "property" } & PropertyApiNameSelector)
  | ({ type: "structField" } & StructFieldSelector);

/**
 * @deprecated Use `PropertyTypeRid` in the `foundry.ontologies` package
 *
 * The RID for a property type from an ontology object.
 *
 * Log Safety: SAFE
 */
export type PropertyTypeRid = LooselyBrandedString<"PropertyTypeRid">;

/**
* @deprecated Use `PropertyValue` in the `foundry.ontologies` package
*
   * Represents the value of a property in the following format.
| Type       | JSON encoding                                         | Example                                                                                            |
|----------- |-------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Array      | array                                                 | ["alpha", "bravo", "charlie"]                                                                    |
| Attachment | JSON encoded AttachmentProperty object              | {"rid":"ri.blobster.main.attachment.2f944bae-5851-4204-8615-920c969a9f2e"}                       |
| Boolean    | boolean                                               | true                                                                                             |
| Byte       | number                                                | 31                                                                                               |
| CipherText | string                                                | "CIPHER::ri.bellaso.main.cipher-channel.e414ab9e-b606-499a-a0e1-844fa296ba7e::unzjs3VifsTxuIpf1fH1CJ7OaPBr2bzMMdozPaZJtCii8vVG60yXIEmzoOJaEl9mfFFe::CIPHER" | | Date | ISO 8601 extended local date string |"2021-05-01"| | Decimal | string |"2.718281828"| | Double | number |3.14159265| | Float | number |3.14159265| | GeoPoint | geojson |{"type":"Point","coordinates":[102.0,0.5]}| | GeoShape | geojson |{"type":"LineString","coordinates":[[102.0,0.0],[103.0,1.0],[104.0,0.0],[105.0,1.0]]}| | Integer | number |238940| | Long | string |"58319870951433"| | Short | number |8739| | String | string |"Call me Ishmael"| | Timestamp | ISO 8601 extended offset date-time string in UTC zone |"2021-01-04T05:00:00Z"`                                                                           |
Note that for backwards compatibility, the Boolean, Byte, Double, Float, Integer, and Short types can also be encoded as JSON strings.
   *
   * Log Safety: UNSAFE
   */
export type PropertyValue = any;

/**
   * Identifies which Realm a User or Group is a member of.
The palantir-internal-realm is used for Users or Groups that are created in Foundry by administrators and not associated with any SSO provider.
   *
   * Log Safety: SAFE
   */
export type Realm = LooselyBrandedString<"Realm">;

/**
 * A union of the types supported by media reference properties.
 *
 * Log Safety: UNSAFE
 */
export type Reference = { type: "mediaSetViewItem" } & MediaSetViewItemWrapper;

/**
 * The release status of the entity.
 *
 * Log Safety: SAFE
 */
export type ReleaseStatus =
  | "ACTIVE"
  | "ENDORSED"
  | "EXPERIMENTAL"
  | "DEPRECATED";

/**
 * A set of permissions that can be assigned to a principal for a specific resource type.
 *
 * Log Safety: UNSAFE
 */
export interface Role {
  id: RoleId;
  roleSetId: RoleSetId;
  name: string;
  description: string;
  isDefault: boolean;
  type: RoleContext;
  operations: Array<Operation>;
}

/**
 * Log Safety: SAFE
 */
export interface RoleAssignmentUpdate {
  roleId: RoleId;
  principalId: PrincipalId;
}

/**
 * Log Safety: SAFE
 */
export type RoleContext = "ORGANIZATION";

/**
   * The unique ID for a Role. Roles are sets of permissions that grant different levels of access to resources.
The default roles in Foundry are: Owner, Editor, Viewer, and Discoverer. See more about
roles in the user documentation.
   *
   * Log Safety: SAFE
   */
export type RoleId = LooselyBrandedString<"RoleId">;

/**
 * Log Safety: SAFE
 */
export type RoleSetId = LooselyBrandedString<"RoleSetId">;

/**
 * The RID of a Schedule.
 *
 * Log Safety: SAFE
 */
export type ScheduleRid = LooselyBrandedString<"ScheduleRid">;

/**
 * The data type of a column in a dataset schema.
 *
 * Log Safety: SAFE
 */
export type SchemaFieldType =
  | "ARRAY"
  | "BINARY"
  | "BOOLEAN"
  | "BYTE"
  | "DATE"
  | "DECIMAL"
  | "DOUBLE"
  | "FLOAT"
  | "INTEGER"
  | "LONG"
  | "MAP"
  | "SHORT"
  | "STRING"
  | "STRUCT"
  | "TIMESTAMP";

/**
 * @deprecated Use `SearchJsonQueryV2` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export type SearchJsonQueryV2 =
  | ({ type: "or" } & OrQueryV2)
  | ({ type: "in" } & InQuery)
  | ({ type: "doesNotIntersectPolygon" } & DoesNotIntersectPolygonQuery)
  | ({ type: "lt" } & LtQueryV2)
  | ({ type: "doesNotIntersectBoundingBox" } & DoesNotIntersectBoundingBoxQuery)
  | ({ type: "eq" } & EqualsQueryV2)
  | ({ type: "containsAllTerms" } & ContainsAllTermsQuery)
  | ({ type: "gt" } & GtQueryV2)
  | ({ type: "withinDistanceOf" } & WithinDistanceOfQuery)
  | ({ type: "withinBoundingBox" } & WithinBoundingBoxQuery)
  | ({ type: "contains" } & ContainsQueryV2)
  | ({ type: "not" } & NotQueryV2)
  | ({ type: "intersectsBoundingBox" } & IntersectsBoundingBoxQuery)
  | ({ type: "and" } & AndQueryV2)
  | ({ type: "isNull" } & IsNullQueryV2)
  | ({
    type: "containsAllTermsInOrderPrefixLastTerm";
  } & ContainsAllTermsInOrderPrefixLastTerm)
  | ({ type: "containsAnyTerm" } & ContainsAnyTermQuery)
  | ({ type: "gte" } & GteQueryV2)
  | ({ type: "containsAllTermsInOrder" } & ContainsAllTermsInOrderQuery)
  | ({ type: "withinPolygon" } & WithinPolygonQuery)
  | ({ type: "intersectsPolygon" } & IntersectsPolygonQuery)
  | ({ type: "lte" } & LteQueryV2)
  | ({ type: "startsWith" } & StartsWithQuery);

/**
 * The name of the service that is not set-up
 *
 * Log Safety: SAFE
 */
export type ServiceName = LooselyBrandedString<"ServiceName">;

/**
 * Log Safety: SAFE
 */
export interface ShortType {}

/**
 * The size of the file or attachment in bytes.
 *
 * Log Safety: SAFE
 */
export type SizeBytes = string;

/**
 * @deprecated Use `StartsWithQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field starts with the provided value.
 *
 * Log Safety: UNSAFE
 */
export interface StartsWithQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: string;
}

/**
 * The schema for a Foundry stream. Records pushed to this stream must match this schema.
 *
 * Log Safety: UNSAFE
 */
export interface StreamSchema {
  fields: Array<Field>;
  keyFieldNames?: Array<FieldName>;
  changeDataCapture?: ChangeDataCaptureConfiguration;
}

/**
 * Log Safety: SAFE
 */
export interface StringType {}

/**
 * @deprecated Use `StructFieldApiName` in the `foundry.ontologies` package
 *
 * The name of a struct field in the Ontology.
 *
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
* @deprecated Use `StructFieldSelector` in the `foundry.ontologies` package
*
   * A combination of a struct property api name and a struct field api name. This is used to select struct fields
to query on. Note that you can still select struct properties with only a 'PropertyApiNameSelector'; the queries
will then become 'OR' queries across the fields of the struct property.
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
  subFields: Array<Field>;
}

/**
 * The Resource Identifier (RID) of a Table.
 *
 * Log Safety: SAFE
 */
export type TableRid = LooselyBrandedString<"TableRid">;

/**
 * A union of the types supported by time series properties.
 *
 * Log Safety: UNSAFE
 */
export type TimeSeriesItemType =
  | ({ type: "string" } & StringType)
  | ({ type: "double" } & DoubleType)
  | ({ type: "numericOrNonNumeric" } & NumericOrNonNumericType);

/**
 * Log Safety: UNSAFE
 */
export interface TimeseriesType {
  itemType: TimeSeriesItemType;
}

/**
 * Log Safety: SAFE
 */
export interface TimestampType {}

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
  | "YEARS";

/**
 * The total number of items across all pages.
 *
 * Log Safety: SAFE
 */
export type TotalCount = string;

/**
 * The W3C Trace Context traceparent header value used to propagate distributed tracing information for Foundry telemetry. See https://www.w3.org/TR/trace-context/#traceparent-header for more details. Note the 16 byte trace ID encoded in the header must be derived from a time based uuid to be used within Foundry.
 *
 * Log Safety: SAFE
 */
export type TraceParent = LooselyBrandedString<"TraceParent">;

/**
 * The W3C Trace Context tracestate header value, which is used to propagate vendor specific distributed tracing information for Foundry telemetry. See https://www.w3.org/TR/trace-context/#tracestate-header for more details.
 *
 * Log Safety: SAFE
 */
export type TraceState = LooselyBrandedString<"TraceState">;

/**
 * Log Safety: UNSAFE
 */
export interface UnsupportedType {
  unsupportedType: string;
  params: Record<UnsupportedTypeParamKey, UnsupportedTypeParamValue>;
}

/**
 * Log Safety: UNSAFE
 */
export type UnsupportedTypeParamKey = LooselyBrandedString<
  "UnsupportedTypeParamKey"
>;

/**
 * Log Safety: UNSAFE
 */
export type UnsupportedTypeParamValue = LooselyBrandedString<
  "UnsupportedTypeParamValue"
>;

/**
 * The Foundry user who last updated this resource
 *
 * Log Safety: SAFE
 */
export type UpdatedBy = UserId;

/**
 * The time at which the resource was most recently updated.
 *
 * Log Safety: SAFE
 */
export type UpdatedTime = string;

/**
 * A Foundry User ID.
 *
 * Log Safety: SAFE
 */
export type UserId = string;

/**
 * Present status of user.
 *
 * Log Safety: SAFE
 */
export type UserStatus = "ACTIVE" | "DELETED";

/**
   * The vector similarity function to support approximate nearest neighbors search. Will result in an index
specific for the function.
   *
   * Log Safety: SAFE
   */
export interface VectorSimilarityFunction {
  value?: VectorSimilarityFunctionValue;
}

/**
 * Log Safety: SAFE
 */
export type VectorSimilarityFunctionValue =
  | "COSINE_SIMILARITY"
  | "DOT_PRODUCT"
  | "EUCLIDEAN_DISTANCE";

/**
 * Represents a fixed size vector of floats. These can be used for vector similarity searches.
 *
 * Log Safety: UNSAFE
 */
export interface VectorType {
  dimension: number;
  supportsSearchWith: Array<VectorSimilarityFunction>;
  embeddingModel?: EmbeddingModel;
}

/**
 * The version identifier of a dataset schema.
 *
 * Log Safety: SAFE
 */
export type VersionId = string;

/**
 * @deprecated Use `WithinBoundingBoxPoint` in the `foundry.ontologies` package
 *
 * Log Safety: UNSAFE
 */
export type WithinBoundingBoxPoint = { type: "Point" } & _Geo.GeoPoint;

/**
 * @deprecated Use `WithinBoundingBoxQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field contains a point within the bounding box provided.
 *
 * Log Safety: UNSAFE
 */
export interface WithinBoundingBoxQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: BoundingBoxValue;
}

/**
 * @deprecated Use `WithinDistanceOfQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field contains a point within the distance provided of the center point.
 *
 * Log Safety: UNSAFE
 */
export interface WithinDistanceOfQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: CenterPoint;
}

/**
 * @deprecated Use `WithinPolygonQuery` in the `foundry.ontologies` package
 *
 * Returns objects where the specified field contains a point within the polygon provided.
 *
 * Log Safety: UNSAFE
 */
export interface WithinPolygonQuery {
  field?: PropertyApiName;
  propertyIdentifier?: PropertyIdentifier;
  value: PolygonValue;
}

/**
 * A string representation of a java.time.ZoneId
 *
 * Log Safety: SAFE
 */
export type ZoneId = LooselyBrandedString<"ZoneId">;
