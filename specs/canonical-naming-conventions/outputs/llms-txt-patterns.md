# llms.txt and AI-Native Patterns Research

## Research Parameters
- **Topic**: AI-friendly codebase patterns and llms.txt specification
- **Date**: 2026-01-21
- **Phase**: 1 (External Research)

## Executive Summary

The llms.txt specification and related AI tooling documentation establish foundational patterns for machine-readable codebase organization. Key principles include explicit discovery files (llms.txt, CLAUDE.md, AGENTS.md), semantic path hierarchies, descriptive file names optimized for grep, and consistent delimiter conventions. These patterns complement rather than replace internal naming conventions, providing a discovery layer that enables AI agents to navigate unfamiliar codebases efficiently.

## Key Findings

### Finding 1: llms.txt Specification Structure
**Source**: https://llmstxt.org/
**Credibility**: HIGH (Official specification)

llms.txt provides standardized machine-readable documentation discovery.

**Format**:
```
# Title

> /path/to/file.md: Description of contents

## Section
> /path/to/section/: Section description

### Subsection
> /file1.md: Description
> /file2.md: Description
```

**Key Observations**:
- Plain text format prioritizes simplicity
- Hierarchical sections mirror directory structure
- Descriptions enable purpose understanding without file access
- No mandate on internal file naming—focuses on discovery layer

**Relevance**: Explicit mapping complements implicit naming. Even well-named files benefit from centralized discovery.

### Finding 2: CLAUDE.md as AI Configuration
**Source**: Anthropic documentation, beep-effect implementation
**Credibility**: HIGH (Official pattern)

CLAUDE.md serves as primary AI agent configuration.

**Observed Structure**:
```markdown
# CLAUDE.md

## Quick Reference
| Category | Command |
|----------|---------|
| Install  | bun install |

## Architecture & Boundaries
- Layer descriptions
- Import rules

## Code Quality
- Linting rules
- Testing conventions

## Key References
| Document | Purpose |
|----------|---------|
| README.md | Onboarding |
```

**Key Observations**:
- Markdown tables for scannable reference data
- Explicit paths to detailed documentation
- Combines behavioral rules with technical patterns
- Acts as "entry point" for AI understanding

### Finding 3: Greppable Naming Principles
**Source**: AI tooling guides, community patterns
**Credibility**: MEDIUM (Community consensus)

AI agents rely heavily on grep/search for code navigation.

**Greppability Principles**:
1. **Unique patterns**: `EFFECT_PATTERNS.md` vs `patterns.md`
2. **Consistent prefixes**: `HANDOFF_P0.md`, `HANDOFF_P1.md`, `HANDOFF_P2.md`
3. **Semantic suffixes**: `_GUIDE.md`, `_TEMPLATE.md`, `_LOG.md`
4. **No ambiguous abbreviations**: `SPEC_CREATION_GUIDE.md` vs `SCG.md`

**Evidence from beep-effect**:
```
specs/canonical-naming-conventions/
├── README.md              # unique within directory
├── REFLECTION_LOG.md      # greppable suffix pattern
├── QUICK_START.md         # descriptive, unique
├── handoffs/
│   ├── HANDOFF_P0.md     # consistent prefix pattern
│   ├── HANDOFF_P1.md
│   └── P0_ORCHESTRATOR_PROMPT.md
```

### Finding 4: Semantic Directory Structure
**Source**: llmstxt.org patterns, Effect ecosystem
**Credibility**: MEDIUM (Observed practice)

Directory names encode semantic meaning for navigation.

**Pattern Observations**:
- Plural nouns for collections: `outputs/`, `templates/`, `handoffs/`
- Singular for specific concepts: `domain/`, `client/`, `server/`
- Depth signals abstraction level: `packages/iam/domain/entities/`
- Consistent depth across similar structures

**Anti-patterns**:
- Flat directories with prefixed files: `spec_output1.md`, `spec_output2.md`
- Inconsistent depth: `packages/iam/domain/` vs `packages/shared/domain/users/entities/`

### Finding 5: All-Caps Convention for Meta Files
**Source**: beep-effect codebase, GitHub conventions
**Credibility**: MEDIUM (Community practice)

All-caps signifies meta/configuration files.

**Observed Pattern**:
| All-Caps | Purpose |
|----------|---------|
| README.md | Entry point documentation |
| CLAUDE.md | AI configuration |
| AGENTS.md | Agent-specific documentation |
| CHANGELOG.md | Version history |
| REFLECTION_LOG.md | Learning accumulation |

**Lowercase Files**:
| Format | Purpose |
|--------|---------|
| effect-patterns.md | Technical reference |
| database-patterns.md | Implementation patterns |

**Relevance**: Casing provides visual hierarchy and grep differentiation.

### Finding 6: Index Files as Discovery Points
**Source**: Effect ecosystem, TypeScript conventions
**Credibility**: HIGH (Ecosystem standard)

Index files serve as module entry points.

**Patterns Observed**:
```typescript
// packages/iam-domain/src/index.ts
export * as Member from "./entities/Member/mod.js"
export * as ApiKey from "./entities/ApiKey/mod.js"

// packages/iam-domain/src/entities/Member/mod.ts
export * from "./Member.model.js"
export * from "./Member.schema.js"
```

**Key Observations**:
- `index.ts` at package root for public API
- `mod.ts` within directories for internal aggregation
- Namespace exports (`export * as Name`) preserve context
- `.js` extensions in imports for ESM compatibility

### Finding 7: Versioning in File Names
**Source**: beep-effect handoff patterns
**Credibility**: MEDIUM (Internal practice)

Phase/version indicators in file names.

**Patterns Observed**:
| Pattern | Example | Usage |
|---------|---------|-------|
| `_P[N]` suffix | `HANDOFF_P0.md` | Phase indicators |
| `P[N]_` prefix | `P0_ORCHESTRATOR_PROMPT.md` | Prompt files |
| No version | `README.md` | Living documents |

**Observations**:
- Consistent position (prefix vs suffix) within file type
- Numeric ordering enables natural sorting
- Uppercase P distinguishes from lowercase pattern names

### Finding 8: Documentation Layering
**Source**: beep-effect structure, docs-as-code patterns
**Credibility**: MEDIUM (Best practice)

Multi-layer documentation structure.

**Observed Hierarchy**:
```
project/
├── README.md              # Quick start, overview
├── CLAUDE.md              # AI configuration
├── documentation/         # Internal contributor docs
│   ├── patterns/          # Implementation recipes
│   │   ├── effect-patterns.md
│   │   └── database-patterns.md
│   └── PACKAGE_STRUCTURE.md
└── specs/                 # Multi-phase specifications
    └── [spec-name]/
        ├── README.md      # Spec overview
        ├── outputs/       # Phase deliverables
        └── handoffs/      # Context preservation
```

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | Explicit discovery files complement naming; descriptive names over abbreviations; consistent delimiter patterns; hierarchical directories over flat structures |
| **Conflicts** | No standard for version indicators (P0 vs v1 vs phase1); unclear when to use all-caps vs lowercase for docs |
| **Gaps** | No guidance on optimal file name length for LLM tokens; limited research on AI navigation patterns; no standard for cross-referencing between discovery files |

## Recommendations for Phase 2

### Discovery File Standards
**Evaluate**: CLAUDE.md, AGENTS.md, llms.txt adoption patterns

### Greppability Rules
**Evaluate**:
- Minimum uniqueness requirements for file names
- Acceptable abbreviation patterns
- Suffix standardization (_GUIDE, _TEMPLATE, _LOG, _PROMPT)

### Versioning Conventions
**Evaluate**:
- `_P[N]` suffix vs `P[N]_` prefix
- Numeric vs semantic versioning in file names
- Which file types require version indicators

### Case Convention Rules
**Evaluate**:
- All-caps for meta files (README, CLAUDE, AGENTS)
- kebab-case for technical docs
- When PascalCase is appropriate

### Index File Patterns
**Evaluate**:
- `index.ts` vs `mod.ts` usage boundaries
- Namespace export patterns
- Barrel export depth limits

## Sources

### High Credibility
- [llms.txt Specification](https://llmstxt.org/)
- [Anthropic Documentation](https://docs.anthropic.com/)
- Effect-TS repository patterns

### Medium Credibility
- beep-effect codebase patterns (internal evidence)
- GitHub repository conventions
- docs-as-code community practices
