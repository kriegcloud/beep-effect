# Changelog
All notable changes to this project will be documented in this file.

<a name="v4.0.0"></a>
## [v4.0.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v3.0.1...v4.0.0) - 2025-01-08

### BREAKING CHANGES
* [Make RDF 1.2 literals with base direction output as @direction](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/c119ce44165180e8583320dc9a0578dd58401485)
* [Update to rdf-data-factory v2](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/586fc7ba75e5005b7444e7dd741ca9d437ca4f1f)
    This includes a bump to @rdfjs/types@2.0.0, which requires TypeScript 5 and Node 14+

<a name="v3.0.1"></a>
## [v3.0.1](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v3.0.0...v3.0.1) - 2024-09-27

### Changed
* [Update dependency @types/readable-stream to v4](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/210106aeba7b26ed20fab260be12e85aa2a12e4d)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v2.1.0...v3.0.0) - 2024-09-27

### BREAKING CHANGE
* [Update to jsonld-context-parser v3](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/df0bbbe287b2b20ca284b1c06ce1b83a9f682b48). This is not a breaking change for users of Node 18+

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v2.0.1...v2.1.0) - 2022-11-25

### Added
* [Serialize nested quads as JSON-LD-star embedded nodes, Closes #35](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/96349966e95161418d2dc5a7f0949d99422b531d)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v2.0.0...v2.0.1) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/4667c4f4b399781a460dd92a1aa71edf056ef52e)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v1.3.0...v2.0.0) - 2022-07-14

This release has been marked as a major change due to the transition from Node's internal `stream` API to `readable-stream`.
Most users should experience not breakages with this change.

### Changed
* [Enable tree shaking in package.json](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/7b46dce47e9a558b83c1eddd709ace9291d4e23b)
* [Move away from Node.js built-ins](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/6fd35465d20dcbc3d947dd0e9fa0610cf20d6c61)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v1.2.0...v1.3.0) - 2021-08-11

### Changed
* [Migrate to @rdfjs/types](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/368d260d35569116c0cc90012ba3a21bf62d7909)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v1.1.1...v1.2.0) - 2020-09-15

### Changed
* [Update to @types/rdf-js 4.x](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/a7de211d9a76ab84c939a269c80d5caa22fd1ed8)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v1.1.0...v1.1.1) - 2020-09-02

### Fixed
* [Fix import causing large streams to terminate early](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/754086694e2e0ce652a55e863e6cad0d974ed4a3)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/jsonld-streaming-serializer.js/compare/v1.0.1...v1.1.0) - 2020-04-03

### Added
* Add [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) support
    * [Handle rdfDirection: i18n-datatype](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/9c3abb423ba7bba28090cdcd482b3a2d4f3bd903)
    * [Handle rdf:JSON datatypes](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/684e738125d9349107d2a532c5061acb77c5591d)

### Changed
* [Always serialize xsd:decimal as string](https://github.com/rubensworks/jsonld-streaming-serializer.js/commit/559a02ff311877d76b04d1da7d5b2484fd178ab8)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/rubensworks/streaming-jsonld-serializer.js/compare/v1.0.0...v1.0.1) - 2019-04-03

### Fixed
* [Fix compact serialization containing unneeded spaces](https://github.com/rubensworks/streaming-jsonld-serializer.js/commit/0f32fde93a0d5d0bb651f862ab8d46f9a1856804)

<a name="v1.0.0"></a>
## [v1.0.0] - 2019-04-03

Initial release
