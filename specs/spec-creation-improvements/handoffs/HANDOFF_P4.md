# Phase 4 Handoff: DSPy-Style Agent Signatures

**Date**: 2026-01-21
**From**: Phase 3 (Structured Self-Improvement)
**To**: Phase 4 (DSPy-Style Agent Signatures)
**Status**: Ready for execution

---

## Rolling Summary (Updated Each Phase)

**Spec**: spec-creation-improvements
**Current Phase**: 4 of 5
**Status**: Ready for execution

### Key Decisions Made

- Phase 0: Validated research across 6 topics (context engineering, orchestration, self-improvement, DSPy, llms.txt, patterns)
- Phase 1: Created `llms.txt` (domain-grouped pattern), state machine (Mermaid stateDiagram-v2), complexity calculator (6-factor formula), pattern registry
- Phase 2: Tiered memory model (Working/Episodic/Semantic/Procedural), context budget (4K tokens max), rolling summary compression pattern, context hoarding anti-pattern
- Phase 3: Reflection schema (JSON-compatible), 8-category quality rubric (102 points), skill promotion workflow, SKILL.md template

### Active Constraints

- No breaking changes to existing REFLECTION_LOG entries
- All patterns must be backwards-compatible
- Quality scoring uses 102-point scale (industry standard from Agent Skills)
- Promotion thresholds: 75+ for registry, 90+ for skill files

### Accumulated Patterns

| Pattern | Source | Score | Status |
|---------|--------|-------|--------|
| `year-filtered-search` | Phase 0 | 85/102 | Registry |
| `parallel-search-consolidation` | Phase 0 | 78/102 | Registry |
| `source-cross-reference` | Phase 0 | 82/102 | Registry |
| `product-grouped-llms-txt` | Phase 0 | 80/102 | Registry |
| `mermaid-state-diagrams` | Phase 1 | 76/102 | Registry |
| `multi-factor-complexity-scoring` | Phase 1 | 77/102 | Registry |
| `tiered-memory-handoffs` | Phase 2 | 82/102 | Candidate |
| `rolling-summary-compression` | Phase 2 | 79/102 | Candidate |
| `structured-reflection-schema` | Phase 3 | 78/102 | Candidate |
| `phase-completion-prompt` | Phase 3 | 81/102 | Candidate |

---

## Phase 3 Summary

**Completed**: Structured self-improvement framework
**Duration**: ~35 minutes

### Key Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| Reflection Schema | `specs/SPEC_CREATION_GUIDE.md` | JSON-compatible schema for REFLECTION_LOG entries |
| Quality Rubric | `specs/SPEC_CREATION_GUIDE.md` | 8-category scoring (102 points max) |
| Promotion Workflow | `specs/SPEC_CREATION_GUIDE.md` | Extraction → Scoring → Threshold → Promotion flow |
| SKILL.md Template | `specs/templates/SKILL.template.md` | Comprehensive template with metadata |

### Key Insights from Phase 3

1. **Structured reflection enables extraction**: JSON schema allows programmatic pattern mining
2. **Promotion thresholds reduce noise**: 75-point minimum prevents premature registry pollution
3. **Phase completion prompt is critical**: "What patterns should become skills?" triggers extraction
4. **Score breakdown aids improvement**: Category-level scores show where pattern needs work

---

## Phase 4 Mission

Add programmatic prompt signatures to all agents, enabling composition and validation.

### Research Reference

Primary source: `outputs/dspy-signatures-research.md`

Key patterns to implement:
1. Signature format (input/output contracts)
2. Signatures for all 9 agents
3. Composition patterns
4. Validation examples

### Deliverables

| Deliverable | Target Location | Purpose |
|-------------|-----------------|---------|
| Signature Template | `templates/AGENT_SIGNATURE.template.md` | Format definition |
| Agent Signatures | `.claude/agents/*.md` | Metadata additions |
| Composition Guide | `documentation/patterns/agent-signatures.md` | Usage patterns |

---

## Implementation Details

### 1. Signature Format

```typescript
// Signature definition (TypeScript-style for documentation)
interface AgentSignature {
  name: string;
  input: {
    [field: string]: {
      type: string;
      description: string;
      required: boolean;
    };
  };
  output: {
    [field: string]: {
      type: string;
      description: string;
    };
  };
  sideEffects?: string[]; // Files created/modified
}
```

### 2. Agent Signature Examples

**codebase-researcher**:
```yaml
signature:
  input:
    questions: string[]      # Research questions
    scope: string[]          # Package paths
    depth: shallow|deep      # Exploration depth
  output:
    findings: Finding[]      # Answered questions with sources
    gaps: string[]           # Unanswered questions
  sideEffects: none          # Read-only agent
```

**doc-writer**:
```yaml
signature:
  input:
    targetFiles: string[]    # Files to create/modify
    contentType: readme|agents|jsdoc
    context: string          # Background information
  output:
    filesCreated: string[]   # New file paths
    filesModified: string[]  # Changed file paths
    summary: string          # What was done
  sideEffects: [write-files]
```

### 3. Composition Patterns

Show how agents can chain:
- codebase-researcher → doc-writer (research then document)
- code-reviewer → package-error-fixer (identify then fix)
- reflector → prompt-refiner (analyze then improve)

---

## Agents to Update

| Agent | Capability | Signature Complexity |
|-------|------------|---------------------|
| codebase-researcher | read-only | Low |
| mcp-researcher | read-only | Low |
| web-researcher | read-only | Low |
| reflector | write-reports | Medium |
| code-reviewer | write-reports | Medium |
| architecture-pattern-enforcer | write-reports | Medium |
| doc-writer | write-files | High |
| test-writer | write-files | High |
| code-observability-writer | write-files | Medium |

---

## Verification Steps

```bash
# Verify signature template
cat specs/spec-creation-improvements/templates/AGENT_SIGNATURE.template.md

# Check agents have signatures
grep -l "signature:" .claude/agents/*.md
```

---

## Success Criteria

- [ ] Signature template created
- [ ] All 9 agents have signatures
- [ ] Composition guide documented
- [ ] Practical examples included
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P5.md created
- [ ] P5_ORCHESTRATOR_PROMPT.md created

---

## Next Phase Preview

Phase 5 (Final Integration) will:
1. Implement dry run automation protocol
2. Populate pattern registry
3. Final documentation updates
