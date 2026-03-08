# Change Log

## 0.8.6

### Patch Changes

- c41dbdd7: Updated `@tpluscode/rdf-ns-builders` to v5
- Updated dependencies [c41dbdd7]
  - @tpluscode/rdfine@0.7.11

## 0.8.5

### Patch Changes

- 9b28f347: Updated dependencies to remove `rdf-js` references in compiled output
- Updated dependencies [9b28f347]
  - @tpluscode/rdfine@0.7.7

## 0.8.4

### Patch Changes

- c8d796c4: Relax rdfine dependency

## 0.8.3

### Patch Changes

- 9a838dec: Added changelog to package

## 0.8.2

### Patch Changes

- 3c90fafa: Use mapped type to declare vocabulary factory
- Updated dependencies [3c90fafa]
  - @tpluscode/rdfine@0.7.3

## 0.8.1

### Patch Changes

- 0ab38e3b: Factory was missing from package and exports

## 0.8.0

### Minor Changes

- 9d49a7b2: Remove all `Partial` from mixin types to simplify extending classes

### Patch Changes

- Updated dependencies [fe473333]
  - @tpluscode/rdfine@0.7.0

## 0.7.0

### Minor Changes

- 6cee88c8: Package is not ESM-only

### Patch Changes

- Updated dependencies [6cee88c8]
  - @tpluscode/rdfine@0.6.0

## 0.6.7

### Patch Changes

- 4ce19cbe: Introduce a more stable order of members, exports and imports
- f7cfefff: Update `@tpluscode/rdf-ns-builders` to v2
- Updated dependencies [f7cfefff]
  - @tpluscode/rdfine@0.5.39

## 0.6.6

### Patch Changes

- 5e2681a4: Update @tpluscode/rdfine

## 0.6.5

### Patch Changes

- d6f77ced: `fromPointer` methods should typed as `Factory<T>`

## 0.6.4

### Patch Changes

- a63ec35a: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types
- Updated dependencies [a63ec35a]
  - @tpluscode/rdfine@0.5.27

## 0.6.3

### Patch Changes

- 7cdc4e04: type-only export of interfaces

## 0.6.2

### Patch Changes

- 04d8af79: Missing exports of extension modules

## 0.6.1

### Patch Changes

- c341d76b: Add a return type to mixin functions
- 0d82ae01: Mixins classes implement partial interface
- e2d18bb7: Add factory method to mixin modules
- Updated dependencies [60a925e4]
- Updated dependencies [e2d18bb7]
  - @tpluscode/rdfine@0.5.17

## 0.6.0

### Minor Changes

- 0db486f2: Move all modules into `lib`

  This will allow selective imports in node.

  Also remove any star imports between packages

### Patch Changes

- Updated dependencies [a4e39c35]
- Updated dependencies [07d94285]
- Updated dependencies [69eb2666]
  - @tpluscode/rdfine@0.5.16

## 0.5.1

### Patch Changes

- d69277a: Generated resource types should all have generic dataset argument
- Updated dependencies [d69277a]
- Updated dependencies [9986b77]
- Updated dependencies [fecafe1]
  - @tpluscode/rdfine@0.5.7

## 0.5.0

### Minor Changes

- 57dfa37: All non-array properties are generated as possibly undefined

## 0.4.10

### Patch Changes

- 7438e0b: Update to @types/rdf-js v4
- Updated dependencies [7438e0b]
  - @tpluscode/rdfine@0.5.5

## 0.4.9

### Patch Changes

- 1f452df: Added export definition for namespace module
- Updated dependencies [98d991a]
  - @tpluscode/rdfine@0.5.0

## 0.4.8

### Patch Changes

- 5316ea6: Remove @rdfjs/namespace from dependencies
- Updated dependencies [5316ea6]
  - @tpluscode/rdfine@0.4.23

## [0.4.7](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.6...@rdfine/csvw@0.4.7) (2020-08-07)

**Note:** Version bump only for package @rdfine/csvw

## [0.4.6](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.5...@rdfine/csvw@0.4.6) (2020-08-06)

**Note:** Version bump only for package @rdfine/csvw

## [0.4.5](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.4...@rdfine/csvw@0.4.5) (2020-07-07)

**Note:** Version bump only for package @rdfine/csvw

## [0.4.4](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.3...@rdfine/csvw@0.4.4) (2020-07-07)

**Note:** Version bump only for package @rdfine/csvw

## [0.4.3](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.2...@rdfine/csvw@0.4.3) (2020-07-06)

### Bug Fixes

- **build:** exports field did not work in newer node ([531da7b](https://github.com/tpluscode/rdfine/commit/531da7bd23faa2ad5b1bacec1c5a76e44d6190ab))

## [0.4.2](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.1...@rdfine/csvw@0.4.2) (2020-07-05)

### Bug Fixes

- **build:** bundles partially missing in package ([e8b9816](https://github.com/tpluscode/rdfine/commit/e8b9816cc583f1f756a649107bdcd3fabebb5880))

## [0.4.1](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.4.0...@rdfine/csvw@0.4.1) (2020-07-03)

### Bug Fixes

- **generator:** import mixins only from index ([5470637](https://github.com/tpluscode/rdfine/commit/5470637ee51480bafa76e28d92a92a169d86d180))

# [0.4.0](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.3.4...@rdfine/csvw@0.4.0) (2020-07-03)

### Features

- rename dependencies to bundles ([d67afbe](https://github.com/tpluscode/rdfine/commit/d67afbe596bc1d91c1a030cb233bb44ca04a0fc7))

### BREAKING CHANGES

- imports need to be updated

## [0.3.4](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.3.3...@rdfine/csvw@0.3.4) (2020-06-08)

**Note:** Version bump only for package @rdfine/csvw

## [0.3.3](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.3.2...@rdfine/csvw@0.3.3) (2020-05-06)

**Note:** Version bump only for package @rdfine/csvw

## [0.3.2](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.3.1...@rdfine/csvw@0.3.2) (2020-05-05)

### Features

- generate mixins for specific rdf type to boost perf ([06bf552](https://github.com/tpluscode/rdfine/commit/06bf552f50f516a62f7c2bb05b9f17beb2159aee))

## [0.3.1](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.3.0...@rdfine/csvw@0.3.1) (2020-04-29)

**Note:** Version bump only for package @rdfine/csvw

# [0.3.0](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.11...@rdfine/csvw@0.3.0) (2020-04-29)

### Features

- **vocabs:** re-generated vocabularies to latest structure ([69b526e](https://github.com/tpluscode/rdfine/commit/69b526e69e7094ec7563f69525c60822ae1572b2))

## [0.2.11](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.10...@rdfine/csvw@0.2.11) (2020-04-29)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.10](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.9...@rdfine/csvw@0.2.10) (2020-04-28)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.9](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.8...@rdfine/csvw@0.2.9) (2020-04-28)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.8](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.7...@rdfine/csvw@0.2.8) (2020-04-28)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.7](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.6...@rdfine/csvw@0.2.7) (2020-04-25)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.6](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.5...@rdfine/csvw@0.2.6) (2020-04-22)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.5](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.4...@rdfine/csvw@0.2.5) (2020-04-21)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.4](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.3...@rdfine/csvw@0.2.4) (2020-04-21)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.3](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.2...@rdfine/csvw@0.2.3) (2020-04-19)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.2](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.1...@rdfine/csvw@0.2.2) (2020-04-19)

**Note:** Version bump only for package @rdfine/csvw

## [0.2.1](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.2.0...@rdfine/csvw@0.2.1) (2020-04-18)

### Bug Fixes

- export namespace builder from shared package ([f341521](https://github.com/tpluscode/rdfine/commit/f341521543d2fda91ef6017633ba546bf88ebe0c))

# [0.2.0](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.1.3...@rdfine/csvw@0.2.0) (2020-04-18)

### Bug Fixes

- **generator:** avoid conflict with rdf as vocabulary package ([090aa5e](https://github.com/tpluscode/rdfine/commit/090aa5e3789bf9eac745ed2b609320f677ed32b0))

### Features

- **csvw:** make column and transformations array properties ([6bde90f](https://github.com/tpluscode/rdfine/commit/6bde90fc5a7a9a12e949d0d382dc2da185c10eda))

### BREAKING CHANGES

- **csvw:** changed property return types

## [0.1.3](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.1.2...@rdfine/csvw@0.1.3) (2020-04-18)

**Note:** Version bump only for package @rdfine/csvw

## [0.1.2](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.1.1...@rdfine/csvw@0.1.2) (2020-04-15)

**Note:** Version bump only for package @rdfine/csvw

## [0.1.1](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.1.0...@rdfine/csvw@0.1.1) (2020-04-15)

### Bug Fixes

- subject from all graph did not work ([9d3497b](https://github.com/tpluscode/rdfine/commit/9d3497bdfb88abd907f36a3d701d847eaf9a688c))

# [0.1.0](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.0.2...@rdfine/csvw@0.1.0) (2020-04-01)

### Bug Fixes

- **vocabularies:** missing @rdfjs/namespace dependency ([a1a8bad](https://github.com/tpluscode/rdfine/commit/a1a8bad))
- use same method to slugify dimension table id ([9d9205f](https://github.com/tpluscode/rdfine/commit/9d9205f))
- **generator:** do not require namespace for common namespaces ([d5d68ed](https://github.com/tpluscode/rdfine/commit/d5d68ed))

### Features

- **build:** only package es modules and esm node export ([4d5fa5b](https://github.com/tpluscode/rdfine/commit/4d5fa5b))
- **generator:** add mixin cast to rdf:range properties ([fa4e188](https://github.com/tpluscode/rdfine/commit/fa4e188))

### BREAKING CHANGES

- **build:** some exports have been moved

## [0.0.2](https://github.com/tpluscode/rdfine/compare/@rdfine/csvw@0.0.1...@rdfine/csvw@0.0.2) (2020-03-25)

### Bug Fixes

- **core:** simplify resource initialization ([cfc6731](https://github.com/tpluscode/rdfine/commit/cfc673171c0b969b52b890d375aac093a4024093))

## 0.0.1 (2020-03-25)

### Bug Fixes

- **core:** plain intialization impossible with union type properties ([a545e48](https://github.com/tpluscode/rdfine/commit/a545e485b1827df15788ffacfe6907b408bd5de1))
- **generator:** generate type-only imports of rdf-js ([30c40d1](https://github.com/tpluscode/rdfine/commit/30c40d145c54cf9b1f72cc9c594d695e8222eee1))
- **schema:** schema:URL should be treated as rdfResource ([cd037ac](https://github.com/tpluscode/rdfine/commit/cd037ac51801bb2ce183f8337631df46aea5d1de))

### Features

- **generator:** create classes which can be easily initialized ([3fb0900](https://github.com/tpluscode/rdfine/commit/3fb090087cc7feba2c1cc258bb3db46a52f363d5))
- handle deep initialization from plain object ([0fd30af](https://github.com/tpluscode/rdfine/commit/0fd30af410d7cc0462ce78868da6f383c21305f1))
- **csvw:** generate first version of csvw vocabulary ([12551fc](https://github.com/tpluscode/rdfine/commit/12551fcc7430137a406ff8292ddae062bf3eab34))
