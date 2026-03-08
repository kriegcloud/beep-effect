# Changelog
All notable changes to this project will be documented in this file.

<a name="v3.2.0"></a>
## [v3.2.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v3.1.0...v3.2.0) - 2025-11-03

### Changed
* [Emit error on unsupported versions](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/2b37d294d8a13de0fb9a8d6e2cd6fbad5a2b20b7)

<a name="v3.1.0"></a>
## [v3.1.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v3.0.1...v3.1.0) - 2025-07-01

### Added
* Add RDF/XML 1.2 support
    * [Don't emit triple terms without rdf:version](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/b828deb584436a4433c7d12a103dda9299971e8d)
    * [Fix rdf:version being emitted as triple](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/a7122d680d50437e3e43de718333e9ccbfbb9a63)
    * [Ignore its:version while parsing](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/4a55f6f7d848b7b9709d7b28f75bebfc9d19e82f)
    * [Only use its:dir if rdf:version is 1.2](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1ba33a31e92d628d5b417fef9706f0cdbf366c34)
    * [Parse annotated triples](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/12680398c35150a27360646fcd2ec589ae91b254)
    * [Parse triple terms](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/8e48c3a1bddb2339b3c849d0cd7749f91bb44921)
    * [Parse rdf:version](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/f970161157e613a7e821d04b14b22d8e11b7a99a)
    * [Parse base directions](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/265df9bee38f99586ab9836167ba5e785c3a3f24)

### Fixed
* [Include parent namespaces in XML Literals](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/98d6ab5a5d5d14f551cc0427ec85ebee3ed73acd)
* [Fix invalid handling of rdf:parseType=Collection and rdf:ID](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/f73809a9949232a22318bd86f5a071422184925c)

<a name="v3.0.1"></a>
## [v3.0.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v3.0.0...v3.0.1) - 2025-01-08

### Changed
* [Bump to @types/readable-stream v4](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/22b40b7a2c407f20d56a6d29a6ab60b412481cf3)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.4.0...v3.0.0) - 2025-01-08

### BREAKING CHANGES
* [Update to rdf-data-factory v2](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d6140be8e518d6884b65e0cd9fb815f4867d7356)
    This includes a bump to @rdfjs/types@2.0.0, which requires TypeScript 5 and Node 14+

<a name="v2.4.0"></a>
## [v2.4.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.3.0...v2.4.0) - 2023-11-24

### Added
* [Support namespace declarations on node elements and typed node elements (#72)](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/7e35733deb2e43382ba63aa6c9eab87b940262ed)

<a name="v2.3.0"></a>
## [v2.3.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.2.3...v2.3.0) - 2023-11-07

### Added
* [Add CDATA support, Closes #52](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/41ac737e3fa64b3d8bb7fb589f59181bcddba4ae)

<a name="v2.2.3"></a>
## [v2.2.3](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.2.2...v2.2.3) - 2023-06-05

### Fixed
* [Migrate to @rubensworks/saxes](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/620c08c3e3d7560ad9292abc258fd0ff958c67e7)
    This fixes compilation errors on TypeScript 5

<a name="v2.2.2"></a>
## [v2.2.2](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.2.1...v2.2.2) - 2023-04-06

### Fixed
* [Fix xmlns without prefix being interpreted as property attribute](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/a33f030f78132950b5a87cfaac0c992de05e6c8c)

<a name="v2.2.1"></a>
## [v2.2.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.2.0...v2.2.1) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/409d2a46cf745a892adc5337764733ab912713c0)

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.1.0...v2.2.0) - 2022-08-16

### Changed
* [Use validate-iri.js to validate IRIs](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/ef628b45e5d315479dca2100c315e5e029383618)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v2.0.0...v2.1.0) - 2022-07-27

### Added
* [Add option to disable URI validation, Closes #61](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d51d0fd54957fad5f9d1a843d851b3d5a4c8cc80)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.5.0...v2.0.0) - 2022-07-14

This release has been marked as a major change due to the transition from Node's internal `stream` API to `readable-stream`.
Most users should experience not breakages with this change.

### Changed
* [Uses native saxes namespace support](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/0989939c936f5cc353a4dd3e43301dfbbc35308c)
* [Move away from Node.js built-ins](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/0afa4eaf9ff879a55e27e553d5d9d41f1ddbf6e2)
* [Enable tree shaking in package.json](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/b98fd369d2eba026d6ec816e75ec7b5e85cc58af)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.4.0...v1.5.0) - 2021-08-11

### Changed
* [Migrate to @rdfjs/types](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/7d4c747ce1585a58ebbeb7fb723bc30fda8aaa63)

<a name="v1.4.0"></a>
## [v1.4.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.6...v1.4.0) - 2020-09-15

### Changed
* [Update to @types/rdf-js 4.x](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/f1a2b8a874dcfbed02e475964eacd375dd817e59)

### Fixed
* [Fix import method sometimes failing on large streams](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/9eaead0ba1c1b72fd3b0f61d25bef0c1d19577b8)

<a name="v1.3.6"></a>
## [v1.3.6](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.5...v1.3.6) - 2020-06-03

### Fixed
* [Fix incompatibility with WhatWG streams, Closes #35](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/93f21e91a3321407dcc65007d32f10569e2496d4)

### Changed
* [Update dependency @types/rdf-js to v3 (#33)](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/35509c1fad2005a0c63e062fb62c1bed47e2d3ce)

<a name="v1.3.5"></a>
## [v1.3.5](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.4...v1.3.5) - 2020-04-14

### Fixed
* [Fix relative xml:base not being handled, Closes #32](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/a50f49d8eb8ecae4e216a535c0b8b9f4fb0ff655)

<a name="v1.3.4"></a>
## [v1.3.4](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.3...v1.3.4) - 2020-01-27

### Changed
* [Make implementation more strongly typed on RDF terms](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/97cadae46da140cf273f92e483d338ae50074291)

<a name="v1.3.3"></a>
## [v1.3.3](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.2...v1.3.3) - 2020-01-17

### Fixed
* [Implement RDF.Sink interface in TypeScript](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/6a78effbad97abdfe3833151a624dbf7d65e964a)

<a name="v1.3.2"></a>
## [v1.3.2](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.1...v1.3.2) - 2020-01-12

### Fixed
* [Fix xmlns in datatyped property tags causing errors, Closes #21](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/6913fa1ffea102ba9c35743fc769961cc47d816f)

<a name="v1.3.1"></a>
## [v1.3.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.0...v1.3.1) - 2019-07-17

### Fixed
* [Fix doctype parser not accepting single-quoted strings](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d6b23309f77027bd7405ea9d3ae9e066e366e1a8)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.4...v1.3.0) - 2019-07-03

### Added
* [Add 'trackPosition' option to print line numbers on errors, Closes #16](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1a948ffa72a70503022d4a31c0c6ecd7d5ba7e12)
* [Add 'allowDuplicateRdfIds' to allow duplicate rdf:IDs, Closes #18](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1195847f1ee419d67d217bffaadc51a2d5f91f72)

### Fixed
* [Make DOCTYPE ENTITY parsing less strict regarding whitespace characters](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/76a641366d97f5db53ea80da025018fb5ff60f05)

<a name="v1.2.4"></a>
## [v1.2.4](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.3...v1.2.4) - 2019-06-24

### Fixed
* [Fix _: being accepted as valid IRIs, Closes #15](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/838bfe8834bca20d60297f79f0aa8ced981d111f)

<a name="v1.2.3"></a>
## [v1.2.3](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.2...v1.2.3) - 2019-04-25

### Fixed
* [Fix stream transformation continuing after first error, #12](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/acc805b1b963067eae8e7583bc6debe4ec198e3e)

<a name="v1.2.2"></a>
## [v1.2.2](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.1...v1.2.2) - 2019-04-25

### Fixed
* [Error on unbound prefixes, Closes #12](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/0931aab22c505cbfdd7ae89fd7fd5065a1cb3555)
* [Validate all created URIs, Closes #11](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/75588df39b49d6945001d381af76d38ba9add768)

<a name="v1.2.1"></a>
## [v1.2.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.0...v1.2.1) - 2019-04-02

### Fixed
* [Fix doctype entities not being considered in base IRIs, Closes #10](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/3cda7e18839200e1130af06de23128dd56f24e41)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.1.0...v1.2.0) - 2019-01-28

### Added
* [Implement #import method](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/9213f6c1b634df839ea970a2f308506bcaa9b4fa)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.0.1...v1.1.0) - 2018-11-08

### Changed
* [Update to generic RDFJS typings](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/f6558c57b5a2de83e775fe82f4e97f576d6a78c7)
* [Depend on relative-to-absolute-iri for IRI resolving](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/8fb6beb72d159be7b1a86b62701dc8274be9619e)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.0.0...v1.0.1) - 2018-10-09

### Fixed
* [Throw an error on li attributes on node elements](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/affb69bafb7f6ccfa72be731a7058314a541e2b4)
* [Throw errors on rdf:aboutEach and rdf:aboutEachPrefix](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d981af760f5b4a21d73d325f4105da203bd8223c)
* [Add stricter NCName validation](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/25d97be70d88e18aed856c9aae15741cc9300c5e)
* [Make parseType and resource interactions more strict](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/25e397285db03e8094197515394ee62f88f29761)
* [Add blacklists for forbidden node and property element names](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1e812fcbaef4bb4ad112f3eec83e3ce91bc97d51)

<a name="1.0.0"></a>
## [1.0.0] - 2018-09-04
* Initial release
