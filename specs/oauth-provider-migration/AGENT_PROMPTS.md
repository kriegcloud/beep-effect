# Agent Prompts: OAuth Provider Migration

> Specialized agent guidance for each phase of the OAuth Provider migration spec.

---

## Overview

This document maps specialized agents to spec phases where they can provide value. Use these agents when stuck, for quality checks, or to accelerate specific tasks.

---

## Phase-Agent Mapping

| Phase | Primary Agent | Use Case |
|-------|---------------|----------|
| 1 | `codebase-researcher` | Find Entity ID patterns |
| 2 | `effect-code-writer` | Domain model implementation |
| 3 | `effect-code-writer` | Table implementation |
| 4 | `effect-code-writer` | Relations implementation |
| 5 | `code-reviewer` | Type alignment verification |
| 6 | `codebase-researcher` | Find admin DB patterns |
| 7 | `reflector` | Final reflection and lessons learned |

---

## Agent Usage Prompts

### Phase 1: Entity IDs

**Agent**: `codebase-researcher`

```
Search the codebase for existing Entity ID patterns in @beep/shared-domain.
Focus on:
- How AccountId is defined in ids.ts
- How table-name.ts union is constructed
- How any-id.ts union includes new IDs

Return concrete code examples to follow.
```

### Phase 2: Domain Models

**Agent**: `effect-code-writer`

```
Implement the OAuthClient domain model following the Account.model.ts pattern.
Requirements:
- Use M.Class from @effect/sql/Model
- Use makeFields with IamEntityIds.OAuthClientId
- Include all fields from P2_ORCHESTRATOR_PROMPT.md
- Add proper annotations with $I helper
```

### Phase 3: Tables

**Agent**: `effect-code-writer`

```
Implement the oauthClient.table.ts using Table.make pattern.
Critical requirements:
- Foreign keys reference oauthClient.clientId (NOT oauthClient.id)
- Use pg.text().array() for array columns
- Use datetime() helper for timestamp columns
- Add appropriate indexes
```

### Phase 4: Relations

**Agent**: `effect-code-writer`

```
Define Drizzle relations for OAuth entities.
Requirements:
- oauthClientRelations with user, tokens, consents
- oauthAccessTokenRelations with client, session, user, refreshToken
- oauthRefreshTokenRelations with client, session, user, accessTokens
- oauthConsentRelations with client, user
- Update userRelations and sessionRelations
```

### Phase 5: Type Checks

**Agent**: `code-reviewer`

```
Review the type alignment checks in _check.ts.
Verify:
- All 8 checks present (select + insert for 4 entities)
- Domain model fields match table columns
- Optionality is consistent
- No type errors reported
```

### Phase 6: Admin DB

**Agent**: `codebase-researcher`

```
Find the admin DB relation patterns in @beep/db-admin.
Identify:
- How slice-relations.ts exports relations
- How relations.ts aggregates user/session relations
- Any existing OAuth references to remove
```

### Phase 7: Migration

**Agent**: `reflector`

```
Reflect on the OAuth Provider migration execution.
Capture:
- Total execution time
- Key learnings per phase
- Pattern improvements discovered
- Recommendations for similar future specs
- Issues encountered and resolutions
```

---

## When to Use Agents

### Discovery Phase (Blocked on Patterns)
Use `codebase-researcher` when:
- Unsure about existing patterns
- Need to find similar implementations
- Looking for import paths or conventions

### Implementation Phase (Writing Code)
Use `effect-code-writer` when:
- Implementing domain models
- Creating tables or relations
- Need Effect-specific guidance
- Stuck on Effect Schema patterns

### Verification Phase (Quality Checks)
Use `code-reviewer` when:
- Type checks failing
- Verifying implementation completeness
- Reviewing before handoff

### Completion Phase (Learning Capture)
Use `reflector` when:
- Phase complete, capturing learnings
- Final spec completion
- Preparing REFLECTION_LOG.md updates

---

## Agent Invocation Examples

### Starting Phase 2 with Agent Assistance

```bash
# In Claude Code, invoke the effect-code-writer agent:
> Use the effect-code-writer agent to help implement the OAuthClient domain model.
> Reference: packages/iam/domain/src/entities/Account/Account.model.ts
> Fields: See specs/oauth-provider-migration/handoffs/P2_ORCHESTRATOR_PROMPT.md
```

### Debugging Type Alignment Issues

```bash
# In Claude Code, invoke the code-reviewer agent:
> Use code-reviewer to analyze the type mismatch between
> OAuthClient.Model.select.Encoded and InferSelectModel<typeof tables.oauthClient>.
> Focus on field name casing and optionality differences.
```

---

## Notes

- Agents should be used to accelerate work, not replace understanding
- Always verify agent output against spec requirements
- Log useful agent insights to REFLECTION_LOG.md
- Agents work best with specific, focused prompts
