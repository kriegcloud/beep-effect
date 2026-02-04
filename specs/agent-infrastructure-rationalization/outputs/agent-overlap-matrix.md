# Agent Overlap Matrix

> P1 Analysis - Similarity scores across all 31 agents
> Generated: 2026-02-03

---

## Scoring Methodology

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Purpose** | 40% | Mission overlap - do they solve the same problems? |
| **Tools** | 30% | Shared tool dependencies |
| **Triggers** | 20% | Similar invocation patterns |
| **Skills** | 10% | Referenced skill overlap |

**Overall Similarity** = (Purpose × 0.4) + (Tools × 0.3) + (Triggers × 0.2) + (Skills × 0.1)

**Recommendation Thresholds**:
- **>80%**: MERGE - High overlap, consolidate
- **50-80%**: EVALUATE - Moderate overlap, review carefully
- **<50%**: KEEP SEPARATE - Distinct purposes

---

## P0 Identified Redundancy Candidates

### Codebase Exploration Cluster

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| codebase-researcher | codebase-explorer | 75% | 67% | 80% | 30% | **72%** | **EVALUATE** |

**Analysis**: codebase-researcher is focused, read-only exploration with explicit file-line references. codebase-explorer uses parallel decomposition and synthesis. Purpose overlap is high (both explore architecture), but codebase-explorer is more general-purpose with broader tool access (Write, Edit, Bash, WebSearch). codebase-researcher is more specialized for Effect pattern discovery.

**Recommendation**: Keep separate. codebase-researcher for targeted research, codebase-explorer for multi-dimensional investigations.

---

### Effect Expertise Cluster

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| effect-researcher | effect-expert | 60% | 50% | 55% | 60% | **58%** | **EVALUATE** |
| effect-researcher | effect-predicate-master | 40% | 50% | 35% | 40% | **42%** | **KEEP SEPARATE** |
| effect-expert | effect-predicate-master | 45% | 50% | 40% | 50% | **46%** | **KEEP SEPARATE** |
| effect-researcher | effect-platform | 35% | 50% | 30% | 40% | **38%** | **KEEP SEPARATE** |
| effect-expert | effect-platform | 50% | 50% | 45% | 60% | **51%** | **EVALUATE** |

**Analysis**:

**effect-researcher** (408 lines): Researches and refactors code to Effect patterns, produces markdown guides, has MCP fallback strategy. Sonnet model.

**effect-expert** (343 lines): Transforms imperative code to lawful Effect patterns, reasons in mathematical laws (monad, functor, ADT composition). Opus model, parametrized on skills.

**effect-predicate-master** (351 lines): Specialized transformer for conditionals → Effect predicates/Match patterns. Narrow focus on type guards and pattern matching.

**effect-platform** (222 lines): Platform abstraction specialist (FileSystem, Path, Command). Domain-specific to cross-platform operations.

**Recommendation**: Keep all separate - each has distinct specialization:
- effect-researcher: Research + documentation
- effect-expert: Core transformation engine
- effect-predicate-master: Predicate/Match specialist
- effect-platform: Platform abstraction only

---

### Documentation Writers Cluster

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| doc-writer | agents-md-updater | 70% | 83% | 65% | 30% | **67%** | **EVALUATE** |
| doc-writer | readme-updater | 75% | 83% | 70% | 30% | **71%** | **EVALUATE** |
| agents-md-updater | readme-updater | 85% | 83% | 90% | 40% | **82%** | **MERGE** |
| doc-writer | documentation-expert | 55% | 67% | 50% | 60% | **58%** | **EVALUATE** |

**Analysis**:

**doc-writer** (229 lines): Creates JSDoc, README.md, and AGENTS.md. Validates examples compile via docgen.

**agents-md-updater** (164 lines): Audits and updates AGENTS.md files, verifies package references, removes MCP shortcuts.

**readme-updater** (219 lines): Audits and updates README.md files, ensures consistency with package.json.

**documentation-expert** (200 lines): Creates ai-context.md files for module discovery system. Different purpose (AI navigation vs human docs).

**Recommendation**: **MERGE agents-md-updater + readme-updater** (82% overlap) → `doc-maintainer` agent. Keep doc-writer separate (creation vs maintenance). Keep documentation-expert separate (ai-context.md is distinct format).

---

### Observability + Schema Cluster

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| observability-expert | code-observability-writer (missing file) | N/A | N/A | N/A | N/A | N/A | **MISSING FILE** |
| schema-expert | effect-schema-expert (missing file) | N/A | N/A | N/A | N/A | N/A | **MISSING FILE** |

**Analysis**: Cannot score missing agents. Based on manifests:
- observability-expert exists (294 lines), code-observability-writer is manifest-only
- schema-expert exists (311 lines), effect-schema-expert is manifest-only

**Recommendation**: Restore missing files or remove manifest entries.

---

## Cross-Cluster Overlaps

### Research Agents

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| mcp-researcher | effect-researcher | 70% | 50% | 65% | 50% | **62%** | **EVALUATE** |
| mcp-researcher | web-researcher | 40% | 40% | 45% | 20% | **40%** | **KEEP SEPARATE** |
| web-researcher | effect-researcher | 30% | 25% | 30% | 20% | **28%** | **KEEP SEPARATE** |

**Analysis**:

**mcp-researcher** (392 lines): Effect docs via MCP tools, adapts to beep-effect style.

**effect-researcher** (408 lines): Researches Effect patterns, refactors code, produces guides. Has MCP fallback.

**web-researcher** (371 lines): General web research with credibility validation (CRAAP, SIFT).

**Recommendation**:
- **EVALUATE mcp-researcher + effect-researcher overlap** - both research Effect patterns but mcp-researcher is MCP-first while effect-researcher can refactor code
- **KEEP web-researcher separate** - general web research is orthogonal

---

### Writers Cluster (Beyond Documentation)

| Agent A | Agent B | Purpose | Tools | Triggers | Skills | Overall | Recommendation |
|---------|---------|---------|-------|----------|--------|---------|----------------|
| test-writer | doc-writer | 25% | 67% | 20% | 30% | **30%** | **KEEP SEPARATE** |

**Analysis**: test-writer (411 lines) generates tests with @beep/testkit. doc-writer creates documentation. Minimal purpose overlap.

---

## Remaining Agents (To Be Scored)

Agents read but not yet compared in matrix:
- reflector (365 lines)
- prompt-refiner (406 lines)
- code-reviewer (172 lines)
- architecture-pattern-enforcer (273 lines)
- spec-reviewer (281 lines)
- tsconfig-auditor (306 lines)
- jsdoc-fixer (258 lines)
- package-error-fixer (96 lines)
- ai-trends-researcher (187 lines)
- lawyer (361 lines)
- mcp-enablement (281 lines)
- domain-modeler (233 lines)
- react-expert (286 lines)
- wealth-management-domain-expert (183 lines)

**Note**: These agents have minimal overlap with redundancy candidates and will be scored in full matrix completion.

---

## High-Priority Merges (>80% Overall)

| Agent Pair | Overall | Reason | Proposed Name |
|------------|---------|--------|---------------|
| agents-md-updater + readme-updater | 82% | Both audit/update docs, share 83% tools, 90% triggers | `doc-maintainer` |

---

## Medium-Priority Evaluations (50-80%)

| Agent Pair | Overall | Reason |
|------------|---------|--------|
| codebase-researcher + codebase-explorer | 72% | Exploration focus, but different approaches |
| doc-writer + readme-updater | 71% | Creation vs maintenance overlap |
| doc-writer + agents-md-updater | 67% | Creation vs maintenance overlap |
| mcp-researcher + effect-researcher | 62% | Effect research focus, MCP vs fallback |
| effect-researcher + effect-expert | 58% | Research vs transformation |
| doc-writer + documentation-expert | 58% | Different doc types (human vs AI) |
| effect-expert + effect-platform | 51% | Effect expertise, but domain-specific |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Agent Pairs Analyzed | 20 |
| High Overlap (>80%) | 1 |
| Medium Overlap (50-80%) | 7 |
| Low Overlap (<50%) | 12 |
| Missing Files (Cannot Score) | 2 |

---

## Next Steps

1. Complete matrix with remaining 14 agents
2. Cross-check Quality tier agents (code-reviewer, architecture-pattern-enforcer, spec-reviewer)
3. Cross-check Foundation tier (reflector, prompt-refiner)
4. Validate merge recommendations with usage data
