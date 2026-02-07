# Agent Prompts — Agent Context Optimization

> Specialized prompts for sub-agents used in this spec.

---

## Overview

This spec uses the following agents:

| Agent | Phases | Purpose |
|-------|--------|---------|
| `codebase-researcher` | P0, P2, P3, P4 | Code exploration, module usage analysis |
| `web-researcher` | P1 | External best practices research |
| `doc-writer` | P1, P2, P3, P4 | Documentation generation |
| `architecture-pattern-enforcer` | P0 | Structure validation |
| `agents-md-updater` | P3 | Package AGENTS.md updates |
| `spec-reviewer` | P4 | Final review |

---

## Phase 0: Scaffolding

### For architecture-pattern-enforcer

```
Validate the spec structure at specs/agent-context-optimization/.

Check for:
1. README.md exists and follows spec template (100-150 lines)
2. REFLECTION_LOG.md exists with proper format
3. QUICK_START.md exists (for complex specs)
4. MASTER_ORCHESTRATION.md exists (for complex specs)
5. RUBRICS.md exists (for complex specs)
6. templates/ directory exists
7. outputs/ directory exists
8. handoffs/ directory exists with dual files for all phases

Output: outputs/structure-review.md
```

### For codebase-researcher

```
Audit existing AGENTS.md files across the codebase.

Questions to answer:
1. How many AGENTS.md files exist? (Expected: 65+)
2. What sections do they commonly include?
3. What linking patterns are used?
4. Are there cross-references between package and root AGENTS.md?

Output: Findings to inform orchestrator (no persistent file).
Do NOT produce output files.
```

---

## Phase 1: Git Subtree Setup

### For web-researcher

```
Research git subtree best practices for large monorepos.

Focus on:
1. Best practices for embedding large repositories (~100MB+)
2. Using --squash flag for history management
3. Handling updates and potential merge conflicts
4. Sparse checkout considerations
5. IDE indexing implications

Limit to 3-5 actionable best practices.
Output: Findings to inform orchestrator (no persistent file).
```

### For doc-writer (Subtree Workflow)

```
Create documentation for the git subtree workflow at:
documentation/subtree-workflow.md

Include:
1. Overview: Why we use subtrees for Effect source
2. Setup: Initial subtree add command
3. Updates: Quarterly update command with --squash
4. Troubleshooting: Common issues and resolutions
5. IDE configuration: Optional exclusions for performance

Keep concise (50-100 lines).
Follow existing documentation/patterns/*.md style.
```

---

## Phase 2: Module Context Generation

### For codebase-researcher (Module Analysis)

```
Analyze Effect module usage across the codebase.

Questions to answer:
1. Which Effect modules are imported most frequently?
2. What patterns are used for each module?
3. Are there inconsistencies in module usage?
4. Which packages use each module most heavily?

Focus on these modules:
- Tier 1: Effect, Schema, Layer, Context
- Tier 2: Stream, Array, Option, Either, Match
- Tier 3: DateTime, String, Struct, Record, Predicate
- Platform: FileSystem, HttpClient, Command

Output: Frequency data and pattern summary to inform orchestrator.
Do NOT produce output files.
```

### For doc-writer (Context Files)

```
Generate a context file for effect/[MODULE] following the template in:
templates/context-file.template.md

Process:
1. Read .repos/effect/packages/effect/src/[MODULE].ts
2. Analyze usage patterns in packages/*/src/
3. Extract best practices from .claude/rules/effect-patterns.md
4. Cross-reference with existing .claude/skills/*/SKILL.md

Output: context/effect/[MODULE].md

Requirements:
- Include concrete examples from this codebase
- Link to source in .repos/effect/
- Document anti-patterns specific to this repo
- Keep Quick Reference section actionable (3-5 most used functions)
```

### For doc-writer (Index)

```
Create the master context index at: context/INDEX.md

Structure:
1. Overview of context system
2. Module Index (table linking all context files)
3. Tier organization (Critical → Important → Common)
4. Platform modules section
5. Update instructions

Link all generated context files.
Sort by tier priority.
```

---

## Phase 3: Index Enhancement

### For codebase-researcher (AGENTS.md Audit)

```
Audit the current root AGENTS.md file.

Questions to answer:
1. What sections currently exist?
2. What navigation aids are present?
3. How does it link to other resources?
4. What gaps exist compared to context/ and skills/?

Output: Gap analysis to inform orchestrator.
Do NOT produce output files.
```

### For doc-writer (AGENTS.md Enhancement)

```
Enhance the root AGENTS.md with comprehensive navigation.

Add a "Context Navigation" section after existing content:

## Context Navigation

### Library Reference
| Library | Subtree | Key Modules |
|---------|---------|-------------|
| Effect | `.repos/effect/` | [Effect](context/effect/Effect.md), [Schema](context/effect/Schema.md), ... |
| Platform | `.repos/effect/` | [FileSystem](context/platform/FileSystem.md), ... |

### Skills by Category
| Category | Skills | When to Use |
|----------|--------|-------------|
| Domain Modeling | domain-modeling, pattern-matching | Creating entities, ADTs |
| Services | service-implementation, layer-design | Building services |
| Testing | effect-concurrency-testing | Writing tests |

### Specs by Status
| Status | Specs |
|--------|-------|
| Active | [agent-context-optimization](specs/agent-context-optimization/) |
| Complete | [knowledge-architecture-foundation](specs/knowledge-architecture-foundation/) |

Requirements:
- Maintain ALL existing content
- Add new section after existing sections
- Link all context/*.md files
- Organize skills from .claude/skills/ by category
- List specs from specs/ by status
```

### For agents-md-updater

```
Update package-level AGENTS.md files with cross-references.

For each package AGENTS.md:
1. Add link to root AGENTS.md Context Navigation
2. Add links to relevant context files (based on package dependencies)
3. Do NOT duplicate content from context files

Focus packages:
- packages/knowledge/domain/AGENTS.md → link knowledge-related context
- packages/iam/server/AGENTS.md → link server-related context
- packages/shared/domain/AGENTS.md → link core Effect context

Keep changes minimal - just add cross-reference links.
```

---

## Phase 4: Validation & Refinement

### For codebase-researcher (Gap Analysis)

```
Identify missing context coverage.

Compare:
1. Effect modules imported in packages/*/src/
2. Context files generated in context/

Output: List of modules used but not documented.
Prioritize by import frequency.
Do NOT produce output files.
```

### For doc-writer (Missing Context)

```
Generate context files for identified gaps.

Follow same process as Phase 2 doc-writer prompts.
Use templates/context-file.template.md structure.
Update context/INDEX.md with new files.
```

### For spec-reviewer (Final Review)

```
Perform final validation of the agent-context-optimization spec.

Check:
1. All subtrees accessible and searchable
2. All context files follow template
3. AGENTS.md navigation complete
4. All links valid
5. Maintenance workflow documented

Output: outputs/final-review.md with pass/fail scores.
```

### For doc-writer (Maintenance Documentation)

```
Create maintenance documentation at:
documentation/context-maintenance.md

Include:
1. Subtree update workflow (when and how)
2. Context file refresh triggers
3. Index update process
4. Staleness detection (version tracking)

Reference:
- documentation/subtree-workflow.md
- context/INDEX.md metadata format

Keep concise (75-125 lines).
```

---

## Prompt Customization Notes

When delegating to these agents:

1. **Always specify output location** for write-capable agents
2. **Include phase context** (what was completed in previous phases)
3. **Reference specific files** rather than general instructions
4. **Set scope boundaries** to prevent over-expansion

Example delegation:
```
Delegate to doc-writer:

"Generate context file for effect/Schema following the Phase 2 prompt.

Context from P1: Subtree is available at .repos/effect/
Reference template: templates/context-file.template.md
Output: context/effect/Schema.md

Focus on:
- S.Struct, S.Class, S.TaggedError patterns
- @beep/schema BS.* helpers usage
- Entity ID branded types

Do NOT include:
- Basic schema primitives (S.String, etc.)
- Patterns not used in this codebase"
```
