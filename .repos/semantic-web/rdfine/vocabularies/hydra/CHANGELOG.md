# Change Log

## 0.10.6

### Patch Changes

- c41dbdd7: Updated `@tpluscode/rdf-ns-builders` to v5
- Updated dependencies [c41dbdd7]
- Updated dependencies [c41dbdd7]
  - @tpluscode/rdfine@0.7.11
  - @rdfine/rdf@0.7.6
  - @rdfine/rdfs@0.8.6

## 0.10.5

### Patch Changes

- 9b28f347: Updated dependencies to remove `rdf-js` references in compiled output
- Updated dependencies [9b28f347]
  - @tpluscode/rdfine@0.7.7
  - @rdfine/rdf@0.7.5
  - @rdfine/rdfs@0.8.5

## 0.10.4

### Patch Changes

- c8d796c4: Relax rdfine dependency
- Updated dependencies [c8d796c4]
  - @rdfine/rdf@0.7.4
  - @rdfine/rdfs@0.8.4

## 0.10.3

### Patch Changes

- 9a838dec: Missing `Factory.js` in package
- 9a838dec: Added changelog to package
- Updated dependencies [9a838dec]
- Updated dependencies [9a838dec]
  - @rdfine/rdf@0.7.3
  - @rdfine/rdfs@0.8.3

## 0.10.2

### Patch Changes

- 3c90fafa: Use mapped type to declare vocabulary factory
- Updated dependencies [3c90fafa]
  - @tpluscode/rdfine@0.7.3
  - @rdfine/rdf@0.7.2
  - @rdfine/rdfs@0.8.2

## 0.10.1

### Patch Changes

- 0ab38e3b: Factory was missing from package and exports
- Updated dependencies [0ab38e3b]
  - @rdfine/rdf@0.7.1
  - @rdfine/rdfs@0.8.1

## 0.10.0

### Minor Changes

- 9d49a7b2: Remove all `Partial` from mixin types to simplify extending classes

### Patch Changes

- Updated dependencies [fe473333]
- Updated dependencies [9d49a7b2]
  - @tpluscode/rdfine@0.7.0
  - @rdfine/rdf@0.7.0
  - @rdfine/rdfs@0.8.0

## 0.9.0

### Minor Changes

- 6cee88c8: Package is not ESM-only

### Patch Changes

- Updated dependencies [6cee88c8]
  - @tpluscode/rdfine@0.6.0
  - @rdfine/rdf@0.6.0
  - @rdfine/rdfs@0.7.0

## 0.8.8

### Patch Changes

- a45c89c1: `VariableRepresentation#mapValue` would be undefined because the extension mixin would not be added to factory

## 0.8.7

### Patch Changes

- 96e50a57: Support expanding using `hydra:variableRepresentation` override on individual mapping (re HydraCG/Specifications#244)

## 0.8.6

### Patch Changes

- 45fa0c98: Again export a factory for "member assertion"

## 0.8.5

### Patch Changes

- a080452d: Template expansion did not expand against a parent's URI if it was not an direct parent

## 0.8.4

### Patch Changes

- 153af913: Remove generation of `hydra:collection`
- 4ce19cbe: Introduce a more stable order of members, exports and imports
- f7cfefff: Update `@tpluscode/rdf-ns-builders` to v2
- 67d2ebc5: Do not generate for class `MemberAssertion`, which does not exist in Hydra vocabulary
- Updated dependencies [4ce19cbe]
- Updated dependencies [f7cfefff]
  - @rdfine/rdfs@0.6.10
  - @tpluscode/rdfine@0.5.39
  - @rdfine/rdf@0.5.7

## 0.8.3

### Patch Changes

- c137556e: IriTemplate: add optional `base` argument to expand any relative template

## 0.8.2

### Patch Changes

- 5e2681a4: Update @tpluscode/rdfine
- Updated dependencies [5e2681a4]
  - @rdfine/rdf@0.5.6
  - @rdfine/rdfs@0.6.9

## 0.8.1

### Patch Changes

- d6f77ced: `fromPointer` methods should typed as `Factory<T>`
- Updated dependencies [d6f77ced]
  - @rdfine/rdf@0.5.5
  - @rdfine/rdfs@0.6.8

## 0.8.0

### Minor Changes

- 072263df: Removed generated property getter `hydra:apiDocumentation`

## 0.7.2

### Patch Changes

- 45a4be9c: Broken imports or exports of extension modules
- Updated dependencies [45a4be9c]
  - @rdfine/rdfs@0.6.7

## 0.7.1

### Patch Changes

- c4787718: `hydra:manages` must return an array

## 0.7.0

### Minor Changes

- 553f30b2: Update Hydra to latest vocabulary

  - correct name `writable` used
  - Added `memberAssertion`. `manages` kept for now

### Patch Changes

- Updated dependencies [afe232c3]
- Updated dependencies [247137f2]
  - @rdfine/rdfs@0.6.6
  - @tpluscode/rdfine@0.5.29

## 0.6.6

### Patch Changes

- a63ec35a: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types
- Updated dependencies [a63ec35a]
  - @tpluscode/rdfine@0.5.27
  - @rdfine/rdf@0.5.4
  - @rdfine/rdfs@0.6.5

## 0.6.5

### Patch Changes

- 84eb75b4: Allow multiple inputs to `IriTemplate#expand`

## 0.6.4

### Patch Changes

- fb9fe13c: Bring back missing export

## 0.6.3

### Patch Changes

- 7cdc4e04: type-only export of interfaces
- Updated dependencies [7cdc4e04]
  - @rdfine/rdf@0.5.3
  - @rdfine/rdfs@0.6.3

## 0.6.2

### Patch Changes

- 04d8af79: Missing exports of extension modules
- Updated dependencies [04d8af79]
  - @rdfine/rdf@0.5.2
  - @rdfine/rdfs@0.6.2

## 0.6.1

### Patch Changes

- c341d76b: Add a return type to mixin functions
- 0d82ae01: Mixins classes implement partial interface
- e2d18bb7: Add factory method to mixin modules
- Updated dependencies [c341d76b]
- Updated dependencies [60a925e4]
- Updated dependencies [0d82ae01]
- Updated dependencies [e2d18bb7]
  - @rdfine/rdf@0.5.1
  - @rdfine/rdfs@0.6.1
  - @tpluscode/rdfine@0.5.17

## 0.6.0

### Minor Changes

- 0db486f2: Move all modules into `lib`

  This will allow selective imports in node.

  Also remove any star imports between packages

### Patch Changes

- Updated dependencies [a4e39c35]
- Updated dependencies [07d94285]
- Updated dependencies [0db486f2]
- Updated dependencies [69eb2666]
  - @tpluscode/rdfine@0.5.16
  - @rdfine/rdf@0.5.0
  - @rdfine/rdfs@0.6.0

## 0.5.5

### Patch Changes

- d13a929: Relax hydra:Collection generic argument

## 0.5.4

### Patch Changes

- da5dec5: Update es6-url-template which exported cjs instead of esm
- 9ebb692: Update es6-url-template

## 0.5.3

### Patch Changes

- 9b15d16: es6-url-template did not import correctly in webpack

## 0.5.2

### Patch Changes

- c1bf269: Missing export for IriTemplateEx
- Updated dependencies [1aec204]
  - @tpluscode/rdfine@0.5.10

## 0.5.1

### Patch Changes

- 9fa04eb: do not import module 'url'
- Updated dependencies [677f160]
  - @tpluscode/rdfine@0.5.9

## 0.5.0

### Minor Changes

- b45cc9d: hydra:expects must return an array

### Patch Changes

- d69277a: Generated resource types should all have generic dataset argument
- Updated dependencies [150977e]
- Updated dependencies [d69277a]
- Updated dependencies [9986b77]
- Updated dependencies [fecafe1]
  - @rdfine/rdfs@0.5.0
  - @tpluscode/rdfine@0.5.7
  - @rdfine/rdf@0.4.1

## 0.4.0

### Minor Changes

- 57dfa37: All non-array properties are generated as possibly undefined

### Patch Changes

- Updated dependencies [57dfa37]
  - @rdfine/rdf@0.4.0
  - @rdfine/rdfs@0.4.0

## 0.3.13

### Patch Changes

- 7438e0b: Update to @types/rdf-js v4
- Updated dependencies [7438e0b]
  - @tpluscode/rdfine@0.5.5
  - @rdfine/rdf@0.3.10
  - @rdfine/rdfs@0.3.10

## 0.3.12

### Patch Changes

- 6c016d1: Added datatype to IRI Template
- Updated dependencies [6c016d1]
  - @tpluscode/rdfine@0.5.4

## 0.3.11

### Patch Changes

- 1f452df: Added export definition for namespace module
- Updated dependencies [1f452df]
- Updated dependencies [98d991a]
  - @rdfine/rdf@0.3.9
  - @rdfine/rdfs@0.3.9
  - @tpluscode/rdfine@0.5.0

## 0.3.10

### Patch Changes

- 5316ea6: Remove @rdfjs/namespace from dependencies
- Updated dependencies [5316ea6]
  - @tpluscode/rdfine@0.4.23
  - @rdfine/rdf@0.3.8
  - @rdfine/rdfs@0.3.8

## [0.3.9](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.8...@rdfine/hydra@0.3.9) (2020-08-07)

**Note:** Version bump only for package @rdfine/hydra

## [0.3.8](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.7...@rdfine/hydra@0.3.8) (2020-08-06)

**Note:** Version bump only for package @rdfine/hydra

## [0.3.7](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.6...@rdfine/hydra@0.3.7) (2020-08-04)

### Bug Fixes

- **hydra:** do not expand variables with no values ([98a8ec0](https://github.com/tpluscode/rdfine/commit/98a8ec0e46dd556971eb20b591417bc2098ee226))

## [0.3.6](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.5...@rdfine/hydra@0.3.6) (2020-08-04)

### Features

- **hydra:** added template expansion to Hydra IriTemplate ([1f3a206](https://github.com/tpluscode/rdfine/commit/1f3a20611b2b766ff3db5ff690dbdc49c21751ae))

## [0.3.5](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.4...@rdfine/hydra@0.3.5) (2020-07-07)

**Note:** Version bump only for package @rdfine/hydra

## [0.3.4](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.3...@rdfine/hydra@0.3.4) (2020-07-07)

**Note:** Version bump only for package @rdfine/hydra

## [0.3.3](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.2...@rdfine/hydra@0.3.3) (2020-07-06)

### Bug Fixes

- **build:** exports field did not work in newer node ([531da7b](https://github.com/tpluscode/rdfine/commit/531da7bd23faa2ad5b1bacec1c5a76e44d6190ab))
- **build:** typo in main field ([70f15dc](https://github.com/tpluscode/rdfine/commit/70f15dcacf45694b5490558a49dbb04b014b323f))

## [0.3.2](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.1...@rdfine/hydra@0.3.2) (2020-07-05)

### Bug Fixes

- **build:** bundles partially missing in package ([e8b9816](https://github.com/tpluscode/rdfine/commit/e8b9816cc583f1f756a649107bdcd3fabebb5880))

## [0.3.1](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.3.0...@rdfine/hydra@0.3.1) (2020-07-03)

### Bug Fixes

- **generator:** import mixins only from index ([5470637](https://github.com/tpluscode/rdfine/commit/5470637ee51480bafa76e28d92a92a169d86d180))

# [0.3.0](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.2.4...@rdfine/hydra@0.3.0) (2020-07-03)

### Features

- rename dependencies to bundles ([d67afbe](https://github.com/tpluscode/rdfine/commit/d67afbe596bc1d91c1a030cb233bb44ca04a0fc7))

### BREAKING CHANGES

- imports need to be updated

## [0.2.4](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.2.3...@rdfine/hydra@0.2.4) (2020-06-08)

**Note:** Version bump only for package @rdfine/hydra

## [0.2.3](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.2.2...@rdfine/hydra@0.2.3) (2020-05-06)

**Note:** Version bump only for package @rdfine/hydra

## [0.2.2](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.2.1...@rdfine/hydra@0.2.2) (2020-05-05)

### Features

- generate mixins for specific rdf type to boost perf ([06bf552](https://github.com/tpluscode/rdfine/commit/06bf552f50f516a62f7c2bb05b9f17beb2159aee))

## [0.2.1](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.2.0...@rdfine/hydra@0.2.1) (2020-04-29)

**Note:** Version bump only for package @rdfine/hydra

# [0.2.0](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.11...@rdfine/hydra@0.2.0) (2020-04-29)

### Features

- **vocabs:** re-generated vocabularies to latest structure ([69b526e](https://github.com/tpluscode/rdfine/commit/69b526e69e7094ec7563f69525c60822ae1572b2))

## [0.1.11](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.10...@rdfine/hydra@0.1.11) (2020-04-29)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.10](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.9...@rdfine/hydra@0.1.10) (2020-04-28)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.9](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.8...@rdfine/hydra@0.1.9) (2020-04-28)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.8](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.7...@rdfine/hydra@0.1.8) (2020-04-28)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.7](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.6...@rdfine/hydra@0.1.7) (2020-04-25)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.6](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.5...@rdfine/hydra@0.1.6) (2020-04-22)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.5](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.4...@rdfine/hydra@0.1.5) (2020-04-21)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.4](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.3...@rdfine/hydra@0.1.4) (2020-04-21)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.3](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.2...@rdfine/hydra@0.1.3) (2020-04-19)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.2](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.1...@rdfine/hydra@0.1.2) (2020-04-19)

**Note:** Version bump only for package @rdfine/hydra

## [0.1.1](https://github.com/tpluscode/rdfine/compare/@rdfine/hydra@0.1.0...@rdfine/hydra@0.1.1) (2020-04-18)

### Bug Fixes

- export namespace builder from shared package ([f341521](https://github.com/tpluscode/rdfine/commit/f341521543d2fda91ef6017633ba546bf88ebe0c))

# 0.1.0 (2020-04-18)

### Bug Fixes

- **generator:** avoid conflict with rdf as vocabulary package ([090aa5e](https://github.com/tpluscode/rdfine/commit/090aa5e3789bf9eac745ed2b609320f677ed32b0))
