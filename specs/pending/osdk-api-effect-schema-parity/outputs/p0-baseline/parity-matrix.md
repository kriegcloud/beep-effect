# P0 Parity Matrix

## Scope and Evidence

- Upstream stable export source: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/index.ts`
- Upstream unstable export source: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/public/unstable.ts`
- Local ontology source root: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src`
- Classification rule: `implemented` if mapped local file exists with `>15` non-empty lines; `stubbed` if `<=15`; `missing` if file absent.
- Alias/path mapping used for parity comparison: `OsdkBase->OntologyBase.ts`, `OsdkObject->OntologyObject.ts`, `OsdkObjectFrom->OntologyObjectFrom.ts`, `Definitions->definitions.ts`, `Logger->logger.ts`, `definitions/LinkDefinitions->definitions/LinkDefinition.ts`, `groupby/GroupByClause->groupBy/GroupByClause.ts`.
- Evidence generated directly from file system scan on 2026-02-26.

## Summary Counts

| Surface | Total | Implemented | Stubbed | Missing |
|---|---:|---:|---:|---:|
| Stable (`index.ts` exports) | 52 | 14 | 16 | 22 |
| Unstable (`public/unstable.ts` exports) | 7 | 0 | 0 | 7 |

## Stable Module Matrix

| Upstream module | Local mapped file | Status | Non-empty lines |
|---|---|---|---:|
| `./actions/ActionReturnTypeForOptions` | `packages/common/ontology/src/actions/ActionReturnTypeForOptions.ts` | missing | - |
| `./actions/Actions` | `packages/common/ontology/src/actions/Actions.ts` | missing | - |
| `./aggregate/AggregatableKeys` | `packages/common/ontology/src/aggregate/AggregatableKeys.ts` | missing | - |
| `./aggregate/AggregateOpts` | `packages/common/ontology/src/aggregate/AggregateOpts.ts` | missing | - |
| `./aggregate/AggregateOptsThatErrors` | `packages/common/ontology/src/aggregate/AggregateOptsThatErrors.ts` | missing | - |
| `./aggregate/AggregationResultsWithGroups` | `packages/common/ontology/src/aggregate/AggregationResultsWithGroups.ts` | missing | - |
| `./aggregate/AggregationResultsWithoutGroups` | `packages/common/ontology/src/aggregate/AggregationResultsWithoutGroups.ts` | missing | - |
| `./aggregate/AggregationsClause` | `packages/common/ontology/src/aggregate/AggregationsClause.ts` | missing | - |
| `./aggregate/AggregationsResults` | `packages/common/ontology/src/aggregate/AggregationsResults.ts` | missing | - |
| `./aggregate/GeoFilter` | `packages/common/ontology/src/aggregate/GeoFilter.ts` | missing | - |
| `./aggregate/WhereClause` | `packages/common/ontology/src/aggregate/WhereClause.ts` | missing | - |
| `./Definitions` | `packages/common/ontology/src/definitions.ts` | stubbed | 6 |
| `./definitions/LinkDefinitions` | `packages/common/ontology/src/definitions/LinkDefinition.ts` | stubbed | 6 |
| `./derivedProperties/DerivedProperty` | `packages/common/ontology/src/derivedProperties/DerivedProperty.ts` | missing | - |
| `./groupby/GroupByClause` | `packages/common/ontology/src/groupBy/GroupByClause.ts` | missing | - |
| `./Logger` | `packages/common/ontology/src/logger.ts` | stubbed | 6 |
| `./mapping/DataValueMapping` | `packages/common/ontology/src/mapping/DataValueMapping.ts` | stubbed | 6 |
| `./mapping/PropertyValueMapping` | `packages/common/ontology/src/mapping/PropertyValueMapping.ts` | missing | - |
| `./object/Attachment` | `packages/common/ontology/src/object/Attachment.ts` | stubbed | 6 |
| `./object/FetchPageArgs` | `packages/common/ontology/src/object/FetchPageArgs.ts` | stubbed | 6 |
| `./object/FetchPageResult` | `packages/common/ontology/src/object/FetchPageResult.ts` | stubbed | 6 |
| `./object/Media` | `packages/common/ontology/src/object/Media.ts` | implemented | 78 |
| `./object/PropertySecurity` | `packages/common/ontology/src/object/PropertySecurity.ts` | implemented | 185 |
| `./object/Result` | `packages/common/ontology/src/object/Result.ts` | implemented | 154 |
| `./objectSet/BaseObjectSet` | `packages/common/ontology/src/objectSet/BaseObjectSet.ts` | missing | - |
| `./objectSet/ObjectSet` | `packages/common/ontology/src/objectSet/ObjectSet.ts` | missing | - |
| `./objectSet/ObjectSetLinks` | `packages/common/ontology/src/objectSet/ObjectSetLinks.ts` | missing | - |
| `./objectSet/ObjectSetListener` | `packages/common/ontology/src/objectSet/ObjectSetListener.ts` | missing | - |
| `./ontology/ActionDefinition` | `packages/common/ontology/src/ontology/ActionDefinition.ts` | stubbed | 6 |
| `./ontology/InterfaceDefinition` | `packages/common/ontology/src/ontology/InterfaceDefinition.ts` | stubbed | 6 |
| `./ontology/ObjectOrInterface` | `packages/common/ontology/src/ontology/ObjectOrInterface.ts` | stubbed | 12 |
| `./ontology/ObjectSpecifier` | `packages/common/ontology/src/ontology/ObjectSpecifier.ts` | stubbed | 6 |
| `./ontology/ObjectTypeDefinition` | `packages/common/ontology/src/ontology/ObjectTypeDefinition.ts` | implemented | 97 |
| `./ontology/OntologyMetadata` | `packages/common/ontology/src/ontology/OntologyMetadata.ts` | implemented | 23 |
| `./ontology/PrimaryKeyTypes` | `packages/common/ontology/src/ontology/PrimaryKeyTypes.ts` | implemented | 36 |
| `./ontology/QueryDefinition` | `packages/common/ontology/src/ontology/QueryDefinition.ts` | stubbed | 6 |
| `./ontology/SimplePropertyDef` | `packages/common/ontology/src/ontology/SimplePropertyDef.ts` | stubbed | 6 |
| `./ontology/valueFormatting/PropertyBooleanFormattingRule` | `packages/common/ontology/src/ontology/valueFormatting/PropertyBooleanFormattingRule.ts` | implemented | 27 |
| `./ontology/valueFormatting/PropertyDateAndTimestampFormattingRule` | `packages/common/ontology/src/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.ts` | implemented | 174 |
| `./ontology/valueFormatting/PropertyKnownTypeFormattingRule` | `packages/common/ontology/src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.ts` | implemented | 70 |
| `./ontology/valueFormatting/PropertyNumberFormattingRule` | `packages/common/ontology/src/ontology/valueFormatting/PropertyNumberFormattingRule.ts` | implemented | 423 |
| `./ontology/valueFormatting/PropertyValueFormattingRule` | `packages/common/ontology/src/ontology/valueFormatting/PropertyValueFormattingRule.ts` | implemented | 36 |
| `./ontology/valueFormatting/PropertyValueFormattingUtils` | `packages/common/ontology/src/ontology/valueFormatting/PropertyValueFormattingUtils.ts` | implemented | 61 |
| `./ontology/WirePropertyTypes` | `packages/common/ontology/src/ontology/WirePropertyTypes.ts` | implemented | 50 |
| `./OsdkBase` | `packages/common/ontology/src/OntologyBase.ts` | stubbed | 6 |
| `./OsdkObject` | `packages/common/ontology/src/OntologyObject.ts` | stubbed | 6 |
| `./OsdkObjectFrom` | `packages/common/ontology/src/OntologyObjectFrom.ts` | stubbed | 6 |
| `./PageResult` | `packages/common/ontology/src/PageResult.ts` | implemented | 63 |
| `./queries/Aggregations` | `packages/common/ontology/src/queries/Aggregations.ts` | missing | - |
| `./queries/Queries` | `packages/common/ontology/src/queries/Queries.ts` | missing | - |
| `./timeseries/timeseries` | `packages/common/ontology/src/timeseries/timeseries.ts` | missing | - |
| `./util/LinkUtils` | `packages/common/ontology/src/util/LinkUtils.ts` | missing | - |

## Unstable Module Matrix

| Upstream module | Local mapped file | Status | Non-empty lines |
|---|---|---|---:|
| `../experimental/Experiment` | `packages/common/ontology/src/experimental/Experiment.ts` | missing | - |
| `../experimental/createMediaReference` | `packages/common/ontology/src/experimental/createMediaReference.ts` | missing | - |
| `../experimental/fetchOneByRid` | `packages/common/ontology/src/experimental/fetchOneByRid.ts` | missing | - |
| `../experimental/fetchPageByRid` | `packages/common/ontology/src/experimental/fetchPageByRid.ts` | missing | - |
| `../experimental/getBulkLinks` | `packages/common/ontology/src/experimental/getBulkLinks.ts` | missing | - |
| `../objectSet/BulkLinkResult` | `packages/common/ontology/src/objectSet/BulkLinkResult.ts` | missing | - |
| `../objectSet/ObjectSet` | `packages/common/ontology/src/objectSet/ObjectSet.ts` | missing | - |

## Notes

- `packages/common/ontology/src/index.ts` currently exports only `VERSION`; parity in this matrix is source-file presence parity, not public export parity.
- Empty local directories driving most `missing` statuses: `actions`, `aggregate`, `derivedProperties`, `objectSet`, `queries`, `timeseries`, `util`, `experimental`.
- Unstable parity is currently `0/7` implemented and requires a local `public/unstable.ts` surface in later phases.
