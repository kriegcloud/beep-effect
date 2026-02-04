# Code Review Report: Effect Anti-Patterns & Improvements

## Executive Summary
The codebase uses modern Effect patterns (`Effect.gen`) in many places, but exhibits inconsistent error handling styles and some potential runtime risks (synchronous JSON parsing). There is significant opportunity to reduce boilerplate in error mapping and improve type safety around external data parsing.

## Identified Anti-Patterns & Issues

### 1. Unsafe Synchronous Operations
**Location:** `Service/ReconciliationService.ts`
**Issue:** `JSON.parse` is used inside `try/catch` blocks or directly, rather than using `Effect.try` or `Effect.tryJson`.
**Risk:** Synchronous exceptions can escape the Effect error channel if not carefully managed, or lead to non-idiomatic imperative code.
**Recommendation:** Refactor to use `Effect.try` or `Schema.parseJson`.

### 2. Repetitive Error Mapping
**Location:** `Service/ReconciliationService.ts`, `Service/OntologyLoader.ts`
**Issue:** Identical `Effect.mapError` logic is repeated for every storage call to wrap `SystemError` into domain errors.
**Recommendation:** Create domain-specific wrapper services or helper combinators (e.g., `Effect.mapError` helpers) to handle standard infrastructure errors consistently.

### 3. Verbose Pipe Chains inside Generators
**Location:** `Service/LlmControl/TokenBudget.ts`, `Service/EntityIndex.ts`
**Issue:** Usage of `.pipe(Effect.map(...))` on simple `Ref.get` calls inside or outside generators.
**Recommendation:** Use `Effect.map(Ref.get(ref), ...)` or direct yield in generators for cleaner syntax.

### 4. Loose Typing on Errors
**Location:** General usage
**Issue:** Error messages often use `${e}` or `${error.message}` on unknown error types without narrowing.
**Recommendation:** Leverage the structured `SystemError` or typed errors from dependencies to provide more granular failure information.

### 5. Deep Nesting in Service Definitions
**Location:** `Service/OntologyLoader.ts`
**Issue:** `Effect.cached(Effect.gen(...))` nested inside the main service generator creates deep indentation and complexity.
**Recommendation:** Extract cached effects into standalone definitions or private helper functions.

## Prioritized Refactoring Plan

1.  **High Priority:** Fix `JSON.parse` usage in `ReconciliationService.ts` to prevent potential crashes or silent failures.
2.  **Medium Priority:** Refactor `ReconciliationService.ts` to remove repetitive error mapping.
3.  **Low Priority:** Standardize `Ref.get` patterns in `TokenBudget.ts`.
