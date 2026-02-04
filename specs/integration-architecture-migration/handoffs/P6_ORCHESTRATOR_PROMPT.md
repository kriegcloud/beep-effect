# P6 Orchestrator Prompt: Final Verification & Documentation

Copy this prompt to start Phase 6 execution.

---

## Mission

Finalize the integration architecture migration with comprehensive verification and documentation updates.

**Primary Deliverables:**
1. Complete all verification output files
2. Update spec README with success criteria
3. Update AGENTS.md files for affected packages
4. Final architecture review
5. Update REFLECTION_LOG with learnings

**Success Criteria:**
- All documentation complete and accurate
- No architectural violations
- Spec marked as complete

---

## Context from Previous Phases

### Phase 1-2: Infrastructure

Created `packages/integrations/google-workspace/` with:
- `domain/`: `GoogleOAuthToken`, `GoogleApiError`, `GoogleAuthenticationError`, `GoogleScopeExpansionRequiredError`, `CalendarScopes`, `GmailScopes`
- `client/`: `GoogleAuthClient` Context.Tag interface
- `server/`: `GoogleAuthClientLive` Layer (depends on `AuthContext.oauth`)

Extended `@beep/shared-domain/Policy` with:
- `OAuthApi` type with `getAccessToken`, `getProviderAccount` methods
- `AuthContext.oauth` property

### Phase 3: Slice Adapters

Created adapters in slice server packages:
- `GoogleCalendarAdapter` in `@beep/calendar-server`
- `GmailAdapter` in `@beep/comms-server`
- `GmailExtractionAdapter` in `@beep/knowledge-server`

Each adapter:
- Declares its required OAuth scopes
- Depends on `GoogleAuthClient` and `HttpClient.HttpClient`
- Translates between domain types and Google API types

### Phase 4: Runtime Wiring

Created `packages/runtime/server/src/GoogleWorkspace.layer.ts`:
- Composes all three adapters with their dependencies
- Wired into `ProtectedRoutes` in `HttpRouter.layer.ts`

Created integration tests:
- `packages/calendar/server/test/adapters/GoogleCalendarAdapter.test.ts` (10 tests)
- `packages/comms/server/test/adapters/GmailAdapter.test.ts` (15 tests)
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (14 tests)

### Phase 5: Cleanup (Expected)

Deleted `packages/shared/integrations/` (~70 files).

---

## Step-by-Step Execution Plan

### Step 1: Update Verification Outputs (Agent)

**Agent**: `doc-writer`

**Prompt**:
```
Update the verification output files for the integration-architecture-migration spec.

<contextualization>
The migration is complete. Update these files with actual results:
- outputs/P3-adapters-verification.md
- outputs/P4-migration-verification.md
- outputs/P5-cleanup-verification.md
</contextualization>

For each file:
1. Mark checklist items as complete [x]
2. Add actual file paths created/modified
3. Add verification command results
4. Note any deviations from plan
```

### Step 2: Update Spec README (Orchestrator)

Update `specs/integration-architecture-migration/README.md`:

Change success criteria from [ ] to [x]:
```markdown
## Success Criteria

- [x] Gmail infrastructure migrated to `packages/integrations/google-workspace/`
- [x] `AuthContext` extended with OAuth API in `@beep/shared-domain/Policy`
- [x] Slice-specific adapters created for calendar, comms, knowledge
- [x] OAuth scope expansion flow implemented (incremental authorization)
- [x] All existing Gmail actions functional under new architecture
- [x] Zero cross-slice dependencies from adapters
- [x] `packages/shared/integrations` deleted after migration
- [x] Integration tests passing for all three slices
```

### Step 3: Update AGENTS.md Files (Agent)

**Agent**: `doc-writer`

**Prompt**:
```
Add Google Workspace adapter documentation to slice AGENTS.md files.

<contextualization>
Add usage examples for:
- packages/calendar/server/AGENTS.md - GoogleCalendarAdapter usage
- packages/comms/server/AGENTS.md - GmailAdapter usage
- packages/knowledge/server/AGENTS.md - GmailExtractionAdapter usage
- packages/runtime/server/AGENTS.md - GoogleWorkspace.layer composition
</contextualization>

Include:
1. Import statements
2. Basic usage example
3. Error handling pattern for GoogleScopeExpansionRequiredError
4. Required scopes for each adapter
```

### Step 4: Architecture Review (Agent)

**Agent**: `architecture-pattern-enforcer`

**Prompt**:
```
Review the integration architecture migration for architectural violations.

<contextualization>
Check these packages for violations:
- packages/calendar/server - should not import from @beep/iam-server
- packages/comms/server - should not import from @beep/iam-server
- packages/knowledge/server - should not import from @beep/iam-server
- packages/integrations/google-workspace - should only use @beep/shared-domain/Policy
</contextualization>

Verify:
1. No cross-slice dependencies between adapters
2. Adapters only depend on shared domain and google-workspace packages
3. No circular dependencies introduced
4. Layer composition follows Effect patterns
```

### Step 5: Update REFLECTION_LOG (Orchestrator)

Add final entry to `specs/integration-architecture-migration/REFLECTION_LOG.md`:

```markdown
## Phase 6: Final Verification (Date)

### What Worked Well
- Three-tier architecture cleanly separates concerns
- AuthContext.oauth bridges IAM and integrations without tight coupling
- Slice-specific adapters allow per-slice scope requirements
- Layer composition makes dependencies explicit

### Learnings
- Better Auth's built-in token storage eliminated need for custom token table
- GoogleAuthClientLive captures AuthContext at construction, not per-call
- Mock GoogleAuthClient pattern works well for testing

### Patterns to Replicate
- Infrastructure → Auth Context → ACL pattern for external integrations
- Scope declaration as adapter constants
- Integration tests with mock auth client and HTTP client
```

### Step 6: Mark Spec Complete

Update `specs/README.md` to mark this spec as complete.

---

## Verification Commands

```bash
# Full verification
bun run check
bun run build
bun run test

# Architecture checks
Grep: "from.*@beep/iam-server" path:packages/calendar
Grep: "from.*@beep/iam-server" path:packages/comms
Grep: "from.*@beep/iam-server" path:packages/knowledge
Grep: "from.*@beep/iam-server" path:packages/integrations

# Confirm old package deleted
ls packages/shared/integrations  # Should fail with "not found"
```

---

## Documentation Checklist

- [ ] `outputs/P3-adapters-verification.md` complete
- [ ] `outputs/P4-migration-verification.md` complete
- [ ] `outputs/P5-cleanup-verification.md` complete
- [ ] `README.md` success criteria all [x]
- [ ] `REFLECTION_LOG.md` updated
- [ ] `packages/calendar/server/AGENTS.md` updated
- [ ] `packages/comms/server/AGENTS.md` updated
- [ ] `packages/knowledge/server/AGENTS.md` updated
- [ ] `packages/runtime/server/AGENTS.md` updated
- [ ] `specs/README.md` marks spec complete

---

## Spec Completion Criteria

The spec is complete when:
1. All verification outputs have actual results
2. All README success criteria are checked
3. AGENTS.md files document adapter usage
4. Architecture review shows no violations
5. REFLECTION_LOG has final learnings
6. `specs/README.md` marks spec complete

**Final Status**: COMPLETE ✓
