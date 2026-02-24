# Verified Entity Inventory

**Status:** Verified by Research Agents
**Date:** 2026-02-11
**Total Entities:** 58 (56 requiring migration, 2 already canonical)

## Changes from Original Spec

- **Entity Count Confirmed:** 58 total entities (original spec estimated ~60)
  - 2 entities already canonical (Knowledge: Batch, Extraction)
  - 56 entities requiring migration
- **IAM Repos Confirmed CRUD-Only:** All 20 IAM entities use CRUD-only repos with zero custom extensions
  - 4 IAM entities (OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken) have NO server repo
- **Knowledge Entities Already PascalCase:** No renaming needed for Knowledge slice (19 entities)
- **Documents Mixed State:** 2 canonical, 3 partial, 3 bare (detailed below)

## Entity Counts by Slice

| Slice | Total | Canonical | Partial | Bare | Naming | Need Rename |
|-------|-------|-----------|---------|------|--------|-------------|
| Shared | 8 | 0 | 0 | 8 | kebab-case | Yes |
| IAM | 20 | 0 | 0 | 20 | kebab-case | Yes |
| Documents | 8 | 2 | 3 | 3 | Mixed | 5 entities |
| Knowledge | 19 | 0 | 0 | 19 | PascalCase | No |
| Calendar | 1 | 0 | 0 | 1 | kebab-case | Yes |
| Comms | 1 | 0 | 0 | 1 | kebab-case | Yes |
| Customization | 1 | 0 | 0 | 1 | kebab-case | Yes |
| **TOTAL** | **58** | **2** | **3** | **53** | | |

## Identity Builders by Slice

All slices have identity builders available in `@beep/identity/packages`:

| Slice | Builder | Import Path |
|-------|---------|-------------|
| IAM | `$IamDomainId` | `@beep/identity/packages` |
| Documents | `$DocumentsDomainId` | `@beep/identity/packages` |
| Shared | `$SharedDomainId` | `@beep/identity/packages` |
| Customization | `$CustomizationDomainId` | `@beep/identity/packages` |
| Comms | `$CommsDomainId` | `@beep/identity/packages` |
| Calendar | `$CalendarDomainId` | `@beep/identity/packages` |
| Knowledge | `$KnowledgeDomainId` | `@beep/identity/packages` |

## EntityIds by Slice

### IAM EntityIds

Source: `IamEntityIds` in `@beep/shared-domain`

- AccountId
- ScimProviderId
- ApiKeyId
- InvitationId
- JwksId
- MemberId
- PasskeyId
- RateLimitId
- SsoProviderId
- SubscriptionId
- TeamMemberId
- TwoFactorId
- VerificationId
- WalletAddressId
- OrganizationRoleId
- DeviceCodeId
- OAuthClientId
- OAuthAccessTokenId
- OAuthRefreshTokenId
- OAuthConsentId

### Shared EntityIds

Source: `SharedEntityIds` in `@beep/shared-domain`

- OrganizationId
- TeamId
- FileId
- AuditLogId
- UserId
- SessionId
- FolderId
- UploadSessionId
- AgentId

### Documents EntityIds

Source: `DocumentsEntityIds` in `@beep/shared-domain`

- DocumentId
- DocumentVersionId
- DocumentSourceId
- DiscussionId
- CommentId
- DocumentFileId
- PageId
- PageShareId

### Calendar EntityIds

Source: `CalendarEntityIds` in `@beep/shared-domain`

- CalendarEventId

### Comms EntityIds

Source: `CommsEntityIds` in `@beep/shared-domain`

- EmailTemplateId

### Customization EntityIds

Source: `CustomizationEntityIds` in `@beep/shared-domain`

- UserHotkeyId

### Knowledge EntityIds

Source: `KnowledgeEntityIds` in `@beep/shared-domain`

- EmbeddingId
- KnowledgeEntityId
- RelationId
- OntologyId
- ExtractionId
- MentionId
- MentionRecordId
- MergeHistoryId
- ClassDefinitionId
- PropertyDefinitionId
- EntityClusterId
- SameAsLinkId
- WorkflowExecutionId
- WorkflowActivityId
- WorkflowSignalId
- BatchExecutionId
- KnowledgeAgentId
- RelationEvidenceId
- MeetingPrepBulletId
- MeetingPrepEvidenceId
- EmailThreadId
- EmailThreadMessageId

## Wave Classifications

### Wave 1: Simple Entities (23 entities)

**Criteria:** CRUD-only repos (or no repo), no custom methods, no complex dependencies

#### IAM (20 entities)

All kebab-case, require rename to PascalCase.
All repos are CRUD-only (zero custom extensions verified).

| Entity | EntityId | Server Repo | Notes |
|--------|----------|-------------|-------|
| Account | AccountId | CRUD only | |
| ApiKey | ApiKeyId | CRUD only | |
| DeviceCode | DeviceCodeId | CRUD only | Has schemas/device-code-status.schema.ts |
| Invitation | InvitationId | CRUD only | Has schemas/invitation-status.schema.ts |
| Jwks | JwksId | CRUD only | |
| Member | MemberId | CRUD only | Has schemas/member-status.schema.ts, schemas/member-role.schema.ts |
| OAuthAccessToken | OAuthAccessTokenId | None | No server repo |
| OAuthClient | OAuthClientId | None | No server repo |
| OAuthConsent | OAuthConsentId | None | No server repo |
| OAuthRefreshToken | OAuthRefreshTokenId | None | No server repo |
| OrganizationRole | OrganizationRoleId | CRUD only | |
| Passkey | PasskeyId | CRUD only | Has schemas/authenticator-attachment.schema.ts |
| RateLimit | RateLimitId | CRUD only | |
| ScimProvider | ScimProviderId | CRUD only | |
| SsoProvider | SsoProviderId | CRUD only | |
| Subscription | SubscriptionId | CRUD only | |
| TeamMember | TeamMemberId | CRUD only | |
| TwoFactor | TwoFactorId | CRUD only | |
| Verification | VerificationId | CRUD only | |
| WalletAddress | WalletAddressId | CRUD only | |

#### Other Slices (3 entities)

| Slice | Entity | EntityId | Server Repo | Naming |
|-------|--------|----------|-------------|--------|
| Calendar | CalendarEvent | CalendarEventId | CRUD only | kebab-case |
| Comms | EmailTemplate | EmailTemplateId | CRUD only | kebab-case |
| Customization | UserHotkey | UserHotkeyId | CRUD only | kebab-case |

### Wave 2: Medium Entities (14 entities)

**Criteria:** Custom repo methods, cross-slice repos, or complex return types

#### Shared (8 entities)

All kebab-case, require rename to PascalCase.

| Entity | EntityId | Server Repo Location | Complexity |
|--------|----------|---------------------|------------|
| User | UserId | IAM server (cross-slice) | CRUD only, has schemas/user-role.schema.ts, user.constants.ts |
| Organization | OrganizationId | IAM server (cross-slice) | CRUD only, has schemas/OrganizationType.schema.ts, SubscriptionTier.schema.ts, SubscriptionStatus.schema.ts |
| Session | SessionId | IAM server (cross-slice) | CRUD only |
| Team | TeamId | IAM server (cross-slice) | CRUD only, has team.policy.ts (empty, consider removing) |
| File | FileId | Shared server | 4 custom methods: listPaginated (complex return type), moveFiles, deleteFiles, getFilesByKeys; has schemas/upload-key.schema.ts |
| Folder | FolderId | Shared server | 1 custom method: deleteFolders; has schemas/with-uploaded-files.schema.ts |
| UploadSession | UploadSessionId | Shared server | 5 custom methods: store, findByFileKey, deleteByFileKey, deleteExpired, isValid; custom error type; has schemas/upload-session-metadata.schema.ts |
| AuditLog | AuditLogId | None | No repo exists |

**Note:** User, Organization, Session, Team repos live in IAM server but are CRUD-only (no custom methods).

#### Documents (6 entities)

| Entity | EntityId | Current Naming | Status | Complexity |
|--------|----------|----------------|--------|------------|
| Discussion | DiscussionId | kebab-case | Partial | 7 custom methods: findByIdOrFail, getWithComments, listByDocument, create, resolve, unresolve, hardDelete; custom return type (DiscussionWithCommentsSchema); legacy inline RPC |
| Document | DocumentId | kebab-case | Partial | 13 custom methods: findByIdOrFail, search, listByUser, list, listArchived, listChildren, archive, restore, publish, unpublish, lock, unlock, hardDelete; custom return type (SearchResultSchema); legacy inline RPC |
| DocumentVersion | DocumentVersionId | kebab-case | Partial | 5 custom methods: findByIdOrFail, getWithAuthor, listByDocument, createSnapshot, hardDelete; custom return type (VersionWithAuthorSchema); legacy inline RPC |
| DocumentFile | DocumentFileId | kebab-case | Bare | 5 custom methods: findByIdOrFail, listByDocument, listByUser, create, hardDelete; custom error |
| DocumentSource | DocumentSourceId | kebab-case | Bare | 1 custom method: findByMappingKey |
| PageShare | PageShareId | PascalCase | Bare | No repo |

**Note:** Discussion, Document, DocumentVersion are PARTIAL (have errors.ts + rpc.ts, need contracts refactor).

### Wave 3: Complex Entities (19 entities)

**Criteria:** Knowledge slice entities with complex repo methods, custom types, or no renaming needed

All Knowledge entities already use PascalCase. No renaming required.

#### With Custom Repo Methods (11 entities)

| Entity | EntityId | Custom Methods | Notes |
|--------|----------|----------------|-------|
| Entity | KnowledgeEntityId | 5 methods | findByIds, findByOntology, findByType, countByOrganization, findByNormalizedText |
| EntityCluster | EntityClusterId | 5 methods | findByCanonicalEntity, findByMember, findByOntology, findHighCohesion, deleteByOntology |
| Embedding | EmbeddingId | 4 methods | findByCacheKey, findSimilar, findByEntityType, deleteByEntityIdPrefix; custom SimilarityResult type |
| Relation | RelationId | 5 methods | findBySourceIds, findByTargetIds, findByEntityIds, findByPredicate, countByOrganization |
| SameAsLink | SameAsLinkId | 7 methods | findByCanonical, findByMember, resolveCanonical, findHighConfidence, findBySource, deleteByCanonical, countMembers; recursive CTE |
| Mention | MentionId | 3 methods | findByEntityId, findByIds, findByDocumentId |
| MentionRecord | MentionRecordId | 4 methods | findByExtractionId, findByResolvedEntityId, findUnresolved, updateResolvedEntityId |
| MergeHistory | MergeHistoryId | 4 methods | findByTargetEntity, findBySourceEntity, findByUser, findByOrganization |
| RelationEvidence | RelationEvidenceId | 3 methods | findByRelationId, findByIds, searchByText |
| MeetingPrepBullet | MeetingPrepBulletId | 1 method | listByMeetingPrepId |
| MeetingPrepEvidence | MeetingPrepEvidenceId | 1 method | listByBulletId |

#### CRUD Only (3 entities)

| Entity | EntityId | Notes |
|--------|----------|-------|
| Ontology | OntologyId | CRUD only |
| ClassDefinition | ClassDefinitionId | CRUD only |
| PropertyDefinition | PropertyDefinitionId | CRUD only |

#### No Server Repo (5 entities)

| Entity | EntityId | Notes |
|--------|----------|-------|
| Batch | BatchExecutionId | No repo; already canonical |
| Extraction | ExtractionId | No repo; already canonical |
| EmailThread | EmailThreadId | No repo |
| EmailThreadMessage | EmailThreadMessageId | No repo |
| Agent | KnowledgeAgentId | No repo; Model file is KnowledgeAgent.model.ts |

## Agent Batch Assignments

### Wave 1 (Phase 2) — 4 Agents

**Agent 1 (iam-batch-1):** 5 entities
- Account
- ApiKey
- DeviceCode
- Invitation
- Jwks

**Agent 2 (iam-batch-2):** 5 entities
- Member
- OrganizationRole
- Passkey
- RateLimit
- ScimProvider

**Agent 3 (iam-batch-3):** 6 entities
- SsoProvider
- Subscription
- TeamMember
- TwoFactor
- Verification
- WalletAddress

**Agent 4 (simple-batch):** 7 entities
- OAuthAccessToken
- OAuthClient
- OAuthConsent
- OAuthRefreshToken
- CalendarEvent
- EmailTemplate
- UserHotkey

### Wave 2 (Phase 3) — 4 Agents

**Agent 1 (shared-iam-repos):** 4 entities
- User
- Organization
- Session
- Team

Note: Cross-slice repos in IAM server, all CRUD-only

**Agent 2 (shared-server-repos):** 4 entities
- File
- Folder
- UploadSession
- AuditLog

**Agent 3 (documents-batch-1):** 2 entities
- Discussion (7 custom methods + legacy RPC)
- PageShare

**Agent 4 (documents-batch-2):** 4 entities
- Document (13 custom methods + legacy RPC)
- DocumentVersion (5 custom methods + legacy RPC)
- DocumentFile (5 custom methods)
- DocumentSource (1 custom method)

### Wave 3 (Phase 4) — 5 Agents

**Agent 1 (knowledge-complex-1):** 2 entities
- Entity (5 methods)
- EntityCluster (5 methods)

**Agent 2 (knowledge-complex-2):** 2 entities
- Embedding (4 methods + SimilarityResult)
- Relation (5 methods)

**Agent 3 (knowledge-complex-3):** 2 entities
- SameAsLink (7 methods + recursive CTE)
- MergeHistory (4 methods)

**Agent 4 (knowledge-medium):** 3 entities
- Mention (3 methods)
- MentionRecord (4 methods)
- RelationEvidence (3 methods)

**Agent 5 (knowledge-simple):** 10 entities
- Ontology (CRUD)
- ClassDefinition (CRUD)
- PropertyDefinition (CRUD)
- MeetingPrepBullet (1 method)
- MeetingPrepEvidence (1 method)
- Batch (no repo)
- Extraction (no repo)
- EmailThread (no repo)
- EmailThreadMessage (no repo)
- Agent/KnowledgeAgent (no repo)

## Entities with Extra Files to Preserve

These entities have additional schema files or constants that must be preserved during migration.

| Entity | Slice | Extra Files | Notes |
|--------|-------|-------------|-------|
| file | shared | schemas/upload-key.schema.ts | |
| folder | shared | schemas/with-uploaded-files.schema.ts | |
| organization | shared | schemas/OrganizationType.schema.ts, schemas/SubscriptionTier.schema.ts, schemas/SubscriptionStatus.schema.ts | |
| upload-session | shared | schemas/upload-session-metadata.schema.ts | |
| user | shared | schemas/user-role.schema.ts, user.constants.ts | |
| team | shared | team.policy.ts | Empty file — consider removing |
| device-code | iam | schemas/device-code-status.schema.ts | |
| invitation | iam | schemas/invitation-status.schema.ts | |
| member | iam | schemas/member-status.schema.ts, schemas/member-role.schema.ts | |
| passkey | iam | schemas/authenticator-attachment.schema.ts | |
| Agent | knowledge | KnowledgeAgent.model.ts | Model file has KnowledgeAgent prefix, not Agent |

## Custom Return Types to Define in Contracts

These custom types are currently defined inline in repo methods and must be extracted to contracts.

| Type | Source Repo | Description | Fields |
|------|------------|-------------|--------|
| SimilarityResult | EmbeddingRepo | Search result with similarity score | id, entityType, entityId, contentText (optional), similarity |
| DiscussionWithCommentsSchema | DiscussionRepo | Discussion with author and comments | Discussion + author + comments[] with authors |
| VersionWithAuthorSchema | DocumentVersionRepo | Version with author details | Version + author{id, _rowId, name, image} |
| SearchResultSchema | DocumentRepo | Search result with rank | id, _rowId, title, content, rank |
| ResolveCanonicalResult | SameAsLinkRepo | Canonical entity ID from recursive CTE | canonical_id |
| ListPaginatedOutput | FileRepo | Paginated file listing | rootFiles, folders, total, offset, limit, hasNext |

## Migration Priority Order

1. **Wave 1 (Simple):** IAM entities + Calendar/Comms/Customization
   - Reason: CRUD-only, no dependencies, largest volume
2. **Wave 2 (Medium):** Shared + Documents entities
   - Reason: Cross-slice repos, custom methods, partial entities need contract extraction
3. **Wave 3 (Complex):** Knowledge entities
   - Reason: Already PascalCase, complex repo methods, custom types, recursive CTEs

## Verification Notes

- All repo method counts verified by direct inspection
- All EntityId imports verified in `@beep/shared-domain`
- Identity builders verified in `@beep/identity/packages`
- Cross-slice repo locations verified (User, Organization, Session, Team in IAM server)
- Legacy RPC patterns identified in Documents partial entities (Discussion, Document, DocumentVersion)
- Empty team.policy.ts file flagged for potential removal
