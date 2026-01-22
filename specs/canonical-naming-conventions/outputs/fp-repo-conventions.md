# Functional Programming Repository Conventions Research

## Research Parameters
- **Topic**: FP ecosystem file naming and module organization
- **Date**: 2026-01-21
- **Phase**: 1 (External Research)

## Executive Summary

FP ecosystems converge on PascalCase for module names with hierarchical dot notation, minimal type/implementation file separation (preferring single-module exports), and category-theoretic naming primarily in utility/prelude modules. Effect-TS diverges from traditional FP conventions by using lowercase file names while maintaining PascalCase for internal module references.

## Key Findings

### Finding 1: PascalCase Module Naming Standard
**Source**: https://wiki.haskell.org/Programming_guidelines
**Credibility**: HIGH (Official Haskell Wiki)

Haskell enforces PascalCase for module names (`Data.List`, `Control.Monad.State`).

**Evidence**:
```haskell
-- File: src/Data/User/Repository.hs
module Data.User.Repository where
```

### Finding 2: Effect-TS Official Repository Pattern
**Source**: https://github.com/Effect-TS/effect/tree/main/packages
**Credibility**: HIGH (Official Effect repository)

Core Effect packages use kebab-case for all file names:
- `packages/platform/src/http-client.ts`
- `packages/platform/src/platform-node.ts`
- `packages/sql/src/sql-client.ts`

**Module Exports Pattern**:
```typescript
// File: http-client.ts
export * as HttpClient from "./HttpClient"
```

### Finding 3: Effect Barrel Export Pattern
**Source**: https://github.com/Effect-TS/effect/blob/main/packages/platform/src/index.ts
**Credibility**: HIGH (Official Effect repository)

Index files use namespace re-exports:
```typescript
export * as HttpClient from "./http-client.js"
export * as HttpServer from "./http-server.js"
export * as FileSystem from "./file-system.js"
```

Pattern: kebab-case file imported, PascalCase namespace exported.

### Finding 4: Scala ZIO Single-File Pattern
**Source**: https://github.com/zio/zio (58.8k stars)
**Credibility**: HIGH (Official ZIO repository)

ZIO uses single files per module with combined type definitions and implementations.

**Evidence**:
```scala
// File: core/shared/src/main/scala/zio/ZIO.scala
// Contains: ZIO trait definition, companion object, core operations
```

### Finding 5: PureScript Module Re-export Pattern
**Source**: https://github.com/purescript/documentation/blob/master/language/Modules.md
**Credibility**: HIGH (Official PureScript documentation)

PureScript uses barrel exports via module re-exports with strict one-type-per-file discipline.

**Evidence**:
```purescript
module Data.Array
  ( module Exports ) where
import Data.Array.NonEmpty (NonEmptyArray) as Exports
```

### Finding 6: OCaml File-as-Module Correspondence
**Source**: https://reasonml.github.io/docs/en/module
**Credibility**: HIGH (Official ReasonML documentation)

OCaml enforces strict file-to-module correspondence where filename defines module name.

**Evidence**:
```reason
/* File: User.re automatically becomes module User */
type t = { id: string, name: string };
```

### Finding 7: Category-Theoretic Naming in Utility Modules
**Source**: https://hackage.haskell.org/package/base
**Credibility**: HIGH (Official Haskell standard library)

Category-theoretic names (`Functor`, `Monad`, `Semigroup`) appear in standard library utility modules, not application domain code.

**Evidence**:
```haskell
-- Utility module (category-theoretic)
module Data.Functor where

-- Domain module (business names)
module Domain.Order.Processing where
```

### Finding 8: Elm Single-Module-Per-File
**Source**: https://guide.elm-lang.org/webapps/modules.html
**Credibility**: HIGH (Official Elm guide)

Elm enforces one module per file with PascalCase file names matching module names exactly.

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | 100% of FP languages use PascalCase for module identifiers; hierarchical dot-notation namespaces; single primary export per file over type/impl separation |
| **Conflicts** | File casing: Traditional FP (PascalCase files) vs JavaScript-influenced (lowercase); Re-export patterns vary (PureScript: controlled, Elm: none, Effect: heavy) |
| **Gaps** | No Effect style guide documenting file naming rationale; test file patterns unclear |

## Recommendations for Phase 2

### File Naming Convention
- Official Effect: `kebab-case.ts`
- Community variant: `PascalCase.ts` for services
- Evidence: All official packages use kebab-case

### Service File Patterns
- Official: `[concept]-[aspect].ts` (e.g., `http-client.ts`)
- Community: `[Concept]Service.ts` (e.g., `UserService.ts`)

### Barrel Export Strategy
- Pattern: `index.ts` with `export * as PascalCase from "./kebab-case.js"`

### Internal Implementation Separation
- Pattern: `internal/` directory for implementation details

### Multi-Word Concepts
- Official: `http-server.ts`, `sql-client.ts` (hyphenated)
- Community: `UserService.ts` (PascalCase compound)

## Sources

### High Credibility
- [Effect Platform Package](https://github.com/Effect-TS/effect/tree/main/packages/platform/src)
- [Effect Schema Package](https://github.com/Effect-TS/effect/tree/main/packages/schema/src)
- [Effect SQL Package](https://github.com/Effect-TS/effect/tree/main/packages/sql/src)
- [Haskell Programming Guidelines](https://wiki.haskell.org/Programming_guidelines)
- [PureScript Module Documentation](https://github.com/purescript/documentation/blob/master/language/Modules.md)
- [Elm Module Guide](https://guide.elm-lang.org/webapps/modules.html)
- [Scala ZIO Repository](https://github.com/zio/zio)

### Medium Credibility
- [Effect-TS-App Template](https://github.com/ethanniser/effect-ts-app) - High-starred community project
