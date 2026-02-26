# P0 Module Dependency Order

## Scope and Evidence

- Upstream dependency evidence root: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src`
- Local readiness evidence root: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src`
- Import-edge anchors used for ordering:
  - `ontology/ObjectTypeDefinition.ts` imports `OsdkMetadata`, `ObjectOrInterface`, `PrimaryKeyTypes`, `PropertyValueFormattingRule`, `VersionString`, `WirePropertyTypes`.
  - `aggregate/WhereClause.ts` imports ontology core (`ObjectOrInterface`, `ObjectTypeDefinition`, `SimplePropertyDef`, `WirePropertyTypes`) and `OsdkObjectFrom`.
  - `objectSet/ObjectSet.ts` imports `aggregate/*`, `derivedProperties/*`, `object/*`, `ontology/*`, `OsdkBase`, `OsdkObjectFrom`, `PageResult`, and `util/LinkUtils`.

## Dependency-Ordered Cluster Plan

| Order | Cluster | Locked phase alignment | Why this order |
|---|---|---|---|
| 1 | Foundation primitives: `Logger`, `PageResult`, `object/Attachment`, `object/Media`, `object/Result`, `ontology/{OntologyMetadata,PrimaryKeyTypes,WirePropertyTypes,VersionString}`, `ontology/valueFormatting/*`, `mapping/{DurationMapping,DataValueMapping}`, `timeseries/timeseries`, `OsdkMetadata`, `OsdkObjectPrimaryKeyType`, `util/IncludeValuesExtending` | P2 | Lowest fan-in building blocks; downstream ontology and query layers import these directly. |
| 2 | Ontology core + compile-time metadata: `SimplePropertyDef`, `InterfaceDefinition`, `ObjectTypeDefinition`, `ObjectOrInterface`, `ObjectSpecifier`, `ActionDefinition`, `QueryDefinition`, `mapping/PropertyValueMapping`, `OsdkObject`, `Definitions`, `object/FetchPageArgs` | P3 | Core type graph required by aggregate/query/object-set modules. |
| 3 | Aggregate/groupby/query primitives: `aggregate/*`, `groupby/{GroupByMapper,GroupByClause}`, `queries/Aggregations` | P4 | Depends on P3 object metadata and property definitions; required by object set APIs. |
| 4 | ObjectSet + Osdk core + actions/queries + derived properties: `OsdkBase`, `objectSet/*`, `definitions/LinkDefinitions`, `derivedProperties/*`, `actions/*`, `queries/Queries`, `object/FetchPageResult`, `OsdkObjectFrom`, `util/LinkUtils` | P5 | Highest dependency density; consumes ontology core and aggregate stack together. |
| 5 | Public surface + unstable + aliases: `index.ts`, `public/unstable.ts`, `experimental/*`, alias bridges (`OntologyBase`, `OntologyObject`, `OntologyObjectFrom`, `OntologyObjectPrimaryKey`, `definitions/LinkDefinition`) | P6 | Composition/finalization layer; must sit last because it re-exports all previous clusters. |

## SCC / Hard-Cycle Notes

1. Ontology core SCC: `SimplePropertyDef <-> InterfaceDefinition <-> ObjectOrInterface <-> ObjectTypeDefinition`.
2. Groupby pair SCC: `GroupByClause <-> GroupByMapper`.
3. High-coupling P4/P5 cluster: `aggregate/WhereClause`, `aggregate/GeoFilter`, `derivedProperties/*`, `objectSet/ObjectSet*`, `definitions/LinkDefinitions`, `OsdkObjectFrom`, and `object/FetchPageResult` are tightly interdependent.

## Execution Guardrails

1. Treat P3 ontology core SCC as one coordinated delivery unit; do not split across partial PRs.
2. Do not start P5 until P4 query/aggregate contracts are compile-stable.
3. Keep P6 export wiring strictly after stable implementation parity; unstable entrypoint is a finalization step.
4. Preserve alias compatibility while converging module names to upstream parity (`groupBy` vs `groupby`, singular/plural `LinkDefinition(s)`).
