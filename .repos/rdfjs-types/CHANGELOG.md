# @rdfjs/types

## 2.0.1

### Patch Changes

- 6f54811: Remove generic parameters from `DataFactory#fromTerm()` overloads which caused incompatibility with `@rdfjs/types` v1

## 2.0.0

### Major Changes

- 14906cf: Add missing methods `fromTerm` and `fromQuad` to the `DataFactory` interface
- 8e965db: In some cases, loaders would report an error similar to `Could not resolve "./data-model"`. This is fixed by using `export type *` but requires [TypeScript 5+](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#support-for-export-type-)

### Minor Changes

- 46acfbb: Add optional direction for literals

## 1.1.2

### Patch Changes

- 7d8ffd1: Version `1.1.1` was inadvertently published empty (fixes #49)

## ~~1.1.1~~

### ~~Patch Changes~~

- ~~a631541: Only package declaration files~~

## 1.1.0

### Minor Changes

- 95f1e31: Dataset: Use correct type of `dataset` in methods with callbacks
- 2539ab3: Add queryable interfaces

### Patch Changes

- 8164183: Documentation Fix: Update reference of Quad to BaseQuad in the definition of Term in order to align with the type declaration.
- a19ed91: Make queryable metadata types configurable

## 1.1.0-next.1

### Patch Changes

- Make queryable metadata types configurable

## 1.1.0-next.0

### Minor Changes

- 95f1e31: Dataset: Use correct type of `dataset` in methods with callbacks
- bc7163e: Add queryable interfaces

### Patch Changes

- 8164183: Documentation Fix: Update reference of Quad to BaseQuad in the definition of Term in order to align with the type declaration.

## 1.0.1

### Patch Changes

- 973042f: The package did not work with DefinitelyTyped repository

## 1.0.0

### Major Changes

- 07692f2: Removed RegExp from match and removeMatches to follow current version of rdfjs streams specification
- 4ed7993: First release, migrated from @types/rdf-js
