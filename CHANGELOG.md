# Changelog
All notable changes to this project will be documented in this file.

<a name="v1.0.3"></a>
## [v1.0.3](https://github.com/comunica/traqula/compare/v1.0.2...v1.0.3) - 2026-02-20

* [Chore: patch publish script](https://github.com/comunica/traqula/commit/f4cc461a355f7aabdc3dff8db62baf43a5045884)
* [Docs: detail create parsing process & migration of sparql.js further (#108)](https://github.com/comunica/traqula/commit/269ae11800e6a99565b0f572f5fcc6568c334686)
* [Docs: better wording of SparqlContext parse options in jsdocs (#107)](https://github.com/comunica/traqula/commit/c73a20efa8424da6aa289e7817bab3a001b1f4f1)
* [Chore: update dependency lerna to v9.0.4](https://github.com/comunica/traqula/commit/39fc068812ef3d7ba035f9d5c3e4dc08962cb565)
* [Bugfix: visitObject should check whether array items are objects](https://github.com/comunica/traqula/commit/175638b8d1dc7cea40b6373dcb3c2739b048ad62)
* [Docs: add casing of bnode operation to sparql.js migration guide](https://github.com/comunica/traqula/commit/08ddaf4e0911c41bfa693ad34a43ec22f7de9968)
* [Docs: add AST documentation for AstFactory and AstTransformer (#105)](https://github.com/comunica/traqula/commit/4f750dfb168c100dcafaa6f62f8ccb24b82fb8c4)
* [Docs: cleanup migration guides (#104)](https://github.com/comunica/traqula/commit/ca5c3336911d0ebbd015cc8c70d1a200a8634c4b)
* [Docs: reviewing all READMEs (#98)](https://github.com/comunica/traqula/commit/0b19a887468491023f996add536dc01948517f1f)

<a name="v1.0.2"></a>
## [v1.0.2](https://github.com/comunica/traqula/compare/v1.0.1...v1.0.2) - 2026-02-02

* [Bugfix: SPARQL no newline generation needs space (#103)](https://github.com/comunica/traqula/commit/dac077ce271bc18c0e282438a38822ffdf6c19a8)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/comunica/traqula/compare/v1.0.0...v1.0.1) - 2026-01-30

* [Bugfix: robust removeAlgQuadsRecursive & fix unary operator generation (#101)](https://github.com/comunica/traqula/commit/caa78bb9a1f01cf8beb6257be61ac40bfc8f7dfc)
* [Bugfix: Implementation of skipValidation (#97)](https://github.com/comunica/traqula/commit/8e38d350d6042d5afd27e548f7919f744ab99c80)
* [Bugfix: parser throw on missing prefix (#96)](https://github.com/comunica/traqula/commit/a3e35e6406fc6710d8ebfd0d290f773c42168b47)
* [Chore: upgrade vitest, vite, typedoc, and rdf-test-suite (#99)](https://github.com/comunica/traqula/commit/25900caa2c1cb29a0596ccc888c0de32351611aa)
* [Docs: add descriptions to transformation catalogue (#94)](https://github.com/comunica/traqula/commit/c2dead67651ad6cfd144aaa25a8554e2803a9305)
* [Docs: transformation catalogue (#93)](https://github.com/comunica/traqula/commit/e1e02d45924329431aa493e97f2999d7c45924cb)
* [Test: add unit test for lexer on escaped prefixed iri (#91)](https://github.com/comunica/traqula/commit/7cb363a25fdccc02e77571f2d72234b7ab459db7)
* [Feat: throw on subject-recursive triple-term (#92)](https://github.com/comunica/traqula/commit/f34230b963ddb2e9a0bb3f9059e9115b07f45dff)
* [Chore: utils package should track statics (#87)](https://github.com/comunica/traqula/commit/88ca4f620cc5b0289d99fcdb9aeadac50770d881)
* [Chore: Update actions/upload-artifact action to v6 (#80)](https://github.com/comunica/traqula/commit/c04c5cabf7c3fad81130d322675a00ced944b777)
* [Chore: Update actions/cache action to v5 (#79)](https://github.com/comunica/traqula/commit/8bede66b10793cccea4790c0abad9d5559e6e233)
* [CI: remove macos-13 runners due to deprecation](https://github.com/comunica/traqula/commit/15c95e98253e249c387db4c2fba530048004d90f)
* [Chore: lock vitest version in test-utils](https://github.com/comunica/traqula/commit/55cfd3cf68c05467d030a2fa3b86f9b6303f195b)

<a name="v1.0.0"></a>
## [v1.0.0](https://github.com/comunica/traqula/compare/v0.0.25...v1.0.0) - 2025-12-02

* [DOCS: main project README - Traqula is framework](https://github.com/comunica/traqula/commit/209c4ac3b4daecfb293fcb6cc0d1ed41e487dbd6)

<a name="v0.0.25"></a>
## [v0.0.25](https://github.com/comunica/traqula/compare/v0.0.24...v0.0.25) - 2025-12-02

* [CHORE: remove traverseSubnodes since a propper implementation needs to be created in the future](https://github.com/comunica/traqula/commit/e15f2eccf3af359bb33bc1a12a809a20b86bb7cc)
* [increase transformer docs quality](https://github.com/comunica/traqula/commit/91c237ceb875c589b9f6fda0eb50c723e984487e)
* [Update actions/checkout action to v6 (#78)](https://github.com/comunica/traqula/commit/9118e28f6262ee881fceea880d8172f3e6db567a)
* [Update dependency lerna to v9.0.3](https://github.com/comunica/traqula/commit/3981b67dda7eebb3acc2ebd803866fc24936a96b)
* [Update dependency lerna to v9.0.1](https://github.com/comunica/traqula/commit/2f0e975d4abf458ced15b93d56af737bfe336ad2)
* [Update dependency esbuild to ^0.27.0](https://github.com/comunica/traqula/commit/a84cb8c49e31d59fdaac4350b525734897372103)
* [Feat: generator API does not require origSource - add SourceLocationInlinedSource (#76)](https://github.com/comunica/traqula/commit/ac278a201bf487889b063168c056b5495b9ed6b5)
* [Docs/better api docs (#73)](https://github.com/comunica/traqula/commit/b605a581d6bbaba0bf16683475dba7bcb30dff45)
* [Test: add benchmark for source and no source tracking for 1.2 parser](https://github.com/comunica/traqula/commit/9362cf522cb71bdd0d02cade5d9cd80f7f98350e)
* [Refactor/no source tracking by default (#72)](https://github.com/comunica/traqula/commit/dfd7a4f156a7c1754cdb487bb5aed0685901d887)
* [Refactor: ast test files in separate dirs per file kind (#71)](https://github.com/comunica/traqula/commit/a92a9369fb133f2b33a16f90e58533a2587b3389)
* [Update actions/upload-artifact action to v5](https://github.com/comunica/traqula/commit/51be29f2e9075389b2f4a78a68a059d65512d7ea)
* [Test: add SPARQL 1.0 spec tests (#69)](https://github.com/comunica/traqula/commit/0838734e4f277ed72e7bd83bf5881e4d8776d511)
* [Docs: fix ci badge](https://github.com/comunica/traqula/commit/65984b22cad9f6a9f32d6e179e77c86346a17a29)
* [Chore: add badges to readmes + add coveralls to CI](https://github.com/comunica/traqula/commit/a2c4e9d0df015f17ca8439a7054e08bd2bcad07d)
* [Chore: sub-licence chevrotain package to be sure + Refactor: less import *](https://github.com/comunica/traqula/commit/3b880fc6205dac30593f73d6d1ea01d7497955ae)

<a name="v0.0.24"></a>
## [v0.0.24](https://github.com/comunica/traqula/compare/v0.0.23...v0.0.24) - 2025-10-17

* [Chore: compile cjs using tsc (#66)](https://github.com/comunica/traqula/commit/7940e18e9ae6c320dc596310edf1cd26e6989af6)

<a name="v0.0.23"></a>
## [v0.0.23](https://github.com/comunica/traqula/compare/v0.0.22...v0.0.23) - 2025-10-16

* [Chore: publish the package.json that makes files commonjs](https://github.com/comunica/traqula/commit/ebdb8f665690218c1bed176b4ce9579b56897b98)

<a name="v0.0.22"></a>
## [v0.0.22](https://github.com/comunica/traqula/compare/v0.0.21...v0.0.22) - 2025-10-16

* [Chore/better dual packaging (#65)](https://github.com/comunica/traqula/commit/f187b7af4a5b161503e8ef501f5193d934d1b944)

<a name="v0.0.21"></a>
## [v0.0.21](https://github.com/comunica/traqula/compare/v0.0.20...v0.0.21) - 2025-10-15

* [Bugfix/incorrect inscopevars on minus (#64)](https://github.com/comunica/traqula/commit/549a52604cf879a27ff5a52f24f0c019361e6733)

<a name="v0.0.20"></a>
## [v0.0.20](https://github.com/comunica/traqula/compare/v0.0.19...v0.0.20) - 2025-10-15

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Misc: open algebra in function of Comunica & optimizations in transformer & bugfixes](https://github.com/comunica/traqula/commit/c7df22724a7a31814c1daeb04c8670deb7ad581d)
* [Chore: Update actions/setup-node action to v6](https://github.com/comunica/traqula/commit/fbb237734b5a38f1bbe1a540496a3eb9e2a8233c)
* [Test: add more benchmarks to compare to sparqlAlgebra and sparqlJS](https://github.com/comunica/traqula/commit/c206d40765425ae2935d040825d1cb933f6783c2)
* [feat: better generation API that is also more correct with regard to "uncontrolled" newlines](https://github.com/comunica/traqula/commit/224cd8cccad387f30e1091184046fb286bd0c46d)
* [Docs: add some algebra operation docs](https://github.com/comunica/traqula/commit/a687b53712ce04a82ff32668b8741711678389c4)
* [Feat: generator use single var VALUES clause when possible](https://github.com/comunica/traqula/commit/f63be3c1699ab5b6e56843706b2418c2474a250e)
* [Feat: getRule on builders](https://github.com/comunica/traqula/commit/1b284e42ec831b47a7153b24951b3b4acafe0259)
* [DOCS: add jsdocs to core transformer](https://github.com/comunica/traqula/commit/3c4f127010d2b4ba7e2319b2d5ef03347b78189f)
* [Refactor: generate extends within a group to avoid unwrapping](https://github.com/comunica/traqula/commit/01c235c8fb8eb2781ee7988e548beb7da2256b8a)

<a name="v0.0.19"></a>
## [v0.0.19](https://github.com/comunica/traqula/compare/v0.0.18...v0.0.19) - 2025-09-26

* [REFACTOR: do not use instanceof since it can break uner double packaging](https://github.com/comunica/traqula/commit/56d9e9616e9a40d9a52762b8b92c058d8385e72c)
* [TESTS: add more benchmarks](https://github.com/comunica/traqula/commit/8910ef724e09ed740aacc32131ff5fbbdc0a7f85)

<a name="v0.0.18"></a>
## [v0.0.18](https://github.com/comunica/traqula/compare/v0.0.17...v0.0.18) - 2025-09-25

* [FEATURE: LL-1 is sufficient](https://github.com/comunica/traqula/commit/6a59005bf1f3c705d02fc886d229187e71714341)
* [DOCS: Add docs on CORE package and dedicated docs to create your own parser](https://github.com/comunica/traqula/commit/1fa8b447dc80c1f59e87d1b8267a7678ec509a48)
* [Update dependency lerna to v9](https://github.com/comunica/traqula/commit/79d1c0832f332e6e86be03ab6d2f1bfd1496f40c)
* [BUGFIX: disallow queries with no space between delete/insert data/where](https://github.com/comunica/traqula/commit/3c85629403a366e392970f5c11fa7499f8dd0b85)

<a name="v0.0.17"></a>
## [v0.0.17](https://github.com/comunica/traqula/compare/v0.0.16...v0.0.17) - 2025-09-23

* [REFACTOR: remove any when wrongly indexing Algebra objects](https://github.com/comunica/traqula/commit/e9cc81b194a7359ee212a4b1b751dba79a2913ef)
* [REFACTOR: Different implementation style for rewrites](https://github.com/comunica/traqula/commit/5539391619e2456f573919d8407c2b08fae8b4d3)

<a name="v0.0.16"></a>
## [v0.0.16](https://github.com/comunica/traqula/compare/v0.0.15...v0.0.16) - 2025-09-21

* [FEATURE: SPARQL pretty print (#59)](https://github.com/comunica/traqula/commit/d5a6fabf4cb27987c7abd34d9d3c8b7ee2115d3e)
* [BUGFIX: findPatternBoundedVars should traverse triple terms](https://github.com/comunica/traqula/commit/301a7a7241588bbd7bf7ed216e0389e8582ef84d)
* [REFACTOR: change factory names](https://github.com/comunica/traqula/commit/981a0449896095c5344cd6d455b6cff067060964)

<a name="v0.0.15"></a>
## [v0.0.15](https://github.com/comunica/traqula/compare/v0.0.14...v0.0.15) - 2025-09-17

* [reified triples are not asserted 🤦🏼](https://github.com/comunica/traqula/commit/01e44da5515864c8f12adf2aec2f7ee96fb5aae6)
* [Update dependency lerna to v8.2.4](https://github.com/comunica/traqula/commit/efba0d975d829fac6327181d6f29724bacc02989)

<a name="v0.0.14"></a>
## [v0.0.14](https://github.com/comunica/traqula/compare/v0.0.13...v0.0.14) - 2025-09-16

* [Refactor/esm support (#57)](https://github.com/comunica/traqula/commit/567121cb166c1059e758eecd4dead4882b9408ca)

<a name="v0.0.13"></a>
## [v0.0.13](https://github.com/comunica/traqula/compare/v0.0.12...v0.0.13) - 2025-09-15

* [reified triples correct when nested](https://github.com/comunica/traqula/commit/d84e09757920408992bc933515839b068516e5f7)
* [reifier triple collection should be used for sparql 1.2](https://github.com/comunica/traqula/commit/1b4fd79adc40949bf1a95cf6d4a42230cd97460b)
* [SPARQL 1.2 allows not-not parsing](https://github.com/comunica/traqula/commit/8f1bcfbc4a5cedde7914bc98acb2063015e2623a)
* [Fix: generate triple block also for explicit reifier in triple annotation](https://github.com/comunica/traqula/commit/6f43d0f1182a5073b57f216d07937ca20c0c0aed)

<a name="v0.0.12"></a>
## [v0.0.12](https://github.com/comunica/traqula/compare/v0.0.11...v0.0.12) - 2025-09-15

* [Better implementation of our transformer. (#55)](https://github.com/comunica/traqula/commit/baf4aacadd8ef4922dafe2ecc1dcf11c95ce431c)
* [Update actions/upload-pages-artifact action to v4 (#54)](https://github.com/comunica/traqula/commit/24c7e503d14ebc005c50cadd40996428c7983c95)
* [Merge branch 'main' of github.com:comunica/traqula](https://github.com/comunica/traqula/commit/81d41759089e9e62cbf423900fbbc0bc475a160c)
* [Update actions/setup-node action to v5 (#53)](https://github.com/comunica/traqula/commit/743f96b80aa87299d727c8991d9c475e562122f7)

<a name="v0.0.11"></a>
## [v0.0.11](https://github.com/comunica/traqula/compare/v0.0.10...v0.0.11) - 2025-09-14

* [Algebra 1.2 support - tested](https://github.com/comunica/traqula/commit/fb5b94094c8372789275c3eda410243d8f5fd155)

<a name="v0.0.10"></a>
## [v0.0.10](https://github.com/comunica/traqula/compare/v0.0.9...v0.0.10) - 2025-09-10

* [generate aggregators in uppercase](https://github.com/comunica/traqula/commit/1d457b0e884dfd06170144c7c631438587b50407)

<a name="v0.0.9"></a>
## [v0.0.9](https://github.com/comunica/traqula/compare/v0.0.8...v0.0.9) - 2025-09-10

* [Query generation should generate capitalized versions of operators](https://github.com/comunica/traqula/commit/fb8403077049ad37f7835604263fc10ac26cfcb3)
* [sparql generation of updates should not contain query separators if it is not needed](https://github.com/comunica/traqula/commit/1e79a1747ada180fdd903f4490bc5ff01fad131b)
* [support generation of empty values clause](https://github.com/comunica/traqula/commit/b381f10266200d7d326cd68f1dac8f7093d7f8fa)

<a name="v0.0.8"></a>
## [v0.0.8](https://github.com/comunica/traqula/compare/v0.0.7...v0.0.8) - 2025-09-07

* [more consistent algebra API](https://github.com/comunica/traqula/commit/7a3aa210220f5d2426f13219ba31406879c47db9)

<a name="v0.0.7"></a>
## [v0.0.7](https://github.com/comunica/traqula/compare/v0.0.6...v0.0.7) - 2025-09-07

* [fix langDir and algebra API](https://github.com/comunica/traqula/commit/ff081d1bc0e76ec07661a7093adf352f0df1a4ab)

<a name="v0.0.6"></a>
## [v0.0.6](https://github.com/comunica/traqula/compare/v0.0.5...v0.0.6) - 2025-09-07

* [fix typePatch issues](https://github.com/comunica/traqula/commit/bde39017d1f0d1a99c17d0b61584768266a6c65a)

<a name="v0.0.5"></a>
## [v0.0.5](https://github.com/comunica/traqula/compare/v0.0.4...v0.0.5) - 2025-09-07

* [Update actions/checkout action to v5](https://github.com/comunica/traqula/commit/bbaff40288a67ca33e282e96331dd7175e0e9230)
* [update engines and dependencies](https://github.com/comunica/traqula/commit/ed863fce770a2747182914c452d3bdaf37f2419d)
* [use relative paths for test result generators](https://github.com/comunica/traqula/commit/3cacfbf7d6e84caf17379a0bf73e16f0ee077252)
* [add migration docs](https://github.com/comunica/traqula/commit/6f87486253493657e198b50991a3119f50b031c9)
* [highlight requirements for release](https://github.com/comunica/traqula/commit/6e0f226103ec6648b3fd0943e2c3097df3032a2c)
* [fix typo on builtin lexer rules](https://github.com/comunica/traqula/commit/8b9e55ed6c6fdb2d347405d77c87255d2e145e89)
* [use composite TS building](https://github.com/comunica/traqula/commit/7e7a54fc71b3109f13325d417b574bb0e337274f)

<a name="v0.0.4"></a>
## [v0.0.4](https://github.com/comunica/traqula/compare/v0.0.3...v0.0.4) - 2025-09-02

* [algebra engine consistent function naming](https://github.com/comunica/traqula/commit/0dc2d826fd86ba791d52811f19bb564e055f1168)
* [Remove undefined call in SUBRULE - use rest argument for parser and generator arguments](https://github.com/comunica/traqula/commit/85f65b0a90d745ed9689533f9df3ecad31529f90)
* [reinstate type correctness parser-sparql-1-2](https://github.com/comunica/traqula/commit/33712d7fc2af872d162ec045edaf47fe86392a8d)
* [use factory in sparql 12 algebra translations](https://github.com/comunica/traqula/commit/7365adc5527a0b5b4dd260496033e2b275834289)
* [Split algebra into multiple packages](https://github.com/comunica/traqula/commit/c79afc9e483defc01cf037448976a7613bf56d5c)
* [Add documentation on lexer rules & export grammar rules](https://github.com/comunica/traqula/commit/bd90b0566d23a48cbfed7d1161eb9c815cb50179)

<a name="v0.0.3"></a>
## [v0.0.3](https://github.com/comunica/traqula/compare/v0.0.2...v0.0.3) - 2025-08-19

* [Should use config entries in algebraTransformers](https://github.com/comunica/traqula/commit/3364dda03a79bb717fa291aa0c43268fc1c0d9de)

<a name="v0.0.2"></a>
## [v0.0.2](https://github.com/comunica/traqula/compare/v0.0.1...v0.0.2) - 2025-08-19

* [Bugfix: package.json should export itself](https://github.com/comunica/traqula/commit/0a078b040d0789166f9d65899e4d5afad869d91e)

<a name="v0.0.1"></a>
## [v0.0.1](https://github.com/comunica/traqula/compare/v0.0.1-alpha.138...v0.0.1) - 2025-08-18

* [Feature: support sparql12 in the sparqlAlgebra translators](https://github.com/comunica/traqula/commit/27a69f460d9ef6d8c21c41fa2683f25b48697e38)
* [Merge pull request #47 from comunica/feature/algebra](https://github.com/comunica/traqula/commit/21b6141cabebc6a92ea7ff06967995dfa966b909)
* [Translate SPARQLAlgebra to work on Traqula](https://github.com/comunica/traqula/commit/f61c978a71b7ef4b70a271fd81e7371b3b7c44f0)
* [Version v5.0.1](https://github.com/comunica/traqula/commit/80daa84b7edcccfb03c5929d4ff14639b1e2db4a)
* [Fix blank nodes in triple terms not being converted to variables](https://github.com/comunica/traqula/commit/44f0578a335b73379be84d49da6aa55b0a17cb7a)
* [chore(deps): update jest monorepo to v29 (#94)](https://github.com/comunica/traqula/commit/544f287ba2e2c58709e6b6097816c423bda37f77)
* [Version v5.0.0](https://github.com/comunica/traqula/commit/1a425772bd1b4e68e2c7cd25dea9d29ccc720ab7)
* [Run CI on Node 22 as well](https://github.com/comunica/traqula/commit/0fb7d3a13ae8aaebc6caf50159e95f1c2e67472e)
* [Update to rdf-data-factory v2](https://github.com/comunica/traqula/commit/9e5cc1e80f8c4f860f8b548065c132f45457d51b)
* [chore(deps): update dependency @types/node to v22](https://github.com/comunica/traqula/commit/390475606e1641e3d902ba32c0f37c87cfe04d97)
* [Version v4.3.8](https://github.com/comunica/traqula/commit/2b8e92f72cc806dec36970d10a7b4ced3d36791d)
* [Put BIND requests back in query when required](https://github.com/comunica/traqula/commit/5906f36571ae6c74341eef84237d0f03cfebbd60)
* [Version v4.3.7](https://github.com/comunica/traqula/commit/5f62b872eb1d01890bf57227db188f7a783c5f1a)
* [Improve support for '$' variables](https://github.com/comunica/traqula/commit/2471689431e88a79601546561fbc979409f236c1)
* [Release v4.3.6](https://github.com/comunica/traqula/commit/53397ef6abc061ac7d5d631776ceedc29f18e13c)
* [Correctly handle grouped existence filters](https://github.com/comunica/traqula/commit/09593c6fbf88fb6cba906130ce7b4dec8956376d)
* [Bump json5 from 2.2.1 to 2.2.3](https://github.com/comunica/traqula/commit/c22dab2dcc7fe948f7214bc08e44a34f9c350752)
* [Bump braces from 3.0.2 to 3.0.3](https://github.com/comunica/traqula/commit/3c103d725335f439569948270b96e6f632ff69cd)
* [Release v4.3.5](https://github.com/comunica/traqula/commit/19365ab3b5d378dff14be9fe05df91f9003b81d5)
* [Correctly transform INSERT WHERE blank nodes](https://github.com/comunica/traqula/commit/8e46ee43f5672acdf62516ca22964852ff3ce673)
* [Release v4.3.4](https://github.com/comunica/traqula/commit/a0986a9cab622e164ba1ceb95ed06fe7fab256db)
* [Fix jest config](https://github.com/comunica/traqula/commit/3cd4b36c3b7a7123c24e66a251b23f6922f60eaf)
* [Change variable name](https://github.com/comunica/traqula/commit/a6b7f2ad3f1acff8c2e7ebca4d7274862d87ee27)
* [Prevent union input from being flattened](https://github.com/comunica/traqula/commit/0c2a35b15b4b5dcfe1f1abc4cec3892098eac801)
* [Add CI runs for node 18 and 20](https://github.com/comunica/traqula/commit/cb23ba8f45d8675b11629ec2177dee895253bb24)
* [Revert "chore: Fix dependency vulnerabilities"](https://github.com/comunica/traqula/commit/dce02a2518ca043d8ff19d004294ad919846f366)
* [Release v4.3.3](https://github.com/comunica/traqula/commit/45c14a0f46fcec8564b5f1422286f751e6d257e0)
* [chore: Fix dependency vulnerabilities](https://github.com/comunica/traqula/commit/98b995d043a42f1138c669fdf4dfe3f83178121d)
* [Keep FILTER statement in group graph pattern scope](https://github.com/comunica/traqula/commit/4bb99d7e431d236821cdbe621a943a34b952fd9f)
* [chore(deps): update dependency chai to v5](https://github.com/comunica/traqula/commit/733c8acb69dadf9c6466a9024201e37e50b56b93)
* [Release v4.3.2](https://github.com/comunica/traqula/commit/08b9e6277807cbadd64b1369cbe951691abcfa71)
* [Stop GRAPH statements at edge of SERVICE](https://github.com/comunica/traqula/commit/8082c15ff9ec1e188feec367751e75b3ff666488)
* [Release v4.3.1](https://github.com/comunica/traqula/commit/54a3015d9f3226eeadbb1c32473c4889c2a54535)
* [Correctly remove quads when joining graph blocks](https://github.com/comunica/traqula/commit/e4b56df766af13ed62c62f0aba1e2d8dd4954107)
* [Correctly convert FROM/CONSTRUCT algebra](https://github.com/comunica/traqula/commit/b74cb067cc9636e6381aaf2c041ee2bab9d78d5f)
* [chore(deps): update dependency @types/node to v20](https://github.com/comunica/traqula/commit/3b72a4be3049c79e1879f62061526990388bdbb7)
* [4.3.0](https://github.com/comunica/traqula/commit/b7fb97c9652a0fa7a02ad70ecdb74b6eb92fce2c)
* [Allow metadata to be attached to operations](https://github.com/comunica/traqula/commit/6b852505239a50eddc795c627ecfe51506a3e0b4)
* [chore(deps): update dependency @tsconfig/node12 to v12](https://github.com/comunica/traqula/commit/f8fbb656be7c220c24c96c0a5dd691c717c6f6f7)
* [4.2.0](https://github.com/comunica/traqula/commit/93a9bc68d6ab2d09e6fe92a848b42c7b4179aa3b)
* [Update to sparql.js with full SPARQL-star support](https://github.com/comunica/traqula/commit/11c6b275a9f80b312e23381a3d86d75c183c721c)
* [Update to v4.1.0](https://github.com/comunica/traqula/commit/f95efa6b8c53c5b76ab13130a0e65c4bdfa48162)
* [Make mapExpression public and map expressions](https://github.com/comunica/traqula/commit/13a81842f1ba02b5e723af5f09da5cfbaf090576)
* [chore(deps): update dependency typescript to v5](https://github.com/comunica/traqula/commit/cabed3283eabe3b3a75312f37f130c4198d765a3)
* [chore(deps): update dependency @types/node to v18](https://github.com/comunica/traqula/commit/4393d865f49ea886ff1790985594e44597168307)
* [Update to v4.0.5](https://github.com/comunica/traqula/commit/8c9dde5f57c032c14a656f1b1e1d459a750f6eee)
* [Include source map files in packed files](https://github.com/comunica/traqula/commit/aed9a59487b0c9b6e48646afd433c5ea26cfeb69)
* [Update to v4.0.4](https://github.com/comunica/traqula/commit/3aca52af1447b9907b7546f7e8f012bb049c627f)
* [Update jest dependencies](https://github.com/comunica/traqula/commit/a677ff80110c2468f3c74daeb8778c73b9177473)
* [Update actions/cache action to v3](https://github.com/comunica/traqula/commit/7d946e6409b35cb233e6e2857d6ba2f6c73986b7)
* [chore(deps): update actions/checkout action to v3](https://github.com/comunica/traqula/commit/00ba0c25a5d36e0319929b83f0b6dbabda20e040)
* [chore(deps): update actions/setup-node action to v3](https://github.com/comunica/traqula/commit/8b0cfed5c5d9f0e468561b5359ba104db74f28ce)
* [updates sparqljs to v3.6.1](https://github.com/comunica/traqula/commit/30b1dbd753e81f0d7709fd83aa19f43294b87e39)
* [Update jest monorepo to v28](https://github.com/comunica/traqula/commit/2ec838710c1cc7833cda260e848e34bd875de6b1)
* [Update to 4.0.3](https://github.com/comunica/traqula/commit/9295b0d617644f9a37bfbcc7dbfa7d8e882bc5b8)
* [Update dependencies](https://github.com/comunica/traqula/commit/535cb1bbb8f2c3ac3b45f7bb9024fb5df0b772c4)
* [Update to v4.0.2](https://github.com/comunica/traqula/commit/a7c5d3864dcde81a6256acbe4cfebe090c5a81ff)
* [Correctly handle variable scopes in projection](https://github.com/comunica/traqula/commit/b8866ba53bd691a4d4b0da699bc1b9eb6314adff)
* [Update to v4.0.1](https://github.com/comunica/traqula/commit/0c4facc249f757e6a015a01ad22c849a5eef16d4)
* [Add NOP to list of Update operations](https://github.com/comunica/traqula/commit/bf354d3ff184a11ee7ad3b22f482443a67b33006)
* [Update to v4.0.0](https://github.com/comunica/traqula/commit/9429c52a3031aeaaea4e7517f1ee420072a72096)
* [Make several typings stricter](https://github.com/comunica/traqula/commit/d367787b928c8e6d4b40472ebdacbb891510a664)
* [Update typings](https://github.com/comunica/traqula/commit/4b197ab5d7421c3bf1c22373d1e7619700aa416f)
* [Add missing jest config](https://github.com/comunica/traqula/commit/84da2b4117a5b10a2b8bde032386290056a3e9ae)
* [Use jest as test framework](https://github.com/comunica/traqula/commit/d4f4e4e4dd48ba4112c321578af0f34e43bf52ac)
* [Update dependencies](https://github.com/comunica/traqula/commit/0abe4294df938bda9a9b29eb89238958f30758b8)
* [Update README](https://github.com/comunica/traqula/commit/cb767a4b1114c2cb61b800c9c4abcc9d1f9ede08)
* [Fix typing issue](https://github.com/comunica/traqula/commit/4edd2c237e2211e74bbbc5cfb75e8a6d6fc0b4b2)
* [Improve array pushing in flattenMulti](https://github.com/comunica/traqula/commit/05001addaa4cafbff41055ca07630388585b204d)
* [Make Double extend Multi](https://github.com/comunica/traqula/commit/1a49aa98ccf28378d7480db4c017fb6e7c101b06)
* [Allow algebra flattening to be disabled](https://github.com/comunica/traqula/commit/2fb82568bbc5ec72986eee27d770ad930f32a91e)
* [Enable TypeScript strict mode](https://github.com/comunica/traqula/commit/9343394bb6d2d5d3a080f3b1b56291a743750d5b)
* [Update to v3.0.3](https://github.com/comunica/traqula/commit/e8a7655c34843cfddc3015b9a20c0bc331e77406)
* [Remove unused `util` import](https://github.com/comunica/traqula/commit/94d9dbe1688da60bbc52d49d89fa139b9911151c)
* [Move internal `@types/` to `devDependencies`](https://github.com/comunica/traqula/commit/79b7294f0f22065aac398ab434733920555f8544)
* [Ensure flattening of multi operations in factory](https://github.com/comunica/traqula/commit/68e5466e54eef148905239be638458c955cbae20)
* [Update test files to array-based operations](https://github.com/comunica/traqula/commit/b9a2102e24bce1f73e47553e70b82e48e884c48e)
* [Convert applicable binary ops to n-ary](https://github.com/comunica/traqula/commit/8bd1efaa00d53e5afeb83ec865249cdc9ec50be3)
* [Add helper script for regenerating test JSON output](https://github.com/comunica/traqula/commit/ff1893675d218f6af0aaeed51b840f7e75da9d41)
* [Update to v3.0.2](https://github.com/comunica/traqula/commit/166ec7c9ad40d927a957ce72e2257aa5410b7eab)
* [Update types and CI](https://github.com/comunica/traqula/commit/910404cc0aad011dfe6846c9aa2d6974733d69f7)
* [Update to v3.0.1](https://github.com/comunica/traqula/commit/566497f792a72ad797d98dcb8bc7a5e795302302)
* [Update package-lock](https://github.com/comunica/traqula/commit/37dc87495d17c39afae1345995159045684385a8)
* [Remove link to test folder](https://github.com/comunica/traqula/commit/a6ff13d8a8523f700eeb30bbe7763e18a9a49320)
* [chore(deps): update dependency @types/mocha to v9](https://github.com/comunica/traqula/commit/35ce970c43172075e3148cadca727ac20054f6fa)
* [chore(deps): update dependency mocha to v9](https://github.com/comunica/traqula/commit/4768da5a49296e6eb6f5fd908afa7ffe6e717b40)
* [Update to v3.0.0](https://github.com/comunica/traqula/commit/d5ad2d3cc0ea34941621d802984e3ca06a48ae26)
* [Use Sparql.js typings](https://github.com/comunica/traqula/commit/1641787b5f79b3bb9bdfcce154feb9b2ed4b1944)
* [Update dependencies](https://github.com/comunica/traqula/commit/ef37459a2f5072a1b1ac5dbdbffcd5f75a5b4b6a)
* [Use string templates](https://github.com/comunica/traqula/commit/95287e2ca2b15c342f914775c9ea005858cd3fe2)
* [Improve algebra typings](https://github.com/comunica/traqula/commit/3e107be2321f55d87d24229bc91d96a24fd1e42b)
* [Add NOP operator](https://github.com/comunica/traqula/commit/229669ae3978818adfdfbb738b21605a6107fbb6)
* [Only overwrite default graphs when recursing](https://github.com/comunica/traqula/commit/7b5f129376b62dc7250cc9b9bd02c2603935f8e4)
* [Only overwrite default graphs when recursing](https://github.com/comunica/traqula/commit/f6c99db375e55de701642ce74e66195acad47512)
* [Update to v2.5.4](https://github.com/comunica/traqula/commit/15429cc79ebf0728d1a70ac8c590b568db490bf1)
* [Support empty queries](https://github.com/comunica/traqula/commit/ff2fb9b374a70007f793ed4ed5f81131b5e50e66)
* [Use GRAPH instead of FROM for WHERE statements](https://github.com/comunica/traqula/commit/282896d09f87cab06ca0ca8086d44edc8ec2a739)
* [fix: Keep blank nodes in INSERT operations](https://github.com/comunica/traqula/commit/b1ddc9dd0b3bc2c5ee4d2fa6eafa34e3696ec27a)
* [Update to v2.5.3](https://github.com/comunica/traqula/commit/38801050f74ab4341386958589e99ef55911738a)
* [Fix bug in toSparql when joining bgp and path](https://github.com/comunica/traqula/commit/f79eeffc14f828d4ad2312a9b291b575893078d5)
* [Update to v2.5.2](https://github.com/comunica/traqula/commit/dacc34c5b9387cb58ad3625e2bdbc32ae6b62692)
* [Fix MINUS bug with single pattern](https://github.com/comunica/traqula/commit/3f6fe4703422d0c177a864ad040621ba8575fbb6)
* [Update to v2.5.1](https://github.com/comunica/traqula/commit/08b535bde73e8764e2d98b0755ca6cb682375c7d)
* [Update dependencies](https://github.com/comunica/traqula/commit/15d255ea60079db831048ffbd94396507575273d)
* [Update README.md](https://github.com/comunica/traqula/commit/a841fb0e41ac2f888bea7c84e9acfbb0bcbfa60a)
* [Update README.md](https://github.com/comunica/traqula/commit/287d12c66ad3f353015fd2ce8d673482393874f2)
* [Update to v2.5.0](https://github.com/comunica/traqula/commit/166ae76893beae3e18b07e6e04142c1a55bcd464)
* [Add where field to DELETE WHERE queries](https://github.com/comunica/traqula/commit/5c48bae40bd83989f4c8d07a8379dbcae3a59bd6)
* [Update to v2.4.0](https://github.com/comunica/traqula/commit/55019cb6b07193d7ba9b78badfca492a34007a69)
* [Apply --strict flag to reverse conversion as well](https://github.com/comunica/traqula/commit/780db20e70482dcce406877a7ee2b8aa674a9a76)
* [Update to RDF*-enable data factory](https://github.com/comunica/traqula/commit/a44bb4da74614ca451174e2f91cb0b1b44d1d1b4)
* [Add --strict flag to disable SPARQL* mode](https://github.com/comunica/traqula/commit/e7e0fb046d3ca32c8d182de7b0e84f9ebb45b499)
* [Handle SPARQL* queries](https://github.com/comunica/traqula/commit/b11fa71d34dd7bb6a32d203d032264222aa9abe2)
* [Update dependency typescript to v4](https://github.com/comunica/traqula/commit/2c9e2f792ded23203c1fd88b9e972535e6c9aa0d)
* [Update dependency ts-node to v9](https://github.com/comunica/traqula/commit/1bfc6659e3e2502ceca0399a8cc2370a6c3717a7)
* [Use sparqljs 3.1.1 and update to v2.3.2](https://github.com/comunica/traqula/commit/f3312907b2e70f274cbb78116ee3ece5d426d8d7)
* [Remove testing support for Node 8](https://github.com/comunica/traqula/commit/209bf5554932fab853cc60e1f2db91577c2ea334)
* [Update dependency mocha to v8](https://github.com/comunica/traqula/commit/c8f120139bc6ca0658737f2f656dfb4f4bbb7b2d)
* [Update to version 2.3.1](https://github.com/comunica/traqula/commit/e0b5cd7956649e86494c611185913f4ef4c90d2b)
* [Simply delete/insert operations](https://github.com/comunica/traqula/commit/1ebf588d33d2c280e729a6bc545977d6a875c355)
* [Update to version 2.3.0](https://github.com/comunica/traqula/commit/35c0c118768c273e3ade73383983a4de73619b56)
* [Support SPARQL UPDATE](https://github.com/comunica/traqula/commit/0b709c1edd50af62e6882030da2f896ed8861279)
* [Update to version 2.2.2](https://github.com/comunica/traqula/commit/f0d67a1c79c876df65af77dc6fdee99ae9fca57a)
* [Fix graph/aggregate bug](https://github.com/comunica/traqula/commit/4ae9b5ea09a793a1a122e15061c272d8a41efd86)
* [Update new RDF typings](https://github.com/comunica/traqula/commit/30ba505aeb79e27b29b50abe970911001e5f77d9)
* [Update dependency @types/rdf-js to v3](https://github.com/comunica/traqula/commit/6a8e32931923b03f637a1e50232823bb8a7a9ad4)
* [Update to v2.2.1](https://github.com/comunica/traqula/commit/11e543ab3bf558ea40ee998643a19a2d0c8a7c96)
* [Fix bug when using slice on construct queries](https://github.com/comunica/traqula/commit/5612a98f9417a3263fe1bed401a430daf51a43de)
* [Update dependencies](https://github.com/comunica/traqula/commit/de3d211f611af8773a79b6e1fb5a8ebe5c59d271)
* [Use renovate instead of greenkeeper](https://github.com/comunica/traqula/commit/861d7fee66bf7d2fced556162d4c7355c3b13233)
* [Update dependencies](https://github.com/comunica/traqula/commit/87c0f10efdea40f2f67538917b232c4455551d7e)
* [Update to version 2.2.0](https://github.com/comunica/traqula/commit/368c96d7b564e388653affab249d48ae095d1c70)
* [Update dependencies](https://github.com/comunica/traqula/commit/cab447816c9a221f5765d862e2b142b6c7954f58)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/baf9110c8f0044c237bca4d364c60758419c5d40)
* [chore(package): update @types/node to version 13.1.0](https://github.com/comunica/traqula/commit/11e9be3e16b99cc8a0cdfd63f16d7725c6dbe2f7)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/53851e4697ea3bbd0e0e00c8ed80d4894475ce79)
* [chore(package): update nyc to version 15.0.0](https://github.com/comunica/traqula/commit/0235daed215a0db64fe025264f8765b30bd16824)
* [Handle variable graph names when creating quads](https://github.com/comunica/traqula/commit/ce31165ff524718f1f28b539eb4313c6f3d59c56)
* [Remove unused dependency](https://github.com/comunica/traqula/commit/2bd6baabdf95a7c8aa3a55d7bea2ffb0c3ac054d)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/1070aaacdf72c58b76dd2f847f0e79406c4263a8)
* [fix(package): update fast-deep-equal to version 3.0.0](https://github.com/comunica/traqula/commit/ace9a3008ee28995230eaec26888fb6283aef12e)
* [Update to version 2.1.0](https://github.com/comunica/traqula/commit/a6225e4d290d6328cfc508cd970905d3f25292a0)
* [Create exception for wildcard typings](https://github.com/comunica/traqula/commit/0d2945568ab65dbf5739cf7419b6cef094f93040)
* [Create separate types for Wildcard and GroupConcat](https://github.com/comunica/traqula/commit/59236d3c9d339d86886ec367785d3ec421e8f364)
* [Update to version 2.0.1](https://github.com/comunica/traqula/commit/9c7b874af12b045b33aac7a9180b238d02479711)
* [Update to version 2.0.0](https://github.com/comunica/traqula/commit/215c9e62d628d4ab509ce286d432650d2d713ea5)
* [Remove lodash from non-dev install](https://github.com/comunica/traqula/commit/731b15bec8d74672e17a2674d969d2f8f7b5b690)
* [Support SPARQL.js 3.0.0 (now uses RDF.js)](https://github.com/comunica/traqula/commit/bce39110c20b23f215600d7e4c62055eeedac07d)
* [Change imports back](https://github.com/comunica/traqula/commit/28aa4c14bc51a384d26420b21e0805c85a8d0739)
* [Refactor so it accepts Wildcard type](https://github.com/comunica/traqula/commit/dda19f7db12a8b7bcdb2cf666f5e1d0924fee2bb)
* [Change imports](https://github.com/comunica/traqula/commit/ea4310b1347cefa413cac27ec7d0c9d0f3da4eac)
* [Restore import of sparqljs](https://github.com/comunica/traqula/commit/ef5805718751d88cc0ad7be36bdbc15564afda50)
* [Code cleanup](https://github.com/comunica/traqula/commit/67d857e8e6e0035af59b4be885574be1f5d18934)
* [move isTerm to util so sparql doesn't depend on sparqlAlgebra](https://github.com/comunica/traqula/commit/47cdf12d5e5ff396ecc4421f1a06f748b9866470)
* [Remove console.log](https://github.com/comunica/traqula/commit/fcf5d8c803fab575be9fc7adcbe42094ea365628)
* [Refactor replaceAggregatorVariables](https://github.com/comunica/traqula/commit/53180425df3ca73c56381960a0b5605b0be100a7)
* [Update conversion to having to work with Terms](https://github.com/comunica/traqula/commit/4f8d5e852f7149372ef302ad0191ad954049ebc8)
* [Fix translation of bgp triples](https://github.com/comunica/traqula/commit/7b8a76632803230277cfb2187e54466a72434213)
* [Fix template not getting translated](https://github.com/comunica/traqula/commit/c525d84f12bd48c21140e0e076a07c4d2c34fa28)
* [Fix algebra making '*' into namednodes](https://github.com/comunica/traqula/commit/9b9a9ece614f8768bc6b2c523eeb66a2c29f6d95)
* [Remove redundant conversion to string](https://github.com/comunica/traqula/commit/eeec611247891871e0af6c8d7458f22585223114)
* [Avoid checking termType on undefined](https://github.com/comunica/traqula/commit/9395bd48cdade59d2c26a8ea65d6621bbee28821)
* [Fix unknown expression '*' error](https://github.com/comunica/traqula/commit/208272310b3bc8dcadd150dd949f82ad99f4d28c)
* [Fix incorrect test output file](https://github.com/comunica/traqula/commit/ae582c51a302cf82e061cef7851acfb60f6f2697)
* [Use the same map for both types in canonicalize](https://github.com/comunica/traqula/commit/406b65fe73682e932e5be4be98bf65b9ba5f9ee4)
* [Implement canonicalizing of variablenames](https://github.com/comunica/traqula/commit/e747d35304678c1c902a33e48a67844128b36ba7)
* [Fix incorrect use of createTerm & other problems](https://github.com/comunica/traqula/commit/fc50cabddabaeccd2fed0df1c7b37e402bb5f57b)
* [Update how the variables array is filled](https://github.com/comunica/traqula/commit/66c8c27b0239604fb936320944d12da2dd4d3c3d)
* [Put canonicalizeQuery in test utils](https://github.com/comunica/traqula/commit/193b48d951bbb7d73d7354b2291595f361a2b68b)
* [Implement a way to make tests with bnodes succeed](https://github.com/comunica/traqula/commit/65be21b5434e4226265d2ef27fdedec471b680e0)
* [Fix test](https://github.com/comunica/traqula/commit/538835a54ff0074fc4093ce1cd5189d317dd44b7)
* [Fix test](https://github.com/comunica/traqula/commit/cf7ca2f0400ece3c6d7569bf601dc269471a892b)
* [Make replaceAggregatorVariables handle Term as input correctly](https://github.com/comunica/traqula/commit/32c7e28e323e8509e2bd9534b42ef55028f60f5b)
* [Fix 'where' part where type is project](https://github.com/comunica/traqula/commit/6d0b39f31937b74f0e342e8eba4a362eb2f8ea21)
* [Fix 'group' part where type is project](https://github.com/comunica/traqula/commit/e13a5cd6f3f6d70930a34842f6f6a9141186beee)
* [Add e_ prefix to JSON representations](https://github.com/comunica/traqula/commit/ba37d8533925c387e8f7e2ae1d500b7a9309acc3)
* [make sparqlAlgebra expect Term instances](https://github.com/comunica/traqula/commit/2be55a963b795ebb0ec48998000bf4db5fab4a33)
* [Update README.md](https://github.com/comunica/traqula/commit/4ab0ecb15a24e7acf1ab2ea5c739d60aa65d7dc3)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/62bace8db2bef32f97173221caf22a300a0f5bd3)
* [chore(package): update @types/node to version 12.0.2](https://github.com/comunica/traqula/commit/ccce6ba565f14a9ce50b25a5676189ed82a8820c)
* [Update to version 1.5.2](https://github.com/comunica/traqula/commit/3b9fa9c71791338bf36eced669735e433fa79dc7)
* [Fix blank nodes in CONSTRUCT templates also transforming to bnodes](https://github.com/comunica/traqula/commit/0f334c82a879ae9fadbb4b23783166322862fc66)
* [Update package-lock.json](https://github.com/comunica/traqula/commit/cb6fa2aa7ba97e15e996a3c2d4155541ea1ae1c4)
* [Re-enable nyc coverage](https://github.com/comunica/traqula/commit/3f3806aba494704109a9cd0821425860004751fc)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/29ca8334cff131347575a0582ec56b81241064ba)
* [chore(package): update nyc to version 14.1.0](https://github.com/comunica/traqula/commit/ece1cdbc956d70bfa125b92ca627554719d05793)
* [Update to version 1.5.1](https://github.com/comunica/traqula/commit/77429c0ffbcd249687d8d9689cbd3eefecc8b994)
* [Correctly support BGPs with multiple graphs](https://github.com/comunica/traqula/commit/2fb0bd4f12337af051efac1ac3c93c44ac94888f)
* [Add CLI support for algebra -> SPARQL](https://github.com/comunica/traqula/commit/70aaaf89c3a253c173c8bb2d4d09be8fa68f3358)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/f6aef8c560c9a43496954b5b220acd7b866a2434)
* [chore(package): update mocha to version 6.1.1](https://github.com/comunica/traqula/commit/27c6577350f9e2484e61b72883c379abe5fec653)
* [Update to version 1.5.0](https://github.com/comunica/traqula/commit/bbb6a5bb16204610a6d975d8b94136c8df6fc418)
* [Support GROUP BY operations without variable](https://github.com/comunica/traqula/commit/c0245d7c1554345a043e25636089add5a8052712)
* [chore(package): update lockfile package-lock.json](https://github.com/comunica/traqula/commit/21e0f92c0c38d03765bd8f3320ee59525f59b44e)
* [docs(readme): add Greenkeeper badge](https://github.com/comunica/traqula/commit/4f4eafe527a74ec4e36e2adf6691db3cbf343f5a)
* [chore(package): update dependencies](https://github.com/comunica/traqula/commit/088d299f5f029f6e8d85589da1494ebd704b4f7e)
* [Set target to es2017](https://github.com/comunica/traqula/commit/eb4c2c24a75e6cb46eaa5b4894ef5d97cb95c5e1)
* [Add travis](https://github.com/comunica/traqula/commit/cfa091bd598a1c6078683500fb577c1e0a81adbd)
* [Update to version 1.4.2](https://github.com/comunica/traqula/commit/99d22c2ce4c0bc14de789a506ef53f4fbfd1ddd7)
* [Update SPARQL.js version to fix negation bug](https://github.com/comunica/traqula/commit/8cd5c2cad22384f223fa495c3f2288669992351f)
* [Update to version 1.4.1](https://github.com/comunica/traqula/commit/f859d5e5b97ee555686d22cf021cd2f75e260d2b)
* [Fix command line parameter](https://github.com/comunica/traqula/commit/7f538e27b2ca38545bddcb34b19586166ef7370c)
* [Update to version 1.4.0](https://github.com/comunica/traqula/commit/a5f346398e106139df84a12fa4950c7cd315c8b3)
* [Fix indentation](https://github.com/comunica/traqula/commit/15a7a6baf6f130e5658c20a617e210a928b74e2f)
* [Add option to convert blank nodes to variables](https://github.com/comunica/traqula/commit/6900e2a987fcde8a3922edec76942ec3d64619b9)
* [Update to version 1.3.1](https://github.com/comunica/traqula/commit/3077092c78cd468797e87d71690a3257c32b12da)
* [Update to version 1.3.0](https://github.com/comunica/traqula/commit/8ace227e03744312503b9777ea35f207062b7406)
* [Fix createPattern type contract being too strict](https://github.com/comunica/traqula/commit/7ad17e15cf25de7e7cb3e58561468efe0e66cdec)
* [Update to version 1.2.0](https://github.com/comunica/traqula/commit/3ad3984b733e2ca749d5edb0723564de6261032b)
* [Update to generic RDFJS typings, Closes #31](https://github.com/comunica/traqula/commit/f37259e680f3fabc0278bc015390368e57378038)
* [Update to version 1.1.0](https://github.com/comunica/traqula/commit/164662550dde5e911783ef889f6fe408ae3311a1)
* [Support negated paths with single predicate](https://github.com/comunica/traqula/commit/c2f6b803938709ab29bc132fa930a90f0922db79)
* [Fix invalid DefaultGraph being used in path expressions](https://github.com/comunica/traqula/commit/92ed8fa579c472104cb088b85c29878951fe6d74)
* [Add util documentation](https://github.com/comunica/traqula/commit/9720a728902ebca00419b8f3af4a48c4a71b1406)
* [Update to v1.0.1](https://github.com/comunica/traqula/commit/dd7ed2c0f807e523096610d21406fadefb2ee9a2)
* [Fix typo in package.json](https://github.com/comunica/traqula/commit/cd73d6db1ef3af1fc2d711b4de400f5a8be732a5)
* [Rename Factory.ts to factory.ts](https://github.com/comunica/traqula/commit/7ee7037c89e800c06513d97c6646882a0af7fa8a)
* [Created util class for helper functions](https://github.com/comunica/traqula/commit/80aa7e1f41c317f074b3110d976fc1b84a7f2a43)
* [Update to version 0.7.9](https://github.com/comunica/traqula/commit/359d648511bc9b2994e711d4b5378a2a7749b380)
* [Bump to @rdfjs/data-model](https://github.com/comunica/traqula/commit/73d2c0bd91425e25638a8c8eea7ef4ef61419524)
* [Update to version 0.7.8](https://github.com/comunica/traqula/commit/64b49005a6140ebe37ddd297a61ec166d79384b5)
* [Create function to travel through algebra tree](https://github.com/comunica/traqula/commit/d208ff9be9e826288a6f5f04694ceaef6a569528)
* [Update dependencies](https://github.com/comunica/traqula/commit/43a97b6e88ebcadf446b83bacff292ef9d85abc2)
* [Re-add createBoundAggregate function](https://github.com/comunica/traqula/commit/de0a85421210df99dbc729cae5819496b153e56c)
* [Update to version 0.7.6](https://github.com/comunica/traqula/commit/aa062e0fe9117f1986b86fed64b63936df1869ce)
* [Increase code coverage](https://github.com/comunica/traqula/commit/72fab5b06aec825ba6bbfdf36bec09bff27077d1)
* [Restrict Path predicates to Property path symbols](https://github.com/comunica/traqula/commit/fd51ce20bad2cf8cf10a40b22fbd61ecedc947df)
* [Updated to version 0.7.5](https://github.com/comunica/traqula/commit/95731a4a098f5444f146d1df272aae86ace433b2)
* [Added support for FROM (NAMED) keyword](https://github.com/comunica/traqula/commit/439791c0a778c8325c21384b35abd5cdb22b97de)
* [Added support for SERVICE keyword](https://github.com/comunica/traqula/commit/ce9de4910eb9d8932826f975fd712157e37d4b31)
* [Removed unused types](https://github.com/comunica/traqula/commit/999ac93b8f5491c72234a30d16c3f5ead834be4a)
* [Various bugfixes](https://github.com/comunica/traqula/commit/d05e9365604dc23408df696b182b22395bb96efe)
* [Update to version v0.7.2](https://github.com/comunica/traqula/commit/641798e8b862c45e1ff5c0461355514efaff3ee0)
* [Support star operator in DESCRIBE queries](https://github.com/comunica/traqula/commit/13d7648aea9aeb968f361b178443fbec76729799)
* [Make dataFactory parameter in Factory optional](https://github.com/comunica/traqula/commit/c2d93fd6016f8c768b2a310522c2afbd8871fd5f)
* [Update to version v0.7.0](https://github.com/comunica/traqula/commit/504326e810c2444bea5ed76678786f92f1559a4a)
* [Support Quads when converting back to SPARQL](https://github.com/comunica/traqula/commit/d25e2111fb1ffb62bf75f8dd94381e3ce41efe3f)
* [Various fixes + better testing](https://github.com/comunica/traqula/commit/825693d1282a22c1d1191ad1a0213cbe8ea725c5)
* [Don't simplify groups](https://github.com/comunica/traqula/commit/33a52787896418e281ea1284a8d7b081de5a04b4)
* [Convert algebra back to sparql](https://github.com/comunica/traqula/commit/0b9215e46ec55809042a3ce2c77a2a4b3f47feb5)
* [Allow generic test folder structure](https://github.com/comunica/traqula/commit/cee4afc19d7c46d24f86b4d8ee42dd41451ea42b)
* [Reworked tests to have separate files](https://github.com/comunica/traqula/commit/f2e18ed4ddb333867078553b85062cd46b40e231)
* [Add support for external prefixes & base IRI](https://github.com/comunica/traqula/commit/b342e0a61d7e14083aa3a565491322dbd733f80b)
* [Release v0.6.5](https://github.com/comunica/traqula/commit/fb412fb730f29321378b712f0b4b33ebee424fbe)
* [Support ASK and DESCRIBE queries](https://github.com/comunica/traqula/commit/3a8440195e22fdbe9a5e22930c6b8754cd87d668)
* [Apply slice before applying construct](https://github.com/comunica/traqula/commit/54ab8f2e5e1944863e50cf7596f8eaf376c22c99)
* [Use rdf-string for Term generation](https://github.com/comunica/traqula/commit/91b72ce20984a3469f9c2f07e2bb10fd7fdb7a89)
* [Also use DataFactory for NamedNodes](https://github.com/comunica/traqula/commit/2dde73cf32861405b3ba3e3b6ac3cdb204353d86)
* [Really remove lodash this time](https://github.com/comunica/traqula/commit/9cc6e6238a2f07f78c9bc7d082502cbc5cc850dd)
* [Factory](https://github.com/comunica/traqula/commit/2d77496729b4137c4cc5d4387691db04e4676e63)
* [Update to version 0.6.1](https://github.com/comunica/traqula/commit/b64356dff953f75da5b368a850804875e8763efd)
* [Add default DataFactory](https://github.com/comunica/traqula/commit/388234d8751d8144577a34d7c645218388cf436b)
* [Update to version 0.6.0](https://github.com/comunica/traqula/commit/214f1c7df1dacb0afed09825eff77ec59bc71285)
* [Reduced lodash dependencies](https://github.com/comunica/traqula/commit/e26577235c5b8808dac5fda70507110328fb29f3)
* [Make Factory require a DataFactory](https://github.com/comunica/traqula/commit/cf0de99e08c5924da2216d88affe8be57def1e39)
* [Added support for distinct results in aggregates](https://github.com/comunica/traqula/commit/f113172dc0d1c7beb60ebf0397f090f4efc94b36)
* [Fix for group by statements using 'AS'.](https://github.com/comunica/traqula/commit/eb8aafac2d75831ae2a0160572fc28d7dcc28537)
* [Remove project function from construct results.](https://github.com/comunica/traqula/commit/278121363bcac8a20522c089cb346a80d31152ec)
* [Link to correct bin file](https://github.com/comunica/traqula/commit/4885a3c598c572bff046b284ee246700c1d5536c)
* [Fix missing tsconfig includes](https://github.com/comunica/traqula/commit/7ed4345089dc2729f57040212763c3263efc01be)
* [More cleanup](https://github.com/comunica/traqula/commit/6fbfe5d1dc7c421e88af5085889f16adb8033985)
* [Update version number](https://github.com/comunica/traqula/commit/795dc90f2bf40eb2804210355e39d288263a38b2)
* [Support construct queries](https://github.com/comunica/traqula/commit/18ae9f595fb021f7440c635047cd53bdcea2378f)
* [Cleanup](https://github.com/comunica/traqula/commit/ff0945b1e519f47b81a45566b0a071ae6bfec648)
* [Use Maps for values](https://github.com/comunica/traqula/commit/9c735e4cabf2193179f316911c2793d72d8a3101)
* [Update .gitignore](https://github.com/comunica/traqula/commit/96d93032a5ef819863ddf0e649985190827949a0)
* [Removed old code](https://github.com/comunica/traqula/commit/3f3660a5ee228f498099f6d49d04cfac80e32e40)
* [Support for aggregates](https://github.com/comunica/traqula/commit/ddb746f0e6efc6f1e08ff7244b9fbf613a3a42fc)
* [More WIP](https://github.com/comunica/traqula/commit/4b46c3572237c8fa7b8e3aff134270d52a30cd30)
* [WIP rewrite to typescript](https://github.com/comunica/traqula/commit/e63083594fc2e6d363d301ed1979c1dc370368ad)
* [Add expressions to Factory](https://github.com/comunica/traqula/commit/3afd5d965928ac4c87b48066b3ea964dbb9f2c5b)
* [Factory to create algebra elements](https://github.com/comunica/traqula/commit/f7e73a73666525fef3146e8f1112147bdfcb968a)
* [Remove unused typings](https://github.com/comunica/traqula/commit/5126261c216a6c16babbe071b6399c3699e061b2)
* [Add CLI tool](https://github.com/comunica/traqula/commit/981021833c9b2f38fafaebdc6b542ad995883b9b)
* [Fix typescript complaining about missing signature](https://github.com/comunica/traqula/commit/78f68dbce49d4d51db3191120972ef12d1efa8fb)
* [Increase version number](https://github.com/comunica/traqula/commit/62aaaa7e3adfea40cd07a86be9cb5f121966bfbc)
* [Update exports](https://github.com/comunica/traqula/commit/256f2cfa3562e78bad9e203f3c8b33d43e2ede02)
* [Updated expressions to generalize terms](https://github.com/comunica/traqula/commit/1bb15f6ef1971a007ad416b3e41939adc567b5d6)
* [Output terms in RDF.js format](https://github.com/comunica/traqula/commit/c4d828c2c5e5b7734fa197ea4a580a9092ce3dc5)
* [Use rdf-js types in type definitions](https://github.com/comunica/traqula/commit/b3e016f0cb2c028be12d930d5f43f5f83c20630b)
* [Group TriplePattern and QuadPattern into Pattern](https://github.com/comunica/traqula/commit/c96c4297fd58d8b9ca9439c9b481ea13e519b213)
* [Fix unusable TypeScript typings](https://github.com/comunica/traqula/commit/5fbd8a50614dfeeb24ef4355be97d80e7cdf3bf1)
* [Update version number and readme](https://github.com/comunica/traqula/commit/4c7e5283bb759de6864d9bd8787c26ca3d79e431)
* [Add support for quad algebra](https://github.com/comunica/traqula/commit/e5b8ec6c8e46eb2200e04854d4ce264d76ab2ca0)
* [Rename Operator to Operation](https://github.com/comunica/traqula/commit/a5569d50b7157a82235f9e24239b4ea6832a4814)
* [Delete ignored file](https://github.com/comunica/traqula/commit/7c5540d616e9018c4f7bfa6fae4996a59fd881df)
* [Fixed some typings. Rewrote util.js to typescript](https://github.com/comunica/traqula/commit/6bcc71195d215e4544992f70f5fc8c6e360f9cc0)
* [Export index types](https://github.com/comunica/traqula/commit/3779fd5f047abbc6dc810cdecb32c408db2772f5)
* [Remove ignored .js files](https://github.com/comunica/traqula/commit/3d34d43880ef24cb20a4bdaea5327b8d3000174b)
* [Readme](https://github.com/comunica/traqula/commit/f1e6f9756af367e48374ea306d5aeed9c0620ed8)
* [Change Algebra to types. Put name in lowercase.](https://github.com/comunica/traqula/commit/51ae2f8494fe8922af65ae85df0183cc69715f9c)
* [Added typings for translate function.](https://github.com/comunica/traqula/commit/e768a323eb9a411c94c4c3615f94c922b611b856)
* [Rewrite to match typescript types.](https://github.com/comunica/traqula/commit/f356ac05a07996607866dafa941ea04740229c72)
* [First TypeScript classes](https://github.com/comunica/traqula/commit/46a58d2e62464aa4d5ab712d6a1f7f6cf9b2e808)
* [Remove jena conversions due to changed structure](https://github.com/comunica/traqula/commit/7e31d38224ff16dc5512b7b1e3fe4b360cf4e0d0)
* [Increase version number](https://github.com/comunica/traqula/commit/ae87f89ad064828154bcd4b7e71acfdca9680586)
* [Make separator a field of group_concat](https://github.com/comunica/traqula/commit/669802bce0298ecf3fc40c570d6d3eaddf7d47ad)
* [Introduce notexists function](https://github.com/comunica/traqula/commit/dfb7f2b4f175e8cc75a81d89b50f9b9068bee8df)
* [Replace 'op' with 'body'](https://github.com/comunica/traqula/commit/653b72f8d5d832c91c67dedfa63a61f2982047d7)
* [Full restructuring of result object.](https://github.com/comunica/traqula/commit/9d218ce664cdc88e746cf6a95902fef152dd6fc5)
* [Use underscore for default LIMIT value in Jena](https://github.com/comunica/traqula/commit/3059d3e173d785553a2308fd6a8d952b0a5833db)
* [Merge joins for Jena](https://github.com/comunica/traqula/commit/38977fcdc0c3e8bafe610f425248488dc5ff3fb4)
* [Change output for predicate paths](https://github.com/comunica/traqula/commit/45c02cc4a881a3725d1cf069cf1e3f69b9c3974f)
* [Also translate unknown entities](https://github.com/comunica/traqula/commit/aa74f41c448ebb46344c25eb79affb887da40ca1)
* [Some jena translations](https://github.com/comunica/traqula/commit/58afb3689fee33c2fd2711c15b9dcfc46cfebad9)
* [Change file structure](https://github.com/comunica/traqula/commit/dd175ecafd79fcefc40312c6bc5e47f89162f125)
* [Subquery tests](https://github.com/comunica/traqula/commit/18d46ac116000b2296c06d03abbdc40c8ef72daa)
* [Path tests](https://github.com/comunica/traqula/commit/baeb6c25a2f4b570a00c98c38348ce41716f7435)
* [Limit alt function to 2 parameters](https://github.com/comunica/traqula/commit/f227cd44a5911036216fd72f54209cf200206c03)
* [Fix for graph with no filters](https://github.com/comunica/traqula/commit/d19ff68be5ab4016f00f0986f9d7d2083c5b072a)
* [Support for non-simplified path expressions](https://github.com/comunica/traqula/commit/bd55a4395d2e8e77f5c1c1c50b494f0520ded173)
* [Fix for duplicated predicate in path](https://github.com/comunica/traqula/commit/ccfbcc29da371b87ba3f73e5ea72cb67eacd9dc4)
* [Negation tests](https://github.com/comunica/traqula/commit/70747c0ea1948c335b4c00f795ea360a9d8e0562)
* [Parse minus correctly](https://github.com/comunica/traqula/commit/d03ae71a0242d38b1b8dd4d3bca57c970dab5840)
* [Group tests](https://github.com/comunica/traqula/commit/70cf028ad64f79e2c3576247200e427d7e3c621b)
* [Provide empty list if there are no aggregates in a group](https://github.com/comunica/traqula/commit/746bf62faf46e79a5e61a2202cc6263b106a0590)
* [Function tests](https://github.com/comunica/traqula/commit/ada2990d253db20e5b7a414e1ef4ec87406c03eb)
* [Exists tests](https://github.com/comunica/traqula/commit/bd79e25081a4e970c5036eb904cc5002b2244811)
* [Correctly handle filters in graphs](https://github.com/comunica/traqula/commit/d7c0100f7a1621140fa0d6817824223cc18052bd)
* [VALUES tests](https://github.com/comunica/traqula/commit/7fe8cd0e7fbbbd7bb61c02766e5171e792ebefb0)
* [Update sparqljs to 1.5.2](https://github.com/comunica/traqula/commit/3a861c92040a8c9875293de1a9922b64c04aed24)
* [Put trailing VALUES in toMultiSet](https://github.com/comunica/traqula/commit/17e2607e7eb79b571af9ab206d223f3ea9446763)
* [Add support for VALUES](https://github.com/comunica/traqula/commit/b0a77d655aac6ce0be30eec4ac2f32b4a7b5e570)
* [BIND tests](https://github.com/comunica/traqula/commit/6c7aa351e9a735ae06dc00b038f097d2c31cd885)
* [Allow filter objects to appear in GroupGraphPattern](https://github.com/comunica/traqula/commit/e0cf5dd569eb4b5de370ba0e27a36014d987e903)
* [Correct parsing of UNION body](https://github.com/comunica/traqula/commit/2bc659889d20c8163037e21d5b9f083474e37f30)
* [Update sparqljs version](https://github.com/comunica/traqula/commit/25a42de7c46c173301e059729cc8f6a5c5787811)
* [Fix test names](https://github.com/comunica/traqula/commit/164805bd6c9d528492acf36321e8cb74ffc520d3)
* [Aggregate tests](https://github.com/comunica/traqula/commit/c0bbf8055efc1b4c96d73d33b8de1a6b2aeb8485)
* [Support group_concat separator](https://github.com/comunica/traqula/commit/e5d5db6ccac352612820c55b26fb13fa63e83867)
* [More aggregate tests](https://github.com/comunica/traqula/commit/6e52cdf15e264ed410955a8173201c53730eb9b6)
* [Aggregate/group by/having test](https://github.com/comunica/traqula/commit/cf5b5b143326cb4d056b0bd8ad4a595b0e9fa00c)
* [Support for operator in filter](https://github.com/comunica/traqula/commit/3a234920b23d1f190ab0d0e7f26c7fb41cb83611)
* [Add aggregate test](https://github.com/comunica/traqula/commit/28dcb3b5ec17a33b88ab48ce0dec4c404a15841d)
* [Clarify aggregates](https://github.com/comunica/traqula/commit/aadc82d05c19e1ec70fd5ebe31317c0b605387aa)
* [Use strings instead of symbols](https://github.com/comunica/traqula/commit/d2a83ffa70207428b50320a6e4536fba327550fd)
* [more optional tests](https://github.com/comunica/traqula/commit/c077623a32fe8d0e987b9e3490376a23f1aba40e)
* [union/optional tests](https://github.com/comunica/traqula/commit/2e703fdeab04f166d49029bdc321ae549297a409)
* [Support for bgp appearing without empty join](https://github.com/comunica/traqula/commit/2763147972c442db1d2999089682d4eb12dcce13)
* [Improve package.json](https://github.com/comunica/traqula/commit/63ac5a0ecea584395714d0e4039dc50b5518255a)
* [Split tests over multiple files](https://github.com/comunica/traqula/commit/4c3beb24ea3816d97a8fc779dde42a343370e31c)
* [Add pre-commit test hook](https://github.com/comunica/traqula/commit/71977407a09f33cb10a00b3a2ebd1958e0137779)
* [order tests](https://github.com/comunica/traqula/commit/41e7cf1d8dbf388541d208e527a0510140af8c49)
* [Expressions can contain function calls](https://github.com/comunica/traqula/commit/ad24c3d2c467aaa2e17b5455d0ee548ba9ded118)
* [literal tests](https://github.com/comunica/traqula/commit/62d4838718e27b5f2ae03853faec724a2b0e21d3)
* [list tests](https://github.com/comunica/traqula/commit/034eacd746a3e41b3ff9ad31374a782a30fb3fe6)
* [limit-offset tests](https://github.com/comunica/traqula/commit/58f9e7f3fe74e0d5b752bf9cd55411273c2327a4)
* [Add body to order_by queries](https://github.com/comunica/traqula/commit/74b5ec52a7e01e1b93e5a4d4718949bc97feea31)
* [Add body to offset/limit queries](https://github.com/comunica/traqula/commit/63479037dca443954c893438392ca14e64ad0d67)
* [Update tests to take different orders and blank node names into account](https://github.com/comunica/traqula/commit/337c5166d21b81c339a8e7a28b70029449d56f0c)
* [Added filter tests](https://github.com/comunica/traqula/commit/d9a77dfe25fa155536af8292b038941854ee50c9)
* [Increase version number](https://github.com/comunica/traqula/commit/6507a5b83a4d7988399e3d026a556e02a609466a)
* [Initial test setup](https://github.com/comunica/traqula/commit/6b5763c53b0077572bdd50ec326007bac01b1b07)
* [Print symbols, reset parser blanks](https://github.com/comunica/traqula/commit/4dcce32c23e1d364c8a1c50e5259119cadd93ad4)
* [Add enum-like for algebra elements](https://github.com/comunica/traqula/commit/ba3f977fb21c2f048832c0f58b27ac6102273576)
* [Remove print code](https://github.com/comunica/traqula/commit/af534bd43018695af62fb27bee051b0472f0a1c4)
* [Move to lib folder](https://github.com/comunica/traqula/commit/36e65d6901e03459d7234c91aaf4634aafd8a03b)
* [Use boolean instead of string for leftjoin true](https://github.com/comunica/traqula/commit/e74cf37a9ed75d7f7e61430fd9196a36829f7255)
* [Refactor and clean up code for ES6](https://github.com/comunica/traqula/commit/9f99b2387e4df480e6be0020e0e11c525327cc11)
* [updated package.json](https://github.com/comunica/traqula/commit/4a6f7d4c109f597734fd649d18a0c2ba897e5ef2)
* [minor changes](https://github.com/comunica/traqula/commit/7c83d93362204964761eeb73d4b171b7c108a3eb)
* [url to filter operators](https://github.com/comunica/traqula/commit/b6b4317fbe1e85f2714c2a476780ec45d9111ac6)
* [Improved string representation](https://github.com/comunica/traqula/commit/79f93e02a707d2af73c7ec5af0b36701655349ba)
* [Create AlgebraElement object and override toString](https://github.com/comunica/traqula/commit/db5d2ec179296fc0bd0aed7b7e52c9d66993711f)
* [delete some test stuff](https://github.com/comunica/traqula/commit/62d2d52283b8de29cfb75c45b9ac6a5c2ee38203)
* [Hide test code](https://github.com/comunica/traqula/commit/4bf802a41fa851b54651e4dd455f01890e090431)
* [Removed constructor checks](https://github.com/comunica/traqula/commit/b565b48d54c40860e8802387a47abca7eea586fd)
* [Small mistakes](https://github.com/comunica/traqula/commit/0c85abc4e75eeb2ba27d418ca7b7074143d87ba8)
* [Parse SPARQL using sparqljs](https://github.com/comunica/traqula/commit/c7575b38e06277435dfe8720358e623a71823c12)
* [Removed global variables](https://github.com/comunica/traqula/commit/107471d72fdda7824346dea797456f2f68b18a3f)
* [Attach all functions to an object](https://github.com/comunica/traqula/commit/c53c0cfe02842691a8417b4d2b39970d03b57735)
* [Updated simplification and filter parsing.](https://github.com/comunica/traqula/commit/d2b5ac9ef2872a5aa5f0e8dff0fad2b6ec90e831)
* [Output now gets generated without changing the input object.](https://github.com/comunica/traqula/commit/b6420832eb30e218310a9c61ed8d4d549df13aa8)
* [Completely translating query now. Format still subject to change.](https://github.com/comunica/traqula/commit/a068744dd8c2ca8139d144f7ee61f3446a880f29)
* [More aggregate support. Some parts still don't get transformed, but everything gets parsed.](https://github.com/comunica/traqula/commit/3dedd487ebbf71db6a45baf7e583bbf5327f634c)
* [Partial solution for non-body mappings.](https://github.com/comunica/traqula/commit/64af5f0864fe0b89827143f41923fc8fc6979e72)
* [Added initial support for complete query.](https://github.com/comunica/traqula/commit/12da6bc4ef3ee21aa7516d8dd9df74269d70e0d0)
* [Mostly works for query body (except InlineData and SubSelect). Not yet for outer parts (limit, order, etc.).](https://github.com/comunica/traqula/commit/e4bf5b204b57c8cee16104b0be22a1c717718a05)
* [More stuff. Still completely incomplete.](https://github.com/comunica/traqula/commit/2aa242c3a1dd96b4cc2953c198b4203266814460)
* [Basic attempts at SPARQL algebra generator based on SparqlJS input.](https://github.com/comunica/traqula/commit/ccd1c93aaed19b4eb8ccfb8c3cf0b089fb287d2f)
* [🔄 feature: round tripping parser & generator (#45)](https://github.com/comunica/traqula/commit/faedd0a1d004cd1c43fd5b33766eb00ca233987a)
* [Merge branch 'main' of github.com:comunica/traqula](https://github.com/comunica/traqula/commit/d93b2781100dc8b1a305c0d465b157aaa8669474)
* [Update dependency lerna to v8.2.3](https://github.com/comunica/traqula/commit/e2ce73a97608246271c86fe87e8aa3bfeb05f1ca)
* [add version clause](https://github.com/comunica/traqula/commit/124bccba667ed257311a98ca8380f88601c1628b)
* [Update dependency @vitest/coverage-v8 to v3.2.4 (#42)](https://github.com/comunica/traqula/commit/daabf0031538776aea923026e20f1b45305c6092)
* [Update dependency @vitest/coverage-v8 to v3.2.2](https://github.com/comunica/traqula/commit/c3a51f4846317354d61f3b8e9b4953f975835614)
* [Update dependency @vitest/coverage-v8 to v3.2.1](https://github.com/comunica/traqula/commit/44c706c61dbae7d64c1e607f74edd739f453de0b)
* [Update dependency @vitest/coverage-v8 to v3.2.0](https://github.com/comunica/traqula/commit/1a15cfff4b3da76afb5d0b13783d98a218e3e64c)
* [Merge branch 'main' of github.com:comunica/traqula](https://github.com/comunica/traqula/commit/b2a8e2934446ec59a620326fab780e1dc3e47239)
* [consistent build function](https://github.com/comunica/traqula/commit/65e34f906fb918263df4e15f689ecdbdda1e3d31)
* [Update dependency @vitest/coverage-v8 to v3.1.4](https://github.com/comunica/traqula/commit/2d31b637d36f7e62f69da62ad6fd0730efb8a737)
* [Update dependency @vitest/coverage-v8 to v3.1.3](https://github.com/comunica/traqula/commit/4b241634e26c15dc12f6b89f381b8131c072a2b9)
* [Update dependency @vitest/coverage-v8 to v3.1.2](https://github.com/comunica/traqula/commit/0eea70cc9002add0f61e5621f80b810fb8fbbd37)
* [Update dependency lerna to v8.2.2](https://github.com/comunica/traqula/commit/0170c7f1c92bb2b3b2aa5221f90634783882d531)

<a name="v0.0.1-alpha.138"></a>
## [v0.0.1-alpha.138](https://github.com/comunica/traqula/compare/v0.0.0...v0.0.1-alpha.138) - 2025-04-10

* [changelog](https://github.com/comunica/traqula/commit/7f140b84ba953f6860e92a419afd243b39ebdb87)

<a name="v0.0.0"></a>
## [v0.0.0] - 2025-04-10

* [Prepare/v1 (#39)](https://github.com/comunica/traqula/commit/9400dc5f8bda1d8c2b3d1f4cf56b308995744ba0)
