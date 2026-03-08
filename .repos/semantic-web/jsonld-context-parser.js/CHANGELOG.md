# Changelog
All notable changes to this project will be documented in this file.

<a name="v3.1.0"></a>
## [v3.1.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v3.0.0...v3.1.0) - 2026-01-27

### Added
* [Add disallowDirectlyNestedContext parse option](https://github.com/rubensworks/jsonld-context-parser.js/commit/f514cf4fe35c4776eeb323560d44299a3e70e8f0)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.4.0...v3.0.0) - 2024-06-13

### BREAKING CHANGE
* [Remove cross fetch (#76)](https://github.com/rubensworks/jsonld-context-parser.js/commit/8d26fba6cb2e8c54f998a2eafeee49a4688abe36)
    This is not a breaking change for users of Node 18+

<a name="v2.4.0"></a>
## [v2.4.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.3.3...v2.4.0) - 2023-11-07

### Changed
* [Remove deep cloning of contexts during parsing](https://github.com/rubensworks/jsonld-context-parser.js/commit/28596b5ebbea44beec7b12b56c60fde9a2d73b22)

<a name="v2.3.3"></a>
## [v2.3.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.3.2...v2.3.3) - 2023-10-12

### Fixed
* [Check if value is a string in isSimpleTermDefinitionPrefix](https://github.com/rubensworks/jsonld-context-parser.js/commit/6a725bde5754631fb1ce2c05b05427e1247b29dd)

<a name="v2.3.2"></a>
## [v2.3.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.3.1...v2.3.2) - 2023-10-11

### Fixed
* [Fix incorrect handling of protected prefixes](https://github.com/rubensworks/jsonld-context-parser.js/commit/2cf1f59acc6bbbedbb74cc13f4b2c643e560839b)

<a name="v2.3.1"></a>
## [v2.3.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.3.0...v2.3.1) - 2023-09-26

### Fixed
* [Fix circular dependency in imports, Closes #63](https://github.com/rubensworks/jsonld-context-parser.js/commit/22a74dc761d66df80f143a0b3a0faa68ded8ebca)

<a name="v2.3.0"></a>
## [v2.3.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.2.3...v2.3.0) - 2023-01-27

### Added
* [Expose annotations and error messages for JSON-LD-Star](https://github.com/rubensworks/jsonld-context-parser.js/commit/a5598bb1d096b30a34b6e210675d622bc29a4667)

<a name="v2.2.3"></a>
## [v2.2.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.2.2...v2.2.3) - 2023-01-06

### Fixed
* [Fix error on @id: @nest](https://github.com/rubensworks/jsonld-context-parser.js/commit/7c939c43eb007264d66e51038786b880d5d10e25)
* [Fix handling of prefixed @vocab](https://github.com/rubensworks/jsonld-context-parser.js/commit/db7d9a2d1c15f424fb64f564cfc152f337149679)

<a name="v2.2.2"></a>
## [v2.2.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.2.1...v2.2.2) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rubensworks/jsonld-context-parser.js/commit/18bc542be98ebc914af9be5d4df5e89bdf316abe)

<a name="v2.2.1"></a>
## [v2.2.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.2.0...v2.2.1) - 2022-09-09

### Fixed
* [Fix `@base` not resolving in nested inner contexts](https://github.com/rubensworks/jsonld-context-parser.js/commit/db15734a81bcffbf7411aebef937723615f0e960)

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.5...v2.2.0) - 2022-07-14

### Changed
* [Enables tree shaking in package.json](https://github.com/rubensworks/jsonld-context-parser.js/commit/75c223651fd436a0a672e2b887fc5e6fcb801cef)

<a name="v2.1.5"></a>
## [v2.1.5](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.4...v2.1.5) - 2021-08-17

### Fixed
* [Fix containers handling for imported contexts, Closes #40](https://github.com/rubensworks/jsonld-context-parser.js/commit/f8e06978e4d46dd479911352ef773b548ac9b7a6)

<a name="v2.1.4"></a>
## [v2.1.4](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.3...v2.1.4) - 2021-08-09

### Fixed
* [Fix default value for processing mode if options are present (#39)](https://github.com/rubensworks/jsonld-context-parser.js/commit/aaf926bfc4975cdfac02dcff5966a1c27994dc59)

<a name="v2.1.3"></a>
## [v2.1.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.2...v2.1.3) - 2021-07-29

### Fixed
* [Fix protection checks not handling compact vs expanded terms](https://github.com/rubensworks/jsonld-context-parser.js/commit/ceec47ddce7ff2a61ce0e1727b5238815a59e52a)

<a name="v2.1.2"></a>
## [v2.1.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.1...v2.1.2) - 2021-04-16

### Changed
* [Set compilation target to es2017](https://github.com/rubensworks/jsonld-context-parser.js/commit/461c626e19f2bb3afdb50c12f1bb4b2501d608b8)
* [Don't deepcopy parentContext on minimal processing for better perf](https://github.com/rubensworks/jsonld-context-parser.js/commit/d476b59eda1bee6501fc648afd667b6f50e6a53d)
* [Improve performance for many scoped contexts, Closes #34](https://github.com/rubensworks/jsonld-context-parser.js/commit/e1cd29bbc3a2137cf19bb64bf1229ff675d798ca)

### Fixed
* [Fix invalid baseIRI when parsing file via CLI](https://github.com/rubensworks/jsonld-context-parser.js/commit/793bd526392d31549570c7aec711c5f5816a24bb)
* [Fix crash when parent context is a string](https://github.com/rubensworks/jsonld-context-parser.js/commit/b87b317f2d01cfc913d44b8f612b77323621954a)
* [Fix base failure on complex nested scoped contexts, Closes #35](https://github.com/rubensworks/jsonld-context-parser.js/commit/7f9095080627656df07c317ed7b699239b7114d9)

<a name="v2.1.1"></a>
## [v2.1.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.1.0...v2.1.1) - 2020-09-25

### Fixed
* [Add workaround for failing http-based schema.org requests in browsers](https://github.com/rubensworks/jsonld-context-parser.js/commit/4498d97b00226a5e484b3bcf5cae62c85ffb0900)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.0.2...v2.1.0) - 2020-09-16

### Changed
* [Migrate to cross-fetch](https://github.com/rubensworks/jsonld-context-parser.js/commit/9b3e9c12a2292e2aeed58965df8485c478a7366f)

<a name="v2.0.2"></a>
## [v2.0.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.0.1...v2.0.2) - 2020-07-09

### Fixed
* [Fix false negative on charset in content type](https://github.com/rubensworks/jsonld-context-parser.js/commit/5dd54eaeff5df7e595b221d8af0ad3fa0e09e49e)
* [Fix fetcher breaking in browser environments](https://github.com/rubensworks/jsonld-context-parser.js/commit/ab8b446b81d6d2dfb6be15dfcfa662e23277d216)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v2.0.0...v2.0.1) - 2020-06-03

### Fixed
* [Fix contexts behind alternate links not being detected](https://github.com/rubensworks/jsonld-context-parser.js/commit/eeb2e05eacabb21dc4962de3377ed6f52e3faeab)
* [Throw error on invalid @type value in context](https://github.com/rubensworks/jsonld-context-parser.js/commit/bca3cb5512d321daa7a854ed57a68501f45b5fed)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.3.4...v2.0.0) - 2020-04-03

### Added
* Add support for [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) expansion and compaction features.
* [Add Error class that exposes standard error codes](https://github.com/rubensworks/jsonld-context-parser.js/commit/a762c550d114ed67119d641235c93d24badadf4d)

### Changed
* [Make parser object-oriented instead of fully static](https://github.com/rubensworks/jsonld-context-parser.js/commit/c5593680728856c27a874a904a2025061ea3e0ff)
* [Rename baseIri option to baseIRI](https://github.com/rubensworks/jsonld-context-parser.js/commit/fb516950a5e031299c207d67e2c87809b85e2fe3)

### Fixed
* [Fix aliasing @graph producing validation errors](https://github.com/rubensworks/jsonld-context-parser.js/commit/eccfc3b55a798e8903ed8520e297399fceb567ab)

<a name="v1.3.4"></a>
## [v1.3.4](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.3.3...v1.3.4) - 2019-10-05

### Fixed
* [Fix compactIri not always picking most compact form](https://github.com/rubensworks/jsonld-context-parser.js/commit/ede6536d259b1dcd44bf77bb70a085ba84d52ff6)

<a name="v1.3.3"></a>
## [v1.3.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.3.2...v1.3.3) - 2019-10-05

### Fixed
* [Ensure lowercased language tags](https://github.com/rubensworks/jsonld-context-parser.js/commit/dadc8bd9bbd89fcdbdc2364aa418fa47aff88b04)

<a name="v1.3.2"></a>
## [v1.3.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.3.1...v1.3.2) - 2019-09-18

### Fixed
* [Fix hash fragments being considerable as compact IRIs](https://github.com/rubensworks/jsonld-context-parser.js/commit/9712a9dc609278ba970d1a9064f6627616980c0e)
* [Allow @base in arrays to be relative to each other](https://github.com/rubensworks/jsonld-context-parser.js/commit/72ada1f1df454e70039a90aa8ba20718e2724f3f)
* [Fix @base being modified when it was set to null](https://github.com/rubensworks/jsonld-context-parser.js/commit/e6e2705b31d71b561800c11076ec45b93df9c978)
* [Fix context @base sometimes being modified when absolute](https://github.com/rubensworks/jsonld-context-parser.js/commit/18ae49ae72af91bb2e9ed363598eeca5d6e382b4)
* [Fix infinite term expansion loop on relative vocabs](https://github.com/rubensworks/jsonld-context-parser.js/commit/ca670366102855e7649689ff3471148ae754f30d)
* [Fix relative context IRIs in array not being accepted](https://github.com/rubensworks/jsonld-context-parser.js/commit/19d82699dbccb3d807094cd49178dfe2f6c1a727)
* [Allow @base to be relative to document baseIRI](https://github.com/rubensworks/jsonld-context-parser.js/commit/f65d12721fe42ed1dd6ae8c14e770402654bbc94)

<a name="v1.3.1"></a>
## [v1.3.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.3.0...v1.3.1) - 2019-08-22

### Fixed
* [Fix expansion and compaction causing null terms](https://github.com/rubensworks/jsonld-context-parser.js/commit/0b6ac3ea9d9f519a4329e0528e41292b869f435c)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.2.0...v1.3.0) - 2019-08-22

### Changed
* [Expand and compact iteratively to the best form, Closes #21](https://github.com/rubensworks/jsonld-context-parser.js/commit/50e945d57cee2717a42179af2e40e7aa1ce33053)
* [Append newline to CLI error message](https://github.com/rubensworks/jsonld-context-parser.js/commit/f2d2c91a91610003db2bb5fbb38b75d57cc1893d)

### Fixed
* [Properly handle baseIri in CLI tool, Closes #20](https://github.com/rubensworks/jsonld-context-parser.js/commit/540e72d23f3571a0d89ce3a351e43f16a2b5f6cd)
* [Fix input context objects being modified](https://github.com/rubensworks/jsonld-context-parser.js/commit/de369b8f859308f427ef11e183c8bc92b43642e3)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.4...v1.2.0) - 2019-04-02

### Added
* [Add compactIri helper function](https://github.com/rubensworks/jsonld-context-parser.js/commit/b350541e8052679ef72d62c3798d4a379c771b97)

<a name="v1.1.4"></a>
## [v1.1.4](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.3...v1.1.4) - 2019-03-15

### Changed
* [Make CLI return exit code 1 if an error was encountered](https://github.com/rubensworks/jsonld-context-parser.js/commit/75e4961cba271beb74cf2f77bfd43b4dd589a2b7)
* [Allow tilde in IRIs](https://github.com/rubensworks/jsonld-context-parser.js/commit/9637ebf26de7690f32aab4fc468c22cf5395e417)

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix CLI errors not being shown correctly, Closes #18](https://github.com/rubensworks/jsonld-context-parser.js/commit/f8dea3592adf710e50c5ac0df334db327cca7433)

<a name="v1.1.3"></a>
## [v1.1.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.1...v1.1.3) - 2019-02-13

### Changed
* [Make IRI regex stricter](https://github.com/rubensworks/jsonld-context-parser.js/commit/253986cab9488bcfabdeb53f43353a1170123335)
* [Allow relative context IRIs to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/5754b4b388f7b25f4832c3812d63ff3385ab42ad)

<a name="v1.1.2"></a>
## [v1.1.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.1...v1.1.2) - 2019-02-12

### Fixed
* [Allow relative context IRIs to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/5ec027de3d3e06f8c70ed0928f750b917becb975)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.0...v1.1.1) - 2019-02-07

### Changed
* [Allow context objects with @context to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/02f70ab76d203899be02931df194cb2aefb32ed7)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.0.1...v1.1.0) - 2019-02-07

### Added
* [Distinguish between @base and @vocab term expansion](https://github.com/rubensworks/jsonld-context-parser.js/commit/acec95004c0ba93ea547e9af5fd6723d7424abc5)

### Changed
* [Improve context validation to be spec-compliant](https://github.com/rubensworks/jsonld-context-parser.js/commit/c0a7716cb50b8d1933f10bcc7c904606b064b72e)
* [Request remote contexts with proper accept header](https://github.com/rubensworks/jsonld-context-parser.js/commit/2ea1863a428652b93e1545b8d733aca9748235a7)
* [Pass parse parameters as hash](https://github.com/rubensworks/jsonld-context-parser.js/commit/dc51cf146236f39de491bfe4aa4ba78fb190a282)
* [Process external contexts in arrays in parallel](https://github.com/rubensworks/jsonld-context-parser.js/commit/483050a55e438e81c91984102de7ef03e5a1a00a)
* [Return null from expandTerm if the term has null as context value](https://github.com/rubensworks/jsonld-context-parser.js/commit/eab3530f3ba37f67ad7dba8d24ebef4799ba0630)
* [Remove @base entries from external contexts](https://github.com/rubensworks/jsonld-context-parser.js/commit/b737cbee4ceb610c57d9f26b9bf9671b9b7bbdc9)
* [Depend on relative-to-absolute-iri for IRI resolving](https://github.com/rubensworks/jsonld-context-parser.js/commit/18cc011cdbbd3956d8319a01ce44c991cefc5e00)
* [Don't unwrap @context in IDocumentLoader](https://github.com/rubensworks/jsonld-context-parser.js/commit/4f501447beb72f24e1c390e5315850860061fcca)

### Fixed
* [Fix remote array-based contexts not being retrieved from cache properly](https://github.com/rubensworks/jsonld-context-parser.js/commit/52fdc39f808ed2ce6b5c5f18a6fe5b48035310a6)
* [Allow @base to be set in null contexts](https://github.com/rubensworks/jsonld-context-parser.js/commit/f64b08cba61b02d89e6b1d13d6d58b5ce90c086b)
* [Fix array context not inheriting from parent context](https://github.com/rubensworks/jsonld-context-parser.js/commit/fe387bbe19c66608bab6dd6f57eb057808e773c1)
* [Only expand term references in vocab-mode](https://github.com/rubensworks/jsonld-context-parser.js/commit/858aa60386d86d0a76d8f68876f87b4f5d732e54)
* [Fix @type: @vocab being expanded](https://github.com/rubensworks/jsonld-context-parser.js/commit/96e9a1eda4916d00a66743d0a04da5a087fe5790)
* [Make @type expansion fallback to @base](https://github.com/rubensworks/jsonld-context-parser.js/commit/05880ff9f85f986101a2bedae5f88479e19a7efe)
* [Fix disabling context via @id: null not working](https://github.com/rubensworks/jsonld-context-parser.js/commit/6b1a609d58d0fafec58885c75a6ba4b5efc6c456)
* [Fix inner context expansion happening on @base instead of @vocab](https://github.com/rubensworks/jsonld-context-parser.js/commit/ab526933cb006721d02b35a4a88c8224b4b60991)
* [Fix context entries referencing themselves ignoring @vocab](https://github.com/rubensworks/jsonld-context-parser.js/commit/1a8ac8a679b6053b4d2be9e159d7cb2be2de584c)
* [Blacklist @language value expansion](https://github.com/rubensworks/jsonld-context-parser.js/commit/885f44f1964b17266d1330e15162de0efd452b79)
* [Fix expansion loop stopping too soon when one term was unchanged](https://github.com/rubensworks/jsonld-context-parser.js/commit/65ac1b421037e632562c0117c77fb4bd5b091ab5)
* [Allow setting @context to null](https://github.com/rubensworks/jsonld-context-parser.js/commit/c4ea704be84841f127fa854932b7bfc505880add)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.0.0...v1.0.1) - 2018-10-08

### Fixed
* [Enable manual-git-changelog](https://github.com/rubensworks/jsonld-context-parser.js/commit/53a48cf6fc8a3e0e5ce87efeaad4b018943648c4)

<a name="1.0.0"></a>
## [1.0.0] - 2018-09-25
Initial release
