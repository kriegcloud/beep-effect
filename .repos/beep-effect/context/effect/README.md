# Effect Context Files — Agent Reference

> Quick-reference context files for AI agents working with Effect in the beep-effect codebase.

## Purpose

These files provide agent-specific guidance for using Effect modules in this codebase. Each file covers:
- Commonly used functions with examples
- Codebase-specific patterns and conventions
- Anti-patterns to avoid
- Links to related context files

## Files

### Core Effect Modules

| File | Module | Focus |
|------|--------|-------|
| [Effect.md](./Effect.md) | `effect/Effect` | Effect composition, error handling, observability |
| [Schema.md](./Schema.md) | `effect/Schema` | Domain modeling, validation, branded types |
| [Layer.md](./Layer.md) | `effect/Layer` | Service composition, dependency injection |
| [Context.md](./Context.md) | `effect/Context` | Service definitions, interfaces |

## Usage Guidelines

### When to Reference These Files

- **Starting a new feature** - Review relevant module patterns
- **Debugging Effect code** - Check anti-patterns section
- **Code review** - Validate against codebase patterns
- **Refactoring** - Ensure alignment with current conventions

### Context File vs Rules File

| File Type | Purpose | Example |
|-----------|---------|---------|
| **Context files** (this directory) | Agent-friendly quick reference with examples | "How do I use Effect.gen in this codebase?" |
| **Rules files** (`.claude/rules/`) | Authoritative patterns and requirements | "What are the MANDATORY import conventions?" |
| **Documentation** (`documentation/`) | Comprehensive patterns and rationale | "Why do we use branded EntityIds?" |

**Hierarchy**: Rules files define requirements → Context files provide practical examples → Documentation explains rationale.

## Quick Navigation

### By Task

| Task | File | Section |
|------|------|---------|
| Write generator-based Effects | [Effect.md](./Effect.md) | Generator-Based Composition |
| Define domain models | [Schema.md](./Schema.md) | Domain Models with M.Class |
| Handle errors by type | [Effect.md](./Effect.md) | Error Handling by Tag |
| Create service interfaces | [Context.md](./Context.md) | Service Definition with Context.Tag |
| Compose service implementations | [Layer.md](./Layer.md) | Layer Composition with Layer.mergeAll |
| Add observability spans | [Effect.md](./Effect.md) | Span Instrumentation |
| Use branded entity IDs | [Schema.md](./Schema.md) | Branded EntityIds |
| Test with Effect | [Effect.md](./Effect.md), [Layer.md](./Layer.md) | Test Layers, Test Services |

### By Module

| Need | Context File |
|------|--------------|
| Effect type and operators | [Effect.md](./Effect.md) |
| Schema validation | [Schema.md](./Schema.md) |
| Service composition | [Layer.md](./Layer.md) |
| Service definitions | [Context.md](./Context.md) |

## Related Resources

| Resource | Purpose |
|----------|---------|
| [.claude/rules/effect-patterns.md](../../.claude/rules/effect-patterns.md) | Authoritative Effect patterns and rules |
| [documentation/EFFECT_PATTERNS.md](../../documentation/EFFECT_PATTERNS.md) | Comprehensive Effect pattern reference |
| [.repos/effect/](../../.repos/effect/) | Effect source code (for deep dives) |

## Maintenance

These context files should be updated when:
- New Effect patterns are established in the codebase
- Anti-patterns are discovered and documented
- Major Effect version updates change APIs
- Codebase conventions evolve

**Update frequency**: Review quarterly or after significant architectural changes.

---

**Last updated**: 2026-02-03
