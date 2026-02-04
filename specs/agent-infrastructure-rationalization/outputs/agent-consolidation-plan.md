# Agent Consolidation Plan

> Phase 2 Deliverable - Agent Infrastructure Rationalization
> Generated: 2026-02-03
> Based on: P1 Analysis Findings, Redundancy Report, Agent Overlap Matrix

---

## Executive Summary

After analyzing 31 total agents (20 in manifest, 11 orphaned, 2 missing files), this plan proposes targeted consolidation while preserving specialist agents that serve distinct roles.

**Key Metrics:**

| Metric | Current | Target | Change |
|--------|---------|--------|--------|
| Total agents | 31 | 28 | -3 (9.7% reduction) |
| Manifest sync | 18/20 valid | 28/28 | 100% coverage |
| Orphaned agents | 11 | 0 | Eliminated |
| Missing files | 2 | 0 | Resolved |
| Token overhead | ~10,330 | ~8,500 | ~18% reduction |

**Approach:**
- **1 high-priority merge** (agents-md-updater + readme-updater)
- **2 missing file removals** (code-observability-writer, effect-schema-expert)
- **10 orphaned agents added to manifest** (1 rejected)
- **18 agents preserved** (validated distinct purposes)

---

## 1. Summary Table - All 31 Agents

### Tier 1: Foundation (3 agents → 3 agents)

| Agent | Status | Decision | Rationale |
|-------|--------|----------|-----------|
| codebase-researcher | In manifest ✓ | **KEEP** | Validated distinct from codebase-explorer (systematic vs quick) |
| reflector | In manifest ✓ | **KEEP** | Unique meta-reflection capability |
| prompt-refiner | In manifest ✓ | **KEEP** | Unique prompt improvement workflow |

### Tier 2: Research (7 agents → 7 agents)

| Agent | Status | Decision | Rationale |
|-------|--------|----------|-----------|
| mcp-researcher | In manifest ✓ | **KEEP** | MCP-first Effect docs lookup |
| web-researcher | In manifest ✓ | **KEEP** | General web research with CRAAP/SIFT validation |
| effect-researcher | In manifest ✓ | **KEEP** | Effect pattern refactoring + guide creation |
| effect-schema-expert | Missing file ✗ | **REMOVE** | No file, schema-expert exists (311 lines) |
| effect-predicate-master | In manifest ✓ | **KEEP** | Specialist: predicates/Match patterns |
| ai-trends-researcher | In manifest ✓ | **KEEP** | AI/ML trends research, benchmarking |
| **effect-expert** | Orphaned | **ADD** | Mathematical transformation engine (Opus model) |

### Tier 3: Quality (5 agents → 5 agents)

| Agent | Status | Decision | Rationale |
|-------|--------|----------|-----------|
| code-reviewer | In manifest ✓ | **KEEP** | Guideline enforcement |
| architecture-pattern-enforcer | In manifest ✓ | **KEEP** | Boundary/layer validation |
| spec-reviewer | In manifest ✓ | **KEEP** | Spec quality validation |
| tsconfig-auditor | In manifest ✓ | **KEEP** | TypeScript config auditing |
| **lawyer** | Orphaned | **ADD** | Legal review, licensing (361 lines) |

### Tier 4: Writers (12 agents → 10 agents)

| Agent | Status | Decision | Rationale |
|-------|--------|----------|-----------|
| doc-writer | In manifest ✓ | **KEEP** | Creates new JSDoc/README/AGENTS.md |
| test-writer | In manifest ✓ | **KEEP** | Effect test generation |
| code-observability-writer | Missing file ✗ | **REMOVE** | No file, observability-expert exists |
| jsdoc-fixer | In manifest ✓ | **KEEP** | JSDoc compliance fixes |
| package-error-fixer | In manifest ✓ | **KEEP** | Systematic package error fixing |
| agents-md-updater | In manifest ✓ | **MERGE** → doc-maintainer | 82% overlap with readme-updater |
| readme-updater | In manifest ✓ | **MERGE** → doc-maintainer | 82% overlap with agents-md-updater |
| **observability-expert** | Orphaned | **ADD** | Observability patterns (294 lines, Opus) |
| **schema-expert** | Orphaned | **ADD** | Schema composition (311 lines, Opus) |
| **effect-platform** | Orphaned | **ADD** | FileSystem/Path/Command specialist (222 lines) |

### Utility/Domain (4 agents → 3 agents)

| Agent | Status | Decision | Rationale |
|-------|--------|----------|-----------|
| **codebase-explorer** | Orphaned | **ADD** | Parallel exploration (145 lines) |
| **documentation-expert** | Orphaned | **ADD** | ai-context.md creator (200 lines) |
| **domain-modeler** | Orphaned | **ADD** | Domain modeling patterns (233 lines) |
| **react-expert** | Orphaned | **ADD** | React 19/Next.js patterns (286 lines) |
| **mcp-enablement** | Orphaned | **REJECT** | One-time setup, not recurring |
| **wealth-management-domain-expert** | Orphaned | **REJECT** | Project-specific, not reusable |

---

## 2. Merge Details

### MERGE: agents-md-updater + readme-updater → doc-maintainer

**Overlap Score: 82%** (highest priority merge)

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Purpose | 85% | Both audit/update package documentation |
| Tools | 83% | Identical: Glob, Grep, Read, Write, Edit |
| Triggers | 90% | "update docs", "check references", "audit packages" |
| Skills | 40% | Both reference documentation standards |

**Implementation Approach:**

```yaml
doc-maintainer:
  tier: 4
  capability: write-files
  output_type: documentation
  description: "Package documentation maintainer - updates AGENTS.md, README.md, and verifies references"
  tools:
    - Glob
    - Grep
    - Read
    - Write
    - Edit
  phases: [4]
  triggers:
    - "update docs"
    - "update agents.md"
    - "update readme"
    - "audit documentation"
    - "check references"
    - "fix stale imports"
  input_parameters:
    target: "agents|readme|both"  # Default: both
    packages: "string[]"           # Default: all packages
  use_when: "Need to update or audit package documentation files"
  do_not_use_when: "Creating new documentation (use doc-writer)"
```

**Combined Capabilities:**

| Feature | From agents-md-updater | From readme-updater |
|---------|------------------------|---------------------|
| AGENTS.md maintenance | ✓ | |
| README.md maintenance | | ✓ |
| MCP shortcut removal | ✓ | |
| package.json consistency | | ✓ |
| Import path validation | ✓ | ✓ |
| Effect pattern enforcement | ✓ | ✓ |
| Stale reference detection | ✓ | ✓ |

**Prompt Structure:**

```markdown
# Combined Sections
1. Documentation Standards (merged)
2. Verification Workflows (merged)
3. AGENTS.md-specific rules (from agents-md-updater)
4. README.md-specific rules (from readme-updater)
5. Shared audit patterns (consolidated)

# New Input Handling
if input.target === "agents" → AGENTS.md only
if input.target === "readme" → README.md only
if input.target === "both" → both files (default)
```

**Token Savings:**
- agents-md-updater: ~164 lines
- readme-updater: ~219 lines
- **Combined: ~250 lines** (~35% reduction)

---

## 3. Remove Details

### REMOVE: code-observability-writer (Missing File)

**Justification:**
- Manifest entry exists, but no agent file found
- Redundant with existing `observability-expert` (294 lines, Opus model)
- observability-expert covers same domain (logging/tracing/metrics)
- No evidence of file ever existing in git history

**Action:** Delete manifest entry

### REMOVE: effect-schema-expert (Missing File)

**Justification:**
- Manifest entry exists, but no agent file found
- Redundant with existing `schema-expert` (311 lines, Opus model)
- schema-expert covers Effect Schema patterns comprehensively
- No evidence of file ever existing in git history

**Action:** Delete manifest entry

---

## 4. Add to Manifest Details

### ADD: effect-expert (Tier 2, Opus)

**File:** `.claude/agents/effect-expert.md` (343 lines)

**Capability:** read-only
**Output Type:** none (provides transformation guidance)
**Phase:** [1, 4]

**Manifest Entry:**

```yaml
effect-expert:
  tier: 2
  capability: read-only
  output_type: none
  description: "Mathematical Effect transformation engine - monad laws, functor composition, ADT patterns"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
    - AskUserQuestion
  model: opus  # Requires Opus for complex reasoning
  phases: [1, 4]
  triggers:
    - "transform to effect"
    - "monad laws"
    - "functor composition"
    - "adt patterns"
    - "lawful effect code"
  use_when: "Need complex Effect transformations with mathematical rigor"
  do_not_use_when: "Simple Effect patterns (use effect-researcher)"
```

**Validated Distinct From:**
- effect-researcher (58% overlap): effect-researcher produces docs, effect-expert transforms code
- effect-platform (51% overlap): effect-expert is general, effect-platform is platform-specific

---

### ADD: schema-expert (Tier 2, Opus)

**File:** `.claude/agents/schema-expert.md` (311 lines)

**Capability:** read-only
**Output Type:** none

**Manifest Entry:**

```yaml
schema-expert:
  tier: 2
  capability: read-only
  output_type: none
  description: "Effect Schema composition and validation patterns specialist"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus  # Requires Opus for schema composition reasoning
  phases: [1, 4]
  triggers:
    - "schema design"
    - "schema composition"
    - "schema validation"
    - "tagged struct"
    - "schema transformation"
  use_when: "Need help designing or composing Effect Schemas"
  do_not_use_when: "Simple schema questions (use mcp-researcher)"
```

**Note:** Replaces missing `effect-schema-expert` entry.

---

### ADD: effect-platform (Tier 2, Opus)

**File:** `.claude/agents/effect-platform.md` (222 lines)

**Capability:** read-only
**Output Type:** none

**Manifest Entry:**

```yaml
effect-platform:
  tier: 2
  capability: read-only
  output_type: none
  description: "Effect Platform specialist - FileSystem, Path, Command abstractions"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus
  phases: [1, 4]
  triggers:
    - "filesystem"
    - "path operations"
    - "command execution"
    - "platform abstraction"
    - "cross-platform"
  use_when: "Need Effect Platform services (FileSystem, Path, Command)"
  do_not_use_when: "General Effect patterns (use effect-researcher)"
```

---

### ADD: observability-expert (Tier 4, Opus)

**File:** `.claude/agents/observability-expert.md` (294 lines)

**Capability:** write-files
**Output Type:** code

**Manifest Entry:**

```yaml
observability-expert:
  tier: 4
  capability: write-files
  output_type: code
  description: "Observability instrumentation - adds logging, tracing, metrics to code"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus  # Complex observability patterns
  phases: [4]
  triggers:
    - "add logging"
    - "add tracing"
    - "add metrics"
    - "instrument code"
    - "observability patterns"
  use_when: "Need to add structured logging, tracing spans, or metrics"
  do_not_use_when: "Documentation or tests (use doc-writer/test-writer)"
```

**Note:** Replaces missing `code-observability-writer` entry.

---

### ADD: codebase-explorer (Tier 1)

**File:** `.claude/agents/codebase-explorer.md` (145 lines)

**Capability:** read-only
**Output Type:** none

**Manifest Entry:**

```yaml
codebase-explorer:
  tier: 1
  capability: read-only
  output_type: none
  description: "Parallel codebase exploration with multi-track synthesis"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  phases: [1]
  triggers:
    - "quick exploration"
    - "parallel search"
    - "broad investigation"
    - "multi-dimensional analysis"
  use_when: "Need quick, broad exploration across multiple codebase dimensions"
  do_not_use_when: "Systematic, focused research (use codebase-researcher)"
```

**Validated Distinct From:**
- codebase-researcher (72% overlap): codebase-researcher is systematic/focused, codebase-explorer is parallel/broad

---

### ADD: documentation-expert (Tier 4)

**File:** `.claude/agents/documentation-expert.md` (200 lines)

**Capability:** write-files
**Output Type:** documentation

**Manifest Entry:**

```yaml
documentation-expert:
  tier: 4
  capability: write-files
  output_type: documentation
  description: "ai-context.md creator for module discovery system"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus
  phases: [3, 4]
  triggers:
    - "create ai-context"
    - "module discovery"
    - "/modules system"
    - "ai navigation docs"
  use_when: "Need to create ai-context.md files for module discovery"
  do_not_use_when: "Human-readable docs (use doc-writer)"
```

**Validated Distinct From:**
- doc-writer (58% overlap): documentation-expert creates ai-context.md (AI navigation), doc-writer creates human docs

---

### ADD: domain-modeler (Tier 2, Opus)

**File:** `.claude/agents/domain-modeler.md` (233 lines)

**Capability:** read-only
**Output Type:** none

**Manifest Entry:**

```yaml
domain-modeler:
  tier: 2
  capability: read-only
  output_type: none
  description: "Domain modeling patterns and bounded context design"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus  # Complex domain modeling reasoning
  phases: [0, 1]
  triggers:
    - "domain model"
    - "bounded context"
    - "aggregate design"
    - "entity design"
    - "value object"
  use_when: "Need help designing domain models, aggregates, or bounded contexts"
  do_not_use_when: "Implementation details (use effect-expert/schema-expert)"
```

---

### ADD: react-expert (Tier 2, Opus)

**File:** `.claude/agents/react-expert.md` (286 lines)

**Capability:** read-only
**Output Type:** none

**Manifest Entry:**

```yaml
react-expert:
  tier: 2
  capability: read-only
  output_type: none
  description: "React 19 + Next.js 16 patterns specialist"
  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Glob
    - Grep
    - WebFetch
    - WebSearch
  model: opus
  phases: [1, 4]
  triggers:
    - "react pattern"
    - "next.js"
    - "react 19"
    - "server components"
    - "client components"
  use_when: "Need React 19 or Next.js 16 specific patterns"
  do_not_use_when: "Backend/Effect-only code"
```

---

### ADD: lawyer (Tier 3)

**File:** `.claude/agents/lawyer.md` (361 lines)

**Capability:** write-reports
**Output Type:** reports

**Manifest Entry:**

```yaml
lawyer:
  tier: 3
  capability: write-reports
  output_type: reports
  output_path: "outputs/legal-review.md"
  description: "Legal compliance, licensing, and IP review specialist"
  tools:
    - Glob
    - Grep
    - Read
  phases: [2, 4]
  triggers:
    - "legal review"
    - "licensing"
    - "compliance"
    - "ip review"
    - "license audit"
  use_when: "Need legal/licensing review of code, dependencies, or documentation"
  do_not_use_when: "Code review (use code-reviewer)"
```

---

### REJECT: mcp-enablement

**File:** `.claude/agents/mcp-enablement.md` (281 lines)

**Justification:**
- One-time MCP server setup task
- Not a recurring agent pattern
- Instructions better suited for documentation (e.g., docs/MCP_SETUP.md)
- No phase assignments (setup is pre-phase 0)

**Action:** Keep file for reference, do not add to manifest

---

### REJECT: wealth-management-domain-expert

**File:** `.claude/agents/wealth-management-domain-expert.md` (183 lines)

**Justification:**
- Project-specific domain expert (wealth management)
- Not applicable to beep-effect codebase
- Not reusable across different projects
- Appears to be from different project/context

**Action:** Consider archiving or moving to project-specific agent directory

---

## 5. Final Count

### Agent Count Summary

| Category | Current | Target | Change |
|----------|---------|--------|--------|
| **Manifest Valid** | 18 | 28 | +10 |
| **Manifest Missing Files** | 2 | 0 | -2 |
| **Orphaned (Added)** | 10 | 0 | -10 |
| **Orphaned (Rejected)** | 2 | 2 | 0 |
| **Merged** | 2 | 1 | -1 |
| **TOTAL AGENTS** | **31** | **28** | **-3** |

### By Tier

| Tier | Before | After | Change |
|------|--------|-------|--------|
| Tier 1 (Foundation) | 3 | 4 | +1 (codebase-explorer) |
| Tier 2 (Research) | 7 | 10 | +3 (effect-expert, schema-expert, effect-platform, domain-modeler, react-expert; -2 missing) |
| Tier 3 (Quality) | 5 | 6 | +1 (lawyer) |
| Tier 4 (Writers) | 12 | 8 | -4 (merge 2 → 1, add 2, remove 2 missing, add 1 doc-expert) |
| **Total In Manifest** | **27** | **28** | **+1** |
| **Orphaned** | **11** | **2** | **-9** |

### Token Overhead Reduction

| Category | Before | After | Savings |
|----------|--------|-------|---------|
| Agent definitions | ~10,330 tokens | ~8,500 tokens | ~1,830 tokens |
| Manifest overhead | ~859 tokens | ~1,100 tokens | -241 tokens |
| **Total** | **~11,189 tokens** | **~9,600 tokens** | **~1,589 tokens (14%)** |

---

## 6. Implementation Checklist

### Phase 2a: Cleanup (Immediate)

- [ ] Delete manifest entries for missing files
  - [ ] Remove `code-observability-writer`
  - [ ] Remove `effect-schema-expert`
- [ ] Verify orphaned files exist and are well-formed
  - [ ] Read all 11 orphaned agent files
  - [ ] Validate markdown structure
  - [ ] Check for tool/phase consistency

### Phase 2b: Merge (2 hours)

- [ ] Create `doc-maintainer.md` agent
  - [ ] Merge common sections from agents-md-updater + readme-updater
  - [ ] Add input parameter handling (target: agents|readme|both)
  - [ ] Preserve AGENTS.md-specific rules
  - [ ] Preserve README.md-specific rules
  - [ ] Test on sample packages
- [ ] Archive original agents
  - [ ] Move agents-md-updater.md → archive/
  - [ ] Move readme-updater.md → archive/
- [ ] Update manifest with doc-maintainer entry

### Phase 2c: Add to Manifest (4 hours)

- [ ] Add 10 validated orphaned agents to manifest
  - [ ] effect-expert (Tier 2, Opus)
  - [ ] schema-expert (Tier 2, Opus, replaces effect-schema-expert)
  - [ ] effect-platform (Tier 2, Opus)
  - [ ] observability-expert (Tier 4, Opus, replaces code-observability-writer)
  - [ ] codebase-explorer (Tier 1)
  - [ ] documentation-expert (Tier 4, Opus)
  - [ ] domain-modeler (Tier 2, Opus)
  - [ ] react-expert (Tier 2, Opus)
  - [ ] lawyer (Tier 3)
- [ ] Validate manifest YAML syntax
- [ ] Run `bun run agents:validate` (if available)

### Phase 2d: Archive Rejected (30 minutes)

- [ ] Move rejected agents to archive/
  - [ ] mcp-enablement.md → archive/one-time-setup/
  - [ ] wealth-management-domain-expert.md → archive/project-specific/

### Phase 2e: Documentation Updates (1 hour)

- [ ] Update `specs/agents/README.md` with new count
- [ ] Update orchestrator prompts with new quick reference
- [ ] Update P2 handoff with implementation status
- [ ] Create agent migration guide (old → new mappings)

---

## 7. Success Metrics

### Quantitative

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Total agents | 31 | 28 | Planned |
| Manifest sync | 65% (18/27) | 100% (28/28) | Planned |
| Orphaned agents | 11 | 2 | Planned |
| Missing file agents | 2 | 0 | Planned |
| Token overhead | ~11,189 | ~9,600 | ~14% reduction |

### Qualitative

- [ ] All manifest agents have corresponding files
- [ ] All active agents have clear tier assignments
- [ ] No capability overlap >80% between agents
- [ ] Orphaned agents either added or archived with justification
- [ ] Opus model requirements documented
- [ ] Phase assignments validated for all agents

---

## 8. Risk Assessment

### Low Risk

| Risk | Mitigation |
|------|------------|
| doc-maintainer merge complexity | Parametrized input (target: agents\|readme\|both) keeps workflows separate |
| Missing agent files removal | Replaced with existing equivalents (observability-expert, schema-expert) |

### Medium Risk

| Risk | Mitigation |
|------|------------|
| Opus model availability | Document model requirements in manifest, provide fallback instructions |
| Orphaned agent quality | Manual validation of all 10 agents before manifest addition |

### High Risk

| Risk | Mitigation |
|------|------------|
| Breaking existing workflows | Maintain backward compatibility via aliases in orchestrator prompts |
| Agent selection confusion | Update quick reference with clear use_when/do_not_use_when |

---

## 9. Post-Consolidation Architecture

### Agent Tiers (28 agents)

```
Tier 1: Foundation (4)
├── codebase-researcher      (systematic exploration)
├── codebase-explorer        (parallel exploration)
├── reflector                (meta-reflection)
└── prompt-refiner           (agent improvement)

Tier 2: Research (10)
├── mcp-researcher           (Effect docs MCP)
├── web-researcher           (general web research)
├── effect-researcher        (Effect patterns + refactoring)
├── effect-expert            (mathematical transformations, Opus)
├── effect-predicate-master  (predicates/Match)
├── effect-platform          (FileSystem/Path/Command, Opus)
├── schema-expert            (Schema composition, Opus)
├── domain-modeler           (domain modeling, Opus)
├── react-expert             (React 19/Next.js 16, Opus)
└── ai-trends-researcher     (AI/ML trends)

Tier 3: Quality (6)
├── code-reviewer            (guideline enforcement)
├── architecture-pattern-enforcer (boundaries/layers)
├── spec-reviewer            (spec quality)
├── tsconfig-auditor         (TypeScript config)
└── lawyer                   (legal/licensing)

Tier 4: Writers (8)
├── doc-writer               (creates JSDoc/README/AGENTS.md)
├── doc-maintainer           (updates README/AGENTS.md) [NEW]
├── documentation-expert     (ai-context.md, Opus)
├── test-writer              (Effect tests)
├── observability-expert     (logging/tracing, Opus)
├── jsdoc-fixer              (JSDoc compliance)
└── package-error-fixer      (package fixes)
```

### Capability Distribution

| Capability | Count | Agents |
|------------|-------|--------|
| read-only | 13 | codebase-researcher, codebase-explorer, mcp-researcher, web-researcher, effect-researcher, effect-expert, effect-predicate-master, effect-platform, schema-expert, domain-modeler, react-expert |
| write-reports | 6 | reflector, code-reviewer, architecture-pattern-enforcer, spec-reviewer, tsconfig-auditor, lawyer, ai-trends-researcher |
| write-files | 9 | doc-writer, doc-maintainer, documentation-expert, test-writer, observability-expert, jsdoc-fixer, package-error-fixer, prompt-refiner |

---

## 10. References

- **P1 Analysis Findings**: [P1_ANALYSIS_FINDINGS.md](./P1_ANALYSIS_FINDINGS.md)
- **P1 Redundancy Report**: [P1_REDUNDANCY_REPORT.md](./P1_REDUNDANCY_REPORT.md)
- **Agent Overlap Matrix**: [agent-overlap-matrix.md](./agent-overlap-matrix.md)
- **Agent Catalog**: [agent-catalog.md](./agent-catalog.md)
- **Manifest**: `.claude/agents-manifest.yaml`
- **Agent Files**: `.claude/agents/*.md`

---

## Appendix A: Migration Mapping

| Old Agent | New Agent | Notes |
|-----------|-----------|-------|
| agents-md-updater | doc-maintainer | Use `target: "agents"` |
| readme-updater | doc-maintainer | Use `target: "readme"` |
| code-observability-writer | observability-expert | Direct replacement |
| effect-schema-expert | schema-expert | Direct replacement |

---

## Appendix B: Manifest YAML Snippets

Complete YAML snippets for all additions are provided in Section 4 above. To apply:

1. Copy YAML from Section 4 for each agent
2. Insert into `.claude/agents-manifest.yaml` under appropriate tier
3. Maintain alphabetical order within tier
4. Validate with `bun run agents:validate`

---

**End of Agent Consolidation Plan**
