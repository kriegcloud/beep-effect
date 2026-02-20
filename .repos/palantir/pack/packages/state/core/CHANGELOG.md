# @palantir/pack.state.core

## 0.5.0

### Minor Changes

- 72c058b: remove hardcoded metadata response values
- ceb06a9: make filesystem type required option for doc type deploy
- 8109bd7: add compass filesystem option for document type and doc creation

## 0.4.0

### Minor Changes

- bb1ba4e: update ephemeral events and custom presence event types and search request query

### Patch Changes

- Updated dependencies [bb1ba4e]
  - @palantir/pack.document-schema.model-types@0.4.0

## 0.3.1

### Patch Changes

- 5120719: Update dependency ranges
- Updated dependencies [5120719]
  - @palantir/pack.document-schema.model-types@0.3.1
  - @palantir/pack.core@0.2.2

## 0.3.0

### Minor Changes

- 15f7f90: fix search api to match required types and add search pagination

### Patch Changes

- 9f45b8e: Improve document creation API to separate create request from raw API types
- 571578c: Add Booleans to pack.schema
- 87f1e63: Support for demo mode (offline) document services
- e6e40f7: Improve demo mode services and add offline demo oauth implementation
- 7ee55de: Bump dependencies
- 4a44875: Remove bun-specific scripts and dependency
- Updated dependencies [9f45b8e]
- Updated dependencies [571578c]
- Updated dependencies [862daf6]
- Updated dependencies [e6e40f7]
- Updated dependencies [15f7f90]
- Updated dependencies [7ee55de]
- Updated dependencies [4a44875]
- Updated dependencies [8057223]
- Updated dependencies [19b8f5b]
  - @palantir/pack.document-schema.model-types@0.3.0
  - @palantir/pack.core@0.2.1

## 0.2.2

### Patch Changes

- Updated dependencies [0954a30]
  - @palantir/pack.document-schema.model-types@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [c2012a1]
  - @palantir/pack.document-schema.model-types@0.2.1

## 0.2.0

### Minor Changes

- dfeaeb0: Fix bug in core, where multiple yDocs could get created, causing the initial update to be dropped

### Patch Changes

- Updated dependencies [dfeaeb0]
  - @palantir/pack.document-schema.model-types@0.2.0
  - @palantir/pack.core@0.2.0

## 0.1.1

### Patch Changes

- eba27ae: Fix issues locating model metadata when multiple copies of the schema package are present
- 67df6e4: Documented public apis
- Updated dependencies [eba27ae]
- Updated dependencies [67df6e4]
  - @palantir/pack.document-schema.model-types@0.1.1
  - @palantir/pack.core@0.1.1

## 0.1.0

### Minor Changes

- 77c07c4: Add Core and State Core packages, add Refs to core model types

### Patch Changes

- 09f7acd: Add activity & presence custom event subscriptions
- 99d9186: Add doc transactions for grouping multiple edits, and include an optional edit description for activity/history
- 3ebc927: Drop packApiPath
- fe9891e: Add new state packages
- Updated dependencies [8698373]
- Updated dependencies [09f7acd]
- Updated dependencies [99d9186]
- Updated dependencies [77c07c4]
- Updated dependencies [27a3b33]
- Updated dependencies [511ee0c]
- Updated dependencies [3ebc927]
  - @palantir/pack.core@0.1.0
  - @palantir/pack.document-schema.model-types@0.1.0

## 0.1.0-beta.2

### Minor Changes

- 77c07c4: Add Core and State Core packages, add Refs to core model types

### Patch Changes

- Updated dependencies [77c07c4]
  - @palantir/pack.document-schema.model-types@0.1.0-beta.3
  - @palantir/pack.core@0.1.0-beta.2
