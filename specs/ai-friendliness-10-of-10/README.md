# AI-Friendliness 10/10 Specification

Achieve maximum AI agent contribution effectiveness through comprehensive context engineering.

## Purpose

Transform the beep-effect repository from 8.5/10 to 10/10 AI-friendliness by implementing:
1. **Complete ai-context.md coverage** (currently 0%)
2. **Error pattern catalog** with safe/unsafe fix classification
3. **Interactive onboarding system** for new agent instances
4. **Self-healing capabilities** for auto-recoverable errors
5. **Zero-ambiguity documentation** with worked examples

## Current State (8.5/10)

| Category | Score | Gap |
|----------|-------|-----|
| Documentation Architecture | 9/10 | Formal notation excellent |
| Pattern Explicitness | 9/10 | NEVER/ALWAYS clear |
| Agent Infrastructure | 9/10 | Tiered agents, skills |
| Type Safety Guardrails | 9/10 | EntityIds, Schema |
| **Verification Gates** | **8/10** | Cascade debugging unclear |
| **Context Engineering** | **8/10** | 0% ai-context.md coverage |
| **Onboarding Path** | **7/10** | Assumes Effect proficiency |
| **Error Recovery** | **7/10** | No error pattern catalog |

## Success Criteria

| Criterion | Metric | Target |
|-----------|--------|--------|
| ai-context.md coverage | % of packages | 100% |
| Error catalog entries | Common errors documented | 50+ |
| Onboarding completion | New agent success rate | 95%+ |
| Auto-fix coverage | Recoverable errors handled | 80%+ |
| Worked examples | Patterns with examples | 100% |

## Scope

### In Scope

- Create ai-context.md for all 62+ packages
- Build error pattern catalog (`.claude/errors/`)
- Implement onboarding checklist for new agents
- Add self-healing hooks for lint/format errors
- Complete worked examples for all abstract rules
- Add troubleshooting tables to CLAUDE.md

### Out of Scope

- Rewriting existing documentation
- Changing Effect patterns or architecture
- Modifying agent definitions fundamentally
- Adding new tooling packages

## Phase Overview

| Phase | Name | Deliverables | Sessions |
|-------|------|--------------|----------|
| P0 | Discovery | Current state audit, gap analysis | 1 |
| P1 | ai-context.md Generation | 62+ module documentation files | 3-4 |
| P2 | Error Catalog | `.claude/errors/catalog.yaml` + handlers | 1-2 |
| P3 | Onboarding System | `.claude/onboarding/` + checklist skill | 1 |
| P4 | Self-Healing Hooks | Auto-fix hooks for recoverable errors | 1 |
| P5 | Examples & Validation | Worked examples, zero-ambiguity audit | 1-2 |

**Estimated Total**: 8-11 sessions

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | 5 output files exist, REFLECTION_LOG updated |
| P1 | 62+ ai-context.md files, `/modules` returns 100% |
| P2 | 50+ error catalog entries, CLAUDE.md table added |
| P3 | Onboarding docs + `/onboarding` skill functional |
| P4 | 2 hooks registered, safe errors auto-fixable |
| P5 | Ambiguity audit ≥95%, final score 10/10 |

## Quick Start

```bash
# Read this spec
cat specs/ai-friendliness-10-of-10/README.md

# Start Phase 0 Discovery
cat specs/ai-friendliness-10-of-10/handoffs/P0_ORCHESTRATOR_PROMPT.md
```

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | This file - spec overview |
| `REFLECTION_LOG.md` | Cumulative learnings |
| `MASTER_ORCHESTRATION.md` | Full workflow details |
| `handoffs/HANDOFF_P*.md` | Phase context documents |
| `handoffs/P*_ORCHESTRATOR_PROMPT.md` | Copy-paste prompts |
| `outputs/` | Research and audit artifacts |

## Research Sources (Validated)

All recommendations validated against real-world references:

### Context Engineering
- [Anthropic Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) - Official CLAUDE.md guidance
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - 200+ rule examples
- [context-engineering-intro](https://github.com/coleam00/context-engineering-intro) - PRP workflow
- [AGENTS.md Specification](https://agents.md/) - Linux Foundation standard

### Error Catalogs
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/) - Machine-readable format
- [SonarQube Rules](https://docs.sonarsource.com/) - Remediation effort model
- [Biome Linter](https://biomejs.dev/linter/) - Safe/unsafe fix classification

### Self-Healing Patterns
- [code-repair-demo](https://github.com/snath-ai/code-repair-demo) - CI/CD self-healing
- [healing-agent](https://github.com/matebenyovszky/healing-agent) - Decorator pattern
- Effect Schedule module - Exponential backoff primitives

## Architecture Decisions

### AD-001: ai-context.md vs AGENTS.md

**Decision**: ai-context.md provides discovery metadata, AGENTS.md provides detailed guidance.

| File | Purpose | Length | Audience |
|------|---------|--------|----------|
| `ai-context.md` | Module discovery, search, quick reference | 50-100 lines | `/modules` command |
| `AGENTS.md` | Detailed contributor guidance | 100-400 lines | Agents working in package |

**Rationale**: Different use cases require different granularity. Discovery needs brevity; contribution needs depth.

### AD-002: Error Catalog Format

**Decision**: YAML format with machine-readable fields.

```yaml
errors:
  - id: EFFECT_001
    pattern: "regex pattern"
    category: TypeScript|Effect|Biome|Runtime
    severity: error|warning
    fix_type: safe|unsafe|manual
    remediation: trivial|easy|major
    auto_fix_command: "optional command"
```

**Rationale**: YAML is human-readable, parseable by tools, and consistent with existing config patterns.

### AD-003: Onboarding as Skill vs Documentation

**Decision**: Both. Skill provides interactive checklist, documentation provides reference.

**Rationale**: Skills enable validation gates; documentation enables async reading.

## Complexity Assessment

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) +
             (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
           = (6 × 2) + (8 × 3) + (62 × 0.5) + (0 × 3) + (2 × 5) + (3 × 2)
           = 12 + 24 + 31 + 0 + 10 + 6
           = 83 (Critical)
```

**Classification**: Critical spec requiring full orchestration structure.

## Agent Allocation

| Phase | Primary Agents | Support Agents |
|-------|----------------|----------------|
| P0 | codebase-researcher | architecture-pattern-enforcer |
| P1 | documentation-expert, doc-writer | codebase-researcher |
| P2 | effect-expert, code-reviewer | mcp-researcher |
| P3 | skill-creator, doc-writer | - |
| P4 | effect-expert, test-writer | package-error-fixer |
| P5 | code-reviewer, reflector | spec-reviewer |

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| ai-context.md inconsistent quality | Medium | High | Templates + review |
| Error catalog incomplete | Medium | Medium | Iterative expansion |
| Self-healing causes regressions | High | Low | Safe-only auto-fixes |
| Onboarding too complex | Medium | Medium | Simplify based on feedback |

## Dependencies

- Existing AGENTS.md files (66 total) - source material for ai-context.md
- `.claude/skills/ai-context-writer/` - template and format
- `.claude/scripts/context-crawler.ts` - indexing infrastructure
- Biome configuration - lint/format rules for self-healing

## Verification Commands

```bash
# Check ai-context.md coverage
find packages apps tooling -name "ai-context.md" | wc -l
# Target: 62+

# Test module discovery
bun run .claude/scripts/context-crawler.ts -- --mode=list

# Count error catalog entries (after P2)
grep -c "^  - id:" .claude/errors/catalog.yaml
# Target: 50+

# Validate YAML syntax
bun x yaml-lint .claude/errors/catalog.yaml

# Test onboarding skill (after P3)
/onboarding

# Check hook registration (after P4)
grep -A5 '"hooks"' .claude/settings.json
```

## Related Specs

- `specs/agent-config-optimization/` - Agent configuration improvements
- `specs/agent-effectiveness-audit/` - Agent trigger analysis
- `specs/agents-md-audit/` - Documentation consistency
