/**
 * Public stable API surface for `@beep/ontology`.
 *
 * @since 0.0.0
 * @module @beep/ontology
 */

export type {
  /** @since 0.0.0 */
  ActionReturnTypeForOptions,
} from "./actions/ActionReturnTypeForOptions.js";
export type {
  /** @since 0.0.0 */
  ActionEditResponse,
  /** @since 0.0.0 */
  ActionParam,
  /** @since 0.0.0 */
  ActionValidationResponse,
  /** @since 0.0.0 */
  ApplyActionOptions,
  /** @since 0.0.0 */
  ApplyBatchActionOptions,
} from "./actions/Actions.js";
export type {
  /** @since 0.0.0 */
  ValidAggregationKeys,
} from "./aggregate/AggregatableKeys.js";
export type {
  /** @since 0.0.0 */
  AggregateOpts,
} from "./aggregate/AggregateOpts.js";
export type {
  /** @since 0.0.0 */
  AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy,
} from "./aggregate/AggregateOptsThatErrors.js";
export type {
  /** @since 0.0.0 */
  AggregationResultsWithGroups,
} from "./aggregate/AggregationResultsWithGroups.js";
export type {
  /** @since 0.0.0 */
  AggregationResultsWithoutGroups,
} from "./aggregate/AggregationResultsWithoutGroups.js";
export type {
  /** @since 0.0.0 */
  AggregationClause,
} from "./aggregate/AggregationsClause.js";
export type {
  /** @since 0.0.0 */
  AggregationsResults,
} from "./aggregate/AggregationsResults.js";
export type {
  /** @since 0.0.0 */
  GeoFilterOptions,
} from "./aggregate/GeoFilter.js";
export type {
  /** @since 0.0.0 */
  AndWhereClause,
  /** @since 0.0.0 */
  GeoFilter_Intersects,
  /** @since 0.0.0 */
  GeoFilter_Within,
  /** @since 0.0.0 */
  NotWhereClause,
  /** @since 0.0.0 */
  OrWhereClause,
  /** @since 0.0.0 */
  PossibleWhereClauseFilters,
  /** @since 0.0.0 */
  WhereClause,
} from "./aggregate/WhereClause.js";
export {
  /** @since 0.0.0 */
  DistanceUnitMapping,
} from "./aggregate/WhereClause.js";
export type {
  /** @since 0.0.0 */
  OsdkObjectLinksObject,
  /** @since 0.0.0 */
  SingleLinkAccessor,
} from "./definitions/LinkDefinitions.js";
export type {
  /** @since 0.0.0 */
  OsdkObjectCreatePropertyType,
  /** @since 0.0.0 */
  OsdkObjectPropertyType,
} from "./definitions.js";
export type {
  /** @since 0.0.0 */
  DerivedProperty,
} from "./derivedProperties/DerivedProperty.js";
export type {
  /** @since 0.0.0 */
  AllGroupByValues,
  /** @since 0.0.0 */
  GroupByClause,
  /** @since 0.0.0 */
  GroupByRange,
} from "./groupby/GroupByClause.js";
export {
  /** @since 0.0.0 */
  DurationMapping,
} from "./groupby/GroupByClause.js";
export type {
  /** @since 0.0.0 */
  Logger,
} from "./Logger.js";
export type {
  /** @since 0.0.0 */
  AllowedBucketKeyTypes,
  /** @since 0.0.0 */
  AllowedBucketTypes,
  /** @since 0.0.0 */
  DataValueClientToWire,
  /** @since 0.0.0 */
  DataValueWireToClient,
} from "./mapping/DataValueMapping.js";
export type {
  /** @since 0.0.0 */
  PropertyValueWireToClient,
} from "./mapping/PropertyValueMapping.js";
export type {
  /** @since 0.0.0 */
  ObjectIdentifiers,
  /** @since 0.0.0 */
  OsdkBase,
  /** @since 0.0.0 */
  PrimaryKeyType,
} from "./OsdkBase.js";
// eslint-disable-next-line @typescript-eslint/no-deprecated
export type {
  /** @since 0.0.0 */
  OsdkObject,
} from "./OsdkObject.js";
export type {
  /** @since 0.0.0 */
  ConvertProps,
  /** @since 0.0.0 */
  MaybeScore,
  /** @since 0.0.0 */
  Osdk,
} from "./OsdkObjectFrom.js";
export type {
  /** @since 0.0.0 */
  Attachment,
  /** @since 0.0.0 */
  AttachmentUpload,
} from "./object/Attachment.js";
export type {
  /** @since 0.0.0 */
  AsyncIterArgs,
  /** @since 0.0.0 */
  Augment,
  /** @since 0.0.0 */
  Augments,
  /** @since 0.0.0 */
  FetchPageArgs,
  /** @since 0.0.0 */
  NullabilityAdherence,
  /** @since 0.0.0 */
  ObjectSetArgs,
  /** @since 0.0.0 */
  SelectArg,
  /** @since 0.0.0 */
  SelectArgToKeys,
} from "./object/FetchPageArgs.js";
export type {
  /** @since 0.0.0 */
  FetchPageResult,
  /** @since 0.0.0 */
  SingleOsdkResult,
} from "./object/FetchPageResult.js";
export type {
  /** @since 0.0.0 */
  Media,
  /** @since 0.0.0 */
  MediaMetadata,
  /** @since 0.0.0 */
  MediaReference,
  /** @since 0.0.0 */
  MediaUpload,
} from "./object/Media.js";
export type {
  /** @since 0.0.0 */
  PropertyMarkings,
  /** @since 0.0.0 */
  PropertySecurity,
} from "./object/PropertySecurity.js";
export type {
  /** @since 0.0.0 */
  Result,
} from "./object/Result.js";
export {
  /** @since 0.0.0 */
  isOk,
} from "./object/Result.js";
export type {
  /** @since 0.0.0 */
  BaseObjectSet,
} from "./objectSet/BaseObjectSet.js";
export type {
  /** @since 0.0.0 */
  ObjectSet,
} from "./objectSet/ObjectSet.js";
export type {
  /** @since 0.0.0 */
  FetchLinksPageResult,
  /** @since 0.0.0 */
  LinkTypeApiNamesFor,
  /** @since 0.0.0 */
  MinimalDirectedObjectLinkInstance,
} from "./objectSet/ObjectSetLinks.js";
export type {
  /** @since 0.0.0 */
  ObjectSetSubscription,
} from "./objectSet/ObjectSetListener.js";
export type {
  /** @since 0.0.0 */
  ActionDefinition,
  /** @since 0.0.0 */
  ActionMetadata,
} from "./ontology/ActionDefinition.js";
export type {
  /** @since 0.0.0 */
  InterfaceDefinition,
  /** @since 0.0.0 */
  InterfaceMetadata,
} from "./ontology/InterfaceDefinition.js";
export type {
  /** @since 0.0.0 */
  ObjectOrInterfaceDefinition,
  /** @since 0.0.0 */
  PropertyKeys,
} from "./ontology/ObjectOrInterface.js";
export type {
  /** @since 0.0.0 */
  ObjectSpecifier,
} from "./ontology/ObjectSpecifier.js";
export type {
  /** @since 0.0.0 */
  CompileTimeMetadata,
  /** @since 0.0.0 */
  ObjectMetadata,
  /** @since 0.0.0 */
  ObjectTypeDefinition,
  /** @since 0.0.0 */
  PropertyDef,
  /** @since 0.0.0 */
  VersionBound,
} from "./ontology/ObjectTypeDefinition.js";
export type {
  /** @since 0.0.0 */
  OntologyMetadata,
} from "./ontology/OntologyMetadata.js";
export type {
  /** @since 0.0.0 */
  PrimaryKeyTypes,
} from "./ontology/PrimaryKeyTypes.js";
export type {
  /** @since 0.0.0 */
  InterfaceQueryDataType,
  /** @since 0.0.0 */
  ObjectQueryDataType,
  /** @since 0.0.0 */
  ObjectSetQueryDataType,
  /** @since 0.0.0 */
  QueryDataTypeDefinition,
  /** @since 0.0.0 */
  QueryDefinition,
  /** @since 0.0.0 */
  QueryMetadata,
  /** @since 0.0.0 */
  QueryParameterDefinition,
  /** @since 0.0.0 */
  ThreeDimensionalQueryAggregationDefinition,
  /** @since 0.0.0 */
  TwoDimensionalQueryAggregationDefinition,
} from "./ontology/QueryDefinition.js";
export type {
  /** @since 0.0.0 */
  SimplePropertyDef,
} from "./ontology/SimplePropertyDef.js";
export type {
  /** @since 0.0.0 */
  PropertyBooleanFormattingRule,
} from "./ontology/valueFormatting/PropertyBooleanFormattingRule.js";
export type {
  /** @since 0.0.0 */
  DatetimeFormat,
  /** @since 0.0.0 */
  DatetimeLocalizedFormat,
  /** @since 0.0.0 */
  DatetimeLocalizedFormatType,
  /** @since 0.0.0 */
  DatetimeStringFormat,
  /** @since 0.0.0 */
  DatetimeTimezone,
  /** @since 0.0.0 */
  DatetimeTimezoneStatic,
  /** @since 0.0.0 */
  DatetimeTimezoneUser,
  /** @since 0.0.0 */
  PropertyDateFormattingRule,
  /** @since 0.0.0 */
  PropertyTimestampFormattingRule,
} from "./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js";
export type {
  /** @since 0.0.0 */
  KnownType,
  /** @since 0.0.0 */
  PropertyKnownTypeFormattingRule,
} from "./ontology/valueFormatting/PropertyKnownTypeFormattingRule.js";
export type {
  /** @since 0.0.0 */
  Affix,
  /** @since 0.0.0 */
  DurationBaseValue,
  /** @since 0.0.0 */
  DurationFormatStyle,
  /** @since 0.0.0 */
  DurationPrecision,
  /** @since 0.0.0 */
  HumanReadableFormat,
  /** @since 0.0.0 */
  NumberFormatAffix,
  /** @since 0.0.0 */
  NumberFormatCurrency,
  /** @since 0.0.0 */
  NumberFormatCurrencyStyle,
  /** @since 0.0.0 */
  NumberFormatCustomUnit,
  /** @since 0.0.0 */
  NumberFormatDuration,
  /** @since 0.0.0 */
  NumberFormatFixedValues,
  /** @since 0.0.0 */
  NumberFormatNotation,
  /** @since 0.0.0 */
  NumberFormatOptions,
  /** @since 0.0.0 */
  NumberFormatRatio,
  /** @since 0.0.0 */
  NumberFormatScale,
  /** @since 0.0.0 */
  NumberFormatStandard,
  /** @since 0.0.0 */
  NumberFormatStandardUnit,
  /** @since 0.0.0 */
  NumberRatioType,
  /** @since 0.0.0 */
  NumberRoundingMode,
  /** @since 0.0.0 */
  NumberScaleType,
  /** @since 0.0.0 */
  PropertyNumberFormattingRule,
  /** @since 0.0.0 */
  PropertyNumberFormattingRuleType,
  /** @since 0.0.0 */
  TimeCodeFormat,
} from "./ontology/valueFormatting/PropertyNumberFormattingRule.js";
export type {
  /** @since 0.0.0 */
  PropertyValueFormattingRule,
} from "./ontology/valueFormatting/PropertyValueFormattingRule.js";
export type {
  /** @since 0.0.0 */
  PropertyTypeReference,
  /** @since 0.0.0 */
  PropertyTypeReferenceOrStringConstant,
  /** @since 0.0.0 */
  StringConstant,
} from "./ontology/valueFormatting/PropertyValueFormattingUtils.js";
export type {
  /** @since 0.0.0 */
  BaseWirePropertyTypes,
  /** @since 0.0.0 */
  WirePropertyTypes,
} from "./ontology/WirePropertyTypes.js";
export type {
  /** @since 0.0.0 */
  PageResult,
} from "./PageResult.js";
export type {
  /** @since 0.0.0 */
  Range,
  /** @since 0.0.0 */
  ThreeDimensionalAggregation,
  /** @since 0.0.0 */
  TwoDimensionalAggregation,
} from "./queries/Aggregations.js";
export type {
  /** @since 0.0.0 */
  QueryParam,
  /** @since 0.0.0 */
  QueryResult,
} from "./queries/Queries.js";
export type {
  /** @since 0.0.0 */
  GeotimeSeriesProperty,
  /** @since 0.0.0 */
  TimeSeriesPoint,
  /** @since 0.0.0 */
  TimeSeriesProperty,
  /** @since 0.0.0 */
  TimeSeriesQuery,
} from "./timeseries/timeseries.js";
export {
  /** @since 0.0.0 */
  TimeseriesDurationMapping,
} from "./timeseries/timeseries.js";
export type {
  /** @since 0.0.0 */
  LinkedType,
  /** @since 0.0.0 */
  LinkNames,
} from "./util/LinkUtils.js";
