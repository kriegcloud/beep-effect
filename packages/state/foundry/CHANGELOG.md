# @palantir/pack.state.foundry

## 0.4.0

### Minor Changes

- 72c058b: remove hardcoded metadata response values
- 8109bd7: add compass filesystem option for document type and doc creation

### Patch Changes

- Updated dependencies [72c058b]
- Updated dependencies [ceb06a9]
- Updated dependencies [8109bd7]
  - @palantir/pack.state.foundry-event@0.4.0
  - @palantir/pack.state.core@0.5.0

## 0.3.0

### Minor Changes

- bb1ba4e: update ephemeral events and custom presence event types and search request query

### Patch Changes

- Updated dependencies [bb1ba4e]
  - @palantir/pack.document-schema.model-types@0.4.0
  - @palantir/pack.state.foundry-event@0.3.0
  - @palantir/pack.state.core@0.4.0

## 0.2.1

### Patch Changes

- 5120719: Update dependency ranges
- Updated dependencies [5120719]
  - @palantir/pack.document-schema.model-types@0.3.1
  - @palantir/pack.state.foundry-event@0.2.1
  - @palantir/pack.state.core@0.3.1
  - @palantir/pack.auth@0.1.2
  - @palantir/pack.core@0.2.2

## 0.2.0

### Minor Changes

- 15f7f90: fix search api to match required types and add search pagination
- 83e4a85: Replace local presence types with @osdk/foundry.pack types. Update presence events to use new type format.
- 8057223: Add metadata event types (platform events) and refactor demo app.

### Patch Changes

- 9f45b8e: Improve document creation API to separate create request from raw API types
- 571578c: Add Booleans to pack.schema
- 7ee55de: Bump dependencies
- 4a44875: Remove bun-specific scripts and dependency
- Updated dependencies [b02d9b7]
- Updated dependencies [9f45b8e]
- Updated dependencies [571578c]
- Updated dependencies [862daf6]
- Updated dependencies [87f1e63]
- Updated dependencies [fcf8655]
- Updated dependencies [e6e40f7]
- Updated dependencies [15f7f90]
- Updated dependencies [7ee55de]
- Updated dependencies [83e4a85]
- Updated dependencies [4a44875]
- Updated dependencies [8057223]
- Updated dependencies [19b8f5b]
  - @palantir/pack.state.foundry-event@0.2.0
  - @palantir/pack.document-schema.model-types@0.3.0
  - @palantir/pack.state.core@0.3.0
  - @palantir/pack.core@0.2.1
  - @palantir/pack.auth@0.1.1

## 0.1.2

### Patch Changes

- Updated dependencies [0954a30]
  - @palantir/pack.document-schema.model-types@0.2.2
  - @palantir/pack.state.foundry-event@0.1.2
  - @palantir/pack.state.core@0.2.2

## 0.1.1

### Patch Changes

- Updated dependencies [c2012a1]
  - @palantir/pack.document-schema.model-types@0.2.1
  - @palantir/pack.state.core@0.2.1
  - @palantir/pack.state.foundry-event@0.1.1

## 0.1.0

### Minor Changes

- dfeaeb0: Fix bug in core, where multiple yDocs could get created, causing the initial update to be dropped

### Patch Changes

- Updated dependencies [dfeaeb0]
  - @palantir/pack.document-schema.model-types@0.2.0
  - @palantir/pack.state.foundry-event@0.1.0
  - @palantir/pack.state.core@0.2.0
  - @palantir/pack.auth@0.1.0
  - @palantir/pack.core@0.2.0

## 0.0.2

### Patch Changes

- 4ab9c98: Update @osdk/foundry.pack dependency, add searchDocuments to FoundryEventService
- eba27ae: Fix issues locating model metadata when multiple copies of the schema package are present
- Updated dependencies [4ab9c98]
- Updated dependencies [eba27ae]
- Updated dependencies [67df6e4]
  - @palantir/pack.state.foundry-event@0.0.2
  - @palantir/pack.document-schema.model-types@0.1.1
  - @palantir/pack.core@0.1.1
  - @palantir/pack.state.core@0.1.1
  - @palantir/pack.auth@0.0.2

## 0.0.1

### Patch Changes

- 09f7acd: Add activity & presence custom event subscriptions
- fe9891e: Add new state packages
- Updated dependencies [8ed48e6]
- Updated dependencies [8698373]
- Updated dependencies [09f7acd]
- Updated dependencies [99d9186]
- Updated dependencies [77c07c4]
- Updated dependencies [27a3b33]
- Updated dependencies [511ee0c]
- Updated dependencies [3ebc927]
- Updated dependencies [fe9891e]
  - @palantir/pack.auth@0.0.1
  - @palantir/pack.core@0.1.0
  - @palantir/pack.document-schema.model-types@0.1.0
  - @palantir/pack.state.foundry-event@0.0.1
  - @palantir/pack.state.core@0.1.0
