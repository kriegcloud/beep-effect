# Handoff P0: Spec Scaffolding - Liveblocks Lexical AI Integration

> **Quick Start:** [README.md](../README.md)

---

## Context Header

| Field | Value |
|-------|-------|
| **Date** | 2025-01-29 |
| **From** | Initial Investigation |
| **To** | Phase 1 (Infrastructure Verification) |
| **Status** | Complete |

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,500 tokens | ~2,200 | OK |
| Episodic Memory | 1,500 tokens | ~1,300 | OK |
| Semantic Memory | 800 tokens | ~650 | OK |
| Procedural Memory | 500 tokens | ~400 | OK |
| **Total** | **5,300 tokens** | **~4,550** | **OK (86% utilization)** |

---

## Working Memory (Current Phase)

### Phase 0 Goal

Document the liveblocks-lexical-ai-integration spec scaffolding: problem analysis, scope boundaries, gap identification, and phase structure for completing real API integration.

### Problem Statement

The todox app has **partial** Liveblocks + Lexical + AI integration from `specs/lexical-editor-ai-features` (phases 1-5). The architecture is complete but untethered to real APIs:

- **Auth endpoint** exists but uses mock user database (`_example.ts`)
- **Room pattern mismatch** between auth allowlist (`examples:*`) and provider (`playground:*`)
- **Environment access** uses direct `process.env` instead of typed env
- **Collaborative features** (presence, conflict detection) exist but untested with real Liveblocks

**Core Goal**: Complete integration to enable fully functional real-time collaborative AI:
- Real Liveblocks authentication via JWT
- Real OpenAI streaming for text improvements
- Verified presence broadcasting with user metadata
- Tested conflict detection across browser tabs

### Scope Decisions

#### In Scope

| Area | Scope | Rationale |
|------|-------|-----------|
| **Liveblocks auth** | Wire to real user sessions | Production requirement |
| **Room connection** | Verify WebSocket establishes | Foundation for presence |
| **AI streaming** | Verify OpenAI calls end-to-end | Core feature validation |
| **Presence broadcasting** | Show real user info (name, avatar, color) | Collaborative awareness |
| **Conflict detection** | Test with multiple browser tabs | Safety mechanism |
| **Environment setup** | Verify `LIVEBLOCKS_SECRET_KEY` functional | Infrastructure foundation |

#### Out of Scope

| Area | Reason |
|------|--------|
| New AI features | Only completing existing integration |
| Component refactoring | Existing architecture is sound |
| New Liveblocks features | Focus on AI presence only |
| Database schema changes | No storage changes required |
| New UI components | Bug fixes to existing UI only |
| Mobile optimization | Desktop-first iteration |
| Offline support | Deferred to future work |

### Initial Gap Analysis

| Gap | Current State | Required State | Priority | Impact |
|-----|---------------|----------------|----------|--------|
| **Auth endpoint** | Uses mock users from `_example.ts` | Real session from better-auth | P1 | Blocking |
| **Room pattern** | Auth allows `liveblocks:examples:*` | Must match provider pattern | P1 | Blocking |
| **Environment access** | Direct `process.env` in route | Use `@beep/shared-env` typed access | P1 | High |
| **User resolution** | Mock database with static IDs | Real user service integration | P2 | High |
| **Presence validation** | Untested with real Liveblocks | E2E tested across tabs | P3-P4 | Medium |
| **Error handling** | Basic try/catch | Graceful degradation with telemetry | P5 | Medium |

### Working Components (Verified)

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| Liveblocks auth route | `apps/todox/src/app/api/liveblocks-auth/route.ts` | Exists | Needs real session wiring |
| AI server action | `apps/todox/src/actions/ai.ts` | Working | Streams from OpenAI correctly |
| Collaborative AI hook | `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | Complete | Uses Liveblocks presence API |
| Collaborative panel | `plugins/AiAssistantPlugin/components/CollaborativeFloatingAiPanel.tsx` | Complete | Conflict detection UI ready |
| Room provider | `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` | Wraps RoomProvider | Configures AI presence/storage types |
| Liveblocks config | `apps/todox/liveblocks.config.ts` | Type declarations | Defines presence/storage schema |

### Success Criteria for P0

- [x] Problem statement clearly articulated with blocking vs non-blocking gaps
- [x] Scope boundaries established with in/out rationale
- [x] Gap analysis identifies current vs required state with priority
- [x] Phase structure defined with effort estimates and rationale
- [x] Research sources catalogued with file locations and purposes
- [x] Risk assessment completed with specific mitigations
- [x] Working components verified and documented
- [x] Reference implementation patterns identified
- [x] Known gotchas and edge cases documented
- [x] Decision rationale recorded for each phase

---

## Episodic Memory (Previous Context)

### Reference Implementation Available

The `tmp/nextjs-notion-like-ai-editor/` directory contains production-ready patterns:

**Auth Flow**:
- Route: `app/api/liveblocks-auth/route.ts` (pattern for session validation)
- Resolvers: `app/Providers.tsx` (user/room resolution functions)
- Provider: `app/[pageId]/Room.tsx` (RoomProvider setup with presence types)

**Key Pattern**: Reference uses resolvers for async user/room lookup rather than inline auth logic. This pattern should inform P2 implementation.

**Type Configuration**: `liveblocks.config.ts` shows complete presence/storage schema setup - valuable reference for todox config alignment.

### Previous Spec Learnings

From `specs/lexical-editor-ai-features` (P1-P5):
- Streaming UI patterns are production-ready
- Collaborative hooks properly abstract Liveblocks API
- Conflict detection logic is sound (tested for false positives)
- Floating panel UI handles edge cases well

**Implication**: P1-P4 focuses on "last mile" API wiring, not architecture changes.

---

## Semantic Memory (Project Constants)

### Critical File Locations

| Component | File Path | Status |
|-----------|-----------|--------|
| Auth endpoint | `apps/todox/src/app/api/liveblocks-auth/route.ts` | Needs session integration |
| Mock session helper | `apps/todox/src/app/api/liveblocks-auth/_example.ts` | Template to replace |
| Mock user database | `apps/todox/src/app/api/_database.ts` | Reference for user shape |
| AI action (streaming) | `apps/todox/src/actions/ai.ts` | Working, verify end-to-end |
| Room management | `apps/todox/src/actions/liveblocks.ts` | Server-side utilities |
| Liveblocks utils | `apps/todox/src/utils/liveblocks.ts` | Should use typed env |
| Liveblocks config | `apps/todox/liveblocks.config.ts` | Type declarations |

### Room Provider Setup

| Item | File | Purpose |
|------|------|---------|
| LiveblocksProvider | `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` | Wraps RoomProvider with presence config |
| Presence types | `apps/todox/liveblocks.config.ts` | Defines `AiActivity` presence fields |
| Client action | `apps/todox/src/actions/liveblocks.ts` | `broadcastAiActivity` function |

### Known Gotchas Documented

1. **Room ID Pattern Mismatch** (Blocking P1)
   - Auth allowlist: `liveblocks:examples:*`
   - Provider uses: `liveblocks:playground:*`
   - **Fix**: Align patterns in P1 before proceeding

2. **Mock User Expectations** (P2 dependency)
   - Auth expects `userId` in request body
   - Mock database returns user with shape: `{ id, name, avatar, color }`
   - **Fix**: P2 replaces with real session extraction

3. **Environment Access Pattern** (P1 improvement)
   - Current: `process.env.LIVEBLOCKS_SECRET_KEY` in route
   - Preferred: Use `@beep/shared-env` typed access
   - **Fix**: Migrate to typed env in P1

4. **Resolver Functions Missing** (P2 consideration)
   - Reference impl uses resolvers for user/room lookup
   - Todox may need to add these for async user resolution
   - **Fix**: Evaluate in P2 based on auth integration needs

### Phase Effort Estimates

| Phase | Focus | Sessions | Confidence | Rationale |
|-------|-------|----------|------------|-----------|
| P1 | Infrastructure (auth/room/env) | 1 | High | Isolated, well-defined changes |
| P2 | Real auth integration | 1 | Medium | Depends on better-auth shape |
| P3 | Client wiring & verification | 1 | High | Connecting known-working pieces |
| P4 | E2E testing & edge cases | 1 | Medium | May reveal unexpected issues |
| P5 | Polish & error handling | 0.5 | High | Refinement work |
| **Total** | | **4.5** | **Medium** | |

---

## Procedural Memory (Reference Links)

### Documentation & Standards

- **Effect Patterns**: `.claude/rules/effect-patterns.md` (REQUIRED for implementation)
- **General Rules**: `.claude/rules/general.md` (Architecture boundaries, commands)
- **Behavioral**: `.claude/rules/behavioral.md` (Critical thinking requirements)
- **Project Overview**: `CLAUDE.md` (Tech stack, workflow standards)

### Existing Spec References

| Spec | Purpose | Relevance |
|------|---------|-----------|
| `specs/lexical-editor-ai-features/` | Previous AI features work (P1-P5) | Architecture patterns, component structure |
| `specs/lexical-effect-alignment/` | Effect integration patterns (11 phases) | Future Effect AI migration reference |
| `specs/knowledge-graph-poc-demo/` | Multi-phase handoff patterns | Handoff structure reference |

### External Documentation

| Source | Purpose | URL |
|--------|---------|-----|
| Liveblocks auth docs | Authentication & JWT patterns | https://liveblocks.io/docs/api-reference/rest-api/authorize-user |
| Liveblocks presence | Real-time presence API | https://liveblocks.io/docs/products/presence |
| Vercel AI SDK | Streaming patterns (current) | https://sdk.vercel.ai/docs |
| OpenAI API | Text generation models | https://platform.openai.com/docs/api-reference |

### Research Sources

**Primary Code**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts` - Current auth endpoint
- `apps/todox/liveblocks.config.ts` - Type declarations
- `apps/todox/src/app/lexical/context/LiveblocksProvider.tsx` - Room setup
- `tmp/nextjs-notion-like-ai-editor/` - Reference implementation

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|------------|--------|----------|------------|
| Liveblocks API key invalid/missing | Medium | High | **Critical** | Verify in P1 environment check first |
| Room pattern mismatch causes silent failure | High | High | **Critical** | Test auth + room connection in P1 |
| better-auth session shape incompatible | Low | Medium | High | Pre-research session format in P1 |
| OpenAI key exhausted/invalid | Low | Medium | Medium | Test separately from Liveblocks wiring |
| Streaming latency > 2s | Low | Low | Low | Monitor in P4 E2E tests |

### Process Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|------------|--------|----------|------------|
| Context loss between phases | Medium | Medium | High | Detailed handoffs with code snippets |
| Phase dependencies not honored | Low | High | Medium | Clear P0→P1→P2 dependency chain |
| Mock users inadequate for testing | Low | Low | Low | P2 replaces with real auth |
| Unforeseen edge cases in P4 | Medium | Low | Low | Acceptable - documented in REFLECTION_LOG |

### Risk Mitigation Strategy

**Early Validation** (P1):
- Verify `LIVEBLOCKS_SECRET_KEY` loads correctly
- Test auth endpoint returns valid token with correct shape
- Verify room connection establishes with correct pattern

**Incremental Testing** (P2-P4):
- Each phase has acceptance tests before proceeding
- Manual testing with 2+ browser tabs in P4
- Document any unexpected behavior in REFLECTION_LOG

---

## Phase Structure & Rationale

### Why This Phase Order

| Phase | Focus | Rationale | Duration |
|-------|-------|-----------|----------|
| **P0** | Scaffolding & analysis | Document gaps, establish baseline | Complete |
| **P1** | Infrastructure | Fix blocking issues (auth/room/env) first | 1 session |
| **P2** | Real auth | Replace mocks before UI wiring | 1 session |
| **P3** | Client wiring | Connect UI to real APIs | 1 session |
| **P4** | E2E verification | Test complete flow with edge cases | 1 session |
| **P5** | Polish | Error handling, UX refinement | 0.5 session |

**Key Insight**: Infrastructure-first approach catches blockers early. Auth must work before presence can be tested. Presence must work before conflict detection can be verified.

### Blocking Dependencies

```
P1 (Infra) → P2 (Auth) → P3 (Client) → P4 (E2E) → P5 (Polish)
  ↓           ↓           ↓            ↓
  Fix         Real        Wire         Test
  room/env    session     UI           complete
  pattern     integration             flow
```

**Key Rule**: Do not proceed to next phase until acceptance criteria pass.

---

## Verification Tables

### Decision Points Verified

| Decision | Choice | Rationale | Status |
|----------|--------|-----------|--------|
| Phase count | 5 phases (P0-P4 + P5 polish) | Infrastructure-first, gradual integration | Verified |
| Scope boundary | Auth + Presence only | Focus on foundation, not full collab | Verified |
| Research approach | Reference impl + existing code | Known working patterns available | Verified |
| Risk mitigation | Environment verification first | Catch blockers early in P1 | Verified |
| Implementation order | Room/env → Auth → Client → E2E | Dependency order honored | Verified |

### Success Criteria Checklist

#### P0 Completion (This Document)

- [x] Problem statement clearly defines the gap
- [x] Scope tables show what's in/out with rationale
- [x] Gap analysis identifies current vs required state
- [x] Phase structure documented with effort estimates
- [x] Research sources catalogued with locations
- [x] Risk assessment completed with mitigations
- [x] Working components verified and listed
- [x] Reference implementation patterns identified
- [x] Known gotchas documented (room pattern, mock users, env, resolvers)
- [x] Blocking dependencies identified (auth must work before presence)
- [x] Success criteria for P1 defined in detail

#### Files Created in P0

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Spec overview, phase breakdown, success criteria | Created |
| `QUICK_START.md` | Reference to phase handoffs | Linked |
| `REFLECTION_LOG.md` | Template for phase learnings | Template |
| `handoffs/HANDOFF_P0.md` | This document | Created |
| `handoffs/HANDOFF_P1.md` | Full context for P1 infrastructure | Created |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt | Created |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | P1 orchestration prompt | Created |

---

## Handoff to Phase 1

### Next Steps

Phase 1 should begin with the prompt in `P1_ORCHESTRATOR_PROMPT.md`:

1. **Environment Check** (5 min)
   - Verify `LIVEBLOCKS_SECRET_KEY` exists and loads
   - Verify `OPENAI_API_KEY` exists

2. **Room Pattern Alignment** (10 min)
   - Check auth allowlist pattern
   - Check provider's room pattern
   - Identify mismatch and plan fix

3. **Auth Endpoint Testing** (15 min)
   - Test auth endpoint with mock user
   - Verify token shape matches Liveblocks expectations

4. **Room Connection Test** (10 min)
   - Verify WebSocket establishes
   - Check browser console for Liveblocks errors

5. **Environment Migration** (20 min)
   - Migrate `process.env` to typed env
   - Verify no regression

### Context Handoff Info

**Read for P1 Execution**:
- `handoffs/HANDOFF_P1.md` - Full context and implementation details
- `tmp/nextjs-notion-like-ai-editor/app/api/liveblocks-auth/route.ts` - Auth pattern reference

**Keep Handy**:
- `.claude/rules/effect-patterns.md` - Implementation standards
- `.claude/rules/general.md` - Architecture boundaries

**Blocking Knowledge**:
- Room pattern mismatch is critical blocker
- Auth must use real session before presence works
- Mock users are foundation for early testing

---

## Appendix: Known Issues & Constraints

### Known Gotchas (From Investigation)

1. **Room ID Pattern Mismatch** → Will cause silent failures in presence
2. **Mock User Database** → Limits testing scope but acceptable for P1
3. **Typed Env Missing** → Use `serverEnv` instead of `process.env`
4. **Resolver Functions** → Reference impl uses them; evaluate if needed for todox

### Constraints

- Cannot add new tables (schema frozen)
- Cannot refactor components (architecture complete)
- Must use existing Liveblocks types from config
- Must maintain streaming patterns from P1-P5 of previous spec

### Open Questions for P1

- Will room pattern mismatch require config changes or auth-side fix?
- Does better-auth provide session in expected format?
- Are resolver functions necessary for async user lookup?

---

## Token Usage Summary

| Memory Type | Used | Remaining |
|-------------|------|-----------|
| Working Memory | 2,200 | 300 |
| Episodic Memory | 1,300 | 200 |
| Semantic Memory | 650 | 150 |
| Procedural Memory | 400 | 100 |
| **Total** | **4,550** | **750** |

**Status**: Under budget. 750 tokens available for P1 context additions.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-29
**Maintained By**: Spec Scaffolding Phase
**Next Review**: After P1 completion
