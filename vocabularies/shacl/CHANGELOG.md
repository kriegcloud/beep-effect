# Change Log

## 0.10.6

### Patch Changes

- c41dbdd7: Updated `@tpluscode/rdf-ns-builders` to v5
- Updated dependencies [c41dbdd7]
- Updated dependencies [c41dbdd7]
  - @tpluscode/rdfine@0.7.11
  - @rdfine/owl@0.6.6
  - @rdfine/rdf@0.7.6
  - @rdfine/rdfs@0.8.6

## 0.10.5

### Patch Changes

- 9b28f347: Updated dependencies to remove `rdf-js` references in compiled output
- Updated dependencies [9b28f347]
  - @tpluscode/rdfine@0.7.7
  - @rdfine/owl@0.6.5
  - @rdfine/rdf@0.7.5
  - @rdfine/rdfs@0.8.5

## 0.10.4

### Patch Changes

- c8d796c4: Relax rdfine dependency
- Updated dependencies [c8d796c4]
  - @rdfine/owl@0.6.4
  - @rdfine/rdf@0.7.4
  - @rdfine/rdfs@0.8.4

## 0.10.3

### Patch Changes

- 9a838dec: Added changelog to package
- Updated dependencies [9a838dec]
- Updated dependencies [9a838dec]
  - @rdfine/owl@0.6.3
  - @rdfine/rdf@0.7.3
  - @rdfine/rdfs@0.8.3

## 0.10.2

### Patch Changes

- 3c90fafa: Use mapped type to declare vocabulary factory
- Updated dependencies [3c90fafa]
  - @tpluscode/rdfine@0.7.3
  - @rdfine/owl@0.6.2
  - @rdfine/rdf@0.7.2
  - @rdfine/rdfs@0.8.2

## 0.10.1

### Patch Changes

- 0ab38e3b: Factory was missing from package and exports
- Updated dependencies [0ab38e3b]
  - @rdfine/owl@0.6.1
  - @rdfine/rdf@0.7.1
  - @rdfine/rdfs@0.8.1

## 0.10.0

### Minor Changes

- 9d49a7b2: Remove all `Partial` from mixin types to simplify extending classes

### Patch Changes

- Updated dependencies [fe473333]
- Updated dependencies [9d49a7b2]
  - @tpluscode/rdfine@0.7.0
  - @rdfine/owl@0.6.0
  - @rdfine/rdf@0.7.0
  - @rdfine/rdfs@0.8.0

## 0.9.0

### Minor Changes

- 6cee88c8: Package is not ESM-only

### Patch Changes

- Updated dependencies [6cee88c8]
  - @tpluscode/rdfine@0.6.0
  - @rdfine/owl@0.5.0
  - @rdfine/rdf@0.6.0
  - @rdfine/rdfs@0.7.0

## 0.8.7

### Patch Changes

- 4ce19cbe: Introduce a more stable order of members, exports and imports
- f7cfefff: Update `@tpluscode/rdf-ns-builders` to v2
- Updated dependencies [4ce19cbe]
- Updated dependencies [f7cfefff]
  - @rdfine/owl@0.4.9
  - @rdfine/rdfs@0.6.10
  - @tpluscode/rdfine@0.5.39
  - @rdfine/rdf@0.5.7

## 0.8.6

### Patch Changes

- 5f4e2023: `sh:detail` should allow multiple values

## 0.8.5

### Patch Changes

- 76c13f14: Fix peer dependencies (re hypermedia-app/shaperone#173)
- Updated dependencies [76c13f14]
  - @tpluscode/rdfine@0.5.35

## 0.8.4

### Patch Changes

- 5e2681a4: Update @tpluscode/rdfine
- Updated dependencies [5e2681a4]
  - @rdfine/owl@0.4.8
  - @rdfine/rdf@0.5.6
  - @rdfine/rdfs@0.6.9

## 0.8.3

### Patch Changes

- d6f77ced: `fromPointer` methods should typed as `Factory<T>`
- Updated dependencies [d6f77ced]
  - @rdfine/owl@0.4.7
  - @rdfine/rdf@0.5.5
  - @rdfine/rdfs@0.6.8

## 0.8.2

### Patch Changes

- 46a6b035: Simplify generated enum modules
- Updated dependencies [45a4be9c]
  - @rdfine/owl@0.4.6
  - @rdfine/rdfs@0.6.7

## 0.8.1

### Patch Changes

- a63ec35a: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types
- Updated dependencies [a63ec35a]
  - @tpluscode/rdfine@0.5.27
  - @rdfine/owl@0.4.4
  - @rdfine/rdf@0.5.4
  - @rdfine/rdfs@0.6.5

## 0.8.0

### Minor Changes

- cc15037b: Results must be an array

## 0.7.5

### Patch Changes

- dd26cb12: Missing sh:ignoredProperties on NodeShape

## 0.7.4

### Patch Changes

- e7988f86: `_equals` property needs path decorator option

## 0.7.3

### Patch Changes

- 7cdc4e04: type-only export of interfaces
- Updated dependencies [7cdc4e04]
  - @rdfine/owl@0.4.3
  - @rdfine/rdf@0.5.3
  - @rdfine/rdfs@0.6.3

## 0.7.2

### Patch Changes

- 04d8af79: Missing exports of extension modules
- Updated dependencies [04d8af79]
  - @rdfine/owl@0.4.2
  - @rdfine/rdf@0.5.2
  - @rdfine/rdfs@0.6.2

## 0.7.1

### Patch Changes

- decc4686: sh:equals property added to PropertyShape
- c341d76b: Add a return type to mixin functions
- 60a925e4: Generating mixins extending other vocabs
- 0d82ae01: Mixins classes implement partial interface
- e2d18bb7: Add factory method to mixin modules
- Updated dependencies [c341d76b]
- Updated dependencies [60a925e4]
- Updated dependencies [0d82ae01]
- Updated dependencies [e2d18bb7]
  - @rdfine/owl@0.4.1
  - @rdfine/rdf@0.5.1
  - @rdfine/rdfs@0.6.1
  - @tpluscode/rdfine@0.5.17

## 0.7.0

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
  - @rdfine/owl@0.4.0
  - @rdfine/rdf@0.5.0
  - @rdfine/rdfs@0.6.0

## 0.6.0

### Minor Changes

- 9b30de4: sh:hasValues must allow multiple terms

### Patch Changes

- Updated dependencies [fc82303]
  - @rdfine/owl@0.3.2

## 0.5.2

### Patch Changes

- 5727c2b: Export enumerations from main module

## 0.5.1

### Patch Changes

- d69277a: Generated resource types should all have generic dataset argument
- Updated dependencies [150977e]
- Updated dependencies [d69277a]
- Updated dependencies [9986b77]
- Updated dependencies [fecafe1]
  - @rdfine/rdfs@0.5.0
  - @tpluscode/rdfine@0.5.7
  - @rdfine/owl@0.3.1
  - @rdfine/rdf@0.4.1

## 0.5.0

### Minor Changes

- 57dfa37: All non-array properties are generated as possibly undefined

### Patch Changes

- 493549e: targetNode and targetClass must return arrays
- Updated dependencies [57dfa37]
  - @rdfine/owl@0.3.0
  - @rdfine/rdf@0.4.0
  - @rdfine/rdfs@0.4.0

## 0.4.3

### Patch Changes

- 7438e0b: Update to @types/rdf-js v4
- Updated dependencies [7438e0b]
  - @tpluscode/rdfine@0.5.5
  - @rdfine/owl@0.2.10
  - @rdfine/rdf@0.3.10
  - @rdfine/rdfs@0.3.10

## 0.4.2

### Patch Changes

- 1f452df: Added export definition for namespace module
- Updated dependencies [1f452df]
- Updated dependencies [98d991a]
  - @rdfine/owl@0.2.9
  - @rdfine/rdf@0.3.9
  - @rdfine/rdfs@0.3.9
  - @tpluscode/rdfine@0.5.0

## 0.4.1

### Patch Changes

- 57f6781: Missing sh:order property
- 57f6781: sh:node and sh:nodeKind moved to base class

## 0.4.0

### Minor Changes

- e2bed16: Added most missing properties and adjusted some return types

### Patch Changes

- 4a53697: Enumerations are now generated as typed named nodes

## 0.3.0

### Minor Changes

- bbf822f: Generating properties which can be single value or list

### Patch Changes

- aa90114: Added properties for SHACL List-values predicates
- Updated dependencies [c1e1e19]
  - @tpluscode/rdfine@0.4.24

## 0.2.8

### Patch Changes

- 5316ea6: Remove @rdfjs/namespace from dependencies
- Updated dependencies [5316ea6]
  - @tpluscode/rdfine@0.4.23
  - @rdfine/owl@0.2.8
  - @rdfine/rdf@0.3.8
  - @rdfine/rdfs@0.3.8

## [0.2.7](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.6...@rdfine/shacl@0.2.7) (2020-08-07)

**Note:** Version bump only for package @rdfine/shacl

## [0.2.6](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.5...@rdfine/shacl@0.2.6) (2020-08-06)

**Note:** Version bump only for package @rdfine/shacl

## [0.2.5](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.4...@rdfine/shacl@0.2.5) (2020-07-07)

**Note:** Version bump only for package @rdfine/shacl

## [0.2.4](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.3...@rdfine/shacl@0.2.4) (2020-07-07)

**Note:** Version bump only for package @rdfine/shacl

## [0.2.3](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.2...@rdfine/shacl@0.2.3) (2020-07-06)

### Bug Fixes

- **build:** exports field did not work in newer node ([531da7b](https://github.com/tpluscode/rdfine/commit/531da7bd23faa2ad5b1bacec1c5a76e44d6190ab))
- **build:** typo in main field ([70f15dc](https://github.com/tpluscode/rdfine/commit/70f15dcacf45694b5490558a49dbb04b014b323f))

## [0.2.2](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.1...@rdfine/shacl@0.2.2) (2020-07-05)

### Bug Fixes

- **build:** bundles partially missing in package ([e8b9816](https://github.com/tpluscode/rdfine/commit/e8b9816cc583f1f756a649107bdcd3fabebb5880))

## [0.2.1](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.2.0...@rdfine/shacl@0.2.1) (2020-07-03)

### Bug Fixes

- **generator:** import mixins only from index ([5470637](https://github.com/tpluscode/rdfine/commit/5470637ee51480bafa76e28d92a92a169d86d180))

# [0.2.0](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.1.4...@rdfine/shacl@0.2.0) (2020-07-03)

### Features

- rename dependencies to bundles ([d67afbe](https://github.com/tpluscode/rdfine/commit/d67afbe596bc1d91c1a030cb233bb44ca04a0fc7))

### BREAKING CHANGES

- imports need to be updated

## [0.1.4](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.1.3...@rdfine/shacl@0.1.4) (2020-06-08)

**Note:** Version bump only for package @rdfine/shacl

## [0.1.3](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.1.2...@rdfine/shacl@0.1.3) (2020-05-06)

**Note:** Version bump only for package @rdfine/shacl

## [0.1.2](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.1.1...@rdfine/shacl@0.1.2) (2020-05-05)

### Features

- generate mixins for specific rdf type to boost perf ([06bf552](https://github.com/tpluscode/rdfine/commit/06bf552f50f516a62f7c2bb05b9f17beb2159aee))

## [0.1.1](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.1.0...@rdfine/shacl@0.1.1) (2020-04-29)

**Note:** Version bump only for package @rdfine/shacl

# [0.1.0](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.0.5...@rdfine/shacl@0.1.0) (2020-04-29)

### Features

- **vocabs:** re-generated vocabularies to latest structure ([69b526e](https://github.com/tpluscode/rdfine/commit/69b526e69e7094ec7563f69525c60822ae1572b2))

## [0.0.5](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.0.4...@rdfine/shacl@0.0.5) (2020-04-29)

**Note:** Version bump only for package @rdfine/shacl

## [0.0.4](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.0.3...@rdfine/shacl@0.0.4) (2020-04-28)

**Note:** Version bump only for package @rdfine/shacl

## [0.0.3](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.0.2...@rdfine/shacl@0.0.3) (2020-04-28)

### Bug Fixes

- **shacl:** property is an array ([3f35890](https://github.com/tpluscode/rdfine/commit/3f358904ca9c8047e5208520d96fe5811e1abb92))
- **shacl:** sh:property is array ([d6d18e5](https://github.com/tpluscode/rdfine/commit/d6d18e52548508a9f0b965927aaf47bcdb0a5541))

## [0.0.2](https://github.com/tpluscode/rdfine/compare/@rdfine/shacl@0.0.1...@rdfine/shacl@0.0.2) (2020-04-28)

**Note:** Version bump only for package @rdfine/shacl

## 0.0.1 (2020-04-28)

### Features

- **owl:** first generation ([64e6388](https://github.com/tpluscode/rdfine/commit/64e6388b3a9aed9fe91f54fb21879f76d7e3169c))
- **shacl:** first build ([49b4e0f](https://github.com/tpluscode/rdfine/commit/49b4e0f260a264808fe43965096e7c2978141e1e))
