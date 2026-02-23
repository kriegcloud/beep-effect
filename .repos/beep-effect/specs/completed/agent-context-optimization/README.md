# Agent Context Optimization Spec

> Implementing Michael Arnaldi's recommendations for enhancing AI agent performance in Effect-first codebases.

---

## Overview

This specification implements a systematic approach to optimize AI agent context based on [Michael Arnaldi's recommendations](https://x.com/MichaelArnaldi/status/2018597458431931922340). The goal is to enhance agent performance by providing deep library context, module-specific best practices, and a comprehensive navigation index.

### Source Recommendations

From Michael Arnaldi's post:

1. **Git Subtrees**: Add library repos as git subtrees in `.repos/` (e.g., `.repos/effect`)
2. **Module Context**: Generate best practices for each module (e.g., `context/effect-Effect.md`)
3. **Comprehensive Index**: Create an index in `AGENTS.md` linking all context and specs
4. **Feedback Loop**: Setup type-check and test validation loops
5. **Implementation Plans**: Create detailed plans in `specs/X-plan.md`

### Current State Assessment

| Component | Current Status | Gap |
|-----------|----------------|-----|
| AGENTS.md files | ✅ 65+ files across packages | Index linking specs/context missing |
| Specs system | ✅ Mature with handoffs, reflections | Already exceeds recommendation |
| Feedback loop | ✅ `bun run check`, `bun run test` | No gap |
| Git subtrees | ❌ Not implemented | `.repos/` directory needed |
| Module context | ❌ Not implemented | `context/` directory needed |
| Effect skills | ✅ 35+ skills exist | Can be linked to context |

---

## Problem Statement

While this repository has sophisticated agent infrastructure (skills, specs, AGENTS.md files), agents lack:

1. **Deep library source access**: Agents cannot reference Effect source code directly
2. **Module-specific best practices**: No centralized context for Effect modules
3. **Navigation index**: No single entry point linking all agent resources

This causes:
- Repeated lookups for common Effect patterns
- Inconsistent application of module-specific idioms
- Fragmented agent context across skills, rules, and specs

---

## Solution Architecture

### Directory Structure

```
.repos/                              # NEW: Git subtrees for reference libraries
├── effect/                          # Effect TS source
├── effect-platform/                 # @effect/platform source
├── effect-ai/                       # @effect/ai source
└── better-auth/                     # better-auth source

context/                             # NEW: Generated module best practices
├── INDEX.md                         # Master index of all context files
├── effect/
│   ├── Effect.md                    # Effect module patterns
│   ├── Stream.md                    # Stream module patterns
│   ├── Schema.md                    # Schema module patterns
│   ├── Layer.md                     # Layer composition patterns
│   ├── Context.md                   # Context/Tag patterns
│   └── ...                          # Additional modules
├── platform/
│   ├── FileSystem.md                # FileSystem service patterns
│   ├── HttpClient.md                # HTTP client patterns
│   └── Command.md                   # Process spawning patterns
└── internal/                        # Repo-specific context
    ├── architecture.md              # Architecture decisions
    ├── patterns.md                  # Common patterns
    └── anti-patterns.md             # What to avoid

AGENTS.md                            # ENHANCED: Root index with context links
├── Quick Reference (existing)
├── Context Navigation (NEW)
│   ├── Links to context/*.md
│   ├── Links to skills
│   └── Links to specs
└── Workflow (existing)
```

---

## Success Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| Library subtrees added | Count | 4+ repositories |
| Module context files | Count | 20+ files |
| Index completeness | Coverage | All Effect modules used in codebase |
| Agent accuracy | Before/after comparison | Measurable improvement |
| Build verification | `bun run check` | Passes |

---

## Phase Overview

### Phase 0: Scaffolding
- Create directory structure
- Validate against spec template

### Phase 1: Git Subtree Setup
- Add Effect, @effect/platform, @effect/ai as subtrees
- Configure `.gitignore` for subtrees
- Document subtree update workflow

### Phase 2: Module Context Generation
- Analyze Effect module usage in codebase
- Generate context files for top 20 modules
- Create internal context for repo-specific patterns

### Phase 3: Index Enhancement
- Enhance root AGENTS.md with comprehensive index
- Link context files, skills, and specs
- Add navigation shortcuts

### Phase 4: Validation & Refinement
- Test agent performance with new context
- Gather feedback and refine
- Document maintenance workflow

---

## Constraints

### Technical Constraints
- Git subtrees must not break existing workflows
- Context files must follow existing documentation standards
- Must work with Claude Code, Cursor, and other AGENTS.md-compatible tools

### Process Constraints
- No breaking changes to existing AGENTS.md files
- Maintain backwards compatibility with current agent workflows
- Follow existing spec patterns from `specs/_guide/`

### Resource Constraints
- Subtrees add ~100-200MB to repo (acceptable)
- Context generation is one-time with periodic refresh

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `specs/_guide/README.md` | Available | Spec template reference |
| `.claude/agents-manifest.yaml` | Available | Agent capability reference |
| Effect MCP tools | Available | For documentation lookup |
| Git subtree support | Available | Standard git feature |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Subtree merge conflicts | Medium | Use sparse checkout, ignore in merges |
| Context staleness | Low | Document refresh workflow, version pin |
| Index maintenance burden | Low | Generate index programmatically |
| Breaking existing workflows | High | Test extensively before merge |

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/_guide/README.md` | Spec creation guide |
| `.claude/agents-manifest.yaml` | Agent capabilities |
| `documentation/EFFECT_PATTERNS.md` | Effect pattern reference |
| `.claude/rules/effect-patterns.md` | Effect rules for agents |
| `AGENTS.md` | Root agent configuration |

---

## Spec Status

| Status | Phase | Last Updated |
|--------|-------|--------------|
| ✅ Complete | P5 Complete (Extended Coverage) | 2026-02-03 |

---

## Estimated Complexity

```
Phase Count:       5 phases    × 2 = 10
Agent Diversity:   5 agents    × 3 = 15
Cross-Package:     0           × 4 = 0
External Deps:     4 (repos)   × 3 = 12
Uncertainty:       2 (low)     × 5 = 10
Research Required: 3 (medium)  × 2 = 6
────────────────────────────────────────
Total Score:                       53 → High Complexity
```

**Agents Used**: `web-researcher`, `codebase-researcher`, `doc-writer`, `architecture-pattern-enforcer`, `agents-md-updater`

**Structure**: Complex spec with MASTER_ORCHESTRATION.md, phase handoffs, and validation checkpoints.
