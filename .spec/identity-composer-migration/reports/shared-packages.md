# Identity Composer Migration Report: Shared Packages

## Composer Status
All Shared composers exist in packages.ts: **YES**
- `$SharedDomainId` - shared-domain
- `$SharedServerId` - shared-server
- `$SharedClientId` - shared-client
- `$SharedTablesId` - shared-tables
- `$SharedUiId` - shared-ui

## Files Requiring Migration

### packages/shared/domain/src/Policy.ts
- **Line 79**: `Context.Tag` - Current: `Context.Tag("AuthContext")` → Should be: `Context.Tag($I`AuthContext`)`
- **Line 103**: `Context.Tag` - Current: `Context.Tag("CurrentUser")` → Should be: `Context.Tag($I`CurrentUser`)`

### packages/shared/domain/src/services/EncryptionService/EncryptionService.ts
- **Line 115**: `Context.Tag` - Current: `Context.Tag("@beep/shared-domain/EncryptionService")` → Should be: `Context.Tag($I`EncryptionService`)`

### packages/shared/domain/src/policy/policy-types.ts
- **Line 664**: `S.Class` - Current: `S.Class<RuleStats>("RuleStats")` → Should be: `S.Class<RuleStats>($I`RuleStats`)`
- **Line 1107**: `S.Class` - Current: `S.Class<DecisionResult>("DecisionResult")` → Should be: `S.Class<DecisionResult>($I`DecisionResult`)`

### packages/shared/server/src/factories/db-client/pg/PgClient.ts
- **Line 447**: `Context.Tag` - Current: `Context.Tag("TransactionContext")` → Should be: `Context.Tag($I`TransactionContext`)`

### packages/shared/server/src/rpc/v1/event-stream-hub.ts
- **Line 47**: `Effect.Service` - Current: `Effect.Service<EventStreamHub>()("EventStreamHub", ...)` → Should be: `Effect.Service<EventStreamHub>()($I`EventStreamHub`, ...)`

### packages/shared/server/src/internal/email/adapters/resend/service.ts
- **Line 66**: `Effect.Service` - Current: `Effect.Service<ResendService>()("ResendService", ...)` → Should be: `Effect.Service<ResendService>()($I`ResendService`, ...)`

### packages/shared/server/src/db/repos/UploadSession.repo.ts
- **Line 61**: `S.TaggedError` - Current: `S.TaggedError<UploadSessionRepoError>()("UploadSessionRepoError", ...)` → Should be: `S.TaggedError<UploadSessionRepoError>()($I`UploadSessionRepoError`, ...)`

## Summary
- **Total Files**: 7
- **Context.Tag violations**: 4
- **Effect.Service violations**: 2
- **S.Class violations**: 2
- **S.TaggedError violations**: 1
