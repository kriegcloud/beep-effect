# Integration Architecture Migration

> Migrate third-party integrations from `packages/shared/integrations` to a three-tier architecture: shared infrastructure, IAM-owned token storage, and slice-specific anti-corruption layers.

---

## Purpose

Transform the monolithic integration layer into a composable architecture that separates technical infrastructure, credential management, and domain translation.

**Problem**: Current `packages/shared/integrations` violates architectural boundaries by mixing HTTP client logic, OAuth token management, and domain-specific translation in a single shared package. This creates tight coupling between IAM (auth), consuming slices (calendar, comms, knowledge), and third-party APIs (Gmail, Google Calendar).

**Solution**: Three-tier architecture:
1. **Infrastructure Layer** (`packages/integrations/google-workspace`): OAuth client, HTTP retry logic, common error types
2. **Credential Layer** (IAM): Encrypted token storage, scope expansion flows, revocation
3. **Anti-Corruption Layer** (slice adapters): Domain ↔ Google translation, slice-specific scope declaration

---

## Success Criteria

- [ ] Gmail infrastructure migrated to `packages/integrations/google-workspace/`
- [ ] `IntegrationTokenStore` service created in `packages/iam/server/`
- [ ] Slice-specific adapters created for calendar, comms, knowledge
- [ ] OAuth scope expansion flow implemented (incremental authorization)
- [ ] All existing Gmail actions functional under new architecture
- [ ] Zero cross-slice dependencies from adapters
- [ ] `packages/shared/integrations` deleted after migration
- [ ] Integration tests passing for all three slices

---

## Current State

### Existing Structure (`packages/shared/integrations/src/google/gmail/`)

```
packages/shared/integrations/src/google/gmail/
├── common/
│   ├── GmailClient.ts         # Context.Tag for Gmail API client
│   ├── wrap-gmail-call.ts     # Effect wrapper for API calls
│   └── gmail.schemas.ts       # Request/response schemas
├── actions/
│   ├── layer.ts               # WrapperGroup.toLayer composition
│   ├── get-email/
│   │   ├── contract.ts        # Payload, Success, Wrapper definitions
│   │   └── handler.ts         # Wrapper.implement with wrapGmailCall
│   ├── list-emails/
│   ├── send-email/
│   ├── batch-modify/
│   └── ... (12+ actions total)
└── models/                    # Shared email models
```

### Pattern Used

- **Wrapper pattern**: `contract.ts` → `handler.ts` → `layer.ts` composition
- **GmailClient Context.Tag**: Dependency injection for Gmail API client
- **wrapGmailCall**: Centralized Effect wrapper for API calls with error handling
- **Actions**: get-email, list-emails, send-email, batch-modify, get-thread, list-threads, etc.

### Architectural Smells

1. **Mixed Responsibilities**: Gmail integration mixes infrastructure (HTTP client, token handling) with domain translation (Gmail message → domain email model)
2. **IAM Bypass**: Integration code needs OAuth tokens but has no clean dependency on IAM's token management
3. **Slice Pollution**: Google-specific concepts (message IDs, thread IDs, labels) leak into consuming slices
4. **No Clear Boundary**: `packages/shared` is meant for cross-slice domain concepts, not third-party adapters
5. **Scope Sprawl**: All OAuth scopes requested upfront; no incremental authorization

---

## Target State

### Three-Tier Architecture

```
packages/
├── integrations/                        # NEW TOP-LEVEL SLICE
│   └── google-workspace/                # Google-specific infrastructure
│       ├── domain/
│       │   └── src/
│       │       ├── errors/              # GoogleApiError, RateLimitError, ScopeExpansionRequired
│       │       └── entity-ids/          # GoogleWorkspaceEntityIds (if needed)
│       ├── client/
│       │   └── src/
│       │       ├── GoogleAuthClient.ts     # Context.Tag for OAuth operations
│       │       ├── GoogleHttpClient.ts     # Retry/backoff HTTP wrapper
│       │       └── contracts/              # Scope enums, config schemas
│       └── server/
│           └── src/
│               ├── services/
│               │   └── GoogleAuthService.ts  # Token refresh, scope management
│               └── layers/
│                   └── GoogleWorkspaceLive.ts
│
├── iam/
│   └── server/
│       └── src/
│           └── services/
│               └── IntegrationTokenStore.ts  # OWNS encrypted token storage
│
├── calendar/
│   └── server/
│       └── src/
│           └── adapters/
│               └── GoogleCalendarAdapter.ts  # Calendar-specific ACL
│
├── comms/
│   └── server/
│       └── src/
│           └── adapters/
│               └── GmailAdapter.ts           # Comms-specific ACL
│
└── knowledge/
    └── server/
        └── src/
            └── adapters/
                └── GmailExtractionAdapter.ts  # Knowledge-specific ACL
```

### Layer Responsibilities

| Layer | Owns | Example Components |
|-------|------|-------------------|
| **Infrastructure** (`packages/integrations/google-workspace`) | OAuth client, HTTP retry, common errors | `GoogleAuthClient`, `GoogleHttpClient`, `RateLimitError` |
| **Credential** (`packages/iam/server`) | Encrypted token storage, scope expansion | `IntegrationTokenStore`, `expandScopes()` |
| **Anti-Corruption** (slice adapters) | Domain ↔ Google translation, scope declaration | `GmailAdapter.sendEmail()`, `COMMS_SCOPES` |

### Key Design Decisions

1. **IAM Owns TokenStore**: Centralizes security policy, reuses existing `Account` model for user association
2. **GoogleAuthClient is Interface-Only**: Infrastructure package provides `Context.Tag`; IAM provides token storage dependency
3. **Slice Adapters Declare Scopes**: Each slice declares its required OAuth scopes in adapter constants
4. **Incremental Authorization**: Don't request all scopes upfront; catch `ScopeExpansionRequired` and trigger OAuth flow
5. **No Cross-Slice Dependencies**: Adapters only depend on infrastructure layer and their own slice's domain

---

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) |
|-------|-------|---------|----------|
| **P0** | Scaffolding | README.md, REFLECTION_LOG.md, handoffs/ | doc-writer |
| **P1** | Infrastructure Package | `packages/integrations/google-workspace` | codebase-researcher, effect-code-writer |
| **P2** | Token Storage | `packages/iam/server/services/IntegrationTokenStore.ts` | codebase-researcher, effect-code-writer |
| **P3** | Slice Adapters | Calendar/Comms/Knowledge adapters | effect-code-writer (3x parallel) |
| **P4** | Migration | Move existing Gmail actions to new structure | codebase-researcher, effect-code-writer |
| **P5** | Cleanup | Delete old `packages/shared/integrations` | package-error-fixer |
| **P6** | Verification | Integration tests, verification report | test-writer, code-reviewer |

---

## Detailed Phase Plans

### Phase 1: Infrastructure Package

**Goal**: Create `packages/integrations/google-workspace` with reusable OAuth and HTTP infrastructure.

**Work Items**:
1. Create package structure (`domain`, `client`, `server`)
2. Define error schemas (`GoogleApiError`, `RateLimitError`, `ScopeExpansionRequired`)
3. Implement `GoogleAuthClient` Context.Tag
4. Implement `GoogleHttpClient` with retry/backoff logic
5. Define scope enums and configuration schemas
6. Create `GoogleWorkspaceLive` layer

**Success Criteria**:
- [ ] Package compiles without errors
- [ ] `GoogleAuthClient` exports token refresh interface
- [ ] `GoogleHttpClient` handles rate limiting
- [ ] Error schemas include structured error details

### Phase 2: Token Storage

**Goal**: Create `IntegrationTokenStore` in IAM with encrypted token storage.

**Work Items**:
1. Create `IntegrationTokenStore` service interface
2. Implement encrypted token CRUD operations
3. Add `integration_tokens` table (Drizzle schema)
4. Implement scope expansion detection
5. Create layer composition with IAM dependencies
6. Add integration tests

**Success Criteria**:
- [ ] Tokens stored with encryption at rest
- [ ] Scope expansion triggers OAuth re-consent flow
- [ ] Service accessible via IAM layer
- [ ] Tests verify token lifecycle (store, refresh, revoke)

### Phase 3: Slice Adapters

**Goal**: Create anti-corruption layers for calendar, comms, and knowledge slices.

**Work Items (Parallel)**:

**Calendar Adapter**:
- [ ] `GoogleCalendarAdapter` service
- [ ] `CALENDAR_SCOPES` constant
- [ ] Domain ↔ Google Calendar event translation
- [ ] Layer composition with infrastructure dependency

**Comms Adapter**:
- [ ] `GmailAdapter` service
- [ ] `COMMS_SCOPES` constant (mail.send, mail.readonly)
- [ ] Domain email ↔ Gmail message translation
- [ ] Layer composition with infrastructure dependency

**Knowledge Adapter**:
- [ ] `GmailExtractionAdapter` service
- [ ] `KNOWLEDGE_SCOPES` constant (mail.readonly only)
- [ ] Email extraction for knowledge graph
- [ ] Layer composition with infrastructure dependency

**Success Criteria**:
- [ ] Zero cross-slice dependencies between adapters
- [ ] Each adapter only uses scopes needed for its domain
- [ ] Domain models don't leak Google-specific types

### Phase 4: Migration

**Goal**: Migrate existing 12+ Gmail actions to new adapter structure.

**Work Items**:
1. Audit all actions in `packages/shared/integrations/src/google/gmail/actions/`
2. Map actions to target adapters (comms vs knowledge)
3. Migrate `send-email`, `get-email`, `list-emails` to `GmailAdapter`
4. Migrate extraction-specific actions to `GmailExtractionAdapter`
5. Update action contracts to use new infrastructure errors
6. Update consuming code to use new adapter layers

**Success Criteria**:
- [ ] All 12+ actions functional under new architecture
- [ ] Consuming code in apps/ updated
- [ ] No references to old `packages/shared/integrations` remain

### Phase 5: Cleanup

**Goal**: Remove old integration package.

**Work Items**:
1. Verify zero imports from `packages/shared/integrations`
2. Delete `packages/shared/integrations` directory
3. Remove package from Turborepo configuration
4. Update path aliases in `tsconfig.base.jsonc`

**Success Criteria**:
- [ ] `bun run check` passes
- [ ] No broken imports
- [ ] Package removed from monorepo

### Phase 6: Verification

**Goal**: Validate architecture with integration tests and documentation.

**Work Items**:
1. Create integration tests for each adapter
2. Create end-to-end test (OAuth → send email → verify)
3. Document adapter usage in AGENTS.md files
4. Generate verification report
5. Update architecture documentation

**Success Criteria**:
- [ ] Integration tests passing for all adapters
- [ ] Documentation reflects new architecture
- [ ] Verification report confirms no architectural violations

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **OAuth Token Migration** | Existing tokens in old schema | Create migration script to copy tokens to `integration_tokens` table |
| **Scope Conflicts** | Overlapping scopes between slices | Document scope ownership; IAM manages consolidated scope list |
| **Breaking Changes** | Consumers depend on old integration API | Parallel implementation; swap adapters atomically per slice |
| **Rate Limiting** | Google API quotas during migration | Implement exponential backoff in `GoogleHttpClient` |
| **Test Coverage Gaps** | Integration tests require live Google account | Create mock Google API layer for unit tests |

---

## Complexity Assessment

| Factor | Weight | Score | Calculation |
|--------|--------|-------|-------------|
| Phase Count | ×2 | 6 | 6 phases × 2 = 12 |
| Agent Diversity | ×3 | 5 | 5 agents × 3 = 15 |
| Cross-Package | ×4 | 5 | 5 packages × 4 = 20 |
| External Deps | ×3 | 2 | 2 deps × 3 = 6 |
| Uncertainty | ×5 | 2 | (low - design complete) × 5 = 10 |
| Research Required | ×2 | 1 | (minimal) × 2 = 2 |
| **Total** | | | **65 → Critical** |

**Complexity Rating**: **Critical** (65 points)

This migration qualifies as critical complexity due to:
- Multi-phase execution requiring coordination across 6 distinct phases
- High agent diversity (5 specialized agents with different expertise)
- Cross-package architectural changes spanning 5 packages
- External API integration requiring OAuth token migration
- Low uncertainty (design complete, well-defined target state)

**Implications**:
- Requires careful phase sequencing to avoid breaking changes
- Each phase must complete verification before proceeding
- Token migration requires special attention to data security
- Integration tests critical for validating adapter boundaries

---

## Dependencies

### Intra-Monorepo
- `@beep/iam-domain` - Account model for token association
- `@beep/iam-tables` - Database schema for integration_tokens table
- `@beep/shared-domain` - Error types, base schemas
- `@beep/common-schema` - Schema utilities, transformations

### External
- `googleapis` - Official Google API client
- `@effect/platform-bun` - HTTP client primitives
- `@effect/sql-pg` - Database access for token storage

---

## Reference Documentation

### Internal
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md) - Effect coding standards
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Schema creation, migrations
- [Package Structure](../../documentation/PACKAGE_STRUCTURE.md) - Monorepo layout

### External
- [Google OAuth 2.0 Incremental Authorization](https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth)
- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest)
- [Effect Platform Documentation](https://effect.website/docs/platform/introduction)

---

## Related Specifications

- `specs/knowledge-architecture-foundation/` - Knowledge domain setup (consumer of `GmailExtractionAdapter`)
- `specs/liveblocks-lexical-ai-integration/` - Comms integration patterns (consumer of `GmailAdapter`)

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute overview of the migration workflow.

For detailed orchestration instructions, see [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).
