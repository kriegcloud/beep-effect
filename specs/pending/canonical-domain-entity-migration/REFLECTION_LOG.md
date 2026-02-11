# Reflection Log: canonical-domain-entity-migration

> Cumulative learnings across all phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** -- Techniques that were effective
2. **What Didn't Work** -- Approaches that failed or were inefficient
3. **Methodology Improvements** -- Changes to apply in future phases
4. **Prompt Refinements** -- Updated prompts based on learnings
5. **Codebase-Specific Insights** -- Patterns unique to this repo

---

## Pre-Phase Notes

- Canonical pattern established by Comment (5 contracts) and Page (16 contracts) entities in `@beep/documents-domain`
- The `canonical-domain-entity` skill in `.claude/skills/` documents the exact pattern with complete code examples
- 56 entities remain to be migrated across 7 slices (58 total, 2 already canonical)
- IAM slice has 20 entities but all are CRUD-only stubs -- fastest batch, ideal for Wave 1
- Knowledge slice has the most complex repos with custom SQL extensions -- deferred to Wave 3
- Knowledge repos use older `Context.Tag` + `Layer.effect` pattern for server implementations; domain contracts should still use the canonical `Context.Tag($I\`Repo\`)` pattern regardless
- Some entities (OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, AuditLog, Batch, Extraction, EmailThread, EmailThreadMessage, Agent) have no server repos -- still create full module structure with empty repo extensions
- User/Organization/Session/Team domain models live in `packages/shared/domain/` but their server repos live in `packages/iam/server/` -- agents working on these entities must read repos from a different package
- Discussion and Document have legacy inline RPC definitions that must be dismantled and rebuilt as separate contract files
- DocumentFile and DocumentSource are bare models that need new contracts based on server repo custom methods
- The `db-repo-standardization` spec (now completed) established `DbRepo.DbRepoSuccess` and `DbRepo.Method` patterns that this spec builds on
- Swarm mode (TeamCreate + parallel agents) was successfully used in the db-repo-standardization spec with 4 parallel agents -- optimal for ~193 change sites across 20 files
- Embedding exact before/after code in agent prompts produces one-pass mechanical execution with zero errors (lesson from db-repo-standardization P5)
- Identity builders per slice: `$SharedDomainId`, `$IamDomainId`, `$DocumentsDomainId`, `$KnowledgeDomainId`, `$CalendarDomainId`, `$CommsDomainId`, `$CustomizationDomainId` (all from `@beep/identity/packages`)
- Directory/file naming is currently split: IAM, Shared, Calendar, Comms, Customization use kebab-case; Knowledge and Documents canonical use PascalCase. Migration will standardize everything to PascalCase.
- The `mcp__mcp-refactor-typescript` MCP server provides compiler-aware file rename with automatic import updates. This is MANDATORY for the rename step -- manual mv/git-mv will break imports.
- Knowledge `Agent/` directory contains `KnowledgeAgent.model.ts` (not `Agent.model.ts`) -- use `KnowledgeAgent` prefix for all new files in this entity.
- Renaming adds ~10-15 minutes per wave but eliminates permanent naming inconsistency.

---

## Reflection Entries

### Phase 1: Inventory Verification & Task Planning (2026-02-11)

**Duration**: ~15 minutes total (research + doc generation)

#### 1. What Worked

- **Parallel research agents**: Spawning 3 codebase-researcher agents simultaneously (IAM repos, entity inventory, other slice repos) completed the full inventory in ~3 minutes vs sequential which would have taken ~10 minutes.
- **Background doc-writer agents**: Delegating verified-inventory.md and handoff document creation to background agents while monitoring progress kept throughput high.
- **EntityId file reads**: Reading all 7 EntityId files in parallel gave complete coverage for mapping entities → their IDs.
- **MCP memory integration**: Prior session observations (#1086-#1135) provided immediate context without re-reading files, saving ~30 tool calls.
- **Pre-phase notes**: The extensive pre-phase notes in REFLECTION_LOG.md captured critical gotchas (cross-slice repos, Knowledge PascalCase, OAuth no-repos) that informed handoff quality.

#### 2. What Didn't Work

- **Agent context budget**: The handoff doc-writer agent (a143101) needed to read the README, REFLECTION_LOG, HANDOFF_STANDARDS, and MASTER_ORCHESTRATION before writing -- this consumed significant context. Future phases should pass distilled context directly in prompts rather than having agents re-read multiple large files.
- **Inventory file size**: verified-inventory.md at 399 lines is comprehensive but may exceed what a Phase 2 agent can absorb. The P2_ORCHESTRATOR_PROMPT.md (12KB) with embedded templates is the better entry point.

#### 3. Methodology Improvements

- **Embed templates in agent prompts**: Confirmed that embedding complete code templates (not references) in agent prompts enables one-pass execution. Applied this in HANDOFF_P2.md with full Get/Delete contract templates.
- **Batch by slice affinity**: Grouping all IAM entities into 3 batches + 1 cross-slice batch reduces context switching for agents.
- **Distill handoffs progressively**: Each handoff should be self-contained with embedded patterns, not requiring agents to read upstream files.

#### 4. Prompt Refinements

- Agent prompts for Phase 2 explicitly state "CRUD-only with empty repo extensions" to prevent agents from inventing custom methods.
- MCP refactor tool requirement emphasized 3 times in handoff (workflow section, gotchas, orchestrator prompt) to prevent manual rename mistakes.
- Per-entity rename mapping table provided so agents don't need to compute kebab→PascalCase conversions.

#### 5. Codebase-Specific Insights

- **All 20 IAM repos have zero custom methods** -- confirmed by direct inspection of every .repo.ts file. This was suspected but not verified until Phase 1.
- **73 custom repo methods** cataloged across all slices (10 shared, 27 documents, 36 knowledge, 0 calendar/comms/customization).
- **DeviceCode.repo.ts has a commented-out upsert** -- interesting pattern for future reference but currently CRUD-only.
- **6 custom return types** need extraction into contracts (SimilarityResult, DiscussionWithCommentsSchema, etc.) -- deferred to Waves 2-3.
- **Empty team.policy.ts** in shared/domain Team entity -- flagged for potential removal during migration.

---

---

## Lessons Learned Summary

*(Will be populated after all phases complete)*
