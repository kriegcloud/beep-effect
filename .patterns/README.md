# Effect Library Development Patterns

## 🎯 PURPOSE

This directory contains Beep guidance and one retained upstream Effect
reference. The [architecture standard](../standards/ARCHITECTURE.md) defines
this repository's package topology. Every TypeScript example in these files is
compiled by `bun run beep laws markdown-fences --check`; a fence that cannot
stand alone carries the reviewed `skip-type-checking` opt-out. The upstream
reference is labeled in its scope section.

## 📚 AVAILABLE PATTERNS

### Core Development Patterns

- **[effect-library-development.md](./effect-library-development.md)** - Effect development patterns for this repository, subordinate to the Effect-first standard
- **[module-organization.md](./module-organization.md)** - Upstream Effect module layout reference; Beep topology follows the architecture standard
- **[effect-module-paths.md](./effect-module-paths.md)** - Current Effect module import paths and the retired `unstable` mapping
- **[error-handling.md](./error-handling.md)** - Structured error management with Effect

### Documentation Patterns

- **[jsdoc-documentation.md](./jsdoc-documentation.md)** - JSDoc documentation standards and examples

### Testing Patterns

- **[testing-patterns.md](./testing-patterns.md)** - `@effect/vitest` testing patterns for this repository, subordinate to the testing standard

### Architecture Patterns

## 🔧 HOW TO USE

### For Developers

1. **Reference before implementing** - Check relevant patterns before starting new work
2. **Follow established conventions** - Use patterns as templates for consistency
3. **Contribute improvements** - Update patterns based on lessons learned

### For Code Reviews

1. **Validate pattern compliance** - Ensure implementations follow established patterns
2. **Identify pattern violations** - Look for anti-patterns and forbidden practices
3. **Suggest pattern usage** - Recommend appropriate patterns for specific use cases

### For Documentation

1. **Extract reusable patterns** - Identify common solutions for documentation
2. **Update patterns** - Keep patterns current with library evolution
3. **Cross-reference examples** - Link patterns to real codebase examples

## 🚨 CRITICAL PRINCIPLES

### Forbidden Patterns (NEVER USE)

- **try-catch in Effect.gen**: Breaks Effect's error handling semantics
- **Type assertions**: `as any`, `as never`, `as unknown` hide type errors
- **Unsafe patterns**: Any pattern that bypasses Effect's type safety

### Mandatory Patterns (ALWAYS USE)

- __return yield_ for errors_*: Makes termination explicit in generators
- **Immediate linting**: `biome check --write <changed files>` after editing TypeScript files
- **JSDoc compilation validation**: `bun run docgen` must pass
- **Markdown example compilation**: `bun run beep laws markdown-fences --check` must pass
- **Effect testing patterns**: Use @effect/vitest with `it.effect`
- **TestClock for time**: Use TestClock for any time-dependent operations

## 📈 PATTERN QUALITY METRICS

### Completeness

- [ ] Core concepts clearly explained
- [ ] Executable code examples provided
- [ ] Common use cases covered
- [ ] Integration patterns documented

### Accuracy

- [ ] All examples compile and run correctly
- [ ] Patterns follow current Effect library conventions
- [ ] No deprecated or anti-pattern usage
- [ ] Proper error handling demonstrated

### Clarity

- [ ] Clear explanations for "why" not just "how"
- [ ] Progressive complexity (simple to advanced examples)
- [ ] Common pitfalls identified and explained
- [ ] Best practices highlighted

## 🔄 MAINTENANCE

### Regular Updates

- **API Changes**: Update patterns when Effect library APIs evolve
- **New Patterns**: Add patterns for newly identified common use cases
- **Deprecation**: Mark outdated patterns and provide migration paths
- **Examples**: Keep examples current with latest library versions

### Quality Assurance

- **Pattern Validation**: Regularly test all code examples
- **Consistency**: Ensure patterns align with current codebase standards
- **Documentation**: Keep pattern documentation synchronized with implementation

## 🎯 SUCCESS INDICATORS

### Developer Experience

- Reduced time to implement common patterns
- Consistent code quality across the codebase
- Fewer pattern-related code review comments
- Improved onboarding for new contributors

### Code Quality

- Consistent architecture patterns throughout codebase
- Proper error handling and resource management
- Type-safe implementations without workarounds
- Comprehensive test coverage with proper patterns

### Documentation Quality

- Practical, working examples for all patterns
- Clear guidance on when and how to use each pattern
- Integration examples showing pattern composition
- Anti-pattern identification and alternatives

This patterns directory serves as the authoritative guide for Effect library development, ensuring consistent, high-quality implementations across the entire codebase.
