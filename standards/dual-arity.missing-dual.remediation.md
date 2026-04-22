# Dual-Arity Remediation Inventory

Generated from `standards/dual-arity.inventory.jsonc` on 2026-04-22.

## Summary

- Candidate findings: 137
- Files: 56
- Owners: 16

## Category Counts

| Category | Count |
| --- | ---: |
| add-dual-2 | 44 |
| objectify-third-param | 31 |
| add-public-dual-signatures | 20 |
| normalize-dual-import | 15 |
| objectify-positional-rest | 15 |
| fix-first-parameter-order | 6 |
| add-dual-3 | 4 |
| fix-dual-arity | 2 |

## Owner Counts

| Owner | Count |
| --- | ---: |
| @beep/nlp | 28 |
| @beep/repo-cli | 24 |
| @beep/observability | 20 |
| @beep/utils | 17 |
| @beep/docgen | 10 |
| @beep/schema | 10 |
| @beep/chalk | 5 |
| @beep/repo-memory-runtime | 5 |
| @beep/shared-domain | 5 |
| @beep/runtime-server | 3 |
| @beep/semantic-web | 3 |
| @beep/repo-utils | 2 |
| @beep/shared-server | 2 |
| @beep/repo-memory-sqlite | 1 |
| @beep/root | 1 |
| @beep/ui | 1 |

## File-Owned Work Queue

| File | Count | Categories |
| --- | ---: | --- |
| packages/common/observability/src/HttpError.ts | 11 | add-dual-2 |
| packages/common/nlp/src/Core/PatternBuilders.ts | 10 | add-public-dual-signatures, objectify-third-param |
| packages/common/utils/src/Str.ts | 10 | normalize-dual-import |
| tooling/docgen/src/Domain.ts | 10 | objectify-positional-rest |
| packages/common/nlp/src/Core/Document.ts | 6 | add-public-dual-signatures, objectify-third-param |
| packages/common/nlp/src/Core/Token.ts | 5 | add-public-dual-signatures |
| packages/common/observability/src/server/HttpApiTelemetry.ts | 4 | add-dual-2, add-dual-3, objectify-positional-rest, objectify-third-param |
| packages/common/utils/src/Array.ts | 4 | normalize-dual-import |
| packages/common/nlp/src/Wink/WinkErrors.ts | 3 | add-dual-2, objectify-third-param |
| packages/common/observability/src/Metric.ts | 3 | fix-first-parameter-order, objectify-third-param |
| packages/common/semantic-web/src/rdf.ts | 3 | add-dual-2, objectify-positional-rest, objectify-third-param |
| packages/repo-memory/runtime/src/internal/QueryPreparation.ts | 3 | add-dual-2, add-dual-3 |
| packages/runtime/server/src/internal/SidecarObservability.ts | 3 | add-dual-2, fix-first-parameter-order |
| packages/shared/domain/src/errors/DbError/utils.ts | 3 | add-dual-2 |
| tooling/cli/src/commands/Docgen/internal/Operations.ts | 3 | add-dual-2 |
| tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts | 3 | add-dual-2, objectify-positional-rest |
| tooling/cli/src/commands/Shared/TsconfigAliasTargets.ts | 3 | add-dual-2, objectify-third-param |
| packages/common/chalk/src/internal/AnsiStyles.ts | 2 | objectify-third-param |
| packages/common/chalk/src/internal/Utilities.ts | 2 | objectify-positional-rest, objectify-third-param |
| packages/common/nlp/src/Core/Sentence.ts | 2 | add-public-dual-signatures, objectify-third-param |
| packages/common/schema/src/internal/yaml.ts | 2 | add-dual-2 |
| packages/common/schema/src/StatusCauseError.ts | 2 | objectify-positional-rest, objectify-third-param |
| packages/common/utils/src/Struct.ts | 2 | objectify-third-param |
| packages/shared/server/src/factories/effect-drizzle/Errors.ts | 2 | add-dual-2, objectify-third-param |
| tooling/cli/src/commands/CreatePackage/ConfigUpdater.ts | 2 | objectify-third-param |
| tooling/cli/src/commands/Shared/DocgenConfig.ts | 2 | add-dual-2, add-dual-3 |
| tooling/cli/src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts | 2 | add-dual-2, objectify-third-param |
| tooling/cli/src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts | 2 | add-dual-2, objectify-third-param |
| packages/common/chalk/src/internal/PublicSurface.ts | 1 | add-dual-2 |
| packages/common/nlp/src/Tools/ToolExport.ts | 1 | objectify-third-param |
| packages/common/nlp/src/Wink/WinkCorpusManager.ts | 1 | objectify-third-param |
| packages/common/observability/src/PhaseProfiler.ts | 1 | fix-first-parameter-order |
| packages/common/observability/src/server/TraceContext.ts | 1 | add-dual-2 |
| packages/common/schema/src/csv/CsvError.ts | 1 | fix-dual-arity |
| packages/common/schema/src/csv/index.ts | 1 | fix-dual-arity |
| packages/common/schema/src/http/headers/Csp.ts | 1 | objectify-third-param |
| packages/common/schema/src/internal/markdown.ts | 1 | objectify-third-param |
| packages/common/schema/src/Thunk.ts | 1 | normalize-dual-import |
| packages/common/schema/src/VariantSchema.ts | 1 | add-dual-2 |
| packages/common/ui/src/hooks/useNumberInput.ts | 1 | objectify-third-param |
| packages/common/utils/src/Text.ts | 1 | objectify-third-param |
| packages/editor/domain/src/Canonical.ts | 1 | objectify-third-param |
| packages/repo-memory/runtime/src/internal/RepoRunServiceShared.ts | 1 | objectify-third-param |
| packages/repo-memory/runtime/src/telemetry/RepoMemoryTelemetry.ts | 1 | objectify-third-param |
| packages/repo-memory/sqlite/src/internal/Telemetry.ts | 1 | add-dual-2 |
| packages/shared/domain/src/entity-ids/_internal/entity-id.ts | 1 | add-dual-2 |
| packages/shared/domain/src/errors/DbError/DbError.ts | 1 | objectify-third-param |
| tooling/cli/src/commands/Codex/internal/CodexSessionStartRuntime.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/Purge.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/Shared/BiomeJson.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/TsconfigSync.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/VersionSync/internal/resolvers/BunResolver.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/VersionSync/internal/resolvers/DockerResolver.ts | 1 | add-dual-2 |
| tooling/cli/src/commands/VersionSync/internal/updaters/PlainTextUpdater.ts | 1 | add-dual-2 |
| tooling/repo-utils/src/errors/DomainError.ts | 1 | fix-first-parameter-order |
| tooling/repo-utils/src/TSMorph/TSMorph.shared.ts | 1 | objectify-third-param |

## Exact Findings

### packages/common/chalk/src/internal/AnsiStyles.ts

- 320:14 `rgbToAnsi256` (exported-const-function, @beep/chalk)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 437:14 `rgbToAnsi` (exported-const-function, @beep/chalk)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/chalk/src/internal/PublicSurface.ts

- 145:14 `makeChalkConstructor` (exported-const-function, @beep/chalk)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/chalk/src/internal/Utilities.ts

- 55:14 `stringReplaceAll` (exported-const-function, @beep/chalk)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 80:14 `stringEncaseCRLFWithFirstIndex` (exported-const-function, @beep/chalk)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest

### packages/common/nlp/src/Core/Document.ts

- 196:19 `Document.getTokensInRange` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 205:19 `Document.getToken` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 213:19 `Document.getTokenByIndex` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 222:19 `Document.getSentence` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 230:19 `Document.getSentenceByIndex` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 239:19 `Document.filterTokens` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures

### packages/common/nlp/src/Core/PatternBuilders.ts

- 266:14 `withMark` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 305:14 `addElements` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 326:14 `prependElements` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 347:14 `withId` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 495:14 `mapElements` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 516:14 `filterElements` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 537:14 `take` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 558:14 `drop` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 579:14 `combine` (exported-const-function, @beep/nlp)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param
- 615:14 `applyPatch` (exported-const-function, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures

### packages/common/nlp/src/Core/Sentence.ts

- 119:19 `Sentence.getTokensInRange` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 128:19 `Sentence.getToken` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures

### packages/common/nlp/src/Core/Token.ts

- 188:19 `Token.containsPosition` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 219:19 `Token.withText` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 224:19 `Token.withPos` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 229:19 `Token.withLemma` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures
- 237:19 `Token.withStopWordFlag` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual-signatures
  - Suggested solution: add-public-dual-signatures

### packages/common/nlp/src/Tools/ToolExport.ts

- 104:19 `ExportedToolError.fromCause` (static-function-property, @beep/nlp)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/nlp/src/Wink/WinkCorpusManager.ts

- 280:19 `CorpusManagerError.fromCause` (static-function-property, @beep/nlp)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/nlp/src/Wink/WinkErrors.ts

- 49:10 `WinkEngineError.fromCause` (static-method, @beep/nlp)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 91:10 `WinkTokenizationError.fromCause` (static-method, @beep/nlp)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 134:10 `WinkEntityError.fromCause` (static-method, @beep/nlp)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/observability/src/HttpError.ts

- 442:14 `makeBadRequestError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 458:14 `makeUnauthorizedError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 474:14 `makeForbiddenError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 490:14 `makeNotFoundError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 506:14 `makeConflictError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 522:14 `makeUnprocessableEntityError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 541:14 `makeTooManyRequestsError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 557:14 `makeInternalServerError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 576:14 `makeBadGatewayError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 592:14 `makeServiceUnavailableError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 611:14 `makeGatewayTimeoutError` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/observability/src/Metric.ts

- 129:14 `trackDuration` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 181:14 `observeWorkflow` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual, obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order
- 263:14 `observeHttpRequest` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual, obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order

### packages/common/observability/src/PhaseProfiler.ts

- 184:14 `profilePhase` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual, obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order

### packages/common/observability/src/server/HttpApiTelemetry.ts

- 222:14 `makeHttpApiTelemetryDescriptor` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-3
- 252:14 `httpApiFailureStatus` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 295:14 `observeHttpApiEffect` (exported-const-function, @beep/observability)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 417:14 `observeHttpApiHandler` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/observability/src/server/TraceContext.ts

- 68:14 `withIncomingTraceContext` (exported-const-function, @beep/observability)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/schema/src/csv/CsvError.ts

- 42:14 `csvError` (exported-const-function, @beep/schema)
  - Diagnostics: invalid-dual-arity
  - Suggested solution: fix-dual-arity

### packages/common/schema/src/csv/index.ts

- 268:14 `CSV` (exported-const-function, @beep/schema)
  - Diagnostics: invalid-dual-arity
  - Suggested solution: fix-dual-arity

### packages/common/schema/src/http/headers/Csp.ts

- 103:14 `createDirectiveValue` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/schema/src/internal/markdown.ts

- 106:14 `makeParseMarkdownForSchema` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/schema/src/internal/yaml.ts

- 72:14 `makeParseYaml` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 83:14 `makeParseYamlForSchema` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/schema/src/StatusCauseError.ts

- 57:14 `statusCauseInput` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual, third-param-not-object-like, obvious-wrong-first-parameter
  - Suggested solution: objectify-third-param
- 142:14 `makeStatusCauseError` (exported-const-function, @beep/schema)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest

### packages/common/schema/src/Thunk.ts

- 131:14 `make` (exported-const-function, @beep/schema)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import

### packages/common/schema/src/VariantSchema.ts

- 609:14 `Overridable` (exported-const-function, @beep/schema)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/semantic-web/src/rdf.ts

- 726:14 `makeLiteral` (exported-const-function, @beep/semantic-web)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 756:14 `makeQuad` (exported-const-function, @beep/semantic-web)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 882:14 `areDatasetsEquivalent` (exported-const-function, @beep/semantic-web)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/common/ui/src/hooks/useNumberInput.ts

- 354:14 `getStepFactor` (exported-const-function, @beep/ui)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/utils/src/Array.ts

- 122:14 `mapNonEmpty` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 158:14 `flatMapNonEmpty` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 196:14 `mapNonEmptyReadonly` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 240:14 `flatMapNonEmptyReadonly` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import

### packages/common/utils/src/Str.ts

- 36:14 `prefix` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 72:14 `prefixThunk` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 107:14 `postfix` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 144:14 `postfixThunk` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 181:14 `mapPrefix` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 227:14 `mapPostfix` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 467:14 `startsWith` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 509:14 `endsWith` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 551:14 `contains` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import
- 592:14 `repeat` (exported-const-function, @beep/utils)
  - Diagnostics: invalid-dual-source
  - Suggested solution: normalize-dual-import

### packages/common/utils/src/Struct.ts

- 219:14 `mapPath` (exported-const-function, @beep/utils)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param
- 293:14 `mapPathLazy` (exported-const-function, @beep/utils)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/common/utils/src/Text.ts

- 53:14 `formatNameWithAliases` (exported-const-function, @beep/utils)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/editor/domain/src/Canonical.ts

- 691:14 `makeRevisionRecord` (exported-const-function, @beep/root)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/repo-memory/runtime/src/internal/QueryPreparation.ts

- 844:14 `findSymbolMatches` (exported-const-function, @beep/repo-memory-runtime)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-3
- 1025:14 `selectImporterEdges` (exported-const-function, @beep/repo-memory-runtime)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 1100:14 `searchKeywordMatches` (exported-const-function, @beep/repo-memory-runtime)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-3

### packages/repo-memory/runtime/src/internal/RepoRunServiceShared.ts

- 91:14 `toRunServiceError` (exported-const-function, @beep/repo-memory-runtime)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/repo-memory/runtime/src/telemetry/RepoMemoryTelemetry.ts

- 427:14 `profileRunPhase` (exported-const-function, @beep/repo-memory-runtime)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/repo-memory/sqlite/src/internal/Telemetry.ts

- 41:14 `observeDriverOperation` (exported-const-function, @beep/repo-memory-sqlite)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/runtime/server/src/internal/SidecarObservability.ts

- 124:14 `observeHttpRequest` (exported-const-function, @beep/runtime-server)
  - Diagnostics: missing-dual, obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order
- 167:14 `provideSidecarObservability` (exported-const-function, @beep/runtime-server)
  - Diagnostics: missing-dual, obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order
- 220:14 `observeRunLifecycle` (exported-const-function, @beep/runtime-server)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/shared/domain/src/entity-ids/_internal/entity-id.ts

- 222:14 `make` (exported-const-function, @beep/shared-domain)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/shared/domain/src/errors/DbError/DbError.ts

- 88:19 `DbError.format` (static-function-property, @beep/shared-domain)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### packages/shared/domain/src/errors/DbError/utils.ts

- 373:14 `formatParam` (exported-const-function, @beep/shared-domain)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 458:14 `padEnd` (exported-const-function, @beep/shared-domain)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 483:14 `formatParamsBlock` (exported-const-function, @beep/shared-domain)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### packages/shared/server/src/factories/effect-drizzle/Errors.ts

- 282:14 `effectDrizzleQueryErrorFromUnknown` (exported-const-function, @beep/shared-server)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 360:14 `getQueryFailureMessage` (exported-const-function, @beep/shared-server)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Codex/internal/CodexSessionStartRuntime.ts

- 127:14 `buildCodexSessionStartContext` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/CreatePackage/ConfigUpdater.ts

- 611:14 `updateRootConfigs` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 640:14 `checkConfigNeedsUpdate` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### tooling/cli/src/commands/Docgen/internal/Operations.ts

- 912:14 `createDocgenConfigDocument` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 998:14 `resolveDocgenWorkspacePackage` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 1080:14 `generateAnalysisReport` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts

- 247:14 `proxyErrorResponse` (exported-const-function, @beep/repo-cli)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 277:14 `proxyHealthResponse` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 560:14 `makeGraphitiProxyQueueService` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Purge.ts

- 190:14 `purgeAtRoot` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Shared/BiomeJson.ts

- 41:14 `renderBiomeJson` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Shared/DocgenConfig.ts

- 285:14 `buildDocgenAliasSource` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-3
- 416:14 `mergeManagedDocgenConfig` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/Shared/TsconfigAliasTargets.ts

- 121:14 `resolveSubpathExportTarget` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 160:14 `buildCanonicalAliasTargets` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 200:14 `buildDocgenAliasTargets` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### tooling/cli/src/commands/TsconfigSync.ts

- 1619:14 `syncTsconfigAtRoot` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/VersionSync/internal/resolvers/BunResolver.ts

- 279:14 `resolveBunVersions` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/VersionSync/internal/resolvers/DockerResolver.ts

- 324:14 `resolveDockerImages` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts

- 33:14 `updatePackageManagerField` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2
- 86:14 `updateCatalogEntry` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param

### tooling/cli/src/commands/VersionSync/internal/updaters/PlainTextUpdater.ts

- 20:14 `updatePlainTextFile` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/cli/src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts

- 45:14 `updateYamlValue` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual, third-param-not-object-like
  - Suggested solution: objectify-third-param
- 99:14 `replaceNodeVersionWithFile` (exported-const-function, @beep/repo-cli)
  - Diagnostics: missing-dual
  - Suggested solution: add-dual-2

### tooling/docgen/src/Domain.ts

- 87:10 `Doc.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 157:10 `DocEntry.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 197:10 `Class.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 247:10 `Interface.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 281:10 `Function.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 315:10 `TypeAlias.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 349:10 `Constant.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 393:10 `Export.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 433:10 `Namespace.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest
- 494:10 `Module.new` (static-method, @beep/docgen)
  - Diagnostics: too-many-positional-params
  - Suggested solution: objectify-positional-rest

### tooling/repo-utils/src/errors/DomainError.ts

- 45:19 `DomainError.newCause` (static-function-property, @beep/repo-utils)
  - Diagnostics: obvious-wrong-first-parameter
  - Suggested solution: fix-first-parameter-order

### tooling/repo-utils/src/TSMorph/TSMorph.shared.ts

- 213:14 `makeKeywords` (exported-const-function, @beep/repo-utils)
  - Diagnostics: third-param-not-object-like
  - Suggested solution: objectify-third-param
