# P1 Gap Analysis: cursor-claude-parity

Evidence-backed gap analysis and P2 implementation prerequisites.

---

## Measurement Timestamp

- **Date**: 2026-02-07
- **Phase**: P1 Gap Analysis
- **Source**: P0_BASELINE.md, parity-capability-matrix.md, filesystem verification

---

## Summary of Gaps

| Domain | Current State | Gap Severity | Primary Blocker |
|--------|---------------|--------------|-----------------|
| **Instruction** | 5 rules synced via sync-cursor-rules | None | — |
| **Skills** | 2 skills (auth only) | High | 35 structured .claude skills not ported |
| **Commands/workflows** | No mapping | High | Cursor has no /command surface; need adaptation |
| **Agent delegation** | None | Medium | No 1:1 Cursor equivalent; map to skills/rules |
| **Context discoverability** | AGENTS.md only | Medium | No .cursor-specific index |
| **Pattern library** | None in .cursor | Low | Optional; may embed in rules/skills |
| **Hooks/telemetry** | Not applicable | Low | Defer; Cursor lifecycle unknown |

---

## P1 Priority Questions — Resolved

### 1. Which skills are required vs optional for Cursor parity?

**Required skills** (RUBRICS capability coverage, effect-heavy workflows):

| Skill | Rationale |
|-------|-----------|
| domain-modeling | Core domain patterns; referenced by effect-patterns rules |
| layer-design | Service composition; critical for server architecture |
| schema-composition | Effect Schema usage; aligns with code-standards |
| error-handling | TaggedError, catchTag; referenced in effect-patterns |
| pattern-matching | $match, Match.typeTags; referenced in code-standards |
| service-implementation | Effect service patterns; core architecture |
| spec-driven-development | Spec lifecycle; enables cursor-claude-parity workflow |
| effect-concurrency-testing | Testing patterns; effect-patterns references |
| onboarding | First-contribution parity; AGENTS.md references |

**Optional skills** (nice-to-have, can defer):

- effect-ai-* (language-model, prompt, provider, streaming, tool) — use when building LLM features
- react-* (react-vm, react-composition), atom-state, the-vm-standard — frontend-focused
- legal-review, parallel-explore, research-orchestration — specialized agent workflows
- context-witness, platform-abstraction, command-executor, filesystem — capability-specific
- Remaining 20+ skills — add incrementally based on usage

**Implementation strategy**: Port 9 required skills first; document remainder in parity-decision-log as defer with rationale.

---

### 2. How should sync-cursor-rules be extended (if at all)?

**Conclusion: No extension required for P2.**

- sync-cursor-rules already covers all 5 rule domains.
- Source: `.claude/rules/`; target: `.cursor/rules/*.mdc`.
- Frontmatter transformation (paths → globs, description, alwaysApply) is correct.
- **P2 action**: Ensure `bun run repo-cli sync-cursor-rules` remains in pre-commit/docs; no code changes.

**Future consideration**: If new rules are added to .claude (e.g. cursor-specific rule), extend sync logic. Document in parity-decision-log as no-action for P2.

---

### 3. What workflow/command mechanisms does Cursor support?

**Cursor capabilities** (from spec context and Cursor docs):

| Cursor mechanism | Equivalent to Claude/Codex | Usage |
|------------------|----------------------------|-------|
| **Rules** (.mdc) | rules/ | Guardrails, always-on or path-scoped |
| **Skills** (SKILL.md in dirs) | commands, skills | Procedural workflows; auto-suggested when relevant |
| **AGENTS.md, README** | module/modules/context | Discoverability; referenced by AI |
| **Composer / @-mentions** | /command invocation | User invokes via prompt; no built-in / prefix |

**Mapping**:

- **Commands as skills**: `new-spec`, `done-feature`, `debug`, `explore`, `write-test` → implement as Cursor skills. User triggers via @-mention or prompt.
- **Commands as docs**: Reference flows in `.cursor/README.md` or AGENTS.md so sessions can discover and execute.
- **No Cursor /command surface**: Claude/Codex `/new-spec` becomes a skill "Create New Spec" + doc pointer. Same intent, different trigger.

**P2 action**: Create skills for spec lifecycle, done-feature, debug/explore/write-test (or consolidated "Task Execution" skill). Add `.cursor/README.md` with command/workflow index.

---

## Blockers and Mitigations

| Blocker | Severity | Mitigation | Owner |
|---------|----------|------------|-------|
| 35 skills vs 9 required | Medium | Port 9 required; defer rest with rationale | P2 |
| Cursor no /command | Medium | Map to skills + doc index; user invokes via prompt | P2 |
| Agent delegation no 1:1 | Low | Map agent intents to skills/rules; document in AGENTS.md | P2 |
| Hook/telemetry parity | Low | Defer; mark as investigate in decision log | P2 |

**No critical blockers** — all required capabilities have a decided adaptation path.

---

## P2 Implementation Prerequisites

1. **Skills**: Create `.cursor/skills/<name>/SKILL.md` for 9 required skills. Copy/adapt from `.claude/skills/<name>/SKILL.md`. Preserve trigger semantics and procedure steps.

2. **Commands/workflows**: Create skills for:
   - Spec lifecycle (new-spec, handoff)
   - Completion (done-feature)
   - Task execution (debug, explore, write-test — can be 1 or 3 skills)

3. **Context discoverability**: Create `.cursor/README.md` with:
   - Pointer to AGENTS.md, specs/, documentation/
   - Command/workflow index (what to @-mention for each flow)
   - Link to `bun run repo-cli sync-cursor-rules`

4. **Agent mapping**: Update AGENTS.md to reference Cursor-specific entry points. Map agent tiers to skills (e.g. "code-reviewer" → legal-review skill if ported).

5. **Safety permissions**: Document Cursor equivalents in `.cursor/README.md` or parity-decision-log; no code change if Cursor uses different permission model.

6. **Do not modify**: `.claude/` or `.codex/` source assets.

---

## Assumptions

- Cursor skills use `SKILL.md` in named directories; format compatible with .claude skills.
- User-triggered flows (prompt, @-mention) are sufficient; no runtime hook parity required.
- AGENTS.md and CLAUDE.md remain cross-tool entry points; .cursor/README.md supplements, not replaces.

---

P1 deliverables complete. Proceed to P2 with parity-decision-log and this gap analysis.
