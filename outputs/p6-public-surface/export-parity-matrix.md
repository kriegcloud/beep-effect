# P6 Export Parity Matrix

## Summary
- Stable symbol exports (upstream): 148
- Stable symbol exports present locally: 148
- Stable missing: 0
- Stable extras: 0
- Unstable symbol exports (upstream): 9
- Unstable symbol exports present locally: 9
- Unstable missing: 0
- Unstable extras: 0
- Package export config validation: PASS

## Discovery And Gate Checks
- `bun run beep docs laws` PASS
- `bun run beep docs skills` PASS
- `bun run beep docs policies` PASS
- `bun run beep docs find exports` PASS (no direct docs match)
- `curl -sS http://127.0.0.1:8123/healthz` PASS (`status: ok`, `rejected: 0`)
- `curl -sS http://127.0.0.1:8123/metrics` PASS (`status: ok`, `rejected: 0`)
- Export presence check against upstream stable/unstable lists (symbol-level): PASS
- Package export config validation script: PASS

## Stable Symbol Matrix
| # | Symbol parity key | Local status |
| --- | --- | --- |
| 1 | `type ActionReturnTypeForOptions <- ./actions/ActionReturnTypeForOptions.js` | PASS |
| 2 | `type ActionEditResponse <- ./actions/Actions.js` | PASS |
| 3 | `type ActionParam <- ./actions/Actions.js` | PASS |
| 4 | `type ActionValidationResponse <- ./actions/Actions.js` | PASS |
| 5 | `type ApplyActionOptions <- ./actions/Actions.js` | PASS |
| 6 | `type ApplyBatchActionOptions <- ./actions/Actions.js` | PASS |
| 7 | `type ValidAggregationKeys <- ./aggregate/AggregatableKeys.js` | PASS |
| 8 | `type AggregateOpts <- ./aggregate/AggregateOpts.js` | PASS |
| 9 | `type AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy <- ./aggregate/AggregateOptsThatErrors.js` | PASS |
| 10 | `type AggregationResultsWithGroups <- ./aggregate/AggregationResultsWithGroups.js` | PASS |
| 11 | `type AggregationResultsWithoutGroups <- ./aggregate/AggregationResultsWithoutGroups.js` | PASS |
| 12 | `type AggregationClause <- ./aggregate/AggregationsClause.js` | PASS |
| 13 | `type AggregationsResults <- ./aggregate/AggregationsResults.js` | PASS |
| 14 | `type GeoFilterOptions <- ./aggregate/GeoFilter.js` | PASS |
| 15 | `value DistanceUnitMapping <- ./aggregate/WhereClause.js` | PASS |
| 16 | `type AndWhereClause <- ./aggregate/WhereClause.js` | PASS |
| 17 | `type GeoFilter_Intersects <- ./aggregate/WhereClause.js` | PASS |
| 18 | `type GeoFilter_Within <- ./aggregate/WhereClause.js` | PASS |
| 19 | `type NotWhereClause <- ./aggregate/WhereClause.js` | PASS |
| 20 | `type OrWhereClause <- ./aggregate/WhereClause.js` | PASS |
| 21 | `type PossibleWhereClauseFilters <- ./aggregate/WhereClause.js` | PASS |
| 22 | `type WhereClause <- ./aggregate/WhereClause.js` | PASS |
| 23 | `type OsdkObjectCreatePropertyType <- ./definitions.js` | PASS |
| 24 | `type OsdkObjectPropertyType <- ./definitions.js` | PASS |
| 25 | `type OsdkObjectLinksObject <- ./definitions/LinkDefinitions.js` | PASS |
| 26 | `type SingleLinkAccessor <- ./definitions/LinkDefinitions.js` | PASS |
| 27 | `type DerivedProperty <- ./derivedProperties/DerivedProperty.js` | PASS |
| 28 | `value DurationMapping <- ./groupby/GroupByClause.js` | PASS |
| 29 | `type AllGroupByValues <- ./groupby/GroupByClause.js` | PASS |
| 30 | `type GroupByClause <- ./groupby/GroupByClause.js` | PASS |
| 31 | `type GroupByRange <- ./groupby/GroupByClause.js` | PASS |
| 32 | `type Logger <- ./Logger.js` | PASS |
| 33 | `type AllowedBucketKeyTypes <- ./mapping/DataValueMapping.js` | PASS |
| 34 | `type AllowedBucketTypes <- ./mapping/DataValueMapping.js` | PASS |
| 35 | `type DataValueClientToWire <- ./mapping/DataValueMapping.js` | PASS |
| 36 | `type DataValueWireToClient <- ./mapping/DataValueMapping.js` | PASS |
| 37 | `type PropertyValueWireToClient <- ./mapping/PropertyValueMapping.js` | PASS |
| 38 | `type Attachment <- ./object/Attachment.js` | PASS |
| 39 | `type AttachmentUpload <- ./object/Attachment.js` | PASS |
| 40 | `type AsyncIterArgs <- ./object/FetchPageArgs.js` | PASS |
| 41 | `type Augment <- ./object/FetchPageArgs.js` | PASS |
| 42 | `type Augments <- ./object/FetchPageArgs.js` | PASS |
| 43 | `type FetchPageArgs <- ./object/FetchPageArgs.js` | PASS |
| 44 | `type NullabilityAdherence <- ./object/FetchPageArgs.js` | PASS |
| 45 | `type ObjectSetArgs <- ./object/FetchPageArgs.js` | PASS |
| 46 | `type SelectArg <- ./object/FetchPageArgs.js` | PASS |
| 47 | `type SelectArgToKeys <- ./object/FetchPageArgs.js` | PASS |
| 48 | `type FetchPageResult <- ./object/FetchPageResult.js` | PASS |
| 49 | `type SingleOsdkResult <- ./object/FetchPageResult.js` | PASS |
| 50 | `type Media <- ./object/Media.js` | PASS |
| 51 | `type MediaMetadata <- ./object/Media.js` | PASS |
| 52 | `type MediaReference <- ./object/Media.js` | PASS |
| 53 | `type MediaUpload <- ./object/Media.js` | PASS |
| 54 | `type PropertyMarkings <- ./object/PropertySecurity.js` | PASS |
| 55 | `type PropertySecurity <- ./object/PropertySecurity.js` | PASS |
| 56 | `value isOk <- ./object/Result.js` | PASS |
| 57 | `type Result <- ./object/Result.js` | PASS |
| 58 | `type BaseObjectSet <- ./objectSet/BaseObjectSet.js` | PASS |
| 59 | `type ObjectSet <- ./objectSet/ObjectSet.js` | PASS |
| 60 | `type FetchLinksPageResult <- ./objectSet/ObjectSetLinks.js` | PASS |
| 61 | `type LinkTypeApiNamesFor <- ./objectSet/ObjectSetLinks.js` | PASS |
| 62 | `type MinimalDirectedObjectLinkInstance <- ./objectSet/ObjectSetLinks.js` | PASS |
| 63 | `type ObjectSetSubscription <- ./objectSet/ObjectSetListener.js` | PASS |
| 64 | `type ActionDefinition <- ./ontology/ActionDefinition.js` | PASS |
| 65 | `type ActionMetadata <- ./ontology/ActionDefinition.js` | PASS |
| 66 | `type InterfaceDefinition <- ./ontology/InterfaceDefinition.js` | PASS |
| 67 | `type InterfaceMetadata <- ./ontology/InterfaceDefinition.js` | PASS |
| 68 | `type ObjectOrInterfaceDefinition <- ./ontology/ObjectOrInterface.js` | PASS |
| 69 | `type PropertyKeys <- ./ontology/ObjectOrInterface.js` | PASS |
| 70 | `type ObjectSpecifier <- ./ontology/ObjectSpecifier.js` | PASS |
| 71 | `type CompileTimeMetadata <- ./ontology/ObjectTypeDefinition.js` | PASS |
| 72 | `type ObjectMetadata <- ./ontology/ObjectTypeDefinition.js` | PASS |
| 73 | `type ObjectTypeDefinition <- ./ontology/ObjectTypeDefinition.js` | PASS |
| 74 | `type PropertyDef <- ./ontology/ObjectTypeDefinition.js` | PASS |
| 75 | `type VersionBound <- ./ontology/ObjectTypeDefinition.js` | PASS |
| 76 | `type OntologyMetadata <- ./ontology/OntologyMetadata.js` | PASS |
| 77 | `type PrimaryKeyTypes <- ./ontology/PrimaryKeyTypes.js` | PASS |
| 78 | `type InterfaceQueryDataType <- ./ontology/QueryDefinition.js` | PASS |
| 79 | `type ObjectQueryDataType <- ./ontology/QueryDefinition.js` | PASS |
| 80 | `type ObjectSetQueryDataType <- ./ontology/QueryDefinition.js` | PASS |
| 81 | `type QueryDataTypeDefinition <- ./ontology/QueryDefinition.js` | PASS |
| 82 | `type QueryDefinition <- ./ontology/QueryDefinition.js` | PASS |
| 83 | `type QueryMetadata <- ./ontology/QueryDefinition.js` | PASS |
| 84 | `type QueryParameterDefinition <- ./ontology/QueryDefinition.js` | PASS |
| 85 | `type ThreeDimensionalQueryAggregationDefinition <- ./ontology/QueryDefinition.js` | PASS |
| 86 | `type TwoDimensionalQueryAggregationDefinition <- ./ontology/QueryDefinition.js` | PASS |
| 87 | `type SimplePropertyDef <- ./ontology/SimplePropertyDef.js` | PASS |
| 88 | `type PropertyBooleanFormattingRule <- ./ontology/valueFormatting/PropertyBooleanFormattingRule.js` | PASS |
| 89 | `type DatetimeFormat <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 90 | `type DatetimeLocalizedFormat <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 91 | `type DatetimeLocalizedFormatType <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 92 | `type DatetimeStringFormat <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 93 | `type DatetimeTimezone <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 94 | `type DatetimeTimezoneStatic <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 95 | `type DatetimeTimezoneUser <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 96 | `type PropertyDateFormattingRule <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 97 | `type PropertyTimestampFormattingRule <- ./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.js` | PASS |
| 98 | `type KnownType <- ./ontology/valueFormatting/PropertyKnownTypeFormattingRule.js` | PASS |
| 99 | `type PropertyKnownTypeFormattingRule <- ./ontology/valueFormatting/PropertyKnownTypeFormattingRule.js` | PASS |
| 100 | `type Affix <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 101 | `type DurationBaseValue <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 102 | `type DurationFormatStyle <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 103 | `type DurationPrecision <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 104 | `type HumanReadableFormat <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 105 | `type NumberFormatAffix <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 106 | `type NumberFormatCurrency <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 107 | `type NumberFormatCurrencyStyle <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 108 | `type NumberFormatCustomUnit <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 109 | `type NumberFormatDuration <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 110 | `type NumberFormatFixedValues <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 111 | `type NumberFormatNotation <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 112 | `type NumberFormatOptions <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 113 | `type NumberFormatRatio <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 114 | `type NumberFormatScale <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 115 | `type NumberFormatStandard <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 116 | `type NumberFormatStandardUnit <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 117 | `type NumberRatioType <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 118 | `type NumberRoundingMode <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 119 | `type NumberScaleType <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 120 | `type PropertyNumberFormattingRule <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 121 | `type PropertyNumberFormattingRuleType <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 122 | `type TimeCodeFormat <- ./ontology/valueFormatting/PropertyNumberFormattingRule.js` | PASS |
| 123 | `type PropertyValueFormattingRule <- ./ontology/valueFormatting/PropertyValueFormattingRule.js` | PASS |
| 124 | `type PropertyTypeReference <- ./ontology/valueFormatting/PropertyValueFormattingUtils.js` | PASS |
| 125 | `type PropertyTypeReferenceOrStringConstant <- ./ontology/valueFormatting/PropertyValueFormattingUtils.js` | PASS |
| 126 | `type StringConstant <- ./ontology/valueFormatting/PropertyValueFormattingUtils.js` | PASS |
| 127 | `type BaseWirePropertyTypes <- ./ontology/WirePropertyTypes.js` | PASS |
| 128 | `type WirePropertyTypes <- ./ontology/WirePropertyTypes.js` | PASS |
| 129 | `type ObjectIdentifiers <- ./OsdkBase.js` | PASS |
| 130 | `type OsdkBase <- ./OsdkBase.js` | PASS |
| 131 | `type PrimaryKeyType <- ./OsdkBase.js` | PASS |
| 132 | `type OsdkObject <- ./OsdkObject.js` | PASS |
| 133 | `type ConvertProps <- ./OsdkObjectFrom.js` | PASS |
| 134 | `type MaybeScore <- ./OsdkObjectFrom.js` | PASS |
| 135 | `type Osdk <- ./OsdkObjectFrom.js` | PASS |
| 136 | `type PageResult <- ./PageResult.js` | PASS |
| 137 | `type Range <- ./queries/Aggregations.js` | PASS |
| 138 | `type ThreeDimensionalAggregation <- ./queries/Aggregations.js` | PASS |
| 139 | `type TwoDimensionalAggregation <- ./queries/Aggregations.js` | PASS |
| 140 | `type QueryParam <- ./queries/Queries.js` | PASS |
| 141 | `type QueryResult <- ./queries/Queries.js` | PASS |
| 142 | `value TimeseriesDurationMapping <- ./timeseries/timeseries.js` | PASS |
| 143 | `type GeotimeSeriesProperty <- ./timeseries/timeseries.js` | PASS |
| 144 | `type TimeSeriesPoint <- ./timeseries/timeseries.js` | PASS |
| 145 | `type TimeSeriesProperty <- ./timeseries/timeseries.js` | PASS |
| 146 | `type TimeSeriesQuery <- ./timeseries/timeseries.js` | PASS |
| 147 | `type LinkedType <- ./util/LinkUtils.js` | PASS |
| 148 | `type LinkNames <- ./util/LinkUtils.js` | PASS |

## Unstable Symbol Matrix
| # | Symbol parity key | Local status |
| --- | --- | --- |
| 1 | `type Experiment <- ../experimental/Experiment.js` | PASS |
| 2 | `type ExperimentFns <- ../experimental/Experiment.js` | PASS |
| 3 | `value __EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference <- ../experimental/createMediaReference.js` | PASS |
| 4 | `value __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid <- ../experimental/fetchOneByRid.js` | PASS |
| 5 | `value __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid <- ../experimental/fetchPageByRid.js` | PASS |
| 6 | `type FetchPageByRidPayload <- ../experimental/fetchPageByRid.js` | PASS |
| 7 | `value __EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks <- ../experimental/getBulkLinks.js` | PASS |
| 8 | `type EXPERIMENTAL_BulkLinkResult <- ../objectSet/BulkLinkResult.js` | PASS |
| 9 | `type MinimalObjectSet <- ../objectSet/ObjectSet.js` | PASS |

## Extras And Deltas
- None. Stable and unstable symbol parity is exact after approved source-path adaptation (`./Definitions.js` -> `./definitions.js`).
