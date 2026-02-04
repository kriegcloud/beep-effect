# P2 Architecture - Target State Design

> Phase 2 Deliverable: Consolidated agent infrastructure architecture
> Generated: 2026-02-03
> Based on: P1 Analysis Findings, P1 Redundancy Report, Agent Overlap Matrix

---

## Executive Summary

This document defines the target architecture for the agent infrastructure after P1 analysis identified significant redundancy and configuration drift. The design consolidates 31 agents → 27-29 agents while eliminating 38-53% content loss in IDE configurations and reducing token overhead by 27%.

### Key Design Principles

1. **Single Source of Truth**: `.claude/` is authoritative for all agent and rule content
2. **IDE Parity**: Cursor and Windsurf receive identical guidance through sync/symlink
3. **Zero Manual Sync**: Automated sync scripts and symlinks eliminate drift
4. **Skill Consolidation**: One master skills directory with symlinks for IDE compatibility
5. **CLAUDE.md Hierarchy**: Overview in root, detailed rules in `.claude/rules/`

### Target Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total agents | 31 (manifest refs) | 27-29 | 6-13% reduction |
| Synced agents | 18 | 27-29 | 100% coverage |
| Orphaned agents | 11 | 0 | Eliminated |
| Missing agents | 2 | 0 | Eliminated |
| Cursor rule accuracy | 47-62% | 100% | Full parity |
| Token overhead | ~10,330 | ~7,500 | 27% reduction |
| Skills directories | 6 (fragmented) | 1 + 5 symlinks | Single source |

---

## 1. Target Directory Structure

```
beep-effect2/
├── .claude/                          # Authoritative source (Claude Code IDE)
│   ├── agents/                       # 27-29 agent definitions
│   │   ├── codebase-researcher.md
│   │   ├── codebase-explorer.md     # (kept separate - different methodology)
│   │   ├── doc-maintainer.md        # NEW: merger of agents-md-updater + readme-updater
│   │   ├── doc-writer.md            # (kept separate - creation vs maintenance)
│   │   ├── documentation-expert.md
│   │   ├── effect-expert.md         # (kept separate - transformation engine)
│   │   ├── effect-platform.md       # (kept separate - platform abstraction)
│   │   ├── effect-predicate-master.md # (kept separate - predicate specialist)
│   │   ├── effect-researcher.md     # (kept separate - research + docs)
│   │   ├── mcp-researcher.md
│   │   ├── observability-expert.md
│   │   ├── schema-expert.md
│   │   ├── test-writer.md
│   │   ├── web-researcher.md
│   │   ├── reflector.md
│   │   ├── prompt-refiner.md
│   │   ├── code-reviewer.md
│   │   ├── architecture-pattern-enforcer.md
│   │   ├── spec-reviewer.md
│   │   ├── tsconfig-auditor.md
│   │   ├── jsdoc-fixer.md
│   │   ├── package-error-fixer.md
│   │   ├── ai-trends-researcher.md
│   │   ├── lawyer.md
│   │   ├── mcp-enablement.md
│   │   ├── domain-modeler.md
│   │   ├── react-expert.md
│   │   └── wealth-management-domain-expert.md
│   │   # REMOVED: agents-md-updater.md, readme-updater.md (merged)
│   │   # REMOVED: code-observability-writer.md, effect-schema-expert.md (missing files)
│   ├── agents-manifest.yaml          # Updated with all 27-29 agents
│   ├── skills/                       # Master skills directory (58 skills)
│   │   ├── effect-testing.md
│   │   ├── react-vm.md
│   │   ├── atom-state.md
│   │   ├── parallel-explore.md
│   │   ├── ... (54 more)
│   │   └── [symlinks to .agents/skills/ for agent-specific skills]
│   ├── rules/                        # Authoritative rule files
│   │   ├── behavioral.md             # (148 lines)
│   │   ├── effect-patterns.md        # (673 lines)
│   │   ├── general.md                # (148 lines)
│   │   ├── meta-thinking.md          # NEW: effect-thinking from .claude/CLAUDE.md
│   │   └── code-standards.md         # NEW: code-standards + code-field from .claude/CLAUDE.md
│   ├── commands/                     # Existing commands
│   ├── patterns/                     # Existing patterns
│   ├── hooks/                        # Existing hooks
│   └── CLAUDE.md                     # DELETED after migration to rules/
│
├── .agents/                          # Agent-specific content
│   └── skills/                       # Agent-specific skills (9 skills)
│       ├── agent-skill-1.md
│       └── ... (8 more)
│
├── .cursor/                          # Cursor IDE configuration
│   ├── rules/                        # Auto-generated from .claude/rules/
│   │   ├── behavioral.mdc            # Generated via sync script
│   │   ├── effect-patterns.mdc       # Generated via sync script
│   │   ├── general.mdc               # Generated via sync script
│   │   ├── meta-thinking.mdc         # Generated via sync script
│   │   └── code-standards.mdc        # Generated via sync script
│   └── skills/                       # Symlink to .claude/skills/
│
├── .windsurf/                        # Windsurf IDE configuration
│   ├── rules/                        # Symlink to .claude/rules/
│   └── skills/                       # Symlink to .claude/skills/
│
├── .codex/                           # DELETED (unused IDE)
├── .opencode/                        # DELETED (unused IDE)
│
└── CLAUDE.md                         # Root overview (simplified)
    # Project Overview
    # Technology Stack
    # Quick Reference (commands table)
    # Architecture Boundaries
    # Specifications
    # IDE Compatibility
    # Links to .claude/rules/ for details
```

---

## 2. Agent Registry Design

### 2.1 Consolidation Actions

#### High-Priority Merge (Complete in P3)

| Merged Agents | New Agent | Rationale | Savings |
|---------------|-----------|-----------|---------|
| `agents-md-updater` (164 lines)<br>`readme-updater` (219 lines) | `doc-maintainer` | 82% similarity, identical tools, complementary targets (AGENTS.md + README.md) | ~133 lines (35%) |

**New Agent Signature:**

```yaml
name: doc-maintainer
model: claude-sonnet-4-5
tools: [Glob, Grep, Read, Write, Edit]
parameters:
  target: enum[agents|readme|both]  # Which docs to maintain
  packages: string[]?               # Optional package filter
output:
  agentsUpdated: string[]
  readmesUpdated: string[]
  issuesFound: object
```

#### Missing Files - Remove from Manifest (Complete in P3)

| Agent | Status | Action |
|-------|--------|--------|
| `code-observability-writer` | Manifest entry, no file | Remove from `agents-manifest.yaml` |
| `effect-schema-expert` | Manifest entry, no file | Remove from `agents-manifest.yaml` |

**Rationale**: `observability-expert` (294 lines) and `schema-expert` (311 lines) already exist and serve these roles.

#### Orphaned Files - Add to Manifest (Complete in P3)

| Agent | Lines | Action |
|-------|-------|--------|
| `codebase-explorer` | 145 | Add manifest entry |
| `documentation-expert` | 200 | Add manifest entry |
| `domain-modeler` | 233 | Add manifest entry |
| `effect-expert` | 343 | Add manifest entry |
| `effect-platform` | 222 | Add manifest entry |
| `lawyer` | 361 | Add manifest entry |
| `mcp-enablement` | 281 | Add manifest entry |
| `observability-expert` | 294 | Add manifest entry |
| `react-expert` | 286 | Add manifest entry |
| `schema-expert` | 311 | Add manifest entry |
| `wealth-management-domain-expert` | 183 | Add manifest entry |

**Total**: 11 orphaned agents (2,859 lines) to be registered.

### 2.2 Agents Kept Separate (No Merge)

| Cluster | Agents | Rationale |
|---------|--------|-----------|
| **Codebase Exploration** | `codebase-researcher`, `codebase-explorer` | Different methodologies (systematic vs parallel decomposition) |
| **Effect Specialists** | `effect-researcher`, `effect-expert`, `effect-predicate-master`, `effect-platform`, `schema-expert` | Distinct specializations (research, transformation, predicates, platform, schemas) |
| **Documentation** | `doc-writer`, `doc-maintainer` (new), `documentation-expert` | Different workflows (creation vs maintenance vs AI navigation) |
| **Research** | `mcp-researcher`, `effect-researcher`, `web-researcher` | Different data sources (MCP vs Effect vs web) |
| **Quality** | `code-reviewer`, `architecture-pattern-enforcer`, `spec-reviewer`, `tsconfig-auditor` | Distinct review focuses |
| **Writers** | `test-writer`, `jsdoc-fixer`, `package-error-fixer` | Different artifact types |
| **Foundation** | `reflector`, `prompt-refiner` | Meta-level agents |
| **Domain** | `domain-modeler`, `react-expert`, `observability-expert`, `wealth-management-domain-expert` | Domain-specific expertise |
| **Utilities** | `lawyer`, `mcp-enablement`, `ai-trends-researcher` | Unique purposes |

### 2.3 Final Agent Count

| Scenario | Starting Count | Merges | Removed | Added | Final Count |
|----------|----------------|--------|---------|-------|-------------|
| **Minimal** | 31 (manifest) | -1 (merge) | -2 (missing) | +0 | **28 agents** |
| **Target** | 31 (manifest) | -1 (merge) | -2 (missing) | +0 | **28 agents** |

**Note**: 11 orphaned agents are already in `.claude/agents/` but missing from manifest. Adding them doesn't change physical count (28 files remain), but manifest will reflect 28 agents instead of current 18.

---

## 3. Skill Registry Design

### 3.1 Current State Problems

| Directory | Skills | Status | Issues |
|-----------|--------|--------|--------|
| `.claude/skills/` | 58 | Mixed | Contains both shared skills + symlinks to .agents/skills/ |
| `.agents/skills/` | 9 | Master | Agent-specific skills |
| `.cursor/skills/` | ? | Unknown | Potentially stale |
| `.windsurf/skills/` | 2 | Minimal | Incomplete |
| `.codex/skills/` | ? | Unknown | Unused IDE |
| `.opencode/skills/` | ? | Unknown | Unused IDE |

### 3.2 Target State: Single Source + Symlinks

**Strategy**: `.claude/skills/` becomes the authoritative master directory, all IDE configs symlink to it.

```
.claude/skills/                   # MASTER (58 skills)
├── effect-testing.md             # Shared skill
├── react-vm.md                   # Shared skill
├── atom-state.md                 # Shared skill
├── parallel-explore.md           # Agent-specific (symlink to .agents/skills/)
├── ... (54 more)
└── [9 symlinks to .agents/skills/agent-*.md]

.agents/skills/                   # Agent-specific source
├── agent-skill-1.md
└── ... (8 more)

.cursor/skills/                   # SYMLINK → .claude/skills/
.windsurf/skills/                 # SYMLINK → .claude/skills/
.codex/                           # DELETED
.opencode/                        # DELETED
```

### 3.3 Symlink Strategy

| Target | Type | Command |
|--------|------|---------|
| `.cursor/skills/` | Symlink | `ln -sfn ../.claude/skills .cursor/skills` |
| `.windsurf/skills/` | Symlink | `ln -sfn ../.claude/skills .windsurf/skills` |

**Benefits**:
- Zero sync overhead (filesystem handles propagation)
- Impossible for skills to drift between IDEs
- Single location for skill updates

---

## 4. IDE Configuration Design

### 4.1 Sync Strategy by IDE

| IDE | Rules Strategy | Skills Strategy | Maintenance |
|-----|----------------|-----------------|-------------|
| **Claude Code** | Authoritative source (`.claude/rules/*.md`) | Authoritative source (`.claude/skills/`) | Manual edits |
| **Cursor** | Auto-generated (`.cursor/rules/*.mdc`) | Symlink (`.cursor/skills/ → .claude/skills/`) | Run sync script after rule changes |
| **Windsurf** | Symlink (`.windsurf/rules/ → .claude/rules/`) | Symlink (`.windsurf/skills/ → .claude/skills/`) | Zero maintenance |

### 4.2 Rule File Transformation (Cursor Only)

Cursor requires MDC format with frontmatter. Sync script transforms:

```typescript
// Source: .claude/rules/general.md (148 lines)
// Generated: .cursor/rules/general.mdc (~152 lines)

---
description: General project rules
alwaysApply: true
globs:
  - "**/*.ts"
  - "**/*.tsx"
syncedAt: "2026-02-03T20:00:00Z"
sourceHash: "abc123..."
---

[... content from .claude/rules/general.md ...]
```

**Key Transformations**:
1. Add frontmatter with `description`, `alwaysApply`, `globs`
2. Add `syncedAt` timestamp for drift detection
3. Add `sourceHash` for validation
4. Transform `paths:` → `globs:` (field rename)
5. Preserve all content (no line loss)

### 4.3 Validation Workflow

```bash
# After editing .claude/rules/*.md:
bun run scripts/sync-cursor-rules.ts

# Verify parity (MDC should be ~3-5 lines longer due to frontmatter):
wc -l .claude/rules/*.md .cursor/rules/*.mdc

# Expected:
# general.md: 148 → general.mdc: ~152 (+4 frontmatter)
# behavioral.md: 50 → behavioral.mdc: ~55 (+5 frontmatter)
# effect-patterns.md: 673 → effect-patterns.mdc: ~677 (+4 frontmatter)
# meta-thinking.md: 24 → meta-thinking.mdc: ~28 (+4 frontmatter)
# code-standards.md: 68 → code-standards.mdc: ~72 (+4 frontmatter)
```

### 4.4 Symlink Creation (Windsurf)

```bash
# One-time setup for Windsurf:
ln -sfn ../.claude/rules .windsurf/rules
ln -sfn ../.claude/skills .windsurf/skills

# Verification:
ls -la .windsurf/
# rules -> ../.claude/rules
# skills -> ../.claude/skills
```

---

## 5. CLAUDE.md Hierarchy Design

### 5.1 Content Overlap Analysis (Current State)

| Section | Root CLAUDE.md | .claude/CLAUDE.md | .claude/rules/*.md | Status |
|---------|----------------|-------------------|-------------------|--------|
| Behavioral Rules | Embedded preamble | `<uncertainty>` tags | `behavioral.md` (50 lines) | **TRIPLICATE** |
| Commands Reference | Full table | ✗ | Partial in `general.md` | **DUPLICATE** |
| Testing | Summary + code | ✗ | Detailed in `general.md` | **DUPLICATE** |
| Effect Patterns | Link only | Partial (127 lines) | Full (`effect-patterns.md` 673 lines) | **FRAGMENTED** |
| Code Quality | 3 lines | ✗ | Detailed in rules | **DUPLICATE** |
| Effect Thinking | ✗ | 24 lines | ✗ | **ORPHANED** |
| Code Standards | ✗ | 43 lines | ✗ | **ORPHANED** |
| Code Field | ✗ | 25 lines | ✗ | **ORPHANED** |
| Project Overview | ✓ | ✗ | ✗ | **UNIQUE** |
| Technology Stack | ✓ | ✗ | ✗ | **UNIQUE** |
| Specifications | ✓ | ✗ | ✗ | **UNIQUE** |

### 5.2 Target State Hierarchy

```
Root CLAUDE.md                        # High-level overview + navigation
├── Project Overview                  # Technology stack, monorepo structure
├── Quick Reference                   # Commands table, workflow checklist
├── Architecture Boundaries           # Slice structure, import rules
├── Specifications                    # Link to specs/ directory
├── IDE Compatibility                 # Link to sync instructions
└── Key References                    # Links to .claude/rules/ for details

.claude/rules/behavioral.md           # Behavioral requirements (50 lines)
.claude/rules/general.md              # General project rules (148 lines)
.claude/rules/effect-patterns.md      # Effect patterns (673 lines)
.claude/rules/meta-thinking.md        # NEW: Effect thinking notation (from .claude/CLAUDE.md)
.claude/rules/code-standards.md       # NEW: Code standards + code field (from .claude/CLAUDE.md)

.claude/CLAUDE.md                     # DELETED (content migrated to rules/)
```

### 5.3 Migration Actions

#### Step 1: Create New Rule Files (P4 Phase)

**File**: `.claude/rules/meta-thinking.md` (24 lines from `.claude/CLAUDE.md`)

```markdown
# Meta-Thinking Patterns

Effect<Success, Error, Requirements>

a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
f(g(x))           →  pipe(x, g, f)

[... rest of effect-thinking content ...]
```

**File**: `.claude/rules/code-standards.md` (68 lines from `.claude/CLAUDE.md`)

```markdown
# Code Standards

## Style

nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct

[... rest of code-standards + code-field content ...]
```

#### Step 2: Simplify Root CLAUDE.md (P4 Phase)

**Remove** (duplicated in `.claude/rules/`):
- Embedded behavioral preamble (lines 1-40)
- Testing details (covered by `general.md`)
- Detailed Effect Collections Quick Reference (link to `effect-patterns.md` instead)

**Keep** (unique to root):
- Project Overview
- Technology Stack
- Quick Reference (commands table)
- Architecture Boundaries
- Specifications section
- IDE Compatibility

**Update** (add navigation):
```markdown
## Detailed Rules

For comprehensive guidelines, see:
- [Behavioral Rules](.claude/rules/behavioral.md)
- [General Project Rules](.claude/rules/general.md)
- [Effect Patterns](.claude/rules/effect-patterns.md)
- [Meta-Thinking Patterns](.claude/rules/meta-thinking.md)
- [Code Standards](.claude/rules/code-standards.md)
```

#### Step 3: Delete `.claude/CLAUDE.md` (P4 Phase)

After verifying content migration:
```bash
# Verify all content migrated:
grep -l "effect-thinking" .claude/rules/*.md  # Should find meta-thinking.md
grep -l "code-standards" .claude/rules/*.md   # Should find code-standards.md

# Delete:
rm .claude/CLAUDE.md
```

---

## 6. Token Budget Analysis

### 6.1 Current Token Usage

| Component | Size (chars) | Tokens | Percentage |
|-----------|--------------|--------|------------|
| Root `CLAUDE.md` | 10,325 | 2,581 | 25% |
| `.claude/CLAUDE.md` | 3,438 | 859 | 8% |
| `.claude/rules/*.md` (3 files) | 27,562 | 6,890 | 67% |
| **Total** | **41,325** | **10,330** | **100%** |

### 6.2 Projected Token Savings

#### Agent Consolidation

| Category | Action | Token Savings |
|----------|--------|---------------|
| Merge agents-md-updater + readme-updater | 383 lines → 250 lines | ~500 tokens |
| Remove missing agents from context | 2 agents × ~250 lines | ~200 tokens |
| **Subtotal** | | **~700 tokens** |

#### CLAUDE.md Consolidation

| Overlap Category | Tokens | Action |
|------------------|--------|--------|
| Behavioral rules (3x duplication) | ~460 | Remove from root preamble |
| Commands table (2x duplication) | ~300 | Keep in root, remove from rules |
| Testing guidance (2x duplication) | ~750 | Keep in rules, link from root |
| Effect patterns refs | ~200 | Consolidate references |
| **Subtotal** | **~1,710** | |

**Realistic CLAUDE.md savings**: ~1,200-1,500 tokens (removing triplication overhead)

#### IDE Configuration Fixes

| Issue | Current Loss | Recovery |
|-------|--------------|----------|
| Cursor `general.mdc` missing 38% | N/A (separate context) | Fixes Cursor IDE guidance |
| Cursor `effect-patterns.mdc` missing 53% | N/A (separate context) | Fixes Cursor IDE guidance |
| Windsurf symlink creation | N/A | Enables Windsurf IDE |

**Note**: IDE config fixes don't affect Claude Code token budget, but ensure parity across all IDEs.

### 6.3 Total Projected Savings

| Component | Current | Target | Savings |
|-----------|---------|--------|---------|
| Agent definitions | ~7,750 tokens | ~7,050 tokens | ~700 tokens (9%) |
| CLAUDE.md files | ~3,440 tokens | ~2,200 tokens | ~1,240 tokens (36%) |
| Rule files | ~6,890 tokens | ~7,100 tokens | -210 tokens (3% increase from new files) |
| **Total** | **~18,080 tokens** | **~16,350 tokens** | **~1,730 tokens (10%)** |

**Note**: Token count assumes only system context loaded by Claude Code. Actual savings depend on how many agents/rules are loaded per session.

### 6.4 Context Window Impact

**Current**: ~10,330 tokens for CLAUDE.md + rules (not counting agents)
**Target**: ~9,300 tokens (after consolidation)
**Available for agent definitions**: More room to load specialized agents on demand

**Benefit**: Reduced system context overhead allows loading more agents or deeper code context during task execution.

---

## 7. Implementation Phases (P3-P5)

### Phase 3: Agent Registry (Estimated: 4 hours)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Merge agents-md-updater + readme-updater | 2 hours | `.claude/agents/doc-maintainer.md` |
| Remove 2 missing agents from manifest | 15 min | Updated `agents-manifest.yaml` |
| Add 11 orphaned agents to manifest | 1 hour | Updated `agents-manifest.yaml` |
| Validate all 28 agents have manifest entries | 15 min | Validation report |
| Update tier assignments in manifest | 30 min | Organized manifest |

### Phase 4: CLAUDE.md Consolidation (Estimated: 3 hours)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Create `.claude/rules/meta-thinking.md` | 30 min | New rule file |
| Create `.claude/rules/code-standards.md` | 45 min | New rule file |
| Simplify root `CLAUDE.md` | 1 hour | Updated root file |
| Delete `.claude/CLAUDE.md` | 15 min | Removed file |
| Verify content migration | 30 min | Migration checklist |

### Phase 5: IDE Configuration (Estimated: 2 hours)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Re-sync Cursor rules (fix 38-53% loss) | 5 min | Updated `.cursor/rules/*.mdc` |
| Create Windsurf rules symlink | 1 min | `.windsurf/rules/ → .claude/rules/` |
| Create Cursor skills symlink | 1 min | `.cursor/skills/ → .claude/skills/` |
| Create Windsurf skills symlink | 1 min | `.windsurf/skills/ → .claude/skills/` |
| Remove `.codex/` and `.opencode/` | 5 min | Deleted directories |
| Harden sync script (add validation) | 1.5 hours | Enhanced `sync-cursor-rules.ts` |
| Verify parity across all IDEs | 30 min | Validation report |

---

## 8. Success Criteria

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Agent count | 31 (manifest refs) | 28 | `ls -1 .claude/agents/*.md \| wc -l` |
| Synced agents | 18 | 28 | All agents have manifest entries |
| Orphaned agents | 11 | 0 | All `.claude/agents/*.md` in manifest |
| Missing agents | 2 | 0 | No manifest entries without files |
| Cursor rule accuracy | 47-62% | 100% | Line count parity ±5 lines (frontmatter) |
| Skills directories | 6 | 1 + 2 symlinks | Only `.claude/skills/` + IDE symlinks |
| Token overhead | ~10,330 | ~9,300 | 10% reduction |

### Qualitative Criteria

- [ ] All IDEs (Claude, Cursor, Windsurf) receive identical rule guidance
- [ ] No manual sync required for Windsurf (symlinks)
- [ ] Minimal sync required for Cursor (automated script)
- [ ] Clear hierarchy: root CLAUDE.md links to detailed rules
- [ ] No content duplication across CLAUDE.md files
- [ ] All agent files have corresponding manifest entries
- [ ] Sync script includes validation safeguards

---

## 9. Risk Analysis

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Merged `doc-maintainer` becomes too complex | Users confused about which agent to invoke | Clear parameter documentation, split if complexity exceeds threshold |
| Symlink strategy breaks on Windows | Windsurf IDE users on Windows can't access rules | Add Windows junction support or fallback to copy strategy |
| Sync script fails to preserve content | Cursor users receive incomplete guidance | Add line count validation, content hash checks, rollback mechanism |

### Medium-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Orphaned agents have undocumented dependencies | Agents fail at runtime | Validate all skill references during manifest registration |
| Token savings don't materialize | No performance improvement | Measure actual context loaded per session, adjust if needed |
| CLAUDE.md consolidation misses edge cases | Some rules lost in migration | Comprehensive diff check before deleting `.claude/CLAUDE.md` |

### Low-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users prefer old agent names | Adoption friction | Document migration in changelog, keep old names as aliases |
| Skill symlinks introduce permission issues | File access errors on some systems | Add permission checks to setup script |

---

## 10. Validation Checklist

### P3 (Agent Registry)

- [ ] `doc-maintainer.md` created and tested
- [ ] `agents-manifest.yaml` has exactly 28 entries
- [ ] All 28 `.claude/agents/*.md` files have manifest entries
- [ ] No manifest entries for missing files (`code-observability-writer`, `effect-schema-expert`)
- [ ] `bun run agents:validate` passes (if script exists)

### P4 (CLAUDE.md Consolidation)

- [ ] `.claude/rules/meta-thinking.md` created (24 lines from `.claude/CLAUDE.md`)
- [ ] `.claude/rules/code-standards.md` created (68 lines from `.claude/CLAUDE.md`)
- [ ] Root `CLAUDE.md` simplified (no duplication with rules files)
- [ ] Root `CLAUDE.md` includes navigation links to all 5 rule files
- [ ] `.claude/CLAUDE.md` deleted
- [ ] `grep "effect-thinking" .claude/rules/*.md` finds `meta-thinking.md`
- [ ] `grep "code-standards" .claude/rules/*.md` finds `code-standards.md`

### P5 (IDE Configuration)

- [ ] `bun run scripts/sync-cursor-rules.ts` completes without errors
- [ ] `wc -l .claude/rules/*.md .cursor/rules/*.mdc` shows parity ±5 lines
- [ ] `.windsurf/rules/` is symlink to `.claude/rules/`
- [ ] `.cursor/skills/` is symlink to `.claude/skills/`
- [ ] `.windsurf/skills/` is symlink to `.claude/skills/`
- [ ] `.codex/` directory deleted
- [ ] `.opencode/` directory deleted
- [ ] `cat .windsurf/rules/general.md` displays Claude source content
- [ ] Sync script includes `syncedAt` and `sourceHash` in frontmatter
- [ ] Sync script validates line count before/after transformation

---

## 11. Appendices

### A. Agent Merger Details

**doc-maintainer Implementation Notes:**

```yaml
name: doc-maintainer
description: Maintains AGENTS.md and README.md files for packages
model: claude-sonnet-4-5
tools:
  - Glob
  - Grep
  - Read
  - Write
  - Edit
parameters:
  target:
    type: enum
    values: [agents, readme, both]
    default: both
    description: Which documentation files to audit and update
  packages:
    type: array
    items: string
    optional: true
    description: Package names to process (defaults to all)
workflow:
  - Scan packages: "Use Glob to find **/package.json"
  - Validate references: "Check import paths, dependencies"
  - Apply Effect patterns: "Enforce namespace imports, BS helpers"
  - Detect stale content: "Identify missing packages, outdated examples"
  - Update files: "Write corrected AGENTS.md and/or README.md"
  - Generate report: "List updated files, issues found"
```

**Merged Content Sources:**
- `agents-md-updater.md` (164 lines) → workflow for AGENTS.md
- `readme-updater.md` (219 lines) → workflow for README.md
- Shared verification logic (deduplicated)

### B. Skill Directory Inventory

**`.claude/skills/` (58 skills)**:
- 49 shared skills (general patterns, Effect utilities, testing)
- 9 symlinks to `.agents/skills/` (agent-specific skills)

**`.agents/skills/` (9 skills)**:
- Agent-specific skills referenced by agents but not generally applicable

**Target State**: `.claude/skills/` remains at 58 skills (no change), but IDE configs symlink to it.

### C. Sync Script Enhancements

**Current Capabilities:**
- Transform `.md` → `.mdc`
- Add frontmatter
- Transform `paths:` → `globs:`

**Required Enhancements (P5):**

```typescript
interface SyncResult {
  sourceFile: string;
  targetFile: string;
  sourceLinesCount: number;
  targetLinesCount: number;
  sourceHash: string;
  syncedAt: string;
  status: "success" | "error";
  error?: string;
}

// Add validation after sync:
function validateSync(result: SyncResult): void {
  const expectedTargetLines = result.sourceLinesCount + 4; // Frontmatter overhead
  const actualDelta = result.targetLinesCount - result.sourceLinesCount;

  if (actualDelta < 3 || actualDelta > 6) {
    throw new Error(
      `Line count mismatch: expected +4 lines, got +${actualDelta} for ${result.sourceFile}`
    );
  }
}

// Add hash for drift detection:
function computeHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}
```

---

## 12. References

- [P1 Analysis Findings](./P1_ANALYSIS_FINDINGS.md)
- [P1 Redundancy Report](./P1_REDUNDANCY_REPORT.md)
- [Agent Overlap Matrix](./agent-overlap-matrix.md)
- [Conflict Matrix](./conflict-matrix.md)
- [P0 Baseline](./P0_BASELINE.md)
- [Agent Catalog](./agent-catalog.md)

---

**Document Status**: ✓ Complete - Ready for P3-P5 implementation
**Last Updated**: 2026-02-03
**Next Phase**: P3 (Agent Registry Implementation)
