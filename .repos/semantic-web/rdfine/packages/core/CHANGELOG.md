# Change Log

## 0.7.11

### Patch Changes

- c41dbdd7: Updated `@zazuko/env`

## 0.7.10

### Patch Changes

- 0d2863f0: Replace `once` with `onetime`

## 0.7.9

### Patch Changes

- 86de16ae: Fix imports to work with `moduleResolution: NodeNext`

## 0.7.8

### Patch Changes

- 0dfe5271: Use the slimmer `@zazuko/env` which works better in the browser

## 0.7.7

### Patch Changes

- 9b28f347: Updated dependencies to remove `rdf-js` references in compiled output

## 0.7.6

### Patch Changes

- 3dac56f6: Remove imports of `clownface`.
  Remove dependency on `@tpluscode/rdf-ns-builders`.

## 0.7.5

### Patch Changes

- 965859d7: Update to `@rdfjs/environment` v1 and `@zazuko/env` v2

## 0.7.4

### Patch Changes

- b110aab2: `toJSON` would not correctly serialise lists when the value did not match annotated property

## 0.7.3

### Patch Changes

- 3c90fafa: Use mapped type to declare vocabulary factory

## 0.7.2

### Patch Changes

- 959e53cf: There were factories missing in the environment

## 0.7.1

### Patch Changes

- 3d337f9b: Missing dataset factory in `RdfineEnvironment` type

## 0.7.0

### Minor Changes

- fe473333: Decorator `@namespace` does not allow `string` any more

## 0.6.0

### Minor Changes

- 6cee88c8: Package is not ESM-only

## 0.5.43

### Patch Changes

- 29474b07: It would still be impossible to initialise literal prop, when it allowed `undefined`

## 0.5.42

### Patch Changes

- e07c0889: Initializing literal properties triggered design-time type error when initialised from a plain JS (string, number ,etc)

## 0.5.41

### Patch Changes

- 1cd0c024: Initializer module missing in CJS build

## 0.5.40

### Patch Changes

- 09714d17: RDF List initializer made simpler a helper function. For example, to initialize a `( 'foo', 'bar', 'baz )` list:

  ```js
  import * as initialize from "@tpluscode/rdfine/initializer";

  let node;
  const resource = fromPointer(node, {
    listProp: initialize.rdfList("foo", "bar", "baz")
  });
  ```

  closes (#143)

## 0.5.39

### Patch Changes

- f7cfefff: Update `@tpluscode/rdf-ns-builders` to v2

## 0.5.38

### Patch Changes

- 5cb8a316: Make `@types/clownface` a regular dependency (re hypermedia-app/Alcaeus#288)

## 0.5.37

### Patch Changes

- 32a92788: `fromPointer` function did not work due to inaccurate types

## 0.5.36

### Patch Changes

- a2484ec2: Initializer factory only allowed URI nodes

## 0.5.35

### Patch Changes

- 76c13f14: Fix peer dependencies (re hypermedia-app/shaperone#173)

## 0.5.34

### Patch Changes

- 292c9d7b: Possibility for setting properties using factories (fixes #191)
- 292c9d7b: Pointers could not have been set to proxied properties

## 0.5.33

### Patch Changes

- 658c9e98: Optimise setting URI property from existing resource object
- 7a52025d: Initializing URI property with factory would throw

## 0.5.32

### Patch Changes

- 20f5f01c: Initializing properties with factory functions

## 0.5.31

### Patch Changes

- 64e8907e: Filter decorator option

## 0.5.30

### Patch Changes

- 6207e784: Fix serialization of list of literals to JSON

## 0.5.29

### Patch Changes

- 247137f2: Extending interface relaxed to allow Partial base class

## 0.5.28

### Patch Changes

- 377c603b: Update typing which appears to cause an error `TS2344: Type 'T' does not satisfy the constraint 'RdfResourceCore<DatasetCore<Quad, Quad>>'` on later versions of TypeScript

## 0.5.27

### Patch Changes

- a63ec35a: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types

## 0.5.26

### Patch Changes

- 97c0dd19: toJSON: serialize lists which are not strongly typed properties
- 0a04fa75: Initializing optional properties only allowed arrays

## 0.5.25

### Patch Changes

- abcdf51a: Setting Term property from resource initializer
- 7b624685: It was impossible to set a Date directly to an annotated Term property
- b03ad19f: Build: break import cycle between modules

## 0.5.24

### Patch Changes

- 6ca3a8a6: toJSON: exception thrown when serializing literals

## 0.5.23

### Patch Changes

- b2af1429: Property which allows lists and single element should not initalize RDF List with single item

## 0.5.22

### Patch Changes

- a721bc7d: Fix initilizer build issue caused in 0.5.20

## 0.5.21

### Patch Changes

- b60897cf: Initializer incorrectly mapped RdfResourceCore properties

## 0.5.20

### Patch Changes

- 5f084146: Types initialied with TypeCollection are not added
- 1448f1bb: Initializing nested resources using typed interface

## 0.5.19

### Patch Changes

- fa277552: Date initializer should set value

## 0.5.18

### Patch Changes

- d5a614bd: Missing export of @tpluscode/rdfine/factory

## 0.5.17

### Patch Changes

- 60a925e4: Generating mixins extending other vocabs
- e2d18bb7: Add factory method to mixin modules

## 0.5.16

### Patch Changes

- a4e39c35: It is now possible to use typed namespace builder with decorator
- 07d94285: Relax the Term type requirement of equals
- 69eb2666: Not all properties from all mixins were initialized

## 0.5.15

### Patch Changes

- b88ea8f: Node terms were incorrectly serialized as string by toJSON

## 0.5.14

### Patch Changes

- 97309a8: toJSON: handle literals without datatype

## 0.5.13

### Patch Changes

- a45b17b: Use annotated types to initialize resource nodes

## 0.5.12

### Patch Changes

- 904b109: Handle initilizer with plain string id

## 0.5.11

### Patch Changes

- 6000ce8: @property decorator was unusable with augmented RdfResource interface

## 0.5.10

### Patch Changes

- 1aec204: toJSON did not walk the prototype chain

## 0.5.9

### Patch Changes

- 677f160: Use `@namespace` when serializing properties in `toJSON`

## 0.5.8

### Patch Changes

- 1ea983b: Extract base resource interface to allow augmentation

## 0.5.7

### Patch Changes

- d69277a: Generated resource types should all have generic dataset argument
- 9986b77: Resource proxy now handles Symbols
- fecafe1: Added a `toJSON` resource method which creates a JSON-LD object of object's graph

## 0.5.6

### Patch Changes

- c5b2570: It was not possible to initialize T | T[] property

## 0.5.5

### Patch Changes

- 7438e0b: Update to @types/rdf-js v4

## 0.5.4

### Patch Changes

- 6c016d1: Added support for xsd date/dateTime/time

## 0.5.3

### Patch Changes

- da8114f: Construct correct base class when overriding in factory call

## 0.5.2

### Patch Changes

- 1abc238: Add export declaration for TypeCollection

## 0.5.1

### Patch Changes

- a9e85e3: Add export of ResourceFactory

## 0.5.0

### Minor Changes

- 98d991a: Update clownface, renamed pointer property

## 0.4.24

### Patch Changes

- c1e1e19: Allow properties to return both arrays/lists as well as single values

## 0.4.23

### Patch Changes

- 5316ea6: Add support for custom datatypes

## [0.4.22](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.21...@tpluscode/rdfine@0.4.22) (2020-08-07)

### Bug Fixes

- mixin cannot be defined to use specific dataset ([1420094](https://github.com/tpluscode/rdfine/commit/1420094b2d691df45fe24337b852965f2cc2c6dd))

## [0.4.21](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.20...@tpluscode/rdfine@0.4.21) (2020-08-06)

### Bug Fixes

- **core:** using [@namespace](https://github.com/namespace) decor with DatasetExt base class ([7068040](https://github.com/tpluscode/rdfine/commit/7068040d1ded7eacdea563f006bc4e6cb91d6c9b))

## [0.4.20](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.19...@tpluscode/rdfine@0.4.20) (2020-07-07)

### Bug Fixes

- unable to initialize arrays with http properties ([2791c90](https://github.com/tpluscode/rdfine/commit/2791c90efad7348c61f45a85ca0dfabe79632f60))

## [0.4.19](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.18...@tpluscode/rdfine@0.4.19) (2020-07-07)

### Features

- comparing resources also with nodes and pointers ([bfaf2dd](https://github.com/tpluscode/rdfine/commit/bfaf2ddec346cd97df2223284b8518f9dbc4b167))
- initializing resource with any property ([0c5f763](https://github.com/tpluscode/rdfine/commit/0c5f763595aa9b149c677b9e713106eb2a3d1123))

## [0.4.18](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.17...@tpluscode/rdfine@0.4.18) (2020-07-06)

### Bug Fixes

- **build:** exports field did not work in newer node ([531da7b](https://github.com/tpluscode/rdfine/commit/531da7bd23faa2ad5b1bacec1c5a76e44d6190ab))

## [0.4.17](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.16...@tpluscode/rdfine@0.4.17) (2020-07-05)

### Bug Fixes

- make all type exports explicit ([0030d8f](https://github.com/tpluscode/rdfine/commit/0030d8fb6622eb6f8f2d352badcdf98e819df28d))

## [0.4.16](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.15...@tpluscode/rdfine@0.4.16) (2020-07-03)

### Bug Fixes

- **resource:** fix bnode id equality ([c13c821](https://github.com/tpluscode/rdfine/commit/c13c821e887c80b39addbde78043a942870d83cb))

## [0.4.15](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.14...@tpluscode/rdfine@0.4.15) (2020-06-08)

**Note:** Version bump only for package @tpluscode/rdfine

## [0.4.14](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.13...@tpluscode/rdfine@0.4.14) (2020-05-06)

### Bug Fixes

- **core:** slight perf boost by skipping unnecessary mixins ([101f7a3](https://github.com/tpluscode/rdfine/commit/101f7a3c8bfd186d082dee117ea7d9a37d707de5))
- **core:** type cache incorrectly created ([21e16e6](https://github.com/tpluscode/rdfine/commit/21e16e6fac15a9adfa43a429bc65bbe5ab5e4d89))

## [0.4.13](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.12...@tpluscode/rdfine@0.4.13) (2020-05-05)

### Features

- **core:** improve performance by memoizing runtime classes ([1cdc7ee](https://github.com/tpluscode/rdfine/commit/1cdc7ee11bbb8489f417bd15f5a4fab5aee7094d))

## [0.4.12](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.11...@tpluscode/rdfine@0.4.12) (2020-04-29)

### Features

- add option to resource decorator to add assert implied types ([90f1b7a](https://github.com/tpluscode/rdfine/commit/90f1b7a2431e751e6d9b247f8f4562305c57926b))

## [0.4.11](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.10...@tpluscode/rdfine@0.4.11) (2020-04-28)

**Note:** Version bump only for package @tpluscode/rdfine

## [0.4.10](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.9...@tpluscode/rdfine@0.4.10) (2020-04-28)

**Note:** Version bump only for package @tpluscode/rdfine

## [0.4.9](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.8...@tpluscode/rdfine@0.4.9) (2020-04-25)

### Bug Fixes

- method getArray should only read resources ([451201e](https://github.com/tpluscode/rdfine/commit/451201e01e75eb6855cc400e02041bdb6a35e16c))

## [0.4.8](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.7...@tpluscode/rdfine@0.4.8) (2020-04-22)

### Features

- add more helpful getters to base class ([2e67a81](https://github.com/tpluscode/rdfine/commit/2e67a8148d1555e8adb6741980052b0496acb04f))

## [0.4.7](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.6...@tpluscode/rdfine@0.4.7) (2020-04-21)

### Features

- add a handy getter to check blank node resource ([#54](https://github.com/tpluscode/rdfine/issues/54)) ([d3d5731](https://github.com/tpluscode/rdfine/commit/d3d5731a2955a6abe373c5b01db88d905183d21f))

## [0.4.6](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.5...@tpluscode/rdfine@0.4.6) (2020-04-21)

### Features

- keep track of parent resource ([ef48ec5](https://github.com/tpluscode/rdfine/commit/ef48ec5d757feaff7ced5e6af94207e68fca04e0))

## [0.4.5](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.4...@tpluscode/rdfine@0.4.5) (2020-04-19)

### Bug Fixes

- **core:** initializing term properties with raw nodes ([eb6aa49](https://github.com/tpluscode/rdfine/commit/eb6aa492e8b81684247487bb3a8e982690ed4d5f))

## [0.4.4](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.3...@tpluscode/rdfine@0.4.4) (2020-04-19)

### Features

- initializing with clownface objects ([c3ac5a5](https://github.com/tpluscode/rdfine/commit/c3ac5a55913225bd19d9ff58e0fe50c635d34e8d))

## [0.4.3](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.2...@tpluscode/rdfine@0.4.3) (2020-04-18)

### Bug Fixes

- **core:** make it possible initialize with RDF/JS terms ([56e13bd](https://github.com/tpluscode/rdfine/commit/56e13bd088a5826682bb26060fb4660ace883740))

## [0.4.2](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.1...@tpluscode/rdfine@0.4.2) (2020-04-15)

### Bug Fixes

- getter throws when selecting all node by dataset is empty ([4e5e4f5](https://github.com/tpluscode/rdfine/commit/4e5e4f513ddbd57a87ccfe78dce98021c46bf722))

## [0.4.1](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.4.0...@tpluscode/rdfine@0.4.1) (2020-04-15)

### Bug Fixes

- subject from all graph did not work ([9d3497b](https://github.com/tpluscode/rdfine/commit/9d3497bdfb88abd907f36a3d701d847eaf9a688c))

# [0.4.0](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.3.7...@tpluscode/rdfine@0.4.0) (2020-04-01)

### Features

- **build:** only package es modules and esm node export ([4d5fa5b](https://github.com/tpluscode/rdfine/commit/4d5fa5b))

### BREAKING CHANGES

- **build:** some exports have been moved

## [0.3.7](https://github.com/tpluscode/rdfine/compare/@tpluscode/rdfine@0.3.6...@tpluscode/rdfine@0.3.7) (2020-03-25)

### Bug Fixes

- **core:** clownface used to create resource would fail ([02a4be9](https://github.com/tpluscode/rdfine/commit/02a4be97107d495fe0be62c2bb4073c6ae574403))
- **core:** simplify resource initialization ([cfc6731](https://github.com/tpluscode/rdfine/commit/cfc673171c0b969b52b890d375aac093a4024093))

## 0.3.6 (2020-03-25)

### Bug Fixes

- **core:** plain intialization impossible with union type properties ([a545e48](https://github.com/tpluscode/rdfine/commit/a545e485b1827df15788ffacfe6907b408bd5de1))
- simplify the creation of resources ([1077cb1](https://github.com/tpluscode/rdfine/commit/1077cb1681b600961b5947e1f24aea52f3b2b85e))

### Features

- **generator:** create classes which can be easily initialized ([3fb0900](https://github.com/tpluscode/rdfine/commit/3fb090087cc7feba2c1cc258bb3db46a52f363d5))
- first draft of schema.org package ([feaa2df](https://github.com/tpluscode/rdfine/commit/feaa2df9418bd763dea1c006a1ba6aab988f8781))
- handle deep initialization from plain object ([0fd30af](https://github.com/tpluscode/rdfine/commit/0fd30af410d7cc0462ce78868da6f383c21305f1))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.5](https://github.com/tpluscode/rdfine/compare/v0.3.4...v0.3.5) (2020-02-04)

### Bug Fixes

- type collection is not exported ([3bafaf2](https://github.com/tpluscode/rdfine/commit/3bafaf2057775c0c895bfc4016845a03413798ee))

### [0.3.4](https://github.com/tpluscode/rdfine/compare/v0.3.3...v0.3.4) (2020-02-04)

### [0.3.3](https://github.com/tpluscode/rdfine/compare/v0.3.2...v0.3.3) (2020-02-04)

### Features

- (optional) type collection to work over all graphs ([752ce18](https://github.com/tpluscode/rdfine/commit/752ce18fb82ef7f9044fdcead003d1c63085d615))

### [0.3.2](https://github.com/tpluscode/rdfine/compare/v0.3.1...v0.3.2) (2020-01-31)

### Bug Fixes

- package missing the declaration files ([310a632](https://github.com/tpluscode/rdfine/commit/310a632d26db2b5974e28806b97141f396202824))

### [0.3.1](https://github.com/tpluscode/rdfine/compare/v0.3.0...v0.3.1) (2020-01-31)

### Bug Fixes

- export ResourceFactory from main ([d278638](https://github.com/tpluscode/rdfine/commit/d278638b3748734abecd1ba8b45624ef3f193c94))

## [0.3.0](https://github.com/tpluscode/rdfine/compare/v0.2.12...v0.3.0) (2020-01-31)

### ⚠ BREAKING CHANGES

- replaces \_node property with \_selfGraph

### Features

- named graph must be explicitly traversed in isolation ([902a7a6](https://github.com/tpluscode/rdfine/commit/902a7a64e70046ae955c0038ac3a4e6b1c936a40))

### Bug Fixes

- **decorator:** make generic annotation more accurate ([4707b0b](https://github.com/tpluscode/rdfine/commit/4707b0b60f3724430573ae645903839adb36fc2f))
- **factory:** depend on interface and not implementation ([0a67270](https://github.com/tpluscode/rdfine/commit/0a672700ae1b8855d6157900a419d1f1cbb10f5e))

### [0.2.12](https://github.com/tpluscode/rdfine/compare/v0.2.11...v0.2.12) (2020-01-30)

### Features

- ability to add multiple mixins at once ([9cb5595](https://github.com/tpluscode/rdfine/commit/9cb5595a045e5354115d7ac5e0153ae6ac84b116))
- allow setting initial value as clownface node ([82ca518](https://github.com/tpluscode/rdfine/commit/82ca518892fa4a290b36c7cd7ca14845167bdfd2))

### [0.2.11](https://github.com/tpluscode/rdfine/compare/v0.2.10...v0.2.11) (2020-01-27)

### Bug Fixes

- types property should be declared as interface ([141624c](https://github.com/tpluscode/rdfine/commit/141624ce544e4bad19a00154b7e67fcc4723eafc))

### [0.2.10](https://github.com/tpluscode/rdfine/compare/v0.2.9...v0.2.10) (2020-01-27)

### Bug Fixes

- initial property value does not work with array properties ([c400565](https://github.com/tpluscode/rdfine/commit/c400565d61d99a4daf296a24fc9bbe5b645e95eb))

### [0.2.9](https://github.com/tpluscode/rdfine/compare/v0.2.8...v0.2.9) (2020-01-26)

### Bug Fixes

- revisit the type declaration for ResourceIndexer ([34d57ca](https://github.com/tpluscode/rdfine/commit/34d57cae253923356a48ced40b9c9b7f2312df53))

### [0.2.8](https://github.com/tpluscode/rdfine/compare/v0.2.7...v0.2.8) (2020-01-23)

### Bug Fixes

- proxy indexer also returns rdf lists as array ([9cd04bd](https://github.com/tpluscode/rdfine/commit/9cd04bd3fa3d02ad6d531dd80c8704c1caf30a52))

### [0.2.7](https://github.com/tpluscode/rdfine/compare/v0.2.6...v0.2.7) (2020-01-22)

### Bug Fixes

- add resource indexer to RdfResource.\_create ([f1deedb](https://github.com/tpluscode/rdfine/commit/f1deedba70d7ea008f7ba8a57fcb52331980e330))

### [0.2.6](https://github.com/tpluscode/rdfine/compare/v0.2.5...v0.2.6) (2020-01-21)

### Features

- setter proxy ([e2f11fb](https://github.com/tpluscode/rdfine/commit/e2f11fbb335d0a9ac6c84b92f7bf4b6165aea230))

### [0.2.5](https://github.com/tpluscode/rdfine/compare/v0.2.4...v0.2.5) (2020-01-20)

### Features

- export indexer interface ([aea91a8](https://github.com/tpluscode/rdfine/commit/aea91a81028d9c43472daaf149dca91d9b0c2531))

### [0.2.4](https://github.com/tpluscode/rdfine/compare/v0.2.3...v0.2.4) (2020-01-20)

### Bug Fixes

- add generic type argument to mark base class ([e65e111](https://github.com/tpluscode/rdfine/commit/e65e1118dc78ee6ff00a605dcc46fbe8f7e288f6))

### [0.2.3](https://github.com/tpluscode/rdfine/compare/v0.2.2...v0.2.3) (2020-01-17)

### Features

- export a resource identitifier term type ([d13a4cd](https://github.com/tpluscode/rdfine/commit/d13a4cd7ae4fc35b55ebf0dff3ec0384e0fe60bf))

### [0.2.2](https://github.com/tpluscode/rdfine/compare/v0.2.1...v0.2.2) (2020-01-17)

### [0.2.1](https://github.com/tpluscode/rdfine/compare/v0.2.0...v0.2.1) (2020-01-16)

### Bug Fixes

- relax the typings of create method ([5c98a21](https://github.com/tpluscode/rdfine/commit/5c98a213dc0d2d0bc78a6ffd291dd5677ec7f1e3))

## [0.2.0](https://github.com/tpluscode/rdfine/compare/v0.1.4...v0.2.0) (2020-01-15)

### ⚠ BREAKING CHANGES

- decorator's `array: boolean` changed to `values: 'array' | 'list' | undefined`

### Features

- allow setting RDF arrays ([7d83311](https://github.com/tpluscode/rdfine/commit/7d833110273f7966973400792df38fc0037d51df))

### Bug Fixes

- more informative getter/setter exceptions ([621c6c9](https://github.com/tpluscode/rdfine/commit/621c6c910b5191624c8301cf234eb4e21492c528))

### [0.1.4](https://github.com/tpluscode/rdfine/compare/v0.1.3...v0.1.4) (2020-01-13)

### Features

- equals method to compare resource instances ([#19](https://github.com/tpluscode/rdfine/issues/19)) ([421c5a4](https://github.com/tpluscode/rdfine/commit/421c5a4849e6c3984be26166372419148d3d9807))
- instance method to create resources ([bab524d](https://github.com/tpluscode/rdfine/commit/bab524d638473034588240f6056437bc2d560140))

### Bug Fixes

- proxy returns array for single object ([dd40473](https://github.com/tpluscode/rdfine/commit/dd404738ff6a50e3846de1a90b57e5c76a79b41b))

### [0.1.3](https://github.com/tpluscode/rdfine/compare/v0.1.2...v0.1.3) (2020-01-11)

### Features

- wrap object in proxy to allow arbitrary property access ([3a08b8c](https://github.com/tpluscode/rdfine/commit/3a08b8c498e5503f927430f783827ecd065ebacb))

### [0.1.2](https://github.com/tpluscode/rdfine/compare/v0.1.1...v0.1.2) (2020-01-09)

### Features

- read-only support for rdf lists ([1849150](https://github.com/tpluscode/rdfine/commit/1849150f659a62e125d351da9613ba815ab4f890))

### Bug Fixes

- decorators fail to apply with babel ([dcd0ca0](https://github.com/tpluscode/rdfine/commit/dcd0ca0c9386d2ccc4ea03fc6d7b56aec0027fa3))
- strict property throws when initialized declaratively ([a7088ff](https://github.com/tpluscode/rdfine/commit/a7088ff33df3e6620374743adc0c6f06fc99124c))

### [0.1.1](https://github.com/tpluscode/rdfine/compare/v0.1.0...v0.1.1) (2020-01-08)

### Features

- added TypeCollection class and resource prop ([60a10d6](https://github.com/tpluscode/rdfine/commit/60a10d67fc39e6e47a1dcc09cea944858ec36c0f))

## [0.1.0](https://github.com/tpluscode/rdfine/compare/v0.0.2...v0.1.0) (2019-12-30)

### ⚠ BREAKING CHANGES

- a factory instance must exist on the base class

### Features

- allow decorated base class override ([6628435](https://github.com/tpluscode/rdfine/commit/662843515b6d111089e319f6d4dbc8f58fec428c))
- basic support for numeric literals ([34c6f2f](https://github.com/tpluscode/rdfine/commit/34c6f2fe4d64af725f2bf194790258a6daaf59be))
- dafault property value ([c1e9c57](https://github.com/tpluscode/rdfine/commit/c1e9c57e6c5cab629cbb1942572728ca0525feca))
- declare initial prop value as factory function ([4849b98](https://github.com/tpluscode/rdfine/commit/4849b98e3e86d3b961c853ed7f49121ae26a326b))
- strict properties ([d4fe5c1](https://github.com/tpluscode/rdfine/commit/d4fe5c1518ebed6c753b72e9ecbd80ef49ea7cbc))

* remove singleton factory ([723c504](https://github.com/tpluscode/rdfine/commit/723c504a006a6594c67baf1e37d511373307d2c2))

### [0.0.2](https://github.com/tpluscode/rdfine/compare/v0.0.1...v0.0.2) (2019-12-23)

### 0.0.1 (2019-12-22)

### Features

- annotating properties to use namespaces ([baf7493](https://github.com/tpluscode/rdfine/commit/baf7493ac3781d4564ccfc738274b83ffb6bfb70))
- implement resource factory as singleton ([bc14c7d](https://github.com/tpluscode/rdfine/commit/bc14c7df3d78cca55c7e40bb544e6711f1362132))
- postel law - set terms directly ([cc88849](https://github.com/tpluscode/rdfine/commit/cc88849a0ba0adbcf9d49f5c4d0a030d79b6004c))
- setting and unsetting resource relations ([05ff089](https://github.com/tpluscode/rdfine/commit/05ff08959e2339cd3ddf0bd6e939197036f1c6c7))
- setting string and boolean literals ([71ed349](https://github.com/tpluscode/rdfine/commit/71ed3491c93f9927be4518828851bd21fa03d6a3))
- setting string and boolean literals ([386a940](https://github.com/tpluscode/rdfine/commit/386a94063abf12904180b5aee353095e82b718e9))

### Bug Fixes

- setting arrays ([700b169](https://github.com/tpluscode/rdfine/commit/700b16951eeb0e4ec235acf485acf80b9f451fc7))
- setting longer paths ([4a2deb4](https://github.com/tpluscode/rdfine/commit/4a2deb4867a12c3f950e290a1769740c94df4170))
