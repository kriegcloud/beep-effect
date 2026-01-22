# Academic & DDD Foundations Research

## Research Parameters
- **Topic**: Academic and Domain-Driven Design file naming foundations
- **Date**: 2026-01-21
- **Phase**: 1 (External Research)

## Executive Summary

Academic literature and authoritative sources converge on three principles: (1) DDD tactical patterns (Entity, Value Object, Aggregate, Repository, Service) form natural file boundaries but lack prescriptive naming conventions beyond pattern suffixes, (2) Clean Architecture emphasizes dependency direction over naming, organizing by feature/use-case rather than technical layers, and (3) FP traditions favor semantic module names over structural suffixes. Cross-referencing reveals tension between OOP pattern suffixing (UserRepository.ts) and FP semantic naming (Users.ts), with no empirical consensus.

## Key Findings

### Finding 1: DDD Tactical Patterns as File Boundaries
**Sources**:
- martinfowler.com/bliki/DomainDrivenDesign.html
- Eric Evans, "Domain-Driven Design" (2003)
**Credibility**: HIGH (Authoritative DDD sources)

DDD defines tactical patterns (Entity, Value Object, Aggregate, Repository, Service, Factory) as conceptual boundaries but does not prescribe file naming conventions. Evans' work focuses on pattern recognition in code, not file organization.

**Relevance**: Pattern-based suffixing is convention, not DDD requirement.

### Finding 2: Vaughn Vernon's Bounded Context Organization
**Source**: Vaughn Vernon, "Implementing Domain-Driven Design" (2013)
**Credibility**: HIGH (Recognized DDD authority)

Vernon emphasizes organizing by Bounded Context and Aggregate boundaries with file structure reflecting domain ubiquitous language. Advocates flat package structures within contexts.

**Relevance**: Supports domain-centric organization over technical layering.

### Finding 3: Clean Architecture Layer Naming
**Source**: blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
**Credibility**: HIGH (Uncle Bob Martin, original author)

Clean Architecture emphasizes dependency direction and organizing by use-case/feature rather than technical role. Does not prescribe file naming beyond "make dependencies clear."

### Finding 4: Category Theory and Module Organization
**Sources**:
- FP literature (Haskell, OCaml conventions)
- Effect-TS documentation patterns
**Credibility**: MEDIUM (Community conventions)

FP communities favor semantic module names describing domain concepts over structural suffixes. Effect-TS follows this: `Effect`, `Layer`, `Context` are semantic, not suffixed.

**Relevance**: Pattern suffixes may be OOP artifact, not universal principle.

### Finding 5: ArXiv Research on Code Comprehension
**Source**: arxiv.org (Multiple papers on code readability)
**Credibility**: HIGH (Peer-reviewed research)

Studies show semantic naming improves comprehension when names match mental models. No research found specifically addressing pattern suffix conventions.

### Finding 6: Martin Fowler on Ubiquitous Language
**Source**: martinfowler.com/bliki/UbiquitousLanguage.html
**Credibility**: HIGH (Martin Fowler)

Ubiquitous language emphasizes domain terminology consistently across code. Raises question: are "Repository" and "Service" domain terms or implementation details?

### Finding 7: Effect Ecosystem Naming Patterns
**Source**: effect.website documentation, Effect GitHub
**Credibility**: HIGH (Official Effect sources)

Effect ecosystem uses PascalCase semantic names: `Effect`, `Layer`, `Context`, `Schema` - not `EffectService`, `LayerManager`. Effect Platform: `@effect/platform/FileSystem`, not `FileSystemService`.

### Finding 8: Plural vs. Singular Debate
**Sources**: Stack Overflow, GitHub conventions
**Credibility**: LOW (Community opinions)

No consensus on plural vs. singular. Rails favors plurals, Java/.NET favor singular. Appears to be stylistic preference.

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | Domain-centric organization; dependency direction over names; semantic names over jargon; pattern suffixes are convention, not requirement |
| **Conflicts** | OOP conventions (UserRepository.ts) vs FP conventions (Users.ts); plural vs singular; technical layering vs feature-first |
| **Gaps** | No empirical research on suffix conventions; Effect lacks project structure guidance; no polyglot paradigm research |

## Four Viable Patterns Identified

### 1. OOP Suffix Pattern (Current default)
- Files: `UserRepository.ts`, `OrderService.ts`, `ProductAggregate.ts`
- Rationale: Explicit pattern identification, familiar to OOP developers
- Trade-off: Verbose, may be redundant if directories convey patterns

### 2. FP Semantic Pattern (Effect ecosystem standard)
- Files: `Users.ts`, `Orders.ts`, `Products.ts`
- Rationale: Matches Effect conventions, emphasizes domain concepts
- Trade-off: Requires clear directory structure for technical role

### 3. Hybrid Pattern (Directory suffixes, file semantic)
- Directories: `repositories/`, `services/`, `domain/`
- Files: `Users.ts`, `Orders.ts` within directories
- Rationale: Technical role via path, semantic at file level
- Trade-off: Deeper nesting

### 4. Feature-First Pattern (Clean Architecture)
- Directories: `users/`, `orders/`
- Files: `repository.ts`, `service.ts`, `domain.ts` within features
- Rationale: Strong feature cohesion, clear boundaries
- Trade-off: Generic file names require context

## Recommendations for Phase 2

### Evaluation Criteria
1. **Comprehension**: Can developers quickly locate and understand code?
2. **Consistency**: Does pattern align with Effect ecosystem?
3. **Maintainability**: Does naming reduce refactoring friction?
4. **Ubiquitous Language**: Do file names reflect domain or jargon?
5. **Tooling Support**: IDE navigation, search, imports?

### Critical Uncertainties
- **No empirical evidence** that pattern suffixes improve comprehension
- **Effect ecosystem lacks prescriptive guidance** on file organization
- **Polyglot paradigm tension** between OOP and FP unresolved

## Sources

### High Credibility
- [Martin Fowler - DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Martin Fowler - Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Eric Evans, "Domain-Driven Design" (2003)
- Vaughn Vernon, "Implementing Domain-Driven Design" (2013)
- [effect.website](https://effect.website)
- ArXiv papers on code comprehension

### Medium Credibility
- FP community conventions (Haskell, OCaml)
- Effect GitHub repositories

### Low Credibility
- Stack Overflow discussions on naming
