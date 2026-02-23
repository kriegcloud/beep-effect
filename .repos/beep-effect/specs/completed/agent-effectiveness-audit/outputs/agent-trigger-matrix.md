# Agent Trigger Matrix

> Comprehensive catalog of trigger patterns for all agents in the beep-effect monorepo.

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Agents** | 29 |
| **Agents with Defined Triggers** | 29/29 (100%) |
| **Tiers** | 4 (Foundation, Research, Quality, Writer) |
| **Capability Levels** | 3 (read-only, write-reports, write-files) |
| **High Confusion Risk Pairs** | 3 |
| **Medium Confusion Risk Pairs** | 5 |

---

## Agent Trigger Matrix by Tier

### TIER 1: FOUNDATION AGENTS (3)

| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
|-------|-----------------|-------------------|----------------|
| **codebase-researcher** | "explore codebase" | find files, map dependencies, how does X work, what patterns exist | HIGH: Overlaps with codebase-explorer |
| **codebase-explorer** | "explore" | understand system, find patterns, how does this work | HIGH: Both agents do exploration |
| **reflector** | "analyze reflection" | extract patterns, meta-reflection, improve prompts, learnings | LOW: Focused on REFLECTION_LOG.md |

---

### TIER 2: RESEARCH AGENTS (9)

| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
|-------|-----------------|-------------------|----------------|
| **mcp-researcher** | "effect docs" | effect api, effect pattern, how to in effect, schema api, layer composition | MEDIUM: Overlaps with effect-researcher |
| **web-researcher** | "research online" | best practices, prior art, external documentation, industry standard | LOW: Clearly distinct |
| **domain-modeler** | "domain model" | entity, value object, tagged struct, ADT | LOW: Specific niche |
| **effect-expert** | "effect service" | layer composition, typed error, stream, fiber, scope | MEDIUM: Overlaps with mcp-researcher |
| **effect-platform** | "file io" | cli tool, process spawn, platform, cross-platform | LOW: Specific to @effect/platform |
| **schema-expert** | "schema composition" | transform, filter, validation, schema pattern | LOW: Focused on Schema |
| **effect-researcher** | "effect question" | effect help | HIGH: Too generic |
| **effect-predicate-master** | "predicate" | type guard, refinement | MEDIUM: Overlaps with effect-researcher |
| **ai-trends-researcher** | "ai trends" | emerging patterns, best practices research, benchmark configuration | LOW: Web-focused |

---

### TIER 3: QUALITY AGENTS (5)

| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
|-------|-----------------|-------------------|----------------|
| **code-reviewer** | "review code" | check violations, audit guidelines, effect patterns check | MEDIUM: Overlaps with architect |
| **architecture-pattern-enforcer** | "architecture audit" | layer violations, cross-slice imports, boundary check | MEDIUM: Overlaps with code-reviewer |
| **spec-reviewer** | "review spec" | spec quality, context engineering, handoff protocol | LOW: Unique niche |
| **lawyer** | "legal review" | law compliance, covenant, enforce rules | LOW: Unique niche |
| **tsconfig-auditor** | "tsconfig audit" | typescript config, path aliases | LOW: Highly specialized |

---

### TIER 4: WRITER AGENTS (8)

| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
|-------|-----------------|-------------------|----------------|
| **doc-writer** | "write documentation" | create readme, add jsdoc, create agents.md | MEDIUM: Overlaps with doc-maintainer |
| **doc-maintainer** | "update agents.md" | update readme, audit documentation, fix documentation | HIGH: Nearly identical to doc-writer |
| **test-writer** | "write tests" | add test coverage, create test file, unit tests | LOW: Specific niche |
| **documentation-expert** | "ai context" | module documentation, discoverable module, ai-context.md | LOW: Specific to ai-context.md |
| **observability-expert** | "observability" | telemetry, wide events, tracing, metrics | LOW: Specific niche |
| **react-expert** | "react component" | vm pattern, effect atom, ui component | LOW: Specific niche |
| **prompt-refiner** | "refine prompt" | improve agent, update agent definition | LOW: Specific niche |
| **jsdoc-fixer** | "fix jsdoc" | add jsdoc, jsdoc compliance | MEDIUM: Overlaps with doc-writer |
| **package-error-fixer** | "fix errors" | fix types, fix build, fix package | MEDIUM: Too generic |

---

### UTILITY AGENTS (1)

| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
|-------|-----------------|-------------------|----------------|
| **wealth-management-domain-expert** | "wealth management" | trust structure, beneficiary, UHNWI, portfolio | LOW: Highly specific domain |

---

## High-Risk Confusion Clusters

### Cluster 1: Explorers (HIGH RISK)

```
codebase-researcher  → "explore codebase"  (systematic, single-threaded)
codebase-explorer    → "explore"           (parallel, multi-threaded)
```

**Problem**: Triggers don't clarify systematic vs parallel approach.

**Recommendation**: Update triggers:
- codebase-researcher: "explore codebase systematically" OR "map codebase architecture"
- codebase-explorer: "explore in parallel" OR "multi-track exploration"

---

### Cluster 2: Documentation Writers (HIGH RISK)

```
doc-writer      → "write documentation"
doc-maintainer  → "update agents.md" / "update readme"
jsdoc-fixer     → "fix jsdoc"
```

**Problem**: Unclear when each agent is appropriate.
- doc-writer: Creates new docs from scratch
- doc-maintainer: Audits and updates existing docs
- jsdoc-fixer: Fixes JSDoc compliance on existing code

**Recommendation**: Clarify triggers:
- doc-writer: "write new documentation" OR "create readme from scratch"
- doc-maintainer: "audit documentation" OR "update stale docs"
- jsdoc-fixer: "fix jsdoc violations" OR "add missing jsdoc"

---

### Cluster 3: Effect Documentation Research (MEDIUM RISK)

```
mcp-researcher       → "effect docs" (specific API lookup)
effect-researcher    → "effect question" (general Effect help)
effect-predicate-master → "predicate" (Predicate utilities)
```

**Problem**: mcp-researcher and effect-researcher have circular distinction.

**Recommendation**:
- mcp-researcher: "effect api lookup" OR "exact effect documentation"
- effect-researcher: "effect concept" OR "effect workflow pattern"
- effect-predicate-master: Keep as-is (clear niche)

---

## Cross-Trigger Overlap Matrix

| Agent Pair | Overlap % | Resolution |
|------------|-----------|------------|
| doc-writer ↔ doc-maintainer | 80% | Clarify create vs audit |
| codebase-researcher ↔ codebase-explorer | 75% | Clarify systematic vs parallel |
| mcp-researcher ↔ effect-researcher | 60% | Clarify API vs concept |
| doc-writer ↔ jsdoc-fixer | 60% | Clarify create vs fix |
| code-reviewer ↔ architecture-pattern-enforcer | 50% | Clarify line vs package scope |
| effect-expert ↔ mcp-researcher | 40% | "layer composition" shared |

---

## Manifest Drift Analysis

| Check | Result |
|-------|--------|
| Files in `.claude/agents/` | 29 |
| Entries in manifest | 29 |
| Drift Detected | NONE |

All agents in manifest have corresponding `.md` files.

---

## Recommendations

### Priority 1 (Critical)
1. **Explorers**: Differentiate systematic vs parallel in triggers
2. **Documentation**: Separate "create new" from "audit/maintain" and "fix compliance"
3. **Effect Research**: Clarify "API lookup" vs "concept" vs "specific utilities"

### Priority 2 (Important)
1. **Architecture vs Code**: Add scope clarification (package-level vs line-level)
2. **Package Errors**: Make trigger more specific than "fix errors"

### Priority 3 (Nice to Have)
1. Add phase hints to triggers where applicable
2. Create a visual "decision tree" in orchestrator prompts

---

*Generated by Explore agent during P0 baseline measurement*
