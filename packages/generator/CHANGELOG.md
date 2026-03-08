# Change Log

## 0.8.5

### Patch Changes

- c41dbdd7: Updated `@zazuko/env`
- c41dbdd7: Updated `@tpluscode/rdf-ns-builders` to v5

## 0.8.4

### Patch Changes

- 9b28f347: Updated dependencies to remove `rdf-js` references in compiled output

## 0.8.3

### Patch Changes

- 965859d7: Update to `@rdfjs/environment` v1 and `@zazuko/env` v2

## 0.8.2

### Patch Changes

- 9a838dec: Added changelog to package

## 0.8.1

### Patch Changes

- 3c90fafa: Use mapped type to declare vocabulary factory

## 0.8.0

### Minor Changes

- 9d49a7b2: Remove all `Partial` from mixin types to simplify extending classes

## 0.7.0

### Minor Changes

- 6cee88c8: Package is not ESM-only

## 0.6.10

### Patch Changes

- 6e11bd18: No unnecessary imports in enumeration modules
- a140fd55: Incorrect type generated for names which need quotes
- 4ce19cbe: Introduce a more stable order of members, exports and imports
- f7cfefff: Update `@tpluscode/rdf-ns-builders` to v2

## 0.6.9

### Patch Changes

- 9acaff8a: Update `@rdfjs/formats-common`

## 0.6.8

### Patch Changes

- 45a4be9c: Broken imports or exports of extension modules
- 46a6b035: Simplify generated enum modules

## 0.6.7

### Patch Changes

- afe232c3: Add extending mixin to generated class
- 2cd64dfb: Generate mixins from `dash:ShapeClass`
- 0faebb6b: Missing namespace import for types used only as ranges

## 0.6.6

### Patch Changes

- a63ec35a: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types

## 0.6.5

### Patch Changes

- 88ff6fa8: Use latest @zazuko/rdf-vocabularies

## 0.6.4

### Patch Changes

- ae3bc5a1: Datatypes: basic support for `owl:onDatatype` constructs
- 030fc0b2: Generate constant types defined as `owl:oneOf` list

## 0.6.3

### Patch Changes

- d538e6fb: Predicates sometimes can be generated as duplicate properties

## 0.6.2

### Patch Changes

- e7988f86: Ensure that properties with changed name get path decorator

## 0.6.1

### Patch Changes

- 04d8af79: Missing exports of extension modules

## 0.6.0

### Minor Changes

- 5a0d871f: Prefix terms which would clash with base class members

### Patch Changes

- fe36fd44: Use exclusions for properties
- 2e2e7a5f: Override property to become RDF/JS Term
- c341d76b: Add a return type to mixin functions
- 3113b9c8: Incorrect bundle module imports
- 60a925e4: Generating mixins extending other vocabs
- 0d82ae01: Mixins classes implement partial interface
- e2d18bb7: Add factory method to mixin modules

## 0.5.0

### Minor Changes

- 0db486f2: Move all modules into `lib`

  This will allow selective imports in node.

  Also remove any star imports between packages

## 0.4.3

### Patch Changes

- 3c5269b: Generate Term properties for rdfs:Literal and owl:Thing
- 6b62158: Handle class/mixin names which are not safe JS identifiers
- 61ac4a4: Generate mixin modules from owl:Class
- ac2b29a: Update to dual ESM version of @zazuko/rdf-vcabularies
- 47be4da: Allow properties with non-alpha characters
- f0be5e0: Require at least node 13 by package.json `engines`

## 0.4.2

### Patch Changes

- 5727c2b: Export enumerations from main module

## 0.4.1

### Patch Changes

- d69277a: Generated resource types should all have generic dataset argument

## 0.4.0

### Minor Changes

- 57dfa37: All non-array properties are generated as possibly undefined

## 0.3.7

### Patch Changes

- 7438e0b: Update to @types/rdf-js v4

## 0.3.6

### Patch Changes

- 6c016d1: Added support for xsd date/dateTime/time

## 0.3.5

### Patch Changes

- 4a53697: Enumerations are now generated as typed named nodes

## 0.3.4

### Patch Changes

- bbf822f: Generating properties which can be single value or list

## 0.3.3

### Patch Changes

- 5316ea6: Add support for custom datatypes

## [0.3.2](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.3.1...@rdfine/generator@0.3.2) (2020-07-07)

### Features

- comparing resources also with nodes and pointers ([bfaf2dd](https://github.com/tpluscode/rdfine/commit/bfaf2ddec346cd97df2223284b8518f9dbc4b167))

## [0.3.1](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.3.0...@rdfine/generator@0.3.1) (2020-07-03)

### Bug Fixes

- **generator:** import mixins only from index ([5470637](https://github.com/tpluscode/rdfine/commit/5470637ee51480bafa76e28d92a92a169d86d180))

# [0.3.0](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.5...@rdfine/generator@0.3.0) (2020-07-03)

### Bug Fixes

- **resource:** fix bnode id equality ([c13c821](https://github.com/tpluscode/rdfine/commit/c13c821e887c80b39addbde78043a942870d83cb))

### Features

- rename dependencies to bundles ([d67afbe](https://github.com/tpluscode/rdfine/commit/d67afbe596bc1d91c1a030cb233bb44ca04a0fc7))

### BREAKING CHANGES

- imports need to be updated

## [0.2.5](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.4...@rdfine/generator@0.2.5) (2020-06-08)

**Note:** Version bump only for package @rdfine/generator

## [0.2.4](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.3...@rdfine/generator@0.2.4) (2020-05-05)

### Features

- generate mixins for specific rdf type to boost perf ([06bf552](https://github.com/tpluscode/rdfine/commit/06bf552f50f516a62f7c2bb05b9f17beb2159aee))

## [0.2.3](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.2...@rdfine/generator@0.2.3) (2020-04-29)

### Bug Fixes

- **generator:** avoid duplicate mixin export in dependency modules ([30dcf20](https://github.com/tpluscode/rdfine/commit/30dcf20b903c5f853f47a87d0c9f78e60e0f3449))
- **generator:** interface annotated on decorators instead of class ([c64ebdb](https://github.com/tpluscode/rdfine/commit/c64ebdb3694697d8aaedfd470c98a148dab21334))

## [0.2.2](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.1...@rdfine/generator@0.2.2) (2020-04-29)

### Bug Fixes

- **generator:** do not generate default exports for mixins ([840a302](https://github.com/tpluscode/rdfine/commit/840a30288963744c6340123d4e00664c7c5741e5))

### Features

- **generator:** generate dependency modules for every mixin ([08976d0](https://github.com/tpluscode/rdfine/commit/08976d0686e2f9fb7293571fb279422596327733))

## [0.2.1](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.2.0...@rdfine/generator@0.2.1) (2020-04-18)

### Bug Fixes

- export namespace builder from shared package ([f341521](https://github.com/tpluscode/rdfine/commit/f341521543d2fda91ef6017633ba546bf88ebe0c))

# [0.2.0](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.1.1...@rdfine/generator@0.2.0) (2020-04-18)

### Bug Fixes

- **generator:** avoid conflict with rdf as vocabulary package ([090aa5e](https://github.com/tpluscode/rdfine/commit/090aa5e3789bf9eac745ed2b609320f677ed32b0))

### Features

- **generator:** overriding property value to generate array/list getters ([394581b](https://github.com/tpluscode/rdfine/commit/394581b639e770b032ea4bf767ba37c06d47d693))

## [0.1.1](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.1.0...@rdfine/generator@0.1.1) (2020-04-15)

**Note:** Version bump only for package @rdfine/generator

# [0.1.0](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.0.2...@rdfine/generator@0.1.0) (2020-04-01)

### Bug Fixes

- use same method to slugify dimension table id ([9d9205f](https://github.com/tpluscode/rdfine/commit/9d9205f))
- **generator:** do not require namespace for common namespaces ([d5d68ed](https://github.com/tpluscode/rdfine/commit/d5d68ed))

### Features

- **build:** only package es modules and esm node export ([4d5fa5b](https://github.com/tpluscode/rdfine/commit/4d5fa5b))
- **generator:** add mixin cast to rdf:range properties ([fa4e188](https://github.com/tpluscode/rdfine/commit/fa4e188))

### BREAKING CHANGES

- **build:** some exports have been moved

## [0.0.2](https://github.com/tpluscode/rdfine/compare/@rdfine/generator@0.0.1...@rdfine/generator@0.0.2) (2020-03-25)

### Bug Fixes

- **core:** simplify resource initialization ([cfc6731](https://github.com/tpluscode/rdfine/commit/cfc673171c0b969b52b890d375aac093a4024093))

## 0.0.1 (2020-03-25)

### Bug Fixes

- **core:** plain intialization impossible with union type properties ([a545e48](https://github.com/tpluscode/rdfine/commit/a545e485b1827df15788ffacfe6907b408bd5de1))
- **generator:** always enable warn and error loggers ([1a5999d](https://github.com/tpluscode/rdfine/commit/1a5999de7ead4ea3f2905f4ce58842ff67d8c363))
- **generator:** generate type-only imports of rdf-js ([30c40d1](https://github.com/tpluscode/rdfine/commit/30c40d145c54cf9b1f72cc9c594d695e8222eee1))
- **schema:** schema:URL should be treated as rdfResource ([cd037ac](https://github.com/tpluscode/rdfine/commit/cd037ac51801bb2ce183f8337631df46aea5d1de))

### Features

- **generator:** create classes which can be easily initialized ([3fb0900](https://github.com/tpluscode/rdfine/commit/3fb090087cc7feba2c1cc258bb3db46a52f363d5))
- **generator:** discover properties which use owl:unionOf ([70c3714](https://github.com/tpluscode/rdfine/commit/70c37145589ccc8ecd7eed44a0b99254d437f417))
- **generator:** first version of generated schema.org ([1759e17](https://github.com/tpluscode/rdfine/commit/1759e17eba36930bfeeb17b693e823b830495350))
