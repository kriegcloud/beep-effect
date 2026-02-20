# @palantir/pack.document-schema.model-types

## 0.4.0

### Minor Changes

- bb1ba4e: update ephemeral events and custom presence event types and search request query

## 0.3.1

### Patch Changes

- 5120719: Update dependency ranges
- Updated dependencies [5120719]
  - @palantir/pack.core@0.2.2

## 0.3.0

### Minor Changes

- 862daf6: Schema union types can define custom discriminant
- 15f7f90: fix search api to match required types and add search pagination
- 8057223: Add metadata event types (platform events) and refactor demo app.

### Patch Changes

- 9f45b8e: Improve document creation API to separate create request from raw API types
- 571578c: Add Booleans to pack.schema
- 7ee55de: Bump dependencies
- 4a44875: Remove bun-specific scripts and dependency
- 19b8f5b: Rm extra field in DiscretionaryPrincipal_All
- Updated dependencies [9f45b8e]
- Updated dependencies [571578c]
- Updated dependencies [e6e40f7]
- Updated dependencies [7ee55de]
- Updated dependencies [4a44875]
  - @palantir/pack.core@0.2.1

## 0.2.2

### Patch Changes

- 0954a30: Relax validation on transaction editDescription for build environments that have duplicated @palantir/pack.document-schema.model-types. Adds a warning when this is detected

## 0.2.1

### Patch Changes

- c2012a1: Add ActivityEvents and PresenceEvents utils for type guards and easier edit descriptions

## 0.2.0

### Minor Changes

- dfeaeb0: Fix bug in core, where multiple yDocs could get created, causing the initial update to be dropped

### Patch Changes

- Updated dependencies [dfeaeb0]
  - @palantir/pack.core@0.2.0

## 0.1.1

### Patch Changes

- eba27ae: Fix issues locating model metadata when multiple copies of the schema package are present
- 67df6e4: Documented public apis
- Updated dependencies [eba27ae]
- Updated dependencies [67df6e4]
  - @palantir/pack.core@0.1.1

## 0.1.0

### Minor Changes

- 77c07c4: Add Core and State Core packages, add Refs to core model types

### Patch Changes

- 09f7acd: Add activity & presence custom event subscriptions
- 99d9186: Add doc transactions for grouping multiple edits, and include an optional edit description for activity/history
- 27a3b33: Initial release
- 511ee0c: Resetting to beta version of package
- Updated dependencies [8698373]
- Updated dependencies [77c07c4]
- Updated dependencies [3ebc927]
  - @palantir/pack.core@0.1.0

## 0.1.0-beta.3

### Minor Changes

- 77c07c4: Add Core and State Core packages, add Refs to core model types

### Patch Changes

- Updated dependencies [77c07c4]
  - @palantir/pack.core@0.1.0-beta.2

## 0.1.0-beta.2

### Minor Changes

- 27a3b33: Initial release
- 511ee0c: Resetting to beta version of package
