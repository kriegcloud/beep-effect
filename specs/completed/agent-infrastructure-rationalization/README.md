# Agent Infrastructure Rationalization

> Comprehensive audit and optimization of agent configuration, eliminating redundancy, reducing token bloat, and aligning with 2025-2026 AI coding best practices.

---

## Executive Summary

This spec addresses accumulated technical debt in the agent infrastructure spanning 5+ directories (`.claude/`, `.agents/`, `.cursor/`, `.codex/`, `.opencode/`, `.windsurf/`). Analysis of 12 completed specs revealed:

- **92% parallel agent success** but 58% agent type confusion
- **60% of specs exceeded 4K token handoff limits** causing context degradation
- **10x discovery efficiency variance** (Glob/Grep vs Bash)
- **30+ agents defined** but only ~10 regularly used
- **5 IDE configurations** with inconsistent sync strategies

### Target Outcomes

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Startup context tokens | ~15K | ≤10K | Consolidation + lazy loading |
| Active agent count | 30 | 15-18 | Merge redundant agents |
| Skill duplication | 4 locations | 1 source | Symlink strategy |
| Agent type confusion rate | 58% | <10% | Capability matrix + naming |
| Pattern registry adoption | 7% | 50% | Automated prompts |

---

## Problem Statement

### Current State

```
Agent Infrastructure (173MB total in .claude/)
├── .claude/                    # PRIMARY - Claude Code config
│   ├── agents/ (30 files)      # Agent definitions
│   ├── skills/ (36 dirs)       # Skill modules
│   ├── rules/ (3 files)        # Behavioral rules
│   ├── hooks/ (4 systems)      # Startup/runtime hooks
│   ├── commands/ (13 files)    # Custom commands
│   ├── patterns/ (78 files)    # Code smell detectors
│   └── agents-manifest.yaml    # Machine-readable registry
├── .agents/skills/ (9 dirs)    # SECONDARY - Curated subset
├── .cursor/rules/ (3 files)    # Cursor IDE (MDC format)
├── .windsurf/rules/ (symlink)  # Windsurf (wrong format)
├── .codex/skills/              # Codex skill source (directory-based `SKILL.md`; see `.codex/skills/README.md`)
└── .opencode/skills/ (empty)   # UNUSED placeholder
```

### Pain Points (Validated from Spec Reflections)

| Issue | Impact | Evidence |
|-------|--------|----------|
| **Agent type confusion** | 15-45 min lost per occurrence | 7/12 specs referenced non-existent agents |
| **Token bloat** | Context degradation at 5K+ | 60% specs exceeded 4K handoff budget |
| **Discovery inefficiency** | 10x time variance | Bash vs Glob/Grep comparison |
| **Redundant agents** | Cognitive load, maintenance burden | `codebase-researcher` vs `Explore` overlap |
| **Skill scatter** | 36 vs 9 vs 11 across directories | No clear sync strategy |
| **Unused infrastructure** | Dead code, confusion | `.codex/` and `.opencode/` empty |

---

## Success Criteria

### Primary Metrics (Required)

- [ ] **SC-1**: ≥30% reduction in startup context tokens (measured via hook output)
- [ ] **SC-2**: Zero duplicate agents serving same purpose
- [ ] **SC-3**: All configuration sources consistent (no conflicts between .claude/.cursor/.windsurf)
- [ ] **SC-4**: Any pattern findable in ≤2 navigation steps (agent capability matrix)
- [ ] **SC-5**: Backward compatibility maintained (existing workflows functional)

### Secondary Metrics (Desired)

- [ ] **SC-6**: Agent type confusion rate <10% (measured in subsequent specs)
- [ ] **SC-7**: Pattern registry adoption >50% (reflector agent integration)
- [ ] **SC-8**: All IDE configs auto-synced from single source
- [ ] **SC-9**: Token budget enforcement automated in handoff creation

---

## Phase Overview

| Phase | Focus | Agents | Deliverables | Duration |
|-------|-------|--------|--------------|----------|
| **P0** | Inventory & Baseline | Explore (×3 parallel) | Token audit, agent catalog, skill map | 1 session |
| **P1** | Redundancy Analysis | reflector, code-reviewer | Redundancy report, conflict matrix | 1 session |
| **P2** | Consolidation Design | doc-writer | Architecture proposal, migration plan | 1 session |
| **P3** | Discoverability Enhancement | doc-writer, Explore | Capability matrix, Discovery Kit skill | 1 session |
| **P4** | AI Trends Research | ai-trends-researcher, web-researcher | Best practices report, gap analysis | 1 session |
| **P5** | Implementation | package-error-fixer, test-writer | Consolidated infrastructure, tests | 2-3 sessions |
| **P6** | Verification | architecture-pattern-enforcer | Final audit, metrics validation | 1 session |

---

## Phase Details

### P0: Inventory & Baseline Measurement

**Objective**: Establish precise baseline metrics for all agent infrastructure components.

**Entry Criteria**: None (starting phase)

**Exit Criteria**:
- [ ] Token count measured for all configuration elements
- [ ] All 30 agents cataloged with usage frequency
- [ ] All 36+ skills mapped with duplication analysis
- [ ] Hook behavior documented (what loads when)
- [ ] Baseline metrics recorded in `outputs/P0_BASELINE.md`

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| Explore (agent inventory) | Catalog `.claude/agents/*.md` with size, triggers, usage | Agent catalog JSON |
| Explore (skill inventory) | Map `.claude/skills/`, `.agents/skills/`, `.cursor/skills/` | Skill duplication matrix |
| Explore (hook analysis) | Analyze `.claude/hooks/` startup behavior | Hook flow diagram |

**Deliverables**:
- `outputs/P0_BASELINE.md` - Metrics snapshot
- `outputs/agent-catalog.md` - All agents with metadata
- `outputs/skill-duplication-matrix.md` - Cross-directory skill mapping
- `outputs/hook-analysis.md` - What loads when, token costs

---

### P1: Redundancy & Conflict Analysis

**Objective**: Identify all redundancies and conflicts across agent infrastructure.

**Entry Criteria**: P0 complete with baseline metrics

**Exit Criteria**:
- [ ] Agent overlap matrix complete (which agents do same tasks)
- [ ] Skill duplication identified with authoritative source
- [ ] Rule/standard conflicts documented
- [ ] CLAUDE.md redundancy analysis complete
- [ ] Redundancy report in `outputs/P1_REDUNDANCY_REPORT.md`

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| reflector | Analyze agent triggers and capabilities for overlap | Overlap matrix |
| code-reviewer | Check rules across .claude/.cursor/.windsurf for conflicts | Conflict report |
| Explore | Compare CLAUDE.md at root vs .claude/ | Redundancy analysis |

**Known Consolidation Opportunities** (from reflection synthesis):

| Current | Proposed | Rationale |
|---------|----------|-----------|
| `codebase-researcher` + `Explore` | Single `Explore` | Name confusion; 92% use Explore |
| `code-reviewer` + `architecture-pattern-enforcer` | `quality-reviewer` | Always run together |
| `doc-writer` + `readme-updater` + `agents-md-updater` | Single `doc-writer` | Same capability, different targets |

**Deliverables**:
- `outputs/P1_REDUNDANCY_REPORT.md` - Complete redundancy analysis
- `outputs/agent-overlap-matrix.md` - Which agents overlap
- `outputs/conflict-matrix.md` - Configuration conflicts

---

### P2: Consolidation Architecture Design

**Objective**: Design the target architecture with clear boundaries and single sources of truth.

**Entry Criteria**: P1 complete with redundancy analysis

**Exit Criteria**:
- [ ] Target directory structure defined
- [ ] Agent consolidation plan approved
- [ ] Skill single-source strategy defined
- [ ] IDE sync automation designed
- [ ] Migration plan with backward compatibility

**Key Design Decisions**:

1. **Agent Consolidation**: Merge 30 → 15-18 agents
2. **Skill Source**: `.claude/skills/` is authoritative; others symlink
3. **IDE Sync**: Auto-generate `.cursor/` and `.windsurf/` from `.claude/`
4. **Cleanup**: Remove `.codex/` and `.opencode/` (unused)
5. **Lazy Loading**: Load detailed context only when triggered

**Deliverables**:
- `outputs/P2_ARCHITECTURE.md` - Target state design
- `outputs/agent-consolidation-plan.md` - Which agents merge/delete
- `outputs/migration-checklist.md` - Step-by-step migration

---

### P3: Discoverability Enhancement

**Objective**: Create navigation tools for agents to find relevant context efficiently.

**Entry Criteria**: P2 architecture approved

**Exit Criteria**:
- [ ] Agent capability matrix created
- [ ] Discovery Kit skill implemented
- [ ] CLAUDE.md files optimized for minimal tokens
- [ ] Index/registry patterns documented
- [ ] Token budget enforcement automated

**Key Deliverables**:

1. **Agent Capability Matrix** (`specs/_guide/AGENT_CAPABILITIES.md`):
   ```markdown
   | Capability | Primary Agent | Fallback | Prerequisites |
   |------------|---------------|----------|---------------|
   | Code exploration | Explore | None | None |
   | Effect docs | mcp-researcher | Explore | MCP config |
   | Pattern extraction | reflector | Manual | REFLECTION_LOG |
   ```

2. **Discovery Kit Skill** (`.claude/skills/discovery-kit/`):
   - File inventory patterns (Glob)
   - Content search patterns (Grep)
   - Verification sequences
   - Anti-patterns (avoid Bash for discovery)

3. **Token Budget Validator** (`specs/_guide/scripts/validate-handoff.sh`):
   ```bash
   TOKEN_COUNT=$(wc -w "$1" | awk '{print $1 * 4}')
   [ $TOKEN_COUNT -gt 4000 ] && exit 1
   ```

**Deliverables**:
- `specs/_guide/AGENT_CAPABILITIES.md` - Capability matrix
- `.claude/skills/discovery-kit/SKILL.md` - Discovery patterns
- `specs/_guide/scripts/validate-handoff.sh` - Token validator
- `outputs/P3_DISCOVERABILITY.md` - Implementation summary

---

### P4: AI Trends Research

**Objective**: Benchmark against current best practices and identify improvement opportunities.

**Entry Criteria**: P3 discoverability tools created

**Exit Criteria**:
- [ ] Claude Code best practices documented (2025-2026)
- [ ] Agent skill design patterns researched
- [ ] Context engineering techniques cataloged
- [ ] Exemplar repositories benchmarked
- [ ] Gap analysis with recommendations

**Research Topics**:

| Topic | Sources | Questions |
|-------|---------|-----------|
| Claude Code config | Anthropic docs, community repos | Optimal file structure? Hook patterns? |
| Agent skill design | Open-source skill libraries | What makes skills reusable? |
| Context engineering | arXiv papers, AI blogs | Token optimization? Memory hierarchies? |
| Multi-agent coordination | Research papers | Communication patterns? State sharing? |
| Prompt optimization | Claude docs, community guides | System prompt vs user prompt? |

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| ai-trends-researcher | Research AI coding trends 2025-2026 | Trends report |
| web-researcher | Benchmark exemplar repos (cursor-tools, aider, etc.) | Benchmark analysis |
| Explore | Identify gaps vs best practices | Gap analysis |

**Deliverables**:
- `outputs/P4_AI_TRENDS.md` - Best practices compilation
- `outputs/benchmark-analysis.md` - Exemplar repo comparison
- `outputs/gap-analysis.md` - Current vs ideal state
- `outputs/improvement-recommendations.md` - Prioritized actions

---

### P5: Implementation

**Objective**: Execute consolidation with backward compatibility.

**Entry Criteria**: P4 research complete, design approved

**Exit Criteria**:
- [ ] Agents consolidated (30 → 15-18)
- [ ] Skills unified (single source + symlinks)
- [ ] IDE configs auto-synced
- [ ] Unused directories removed
- [ ] All workflows functional (no regressions)
- [ ] Tests pass

**Implementation Order** (validated pattern: reverse dependency):

1. **P5a**: Remove unused infrastructure (`.codex/`, `.opencode/`)
2. **P5b**: Consolidate skills to single source
3. **P5c**: Merge redundant agents
4. **P5d**: Implement IDE auto-sync
5. **P5e**: Optimize CLAUDE.md files
6. **P5f**: Create discoverability tools (capability matrix, discovery kit)

**Verification After Each Step**:
```bash
# After each sub-phase
bun run check
bun run lint
bun run test
```

**Deliverables**:
- Consolidated agent infrastructure
- Auto-sync scripts for IDE configs
- Updated documentation
- `outputs/P5_IMPLEMENTATION_LOG.md` - Change log

---

### P6: Verification & Metrics

**Objective**: Validate success criteria and measure improvements.

**Entry Criteria**: P5 implementation complete

**Exit Criteria**:
- [ ] SC-1: ≥30% token reduction verified
- [ ] SC-2: Zero duplicate agents confirmed
- [ ] SC-3: All configs consistent (audit passed)
- [ ] SC-4: Capability matrix navigation tested
- [ ] SC-5: Backward compatibility verified
- [ ] Final metrics documented

**Verification Tests**:

| Metric | Measurement Method | Target |
|--------|-------------------|--------|
| Token reduction | Hook output comparison | ≥30% |
| Agent count | `ls .claude/agents/*.md \| wc -l` | 15-18 |
| Skill duplication | Cross-directory diff | 0 |
| Config consistency | Automated diff check | 0 conflicts |
| Workflow regression | Run existing specs | 100% pass |

**Deliverables**:
- `outputs/P6_FINAL_METRICS.md` - Before/after comparison
- `outputs/verification-report.md` - All tests passed
- Updated `REFLECTION_LOG.md` with learnings

---

## Constraints

### Hard Constraints

1. **Backward Compatibility**: All existing workflows must continue functioning
2. **IDE Compatibility**: Cursor, Windsurf configurations must work after changes
3. **No Functionality Loss**: Consolidation only, no capability removal
4. **Reversibility**: Changes must be reversible via git

### Soft Constraints

1. **Single Session Per Phase**: Target 1 session per phase (except P5: 2-3 sessions)
2. **Token Budget**: Handoffs ≤4K tokens
3. **Parallel Agent Limit**: ≤5 concurrent agents per task

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing workflows | Medium | High | Full test suite before/after |
| IDE sync failures | Medium | Medium | Test on each IDE after changes |
| Agent consolidation too aggressive | Low | High | Keep deprecated agents for 2-3 specs |
| Token reduction insufficient | Low | Medium | Multiple optimization passes |

---

## References

### Internal
- `.claude/agents-manifest.yaml` - Current agent registry
- `.claude/hooks/` - Hook implementations
- `specs/_guide/README.md` - Spec creation guide
- `specs/_guide/PATTERN_REGISTRY.md` - Validated patterns

### Research Inputs
- Reflection synthesis from 12 completed specs (see `outputs/reflection-synthesis-input.md`)
- Token budget research (arXiv:2512.13564)
- Claude Code documentation (Anthropic)

---

## Appendix: Reflection Synthesis Key Findings

Incorporated from analysis of 12 completed spec REFLECTION_LOG files:

### Validated Patterns (Score ≥75)

| Pattern | Score | Status |
|---------|-------|--------|
| Parallel agent deployment | 85/102 | Adopt in P0/P1 |
| Pre-flight verification | 82/102 | Add to templates |
| Tiered context budgets | 78/102 | Enforce in handoffs |
| Discovery Kit (Glob+Grep) | 88/102 | Create in P3 |
| Agent capability matrix | 75/102 | Create in P3 |

### Anti-Patterns to Avoid

| Anti-Pattern | Mitigation |
|--------------|------------|
| Agent type confusion | Capability matrix + naming alignment |
| Context budget violations | Automated token counting |
| Bash for discovery | Discovery Kit skill with Glob/Grep |
| MCP availability assumptions | Document fallbacks upfront |
| Pattern extraction neglect | Add reflector prompt to phase completion |
