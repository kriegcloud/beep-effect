# Phase 0 Orchestrator Prompt

Copy-paste this prompt to scaffold a new multi-session spec.

---

## Prompt

You are scaffolding Phase 0 of a new specification: **[SPEC_NAME]**.

### Context

This is the initial investigation phase for a new multi-session spec. No previous phases exist. Your job is to analyze the problem space, identify gaps, define scope, and create the scaffolding documents that will guide future phases.

**Codebase**: `beep-effect` monorepo (Bun, Effect, Next.js 16, Liveblocks, OpenAI)

### Your Mission

Create the spec scaffolding by completing these tasks:

1. **Problem Statement**: Define what problem this spec solves
2. **Scope Analysis**: Determine what is in/out of scope
3. **Gap Analysis**: Document current state vs required state
4. **Phase Structure**: Design logical phases for implementation
5. **Research Sources**: Identify code, docs, and references to consult
6. **Risk Assessment**: Identify technical and process risks

### Key Research Areas

Investigate these areas to inform the spec:

- **Existing Implementation**: What code already exists? What patterns are used?
- **Reference Implementations**: Are there examples in `tmp/` or elsewhere?
- **Architecture Constraints**: What Effect/beep patterns must be followed?
- **Integration Points**: What services, APIs, or packages are involved?
- **Previous Specs**: Are there related completed specs to learn from?

### Deliverables

Create these files in `specs/[spec-name]/`:

| File | Purpose |
|------|---------|
| `README.md` | Overview, success criteria, phase breakdown |
| `REFLECTION_LOG.md` | Template for phase-by-phase learnings |
| `handoffs/HANDOFF_P0.md` | This phase's handoff document |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for future P0 scaffolding |
| `handoffs/HANDOFF_P1.md` | Full context for first implementation phase |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt for P1 |

### Document Standards

**README.md Structure**:
```markdown
# [Spec Name] - [Brief Description]

> [One-line summary]

## Overview
[2-3 paragraph description]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Current State Analysis
[Tables showing working components and gaps]

## Phase Breakdown
### Phase 1: [Name]
**Objective**: [What this phase accomplishes]
**Tasks**: [Specific work items]
**Deliverables**: [What is produced]

[Repeat for each phase]

## Reference Files
[Tables of files by category]

## Technology Stack
[Table of technologies with versions and purposes]

## Out of Scope
[What this spec does NOT cover]

## Verification Commands
[Commands to validate progress]

## Getting Started
[Point to handoffs]
```

**HANDOFF_P0.md Structure**:
```markdown
# Phase 0 Handoff: Spec Scaffolding

**Date**: YYYY-MM-DD
**From**: Initial Investigation
**To**: Phase 1 ([Phase Name])
**Status**: Complete

## Problem Statement
[What problem this spec solves]

## Scope Decisions
[In/out scope tables with rationale]

## Initial Gap Analysis
[Current vs required state tables]

## Phase Structure
[Phase design with rationale]

## Research Sources
[Primary sources, docs, key files]

## Risk Assessment
[Technical and process risks with mitigations]

## Success Criteria
[What P0 achieved - checklist]
```

### Success Criteria

P0 is complete when:

- [ ] Problem statement is clear and specific
- [ ] Scope boundaries are well-defined with rationale
- [ ] Gap analysis identifies all blocking issues
- [ ] Phase structure has logical progression
- [ ] Research sources are comprehensive
- [ ] Risks are identified with mitigations
- [ ] README.md provides complete spec overview
- [ ] HANDOFF_P1.md has sufficient detail to start implementation
- [ ] P1_ORCHESTRATOR_PROMPT.md is copy-paste ready

### Important Patterns

**Gap Analysis Table**:
```markdown
| Gap | Current State | Required State | Impact |
|-----|---------------|----------------|--------|
| [Issue] | [What exists] | [What's needed] | Blocking/Non-blocking |
```

**Phase Structure Table**:
```markdown
| Phase | Focus | Rationale |
|-------|-------|-----------|
| P1 | [Area] | [Why this order] |
| P2 | [Area] | [Why this follows P1] |
```

**Risk Assessment Table**:
```markdown
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [How to address] |
```

### Reference

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Pattern registry: `specs/_guide/PATTERN_REGISTRY.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Next Phase

After completing P0:
1. Verify all deliverables exist
2. Self-review against success criteria
3. Begin P1 using `P1_ORCHESTRATOR_PROMPT.md`
