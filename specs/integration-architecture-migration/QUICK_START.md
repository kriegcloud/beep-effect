# Integration Architecture Migration: Quick Start

5-minute guide to executing this specification.

---

## Goal

Migrate Gmail integration from `packages/shared/integrations` to three-tier architecture:

**Tier 1**: Shared infrastructure (`packages/integrations/google-workspace`)
**Tier 2**: Slice-specific adapters (`packages/{calendar,comms,knowledge}/server/adapters`)
**Tier 3**: Token management (`packages/iam/server/services/IntegrationTokenStore.ts`)

---

## Current State vs Target State

| Current | Target |
|---------|--------|
| Mixed infrastructure + domain logic in `packages/shared/integrations` | Clean separation: infra → adapters → domain |
| No token store | IAM-owned `IntegrationTokenStore` service |
| Direct Gmail SDK usage in slices | Slice adapters translate Gmail concepts to domain concepts |

**Why**: Security policy centralization (IAM owns tokens), infrastructure reuse (OAuth/HTTP shared), domain isolation (no Google concepts leak into business logic).

---

## Phase Execution Map

| Phase | Task | Agent | Status |
|-------|------|-------|--------|
| **P0** | Scaffolding | doc-writer | ✅ Complete |
| **P1a** | Domain Package | effect-code-writer | Ready |
| **P1b** | Client/Server Packages | effect-code-writer | Blocked by P1a |
| **P2** | Token Store | effect-code-writer | Blocked by P1b |
| **P3** | Slice Adapters | effect-code-writer ×3 | Blocked by P2 |
| **P4** | Migration | effect-code-writer | Blocked by P3 |
| **P5** | Cleanup | general-purpose | Blocked by P4 |
| **P6** | Verification | package-error-fixer | Blocked by P5 |

### Phase Details

| Phase | Task | Output | Time |
|-------|------|--------|------|
| **P1a** | Domain schemas and entity IDs | `@beep/integrations-google-workspace-domain` package | 20min |
| **P1b** | Infrastructure services | OAuth client, HTTP client, Gmail service | 45min |
| **P2** | Token Store | Token CRUD, encryption, refresh logic in IAM | 30min |
| **P3a** | Calendar adapter | `GmailToCalendarAdapter` in `packages/calendar/server/adapters` | 30min |
| **P3b** | Comms adapter | `GmailToCommsAdapter` in `packages/comms/server/adapters` | 30min |
| **P3c** | Knowledge adapter | `GmailToKnowledgeAdapter` in `packages/knowledge/server/adapters` | 30min |
| **P4** | Migration | Update slice services to use adapters | 45min |
| **P5** | Cleanup | Remove old `packages/shared/integrations/gmail` | 15min |
| **P6** | Verification | `bun run check`, `bun run test` | 30min |

**Total Estimated Time**: 4.75 hours

---

## How to Start Phase 1a

**Phase 1 is split into two sub-phases to establish foundational types before building infrastructure:**

### Phase 1a: Domain Package (Start Here)

1. Open `AGENT_PROMPTS.md`
2. Find "Phase 1a: Domain Package"
3. Copy the prompt
4. Pass it to the `effect-code-writer` agent
5. Agent creates `packages/integrations/google-workspace/domain/` with:
   - `src/entity-ids.ts` (branded IDs)
   - `src/schemas/` (domain schemas)
   - Tests in `test/`

### Phase 1b: Infrastructure Package (After P1a)

1. Open `AGENT_PROMPTS.md`
2. Find "Phase 1b: Client/Server Packages"
3. Copy the prompt
4. Pass it to the `effect-code-writer` agent
5. Agent creates:
   - `packages/integrations/google-workspace/client/` (OAuth, HTTP clients)
   - `packages/integrations/google-workspace/server/` (Gmail service)
   - Tests in each package's `test/` directory

---

## Verification at Each Phase

After EVERY phase:

```bash
bun run check --filter @beep/[package-name]
bun run test --filter @beep/[package-name]
```

If errors appear in upstream dependencies (unrelated to your changes), isolate verification:

```bash
bun tsc --noEmit path/to/your/file.ts
```

See `CLAUDE.md` section "Isolating Changes from Pre-existing Errors".

### Phase Completion Checklist

After completing EVERY phase, verify these items:

#### Gates
- [ ] `bun run check --filter @beep/[package]` passes
- [ ] `bun run test --filter @beep/[package]` passes (if tests exist)

#### Documentation
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] HANDOFF_P[N+1].md created with full context
- [ ] P[N+1]_ORCHESTRATOR_PROMPT.md created (copy-paste ready)

#### Verification
- [ ] All success criteria from phase spec met
- [ ] No new TypeScript errors introduced
- [ ] Output file created in outputs/ directory

**A phase is NOT complete until ALL items are checked.**

---

## Critical Architectural Rules

1. **Token ownership**: ONLY `IntegrationTokenStore` (IAM) accesses credentials
2. **No Google concepts in slices**: Adapters translate `gmail.Message` → `CalendarEvent` / `EmailMessage` / `Knowledge.Entity`
3. **Infrastructure reuse**: OAuth/HTTP clients in Tier 1, NOT duplicated per slice
4. **Layer composition**: Slices depend on `@beep/integrations-google-workspace`, NOT vice versa

---

## When You're Stuck

1. **Architecture questions**: See architecture decision rationale in `README.md` (Section: "Why Three Tiers?")
2. **Effect patterns**: Consult `.claude/rules/effect-patterns.md`
3. **Testing**: Use `@beep/testkit` patterns from `.claude/commands/patterns/effect-testing-patterns.md`
4. **Precedent**: Check `tooling/cli/src/commands/create-slice/handler.ts` for canonical Effect patterns

---

## Session Handoffs

Each phase produces a handoff document in `handoffs/HANDOFF_P[N].md`:

- **What was accomplished**
- **Remaining work**
- **Blockers / decisions needed**
- **Notes for next agent**

Update `REFLECTION_LOG.md` after each phase to capture learnings.

---

## Success Criteria

- [ ] `packages/integrations/google-workspace/domain/` created with entity IDs and schemas (P1a)
- [ ] `packages/integrations/google-workspace/client/` and `server/` created with OAuth/HTTP/Gmail services (P1b)
- [ ] `IntegrationTokenStore` in IAM slice handles token lifecycle (P2)
- [ ] Adapters in 3 slices (calendar, comms, knowledge) translate Gmail → domain (P3)
- [ ] Old `packages/shared/integrations/gmail/` removed (P5)
- [ ] All tests passing: `bun run test` (P6)
- [ ] Type-check passing: `bun run check` (P6)
- [ ] No Google SDK direct imports in slice domain/server layers (P6)

---

## Next Steps

1. Read `AGENT_PROMPTS.md` to get phase-specific prompts
2. Start Phase 1a (Domain Package) with `effect-code-writer` agent
3. After P1a completes, proceed to Phase 1b (Client/Server Packages)
4. After each phase, update `REFLECTION_LOG.md` with learnings
5. Create handoff document in `handoffs/` before switching agents or phases
