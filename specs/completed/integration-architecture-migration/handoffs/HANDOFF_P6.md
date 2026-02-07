# Handoff P6: Final Verification & Documentation

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,000 | OK |
| Episodic Memory | 1,000 tokens | ~500 | OK |
| Semantic Memory | 500 tokens | ~300 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~1,800** | **OK** |

---

## Working Memory (Current Phase)

### Phase 6 Goal

Finalize the integration architecture migration with comprehensive verification and documentation updates.

### Deliverables

1. **Update Verification Outputs**:
   - Complete `outputs/P3-adapters-verification.md`
   - Complete `outputs/P4-migration-verification.md`
   - Complete `outputs/P5-cleanup-verification.md`

2. **Update Spec README**:
   - Mark all success criteria as complete
   - Update phase status table

3. **Documentation Updates**:
   - Update slice AGENTS.md files with adapter usage
   - Update runtime server documentation
   - Add integration examples

4. **Final Architecture Review**:
   - Verify no cross-slice dependencies
   - Confirm layer composition is correct
   - Document any architectural decisions

### Success Criteria

- [ ] All verification output files complete with actual results
- [ ] Spec README success criteria all checked
- [ ] AGENTS.md files updated for affected packages
- [ ] No architectural violations detected
- [ ] REFLECTION_LOG.md updated with final learnings

---

## Episodic Memory (Phase 5 Summary)

### Expected Phase 5 Results

Phase 5 should have:
1. Verified no imports from old package
2. Deleted `packages/shared/integrations` (~70 files)
3. Cleaned up any configuration references
4. Verified build passes

### Migration Complete State

After P5, the codebase should have:

**New Structure (created in P1-P4):**
```
packages/integrations/google-workspace/
├── domain/    # GoogleOAuthToken, errors, scopes
├── client/    # GoogleAuthClient interface
└── server/    # GoogleAuthClientLive

packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts
packages/comms/server/src/adapters/GmailAdapter.ts
packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts

packages/runtime/server/src/GoogleWorkspace.layer.ts
```

**Old Structure (deleted in P5):**
```
packages/shared/integrations/  # DELETED
```

---

## Semantic Memory (Architecture Context)

### Final Layer Composition

```
HttpRouter.layer
  └── ProtectedRoutes
       ├── Rpc.layer
       └── GoogleWorkspace.layer (requires AuthContext)
            ├── CalendarAdapterLayer
            │    └── GoogleCalendarAdapterLive
            ├── GmailAdapterLayer
            │    └── GmailAdapterLive
            └── GmailExtractionAdapterLayer
                 └── GmailExtractionAdapterLive
                      └── GoogleAuthClientLive ← AuthContext.oauth
                      └── FetchHttpClient.layer
```

### Dependency Boundaries

| Package | Can Import From | Cannot Import From |
|---------|----------------|-------------------|
| `@beep/calendar-server` | `@beep/google-workspace-client`, `@beep/google-workspace-domain` | `@beep/iam-server`, other slices |
| `@beep/comms-server` | `@beep/google-workspace-client`, `@beep/google-workspace-domain` | `@beep/iam-server`, other slices |
| `@beep/knowledge-server` | `@beep/google-workspace-client`, `@beep/google-workspace-domain` | `@beep/iam-server`, other slices |
| `@beep/google-workspace-server` | `@beep/shared-domain/Policy` (AuthContext) | `@beep/iam-server` |

---

## Procedural Memory (How-To References)

### Verification Commands
```bash
# Full monorepo check
bun run check
bun run build
bun run test

# Specific package checks
bun run check --filter @beep/runtime-server
bun run check --filter @beep/calendar-server
bun run check --filter @beep/comms-server
bun run check --filter @beep/knowledge-server
```

### Architecture Verification
```bash
# Check for cross-slice imports
Grep: "from.*@beep/iam-server" path:packages/calendar
Grep: "from.*@beep/iam-server" path:packages/comms
Grep: "from.*@beep/iam-server" path:packages/knowledge
Grep: "from.*@beep/iam-server" path:packages/integrations
```

---

## Phase 6 Execution Plan

### Step 1: Update Verification Outputs (Agent)

**Agent**: `doc-writer`

Complete the verification output files with actual results:

1. `outputs/P3-adapters-verification.md` - Document adapter creation
2. `outputs/P4-migration-verification.md` - Document runtime wiring
3. `outputs/P5-cleanup-verification.md` - Document cleanup results

### Step 2: Update Spec README (Orchestrator)

Update success criteria in `README.md`:
- [ ] → [x] for completed items
- Update phase status table

### Step 3: Update AGENTS.md Files (Agent)

**Agent**: `doc-writer`

Add adapter usage examples to:
- `packages/calendar/server/AGENTS.md`
- `packages/comms/server/AGENTS.md`
- `packages/knowledge/server/AGENTS.md`
- `packages/runtime/server/AGENTS.md`

### Step 4: Final Architecture Review (Agent)

**Agent**: `architecture-pattern-enforcer`

Verify:
- No cross-slice dependencies from adapters
- Layer composition follows patterns
- No circular dependencies

### Step 5: Update REFLECTION_LOG (Orchestrator)

Add final learnings to `REFLECTION_LOG.md`:
- What worked well
- What could be improved
- Patterns to replicate

---

## Documentation Templates

### Adapter Usage Example (for AGENTS.md)

```markdown
## Google Workspace Adapters

### Using GoogleCalendarAdapter

```typescript
import { GoogleCalendarAdapter } from "@beep/calendar-server/adapters";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";

const program = Effect.gen(function* () {
  const calendar = yield* GoogleCalendarAdapter;

  const events = yield* calendar.listEvents(
    "primary",
    DateTime.unsafeNow(),
    DateTime.add(DateTime.unsafeNow(), { days: 7 })
  );

  return events;
});
```

### Error Handling

```typescript
import { GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";

const program = Effect.gen(function* () {
  const calendar = yield* GoogleCalendarAdapter;
  const events = yield* calendar.listEvents("primary", start, end);
  return events;
}).pipe(
  Effect.catchTag("GoogleScopeExpansionRequiredError", (error) =>
    // Redirect user to OAuth consent with expanded scopes
    Effect.fail(new NeedOAuthConsentError({ scopes: error.requiredScopes }))
  )
);
```
```

---

## Verification Checklist

Final verification:

- [ ] All verification outputs complete
- [ ] Spec README success criteria all [x]
- [ ] AGENTS.md files updated
- [ ] No cross-slice dependencies
- [ ] No circular dependencies
- [ ] REFLECTION_LOG.md updated
- [ ] `bun run check` passes
- [ ] `bun run test` passes

---

## Spec Completion

After Phase 6, the spec is **COMPLETE**.

The integration architecture migration has successfully:
1. Created three-tier architecture (infrastructure, auth context, ACL)
2. Implemented slice-specific adapters
3. Wired adapters into runtime
4. Created integration tests
5. Cleaned up old package
6. Updated documentation

Mark spec as complete in `specs/README.md`.
