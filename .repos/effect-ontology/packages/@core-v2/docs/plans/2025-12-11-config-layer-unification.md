# Config Unification and Layer Improvements Plan

**Date**: 2025-12-11
**Status**: In Progress

## Overview

This plan addresses configuration discrepancies and Effect layer composition improvements identified through analysis of the codebase.

## Part 1: Fix Configuration Naming Discrepancies

### Issue: .env.example uses wrong variable names

**Current State:**
- `.env.example` line 9: `ANTHROPIC_API_KEY=sk-ant-api03-your-key-here`
- `Config.ts` expects: `LLM_API_KEY` (via `Config.nested("LLM")(Config.redacted("API_KEY"))`)
- Terraform correctly uses: `LLM_API_KEY` (line 53)

**Fix:** Update `.env.example` to use `LLM_API_KEY`

### Task 1.1: Update .env.example
- Replace `ANTHROPIC_API_KEY` with `LLM_API_KEY`
- Add clear comments about the nested config pattern
- Ensure all variable names match Config.ts expectations

## Part 2: Effect Layer Composition Improvements

### Issue: Inconsistent use of Layer.provide vs Layer.provideMerge

**Current State (WorkflowLayers.ts):**
```typescript
const LlmExtractionBundle = Layer.mergeAll(...).pipe(
  Layer.provide(makeLanguageModelLayer),  // Should be provideMerge
  Layer.provide(ConfigServiceDefault)     // Should be provideMerge
)
```

**Fix:** Use `Layer.provideMerge` consistently for order-independent composition

### Task 2.1: Update WorkflowLayers.ts
- Replace `Layer.provide` with `Layer.provideMerge` in all bundle compositions
- Consolidate redundant ConfigServiceDefault provisions
- Add explicit dependency documentation

### Task 2.2: Simplify layer structure
- Create a single `CoreDependenciesLayer` that provides ConfigService once
- Have all other bundles depend on it rather than providing ConfigService individually

## Part 3: Storage Service Standardization

### Issue: StorageService uses Context.GenericTag pattern

**Current State:**
```typescript
export const StorageService = Context.GenericTag<StorageService>("@core-v2/StorageService")
```

**Consideration:** While Effect.Service is preferred, the current pattern works and changing it would require updating many files. Mark as low priority.

## Implementation Order

1. **Task 1.1** - Fix .env.example (5 min) - HIGH PRIORITY
2. **Task 2.1** - Update WorkflowLayers.ts (10 min) - HIGH PRIORITY
3. **Task 2.2** - Simplify layer structure (15 min) - MEDIUM PRIORITY

## Verification

After implementation:
1. `pnpm build` - TypeScript compiles
2. `LLM_API_KEY=test-key bun run serve` - Server starts
3. Review layer composition is cleaner and more explicit
