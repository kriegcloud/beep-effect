# Phase 2 Handoff: Synthesis & Standards Definition

> Complete context for Phase 2 execution.

---

## Mission

Synthesize Phase 0 (internal audit) and Phase 1 (external research) into actionable naming standards for `beep-effect`.

## Prerequisites

Phase 0 deliverables:
- `outputs/existing-patterns-audit.md`
- `outputs/file-category-inventory.md`
- `outputs/inconsistency-report.md`

Phase 1 deliverables:
- `outputs/industry-best-practices.md`
- `outputs/fp-repo-conventions.md`
- `outputs/academic-research.md`
- `outputs/llms-txt-patterns.md`

## Context

### Synthesis Goals

1. **Category Taxonomy**: Finalize exhaustive `.category.ts` postfix list
2. **Casing Rules**: Define file/folder casing with rationale
3. **Module Structure**: Standardize barrel export patterns
4. **Rules Document**: Draft `.claude/rules/naming-conventions.md`

### Decision Framework

For each standard, document:
1. **Internal Evidence**: What patterns exist in our codebase?
2. **External Support**: What do industry/academic sources recommend?
3. **Trade-offs**: What are the costs of change?
4. **Decision**: Final recommendation with justification

## Deliverables

### 1. `outputs/category-taxonomy.md`

Exhaustive file category postfix taxonomy:

```markdown
## Category Taxonomy

### Domain Layer
| Postfix | Purpose | Example | Grep Pattern |
|---------|---------|---------|--------------|
| .model.ts | Entity schemas | user.model.ts | **/*.model.ts |

### Infrastructure Layer
...
```

Requirements:
- Every postfix must have a unique semantic purpose
- No overlapping categories
- Category-theoretic rationale where applicable
- Grep-friendly pattern for each

### 2. `outputs/casing-decision-matrix.md`

Casing rules with justification:

```markdown
## Casing Rules

### Decision: lower-snake-case for all files and folders

#### Rationale
- Internal evidence: [from Phase 0]
- External support: [from Phase 1]
- Trade-off analysis: [migration cost vs benefit]

### Exceptions
- PascalCase for React components: `Button.tsx` → `button.component.tsx`?
```

### 3. `outputs/module-structure-patterns.md`

Barrel export conventions:

```markdown
## Module Structure

### Pattern: mod.ts + index.ts Namespace

#### Structure
module/
├── index.ts    # export * as ModuleName from "./mod.ts"
├── mod.ts      # export * as SubModule from "./sub/mod.ts"
└── sub/
    ├── index.ts
    └── mod.ts

#### Rationale
- [From Phase 1 research on mod.ts origin]
- [Benefits for namespace imports]
```

### 4. `outputs/naming-rules-draft.md`

Draft for `.claude/rules/naming-conventions.md`:

```markdown
# Naming Conventions

## File Naming

### Postfix Categories
| Category | Postfix | Layer | Purpose |
...

### Casing
- Files: lower-snake-case.category.ts
- Folders: lower-snake-case/

## Module Structure

### Barrel Exports
- mod.ts for internal re-exports
- index.ts for public API

## Examples
...
```

## Synthesis Tasks

### Task 2.1: Category Taxonomy Synthesis

**Agent**: reflector

**Input**: Phase 0 file inventory + Phase 1 FP conventions research

**Questions**:
- What categories from Phase 0 align with FP conventions?
- What categories are missing based on external research?
- What postfixes should be renamed for clarity?
- How do categories map to architectural layers?

### Task 2.2: Casing Decision

**Agent**: reflector

**Input**: Phase 0 casing analysis + Phase 1 industry best practices

**Questions**:
- What casing convention has strongest support?
- What is the migration cost for each option?
- Are there exceptions that should be preserved?

### Task 2.3: Module Structure Finalization

**Agent**: reflector

**Input**: Phase 0 barrel patterns + Phase 1 FP conventions

**Questions**:
- Is mod.ts the right name, or should we use .barrel.ts?
- How should nested modules be structured?
- What are the namespace import ergonomics?

### Task 2.4: Rules Document Drafting

**Agent**: doc-writer

**Input**: Synthesis from Tasks 2.1-2.3

**Output**: Complete draft of `.claude/rules/naming-conventions.md`

## Agent Delegation

| Task | Agent | Capability | Output |
|------|-------|------------|--------|
| 2.1 | reflector | write-reports | Category taxonomy |
| 2.2 | reflector | write-reports | Casing decision |
| 2.3 | reflector | write-reports | Module structure |
| 2.4 | doc-writer | write-files | Rules draft |

## Verification

After completing artifacts:
- [ ] All four deliverables exist
- [ ] Each decision cites internal + external evidence
- [ ] Rules draft is complete and actionable
- [ ] REFLECTION_LOG.md updated with synthesis learnings

## Success Criteria

- Every category postfix is justified
- Casing rules have clear rationale
- Module structure is documented with examples
- Rules draft is ready for review

## Next Phase

This spec's research phase is complete after Phase 2.

**Future Work**:
1. Create `specs/naming-conventions-refactor/` for implementation
2. Use JetBrains MCP tools for large-scale refactoring
3. Create automated linting rules
