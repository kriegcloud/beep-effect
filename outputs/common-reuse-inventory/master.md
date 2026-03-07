# Common Reuse Inventory

Baseline status:
- `bun run check`: passed before edits
- `bun run lint`: passed before edits
- `bun run test`: passed before edits

Current repo-wide validation:
- `bun run check`: passed after this rollout
- `bun run test`: passed after this rollout
- `bun run lint`: blocked by pre-existing `lint:jsdoc` source-resolution issues in `packages/common/data/src/index.ts` and sibling source files that still import relative `.js` specifiers from the TypeScript source tree

Current inventory status:
- Existing reuse items tracked: 51
- New shared-helper candidates tracked: 33
- Migrated items: 46
- Remaining discovered items: 37
- Blocked items: 1
- Swarm status: mixed; successful for many package scopes, supplemented by direct package-local audits where explorer threads stalled

Confirmed clear packages so far:
- `apps/web`
- `apps/desktop`
- `packages/_internal/db-admin`
- `packages/shared/client`
- `packages/shared/env`
- `packages/shared/providers`
- `packages/shared/server`
- `packages/shared/tables`
- `packages/shared/ui`
- `packages/repo-memory/store reuse`
- `packages/shared/domain extract`
- `packages/runtime/server reuse`

Applied existing reuse items in this rollout:
- `tooling/cli/src/commands/Laws/index.ts:120-121` -> `@beep/utils Text.splitCommaSeparatedTrimmed`
- `tooling/cli/src/commands/Codegen.ts:166` -> `@beep/utils thunkUndefined`
- `tooling/cli/src/commands/Codegen.ts:207-218` -> `@beep/utils Text.joinLines`
- `tooling/cli/src/commands/CreatePackage/TemplateService.ts:115-118` -> `@beep/utils Str.camelCase / Str.pascalCase / Str.kebabCase / Str.snakeCase`
- `tooling/cli/src/commands/CreatePackage/Handler.ts:101-105` -> `@beep/schema LiteralKit`
- `tooling/cli/src/commands/VersionSync/internal/services/UpdateApplierService.ts:21-25` -> `@beep/schema LiteralKit`
- `tooling/cli/src/commands/Laws/EffectImports.ts:26-36` -> `@beep/utils thunkSomeFalse / thunkFalse / thunkSomeEmptyArray / thunkEmptyArray`
- `tooling/cli/src/commands/Laws/TerseEffect.ts:26-36` -> `@beep/utils thunkSomeFalse / thunkFalse / thunkSomeEmptyArray / thunkEmptyArray`
- `tooling/cli/src/commands/Agents/index.ts:26-28` -> `@beep/utils thunkSomeFalse / thunkFalse`
- `tooling/cli/src/commands/VersionSync/internal/Models.ts:324-327` -> `@beep/utils thunkSomeFalse / thunkFalse`
- `tooling/cli/src/commands/VersionSync/internal/resolvers/DockerResolver.ts:332` -> `@beep/utils thunkFalse`
- `tooling/cli/src/commands/DocsAggregate.ts:62-71` -> `@beep/utils thunkFalse`
- `tooling/cli/src/commands/DocsAggregate.ts:165` -> `@beep/utils thunkUndefined`
- `packages/shared/domain/src/errors/DbError/utils.ts:285` -> `@beep/utils Text.joinLines`
- `packages/shared/domain/src/errors/DbError/utils.ts:408` -> `@beep/utils Text.joinLines`
- `packages/shared/domain/src/errors/DbError/utils.ts:704` -> `@beep/utils Text.joinLines`
- `packages/repo-memory/model/src/internal/domain.ts:433` -> `@beep/schema ArrayOfStrings`
- `packages/repo-memory/model/src/internal/domain.ts:455` -> `@beep/schema ArrayOfStrings`
- `packages/shared/domain/src/entity-ids/internal/entity-id.ts:18` -> `@beep/schema/Sql/Constants CONSTANTS.INT32_MAX`
- `packages/shared/domain/src/errors/DbError/utils.ts:354` -> `@beep/utils Str.repeat`
- `packages/runtime/protocol/test/RuntimeProtocol.test.ts:10-11` -> `@beep/utils Struct.dotGet`
- `packages/repo-memory/runtime/src/retrieval/GroundedRetrieval.ts:40` -> `@beep/utils Str.isNonEmpty`
- `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts:55` -> `@beep/utils Str.isNonEmpty`
- `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts:985-989` -> `@beep/utils Text.joinLines`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:521` -> `@beep/utils thunkEffectSucceedNone<RepoSymbolDocumentation>`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:674` -> `@beep/utils thunkEffectSucceedNone<RepoRun>`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:797` -> `@beep/utils thunkEffectSucceedNone<RepoIndexArtifact>`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:832` -> `@beep/utils thunkEffectSucceedNone<RepoSourceSnapshot>`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:863` -> `@beep/utils thunk0`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:1184` -> `@beep/utils thunkEffectSucceedNull`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:1337` -> `@beep/utils thunkEffectSucceedNone<RetrievalPacket>`
- `packages/ai/sdk/src/core/internal/credentials.ts:3-15` -> `@beep/utils Text.joinLines`
- `packages/ai/sdk/src/core/Sandbox/SandboxCloudflare.ts:133` -> `@beep/utils Text.joinLines`
- `packages/ai/sdk/src/core/internal/ConfigTransforms.ts:61-65` -> `@beep/utils Struct.fromEntries`
- `packages/ai/sdk/src/core/AgentSdkConfig.ts:230-231` -> `@beep/utils Struct.fromEntries`
- `packages/ai/sdk/src/core/Logging/Match.ts:9-10` -> `@beep/utils Struct.entries / Struct.fromEntries`
- `tooling/configs/src/internal/eslint/EffectLawsAllowlistSchemas.ts:14` -> `@beep/schema ArrayOfStrings`

Applied new shared helpers in this rollout:
- `packages/repo-memory/client/src/index.ts:31-41` -> `@beep/schema StatusCauseFields / makeStatusCauseError`
- `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts:181-186` -> `@beep/schema StatusCauseFields / makeStatusCauseError`
- `packages/repo-memory/sqlite/src/internal/RepoMemorySql.ts:269-274` -> `@beep/schema StatusCauseFields / makeStatusCauseError`
- `tooling/cli/src/commands/TsconfigSync.ts:122-155` -> `@beep/schema PosixPath / NativePathToPosixPath / normalizePath`
- `tooling/cli/src/commands/CreatePackage/FileGenerationPlanService.ts:218-243` -> `@beep/schema PosixPath / NativePathToPosixPath / normalizePath`
- `packages/repo-memory/store/src/RepoStoreError.ts:13-17` -> `@beep/schema StatusCauseFields / makeStatusCauseError`
- `tooling/configs/src/eslint/Shared.ts:4-34` -> `@beep/schema PosixPath / NativePathToPosixPath / normalizePath`
- `tooling/codegraph/src/Domain/Domain.errors.ts:83-95` -> `@beep/schema SeverityLevel`
- `tooling/codegraph/src/Graph/Nodes.model.ts:68-83` -> `@beep/schema SeverityLevel`

Blocked existing reuse items:
- `packages/repo-memory/model/src/internal/domain.ts:154-158` -> `@beep/schema LiteralKit(RepoRunStatus.pickOptions(["completed", "failed", "interrupted"] as const))`

Remaining high-value new shared-helper candidates:
- `packages/repo-memory/model/src/internal/domain.ts:172-184` -> `@beep/schema SourceFileSpan`
- `packages/repo-memory/model/src/internal/domain.ts:211-408` -> `@beep/schema JSDocSchemas`
- `packages/repo-memory/model/src/internal/protocolModels.ts:133-302` -> `@beep/schema makeTaggedEventClass`
- `packages/ai/sdk/src/core/internal/schemaToZod.ts:13-273` -> `@beep/schema SchemaToZod`
- `packages/ai/sdk/src/core/experimental/RateLimiter.ts:24-184` -> `@beep/utils RateLimiter`
- `packages/ai/sdk/src/core/Sync/EventLogRemoteServer.ts:62-89` -> `@beep/utils SocketAddress`
- `packages/ai/sdk/test/effect-test.ts:7-31` -> `@beep/utils EffectTest`
- `packages/repo-memory/runtime/src/telemetry/RepoMemoryTelemetry.ts:226-237` -> `@beep/utils measureElapsedMillis`
- `packages/repo-memory/sqlite/src/internal/Telemetry.ts:1-66` -> `@beep/utils observeOutcomeDuration`
- `packages/runtime/server/src/index.ts:74-84` -> `@beep/utils normalizeBindableHost`
- `packages/runtime/server/src/index.ts:159-172` -> `@beep/utils messageFromUnknown`
- `packages/runtime/protocol/src/index.ts:67-119` -> `@beep/schema makeHttpStatusPayload`
- `tooling/cli/src/commands/Shared/SchemaCodecs/JsoncCodecs.ts:24-128` -> `@beep/schema decodeJsoncTextAs / JsoncTextToUnknown`
- `tooling/cli/src/commands/Shared/SchemaCodecs/YamlCodecs.ts:18-110` -> `@beep/schema decodeYamlTextAs / YamlTextToUnknown`
- `tooling/cli/src/commands/Shared/TsconfigAliasTargets.ts:12-102` -> `@beep/utils resolveRootExportTarget / buildCanonicalAliasTargets`
- `tooling/codegraph/src/Config/Config.models.ts:24-55` -> `@beep/schema defaultedString / defaultedBoolean / defaultedPositiveInt / defaultedArray / taggedWithDecodingDefault`
- `tooling/codegraph/src/Config/Config.models.ts:563-585` -> `SchemaDefaults.defaultedClassInstance`
- `tooling/codegraph/src/Config/Config.models.ts:239-245` -> `TaggedUnionBuilder.fromLiteralMembers`
- `tooling/codegraph/src/Graph/Nodes.model.ts:524-551` -> `TaggedUnionBuilder.fromLiteralMembers`
- `tooling/codegraph/src/Graph/Edges.model.ts:497-529` -> `TaggedUnionBuilder.fromLiteralMembers`
- `tooling/codegraph/src/Domain/Domain.errors.ts:103-348` -> `DomainErrorFactory.defineTaggedContextError`
- `tooling/configs/src/internal/eslint/EffectLawsAllowlistSchemas.ts:61-67` -> `packages/common/schema/unsupportedEncode.ts`
- `tooling/configs/src/eslint/NoNativeRuntimeRule.ts:41-59` -> `packages/common/eslint/hotspotRuntimeFiles.ts`
- `tooling/configs/test/eslint-rules.test.ts:15-128` -> `packages/common/eslint-test/makeSingleRuleFlatConfig.ts`

Machine-readable details live in [items.json](./items.json).
