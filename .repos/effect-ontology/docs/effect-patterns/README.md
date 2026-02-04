# Effect-TS Patterns Library

> **130+ curated patterns for Effect-TS development**  
> **Source**: [EffectPatterns Repository](https://github.com/PaulJPhilp/EffectPatterns)  
> **Last Updated**: 2025-11-13

## Overview

This directory contains 130+ practical, battle-tested patterns for building applications with Effect-TS. Each pattern includes:

- **Guideline**: What to do
- **Rationale**: Why it matters
- **Good Example**: Recommended approach with working code
- **Bad Example**: Anti-patterns to avoid
- **Related Patterns**: Connected concepts

## Quick Start

### For AI Agents

- See [`AGENTS.md`](../../AGENTS.md) for comprehensive AI agent guidelines
- See [`.claude/skills/effect-patterns-hub/SKILL.md`](../../.claude/skills/effect-patterns-hub/SKILL.md) for pattern index

### For Developers

Browse patterns by category below or search by keyword:

```bash
# Find all patterns about errors
grep -l "error" *.mdx

# Find patterns by use case
grep "useCase: concurrency" *.mdx

# Find patterns by skill level
grep "skillLevel: beginner" *.mdx
```

## Pattern Categories

### 🚀 Getting Started (Beginner)

**Creating Effects**
- [`constructor-succeed-some-right.mdx`](./constructor-succeed-some-right.mdx) - Create successful Effects
- [`constructor-fail-none-left.mdx`](./constructor-fail-none-left.mdx) - Create failed Effects
- [`constructor-sync-async.mdx`](./constructor-sync-async.mdx) - Wrap sync/async code
- [`constructor-try-trypromise.mdx`](./constructor-try-trypromise.mdx) - Safe promise conversion
- [`constructor-from-nullable-option-either.mdx`](./constructor-from-nullable-option-either.mdx) - Handle nullable values

**Basic Composition**
- [`use-pipe-for-composition.mdx`](./use-pipe-for-composition.mdx) - Data-first pipe style
- [`combinator-map.mdx`](./combinator-map.mdx) - Transform success values
- [`combinator-flatmap.mdx`](./combinator-flatmap.mdx) - Chain effects
- [`combinator-sequencing.mdx`](./combinator-sequencing.mdx) - Sequential operations
- [`write-sequential-code-with-gen.mdx`](./write-sequential-code-with-gen.mdx) - Effect.gen basics

**Error Handling Basics**
- [`define-tagged-errors.mdx`](./define-tagged-errors.mdx) - Define custom errors
- [`handle-errors-with-catch.mdx`](./handle-errors-with-catch.mdx) - Basic error recovery
- [`pattern-catchtag.mdx`](./pattern-catchtag.mdx) - Type-safe error handling

**Execution**
- [`execute-with-runpromise.mdx`](./execute-with-runpromise.mdx) - Run Effects as promises
- [`execute-with-runsync.mdx`](./execute-with-runsync.mdx) - Synchronous execution
- [`effects-are-lazy.mdx`](./effects-are-lazy.mdx) - Understanding Effect evaluation

### 🏗️ Building Applications (Intermediate)

**Business Logic**
- [`use-gen-for-business-logic.mdx`](./use-gen-for-business-logic.mdx) - Structure business logic
- [`conditionally-branching-workflows.mdx`](./conditionally-branching-workflows.mdx) - Conditional flows
- [`control-flow-with-combinators.mdx`](./control-flow-with-combinators.mdx) - Combinator patterns
- [`avoid-long-andthen-chains.mdx`](./avoid-long-andthen-chains.mdx) - Readable composition

**Services & Dependency Injection**
- [`model-dependencies-as-services.mdx`](./model-dependencies-as-services.mdx) - Service definition
- [`understand-layers-for-dependency-injection.mdx`](./understand-layers-for-dependency-injection.mdx) - Layer basics
- [`scoped-service-layer.mdx`](./scoped-service-layer.mdx) - Services with resources
- [`organize-layers-into-composable-modules.mdx`](./organize-layers-into-composable-modules.mdx) - Module composition
- [`compose-scoped-layers.mdx`](./compose-scoped-layers.mdx) - Advanced layer patterns

**Schema & Validation**
- [`define-contracts-with-schema.mdx`](./define-contracts-with-schema.mdx) - Schema definitions
- [`parse-with-schema-decode.mdx`](./parse-with-schema-decode.mdx) - Decoding data
- [`transform-data-with-schema.mdx`](./transform-data-with-schema.mdx) - Data transformations
- [`brand-model-domain-type.mdx`](./brand-model-domain-type.mdx) - Branded types
- [`brand-validate-parse.mdx`](./brand-validate-parse.mdx) - Brand validation

**Configuration**
- [`define-config-schema.mdx`](./define-config-schema.mdx) - Config schemas
- [`access-config-in-context.mdx`](./access-config-in-context.mdx) - Using config
- [`provide-config-layer.mdx`](./provide-config-layer.mdx) - Config layers

**HTTP & APIs**
- [`build-a-basic-http-server.mdx`](./build-a-basic-http-server.mdx) - HTTP server setup
- [`launch-http-server.mdx`](./launch-http-server.mdx) - Server lifecycle
- [`handle-get-request.mdx`](./handle-get-request.mdx) - GET endpoints
- [`extract-path-parameters.mdx`](./extract-path-parameters.mdx) - Route parameters
- [`validate-request-body.mdx`](./validate-request-body.mdx) - Request validation
- [`send-json-response.mdx`](./send-json-response.mdx) - JSON responses
- [`handle-api-errors.mdx`](./handle-api-errors.mdx) - API error handling
- [`make-http-client-request.mdx`](./make-http-client-request.mdx) - HTTP clients
- [`create-a-testable-http-client-service.mdx`](./create-a-testable-http-client-service.mdx) - Testable clients

**Resource Management**
- [`safely-bracket-resource-usage.mdx`](./safely-bracket-resource-usage.mdx) - acquireRelease pattern
- [`manage-resource-lifecycles-with-scope.mdx`](./manage-resource-lifecycles-with-scope.mdx) - Scope basics
- [`manual-scope-management.mdx`](./manual-scope-management.mdx) - Advanced scope

**Testing**
- [`mocking-dependencies-in-tests.mdx`](./mocking-dependencies-in-tests.mdx) - Mock layers
- [`use-default-layer-for-tests.mdx`](./use-default-layer-for-tests.mdx) - Test setup
- [`write-tests-that-adapt-to-application-code.mdx`](./write-tests-that-adapt-to-application-code.mdx) - Test philosophy

### ⚡ Production Systems (Advanced)

**Concurrency & Parallelism**
- [`run-effects-in-parallel-with-all.mdx`](./run-effects-in-parallel-with-all.mdx) - Parallel execution
- [`process-collection-in-parallel-with-foreach.mdx`](./process-collection-in-parallel-with-foreach.mdx) - Parallel collections
- [`run-background-tasks-with-fork.mdx`](./run-background-tasks-with-fork.mdx) - Background fibers
- [`race-concurrent-effects.mdx`](./race-concurrent-effects.mdx) - Racing effects
- [`understand-fibers-as-lightweight-threads.mdx`](./understand-fibers-as-lightweight-threads.mdx) - Fiber fundamentals
- [`decouple-fibers-with-queue-pubsub.mdx`](./decouple-fibers-with-queue-pubsub.mdx) - Queue patterns
- [`poll-for-status-until-task-completes.mdx`](./poll-for-status-until-task-completes.mdx) - Polling strategies
- [`implement-graceful-shutdown.mdx`](./implement-graceful-shutdown.mdx) - Shutdown handling

**Error Recovery & Retry**
- [`retry-based-on-specific-errors.mdx`](./retry-based-on-specific-errors.mdx) - Retry strategies
- [`handle-flaky-operations-with-retry-timeout.mdx`](./handle-flaky-operations-with-retry-timeout.mdx) - Retry + timeout
- [`mapping-errors-to-fit-your-domain.mdx`](./mapping-errors-to-fit-your-domain.mdx) - Error mapping
- [`handle-unexpected-errors-with-cause.mdx`](./handle-unexpected-errors-with-cause.mdx) - Cause inspection
- [`control-repetition-with-schedule.mdx`](./control-repetition-with-schedule.mdx) - Schedule patterns

**Stream Processing**
- [`process-streaming-data-with-stream.mdx`](./process-streaming-data-with-stream.mdx) - Stream basics
- [`stream-from-iterable.mdx`](./stream-from-iterable.mdx) - Iterable streams
- [`stream-from-file.mdx`](./stream-from-file.mdx) - File streams
- [`stream-from-paginated-api.mdx`](./stream-from-paginated-api.mdx) - Paginated APIs
- [`stream-process-concurrently.mdx`](./stream-process-concurrently.mdx) - Concurrent streams
- [`stream-process-in-batches.mdx`](./stream-process-in-batches.mdx) - Batch processing
- [`stream-collect-results.mdx`](./stream-collect-results.mdx) - Collecting results
- [`stream-run-for-effects.mdx`](./stream-run-for-effects.mdx) - Stream execution
- [`stream-manage-resources.mdx`](./stream-manage-resources.mdx) - Resource-safe streams
- [`stream-retry-on-failure.mdx`](./stream-retry-on-failure.mdx) - Stream retry

**Runtime & Execution**
- [`execute-long-running-apps-with-runfork.mdx`](./execute-long-running-apps-with-runfork.mdx) - Long-running apps
- [`create-reusable-runtime-from-layers.mdx`](./create-reusable-runtime-from-layers.mdx) - Custom runtimes
- [`create-managed-runtime-for-scoped-resources.mdx`](./create-managed-runtime-for-scoped-resources.mdx) - Managed runtimes
- [`provide-dependencies-to-routes.mdx`](./provide-dependencies-to-routes.mdx) - Route dependencies

**Observability**
- [`leverage-structured-logging.mdx`](./leverage-structured-logging.mdx) - Structured logging
- [`observability-structured-logging.mdx`](./observability-structured-logging.mdx) - Advanced logging
- [`trace-operations-with-spans.mdx`](./trace-operations-with-spans.mdx) - Tracing basics
- [`observability-tracing-spans.mdx`](./observability-tracing-spans.mdx) - Advanced tracing
- [`add-custom-metrics.mdx`](./add-custom-metrics.mdx) - Metrics basics
- [`observability-custom-metrics.mdx`](./observability-custom-metrics.mdx) - Advanced metrics
- [`observability-opentelemetry.mdx`](./observability-opentelemetry.mdx) - OpenTelemetry
- [`observability-effect-fn.mdx`](./observability-effect-fn.mdx) - Effect.fn instrumentation

**Advanced Patterns**
- [`add-caching-by-wrapping-a-layer.mdx`](./add-caching-by-wrapping-a-layer.mdx) - Layer caching
- [`process-a-collection-of-data-asynchronously.mdx`](./process-a-collection-of-data-asynchronously.mdx) - Async collections

### 🧩 Data Types & Pattern Matching

**Core Data Types**
- [`data-option.mdx`](./data-option.mdx) - Option type
- [`model-optional-values-with-option.mdx`](./model-optional-values-with-option.mdx) - Optional values
- [`data-either.mdx`](./data-either.mdx) - Either type
- [`accumulate-multiple-errors-with-either.mdx`](./accumulate-multiple-errors-with-either.mdx) - Error accumulation
- [`data-chunk.mdx`](./data-chunk.mdx) - Chunk collections
- [`use-chunk-for-high-performance-collections.mdx`](./use-chunk-for-high-performance-collections.mdx) - High-perf collections
- [`data-array.mdx`](./data-array.mdx) - Array utilities
- [`data-hashset.mdx`](./data-hashset.mdx) - HashSet collections

**Time & Duration**
- [`data-duration.mdx`](./data-duration.mdx) - Duration type
- [`representing-time-spans-with-duration.mdx`](./representing-time-spans-with-duration.mdx) - Time spans
- [`data-datetime.mdx`](./data-datetime.mdx) - DateTime type
- [`beyond-the-date-type.mdx`](./beyond-the-date-type.mdx) - Advanced time
- [`accessing-current-time-with-clock.mdx`](./accessing-current-time-with-clock.mdx) - Clock service

**Advanced Data Types**
- [`data-bigdecimal.mdx`](./data-bigdecimal.mdx) - BigDecimal precision
- [`data-ref.mdx`](./data-ref.mdx) - Ref for state
- [`manage-shared-state-with-ref.mdx`](./manage-shared-state-with-ref.mdx) - State management
- [`data-redacted.mdx`](./data-redacted.mdx) - Sensitive data
- [`data-cause.mdx`](./data-cause.mdx) - Error cause
- [`data-exit.mdx`](./data-exit.mdx) - Exit results
- [`data-case.mdx`](./data-case.mdx) - Case utilities
- [`data-class.mdx`](./data-class.mdx) - Class patterns
- [`data-struct.mdx`](./data-struct.mdx) - Struct utilities
- [`data-tuple.mdx`](./data-tuple.mdx) - Tuple patterns

**Pattern Matching**
- [`pattern-match.mdx`](./pattern-match.mdx) - Match API
- [`pattern-matcheffect.mdx`](./pattern-matcheffect.mdx) - Effectful matching
- [`pattern-matchtag.mdx`](./pattern-matchtag.mdx) - Tag matching
- [`pattern-option-either-checks.mdx`](./pattern-option-either-checks.mdx) - Option/Either checks

**Combinators**
- [`combinator-conditional.mdx`](./combinator-conditional.mdx) - Conditional logic
- [`combinator-error-handling.mdx`](./combinator-error-handling.mdx) - Error combinators
- [`combinator-filter.mdx`](./combinator-filter.mdx) - Filtering
- [`combinator-foreach-all.mdx`](./combinator-foreach-all.mdx) - Collection combinators
- [`combinator-zip.mdx`](./combinator-zip.mdx) - Zipping values

### 🛠️ Tooling & Setup

**Project Setup**
- [`setup-new-project.mdx`](./setup-new-project.mdx) - New projects
- [`supercharge-your-editor-with-the-effect-lsp.mdx`](./supercharge-your-editor-with-the-effect-lsp.mdx) - Editor setup
- [`teach-your-ai-agents-effect-with-the-mcp-server.mdx`](./teach-your-ai-agents-effect-with-the-mcp-server.mdx) - AI integration

**Utilities**
- [`comparing-data-by-value-with-structural-equality.mdx`](./comparing-data-by-value-with-structural-equality.mdx) - Structural equality
- [`understand-effect-channels.mdx`](./understand-effect-channels.mdx) - Effect type channels
- [`distinguish-not-found-from-errors.mdx`](./distinguish-not-found-from-errors.mdx) - NotFound pattern
- [`solve-promise-problems-with-effect.mdx`](./solve-promise-problems-with-effect.mdx) - Promise migration
- [`wrap-synchronous-computations.mdx`](./wrap-synchronous-computations.mdx) - Sync wrapping
- [`wrap-asynchronous-computations.mdx`](./wrap-asynchronous-computations.mdx) - Async wrapping
- [`transform-effect-values.mdx`](./transform-effect-values.mdx) - Value transformation
- [`create-pre-resolved-effect.mdx`](./create-pre-resolved-effect.mdx) - Pre-resolved Effects
- [`constructor-from-iterable.mdx`](./constructor-from-iterable.mdx) - Iterable conversion

## Pattern Metadata

Each pattern includes structured frontmatter:

```yaml
---
title: Human-readable name
id: kebab-case-identifier
skillLevel: beginner | intermediate | advanced
useCase: primary-category
summary: Brief description
tags:
  - searchable
  - keywords
related:
  - other-pattern-id
author: Pattern author
---
```

## Search Guide

### By Skill Level

```bash
# Beginner patterns
grep "skillLevel: beginner" *.mdx

# Intermediate patterns
grep "skillLevel: intermediate" *.mdx

# Advanced patterns
grep "skillLevel: advanced" *.mdx
```

### By Use Case

Common use cases:
- `domain-modeling` - Schemas, brands, types
- `error-handling` - Recovery, retry, TaggedError
- `concurrency` - Parallelism, fibers, coordination
- `streaming` - Stream processing, backpressure
- `dependency-injection` - Services, layers, context
- `testing` - Mocks, test layers, test patterns
- `observability` - Logging, tracing, metrics
- `http` - Servers, clients, APIs

```bash
grep "useCase: concurrency" *.mdx
grep "useCase: testing" *.mdx
```

### By Topic

```bash
# Error handling
grep -l "error\|catch\|retry" *.mdx

# Concurrency
grep -l "parallel\|concurrent\|fiber" *.mdx

# Streaming
grep -l "stream\|sink" *.mdx

# Services & DI
grep -l "service\|layer\|dependency" *.mdx

# HTTP
grep -l "http\|server\|client" *.mdx

# Testing
grep -l "test\|mock" *.mdx
```

## Integration with Claude Skills

This pattern library is fully integrated with Claude AI agents via `.claude/skills/effect-patterns-hub/SKILL.md`. The patterns are:

- **Searchable**: Agents can grep/read patterns
- **Indexed**: Quick decision tree for pattern selection
- **Referenced**: Skills link to specific patterns
- **Enforced**: AGENTS.md enforces best practices

## Best Practices

When using these patterns:

1. **Start Simple**: Begin with beginner patterns
2. **Check Related**: Follow pattern links for deeper understanding
3. **Adapt Context**: Patterns are templates, not rigid rules
4. **Type Safety**: Always maintain explicit types
5. **Test First**: Use testing patterns from the start
6. **Observe**: Add logging/tracing as you build
7. **Compose**: Combine patterns for complex workflows
8. **Refactor**: Improve as you learn better patterns

## Contributing

These patterns are maintained from the upstream [EffectPatterns](https://github.com/PaulJPhilp/EffectPatterns) repository.

To suggest improvements:
1. Open an issue in the upstream repository
2. Contribute patterns via pull request
3. Update this codebase with new patterns

## Additional Resources

- **Effect Documentation**: https://effect.website/
- **Effect Discord**: https://discord.gg/effect-ts
- **EffectPatterns Repo**: https://github.com/PaulJPhilp/EffectPatterns
- **AGENTS.md**: [../../AGENTS.md](../../AGENTS.md)
- **Claude Skills**: [../../.claude/skills/](../../.claude/skills/)

## Quick Reference

### Most Common Patterns

**Day 1** (Learning Effect):
1. [`use-gen-for-business-logic.mdx`](./use-gen-for-business-logic.mdx)
2. [`use-pipe-for-composition.mdx`](./use-pipe-for-composition.mdx)
3. [`define-tagged-errors.mdx`](./define-tagged-errors.mdx)
4. [`pattern-catchtag.mdx`](./pattern-catchtag.mdx)
5. [`execute-with-runpromise.mdx`](./execute-with-runpromise.mdx)

**Week 1** (Building Apps):
1. [`model-dependencies-as-services.mdx`](./model-dependencies-as-services.mdx)
2. [`understand-layers-for-dependency-injection.mdx`](./understand-layers-for-dependency-injection.mdx)
3. [`define-contracts-with-schema.mdx`](./define-contracts-with-schema.mdx)
4. [`run-effects-in-parallel-with-all.mdx`](./run-effects-in-parallel-with-all.mdx)
5. [`mocking-dependencies-in-tests.mdx`](./mocking-dependencies-in-tests.mdx)

**Month 1** (Production Ready):
1. [`retry-based-on-specific-errors.mdx`](./retry-based-on-specific-errors.mdx)
2. [`leverage-structured-logging.mdx`](./leverage-structured-logging.mdx)
3. [`implement-graceful-shutdown.mdx`](./implement-graceful-shutdown.mdx)
4. [`process-streaming-data-with-stream.mdx`](./process-streaming-data-with-stream.mdx)
5. [`organize-layers-into-composable-modules.mdx`](./organize-layers-into-composable-modules.mdx)

---

**Total Patterns**: 130+  
**Last Sync**: 2025-11-13  
**Version**: EffectPatterns v0.5.0

