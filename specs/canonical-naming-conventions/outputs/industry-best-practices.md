# Industry Best Practices Research

## Research Parameters
- **Topic**: Industry standards for file naming conventions
- **Date**: 2026-01-21
- **Phase**: 1 (External Research)

## Executive Summary

Industry practices converge on semantic path structures, descriptive file names, and consistent delimiter conventions. Research reveals emerging standards for AI-assisted development via discovery files (CLAUDE.md, llms.txt) that complement implicit naming patterns with explicit documentation. The Effect-TS ecosystem uses kebab-case file names with PascalCase namespace exports, diverging from traditional FP conventions but aligning with JavaScript/TypeScript community norms.

## Key Findings

### Finding 1: llms.txt Specification as Discovery Layer
**Source**: https://llmstxt.org/
**Credibility**: HIGH (Recognized specification, community-driven standard)

llms.txt provides a standardized machine-readable format for codebase documentation discovery. The specification uses plain text format mapping descriptions to file paths.

**Key Pattern Observations**:
- Uses `# Title` for section headers
- Uses `> /path/to/file.md: Description` for file mappings
- Supports nested hierarchies through indentation
- Prioritizes readability for both humans and LLMs
- No mandate on internal file naming patterns

**Relevance**: Establishes explicit mapping files complementing implicit naming conventions.

### Finding 2: CLAUDE.md Configuration Standard
**Source**: https://docs.anthropic.com/
**Credibility**: HIGH (Official Anthropic documentation)

CLAUDE.md serves as primary configuration for AI agents in codebases.

**Key Pattern Observations**:
- Uses markdown tables for structured reference data
- Employs explicit path references (absolute paths in links)
- Separates quick reference from detailed documentation
- Includes both behavioral rules and technical patterns

**Relevance**: Demonstrates centralized configuration reducing reliance on implicit file naming.

### Finding 3: Semantic Path Hierarchies
**Source**: Multiple sources (llmstxt.org patterns, agent-optimization discussions)
**Credibility**: MEDIUM (Community consensus)

AI-friendly codebases favor hierarchical path structures encoding semantic relationships.

**Key Pattern Observations**:
- Domain/feature boundaries reflected in directory structure
- Consistent depth levels across similar modules
- 3-4 levels typical maximum depth
- Plural nouns for collection directories (`outputs/`, `templates/`)

### Finding 4: Descriptive Names Reduce Disambiguation
**Source**: beep-effect codebase patterns
**Credibility**: MEDIUM (Internal evidence)

Verbose, explicit file names eliminate need for agents to load file contents.

**Key Pattern Observations**:
- All-caps for high-level docs (README.md, CLAUDE.md, AGENTS.md)
- Hyphenated-lowercase for implementation files (service-patterns.md)
- Descriptive prefixes for related files (HANDOFF_P0.md, HANDOFF_P1.md)
- Consistent suffixes for file types (_GUIDE.md, _TEMPLATE.md, _LOG.md)

### Finding 5: Consistent Delimiter Conventions
**Source**: beep-effect codebase observation
**Credibility**: MEDIUM (Internal evidence)

Consistent delimiters observed:
- Underscores for internal boundaries (SPEC_CREATION_GUIDE.md)
- Hyphens for package names (@beep/iam-domain)
- PascalCase for schema/type files (UserSchema.ts)

### Finding 6: Extension-Based Type Signaling
**Source**: beep-effect patterns, Effect ecosystem
**Credibility**: MEDIUM (Internal + Effect patterns)

Compound extensions provide explicit type signaling:
- `.test.ts` for all test files
- `.gen.ts` for Drizzle-generated files
- Consistent suffix placement before `.ts` extension
- No triple extensions (no `.test.spec.ts`)

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | Descriptive names over abbreviations; hierarchical directories over flat layouts; standardized discovery files as complement to naming |
| **Conflicts** | No authority on delimiter choice; disagreement on all-caps usage; uncertainty on optimal directory depth |
| **Gaps** | No research on optimal file name length for LLM context; limited guidance on versioning in file names; missing impact on LLM token efficiency |

## Recommendations for Phase 2

### Delimiter Conventions
**Evaluate**: When to use underscores vs. hyphens vs. PascalCase

### Semantic Suffixes
**Evaluate**: Standardized suffixes for file types (_GUIDE, _TEMPLATE, _LOG, _PROMPT)

### Directory Depth
**Evaluate**: Optimal depth for specification hierarchies

### Descriptiveness vs. Brevity
**Evaluate**: Threshold for "too verbose" file names

### Case Conventions
**Evaluate**: When to use all-caps, kebab-case, PascalCase

## Sources

### High Credibility
- [llms.txt Specification](https://llmstxt.org/)
- [Anthropic Documentation](https://docs.anthropic.com/)

### Medium Credibility
- beep-effect codebase patterns
- Effect ecosystem conventions
