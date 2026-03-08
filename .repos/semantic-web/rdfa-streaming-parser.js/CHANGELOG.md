# Changelog
All notable changes to this project will be documented in this file.

<a name="v3.0.2"></a>
## [v3.0.2](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v3.0.1...v3.0.2) - 2025-04-15

### Fixed
* [Normalize language tags to lowercase, Closes comunica/comunica#1469](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/1006a41d6b1a510935b9f16d4618dcb11e3a065f)

<a name="v3.0.1"></a>
## [v3.0.1](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v3.0.0...v3.0.1) - 2025-01-13

### Fixed
* [Fix nested tag-capturing and non-capturing literals conflicting](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/864a748dbc95d92991fed692aa2f7286e979740a)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v2.0.1...v3.0.0) - 2025-01-08

### BREAKING CHANGES
* [Update to rdf-data-factory v2](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/a06070d2b28bd3f778374c6bafe3b54ca55c1e38)
    This includes a bump to @rdfjs/types@2.0.0, which requires TypeScript 5 and Node 14+

### Changed
* [Update dependency htmlparser2 to v9 (#55)](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/d425142755bf5b904f3cba6e65befa4e726e7c18)
* [Update dependency @types/readable-stream to v4](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/cc4eca48f7ef225f8c17b312fae3898c26748907)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v2.0.0...v2.0.1) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/8b1c04d1cec779e8ff2da178d79a32ee3b5c6904)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.5.0...v2.0.0) - 2022-08-08

This release has been marked as a major change due to the transition from Node's internal stream API to readable-stream. Most users should experience not breakages with this change.

### Changed
* [Move away from Node.js built-ins (#47)](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/3c088faebbdea89775e3bb6dfbff78623a508a38)
* [Enable tree shacking](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/30c39e81527d1cc3e2bc5bd1a4c69ca38c056da0)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.4.0...v1.5.0) - 2021-08-11

### Changed
* [Migrate to @rdfjs/types](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/b73e115a97c4d515c09e64fa1049bdb1f7e8c0c8)
* [Update dependency htmlparser2 to v6](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/816dc9e8b488a507a3115d2f7558f7d6ccc9b25a)

<a name="v1.4.0"></a>
## [v1.4.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.3.0...v1.4.0) - 2020-10-12

### Changed
* [Update dependency htmlparser2 to v5](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/43c98f38f37a5d61731e3c2fd85cffde881c7a28)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.2.2...v1.3.0) - 2020-09-15

### Changed
* [Migrate to rdf-data-factory](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/0552eb287b228cdfa305070803f9dd176041bbe0)

### Fixed
* [Fix import method sometimes failing on large streams](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/93c8f5f7d002d05bf5e23fa2c3fa5c97d6ac88d3)

<a name="v1.2.2"></a>
## [v1.2.2](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.2.0...v1.2.2) - 2020-06-03

### Fixed
* [Fix incompatibility with WhatWG streams](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/8b7964eb24f70b23f0c5811b730b752e95d3695d)

### Changed
* [Update dependency @types/rdf-js to v3, Closes #17](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/4c45c2f3b41146934678c6c9e53b29afcd5c440c)

<a name="v1.2.1"></a>
## [v1.2.1](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.2.0...v1.2.1) - 2020-03-28

### Fixed
* [Fix crash on relative base tag values](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/e564188e5fb41cbbbbfd78ff1269e1e57959ef86)
* [Properly delegate errors from listeners to the stream](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/730201ce16bc27b80ca046da015d48ce77b8ee8d)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.1.1...v1.2.0) - 2020-01-27

### Added
* [Add typings for RDF.Sink implementation, Closes #9](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/ee48998a0426b41a0a88a61d523273f719c12d05)

### Changed
* [Make implementation more strongly typed](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/e0fb225419a350d8fd5cb6e759800bc673f3b327)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/rubensworks/rdfa-streaming-parser.js/compare/v1.1.0...v1.1.1) - 2019-08-07

### Changed
* [Update to htmlparser2 4.x.x, Closes #5](https://github.com/rubensworks/rdfa-streaming-parser.js/commit/f1c950a956ac33c7cbd570b5df3f521ca02b2eeb)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/streaming-rdfa-parser.js/compare/v1.0.0...v1.1.0) - 2019-07-16

### Fixed
* [Fix inner HTML parser not being ended properly](https://github.com/rubensworks/streaming-rdfa-parser.js/commit/f9c3b443d46f15d327c3661507e28b91b9d16abf)

<a name="v1.0.0"></a>
## [v1.0.0] - 2019-07-08

Initial release
