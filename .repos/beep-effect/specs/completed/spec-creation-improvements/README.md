# Spec Creation Improvements

> Research-validated enhancements to the beep-effect specification creation workflow based on 2025 industry trends.

**Status**: ✅ COMPLETED — Files consolidated to `specs/_guide/`

> **Historical Note**: References to `specs/SPEC_CREATION_GUIDE.md`, `specs/HANDOFF_STANDARDS.md`, `specs/PATTERN_REGISTRY.md`, and `specs/llms.txt` in this document refer to their original locations. These files now live in `specs/_guide/`.

---

## Purpose

Implement evidence-based improvements to the spec creation guide, handoff standards, and agent system based on emerging patterns in:
- Context engineering for multi-session AI workflows
- Graph-based orchestration patterns
- Self-improving specification systems
- DSPy-style programmatic prompts
- AI-native documentation standards (llms.txt)

## Problem Statement

The current spec creation guide is functional but missing:
1. **Structured context management** - Ad-hoc "Red Zone" heuristics vs. tiered memory architecture
2. **Visual orchestration** - Flat tables vs. state machine graphs
3. **Structured reflection** - Free-form text vs. skill-extractable schemas
4. **Optimizable prompts** - Static text vs. DSPy-style signatures
5. **AI discoverability** - No llms.txt for spec navigation

## Research Basis

Initial research conducted 2026-01-21 using:
- [Google Developers Blog - Context-Aware Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [mem0.ai - Context Engineering Guide](https://mem0.ai/blog/context-engineering-ai-agents-guide)
- [llmstxt.org - Official Specification](https://llmstxt.org/)
- [DSPy Official](https://dspy.ai/)
- [Yohei Nakajima - Self-Improving AI Agents](https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/)

**This spec validates and deepens that research before implementation.**

## Success Criteria

### Quantifiable Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Research sources per topic | ≥5 HIGH credibility | Citation audit |
| llms.txt created | 1 file at `specs/llms.txt` | File exists |
| REFLECTION_LOG schema | Structured format documented | Schema validation |
| Agent signatures defined | All 9 agents have signatures | Signature audit |
| State machine visualization | Added to SPEC_CREATION_GUIDE | Visual inspection |
| Complexity calculator | Formula with thresholds | Calculator test |

### Deliverable Checklist

- [ ] `outputs/context-engineering-research.md` - Validated research
- [ ] `outputs/orchestration-patterns-research.md` - Validated research
- [ ] `outputs/self-improvement-research.md` - Validated research
- [ ] `outputs/dspy-signatures-research.md` - Validated research with examples
- [ ] `outputs/llms-txt-research.md` - Validated research
- [ ] `outputs/additional-patterns-research.md` - Validated research
- [ ] `specs/llms.txt` - AI-readable spec index
- [ ] Updated `SPEC_CREATION_GUIDE.md` - All improvements integrated
- [ ] Updated `HANDOFF_STANDARDS.md` - Context engineering updates
- [ ] `templates/REFLECTION_LOG.template.md` - Structured schema
- [ ] `templates/AGENT_SIGNATURE.template.md` - DSPy-style format

## Non-Goals

- **Breaking changes** - All improvements are additive/backwards-compatible
- **Agent rewrites** - Signatures are metadata additions, not prompt rewrites
- **Tooling automation** - No linter/validator implementation (future spec)

---

## Phase Overview

### Phase 0: Research Validation (READ-ONLY)

**Goal**: Validate and deepen initial research findings with additional sources.

**Scope**: 6 research areas requiring validation

| Topic | Initial Sources | Target Sources | Key Questions |
|-------|-----------------|----------------|---------------|
| Context Engineering | 3 | 5+ | Is tiered memory the consensus? What alternatives exist? |
| Graph Orchestration | 2 | 5+ | LangGraph vs alternatives? Production patterns? |
| Self-Improvement | 3 | 5+ | Reflexion vs SEAL vs other patterns? Skill extraction? |
| DSPy Signatures | 2 | 5+ | Practical examples? Integration patterns? |
| llms.txt | 3 | 5+ | Adoption rate? File structure best practices? |
| Additional (dry runs, registries) | 1 | 3+ | Industry validation? |

**Deliverables**:
- `outputs/context-engineering-research.md`
- `outputs/orchestration-patterns-research.md`
- `outputs/self-improvement-research.md`
- `outputs/dspy-signatures-research.md`
- `outputs/llms-txt-research.md`
- `outputs/additional-patterns-research.md`

### Phase 1: Foundation Implementation

**Goal**: Implement low-effort, high-visibility improvements.

**Scope**:
1. Create `specs/llms.txt` - AI-readable spec index
2. Add state machine visualization to SPEC_CREATION_GUIDE.md
3. Add complexity calculator to SPEC_CREATION_GUIDE.md
4. Create pattern registry structure

**Deliverables**:
- `specs/llms.txt`
- `specs/llms-full.txt` (optional companion file)
- Updated `SPEC_CREATION_GUIDE.md` sections
- `specs/PATTERN_REGISTRY.md`

### Phase 2: Context Engineering Integration

**Goal**: Implement tiered context architecture.

**Scope**:
1. Define tiered memory model (Working/Episodic/Semantic)
2. Create context compilation protocol
3. Update HANDOFF_STANDARDS.md with context architecture
4. Add anti-patterns for context hoarding

**Deliverables**:
- Updated `HANDOFF_STANDARDS.md`
- `templates/CONTEXT_COMPILATION.template.md`
- Updated `SPEC_CREATION_GUIDE.md` context sections

### Phase 3: Structured Self-Improvement

**Goal**: Implement skill-extractable reflection format.

**Scope**:
1. Define REFLECTION_LOG schema with structured entries
2. Create skill extraction criteria
3. Define automatic skill promotion workflow
4. Update existing specs with new format guidance

**Deliverables**:
- `templates/REFLECTION_LOG.template.md`
- Updated `SPEC_CREATION_GUIDE.md` reflection sections
- `documentation/patterns/skill-extraction.md`

### Phase 4: DSPy-Style Agent Signatures

**Goal**: Add programmatic prompt signatures to agents.

**Scope**:
1. Define signature format (input/output contracts)
2. Create signatures for all 9 agents
3. Document composition patterns
4. Add practical usage examples

**Deliverables**:
- `templates/AGENT_SIGNATURE.template.md`
- Updated `.claude/agents/*.md` files (signature metadata)
- `documentation/patterns/agent-signatures.md`

### Phase 5: Final Integration & Documentation

**Goal**: Complete implementation and update all documentation.

**Scope**:
1. Dry run automation protocol
2. Cross-spec pattern registry population
3. Final SPEC_CREATION_GUIDE.md updates
4. Verification and testing

**Deliverables**:
- Populated `specs/PATTERN_REGISTRY.md`
- Final `SPEC_CREATION_GUIDE.md`
- Updated `specs/README.md`

---

## Pre-Existing State

### Already Complete

| Item | Status | Notes |
|------|--------|-------|
| AGENTS.md standardization | COMPLETE | CLAUDE.md symlinked to AGENTS.md at root and packages |

### Current Files to Modify

| File | Modification Type |
|------|-------------------|
| `specs/SPEC_CREATION_GUIDE.md` | Major updates (Phases 1-5) |
| `specs/HANDOFF_STANDARDS.md` | Updates (Phase 2) |
| `specs/README.md` | Minor updates (Phase 5) |
| `.claude/agents/*.md` | Signature additions (Phase 4) |

---

## Agent Mapping

| Phase | Primary Agent | Supporting Agents |
|-------|---------------|-------------------|
| 0 | `ai-trends-researcher` | `web-researcher` |
| 1 | `doc-writer` | `codebase-researcher` |
| 2 | `doc-writer` | `reflector` |
| 3 | `doc-writer` | `reflector`, `prompt-refiner` |
| 4 | `doc-writer` | `codebase-researcher` |
| 5 | `doc-writer` | `architecture-pattern-enforcer` |

---

## Execution

Start with: `handoffs/P0_ORCHESTRATOR_PROMPT.md`

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/](./handoffs/) | Phase transition documents |
| [outputs/](./outputs/) | Research and deliverables |

---

## Related Specifications

- `specs/canonical-naming-conventions/` - Uses ai-trends-researcher for research
