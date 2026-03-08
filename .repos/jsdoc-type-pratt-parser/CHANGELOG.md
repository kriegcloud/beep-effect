## [7.1.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v7.1.0...v7.1.1) (2026-02-04)


### Bug Fixes

* conditionals with keyof and nullable precedence ([09e5a2a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/09e5a2abf02fa145d053fd3decd846b6f2e52dfe))

# [7.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v7.0.0...v7.1.0) (2026-01-20)


### Bug Fixes

* add id-token permission and drop NPM_TOKEN ([43d2b54](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/43d2b54f84e9aa06e80072678d1f458781de1751))
* attempt to reutilize NPM_TOKEN ([132f25a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/132f25a6c1669fae3d7cff8e49da594ff541a99b))
* avoid conflict with registry-url and NPM_TOKEN ([8fd296f](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8fd296f5146845bec1b1fb4943729a8a5aa8e25a))
* remove NPM_TOKEN for OIDC publishing ([7efcf45](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/7efcf4565ba8f3985bbade7a012219fea5b26767))
* update for trusted publishing release ([dc35f9b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dc35f9b5326c993235959df911620e3b82ffd002))


### Features

* **stringify:** `bracketSpacing` meta for objects ([c9195e8](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/c9195e8d88125979dce914814f5ec322b7d5c6cc))

# [7.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.11.1...v7.0.0) (2025-11-07)


### Features

* allow `infer` in other positions in generic argument lists ([645bdb1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/645bdb1765bb122f0fc748d60c98b1a1a45ba518))


### BREAKING CHANGES

* Removes infer: boolean from generics in favor of a root level InferResult

## [6.11.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.11.0...v6.11.1) (2025-11-07)


### Bug Fixes

* **mapped types:** fix precedence so unions can be parsed after `in` ([3ba726d](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/3ba726de65ba6373df656bee974de6aed3bc7ddc))

# [6.11.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.10.0...v6.11.0) (2025-10-11)


### Features

* add `loc`; fixes [#134](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/134) ([c4ff6a1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/c4ff6a117780749c6e0d414deeb9bc2af2955fdf))
* add `range` ([717207c](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/717207c9e01076f338202e96a399fc6a45df1f1e))

# [6.10.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.9.1...v6.10.0) (2025-10-08)


### Features

* **traverse:** report array index to onEnter/onLeave ([25e32f1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/25e32f15d5bbbf9f31c75ede459134a810f78639))

## [6.9.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.9.0...v6.9.1) (2025-10-07)


### Bug Fixes

* **stringify:** add `preReturnMarkerSpacing` and `postReturnMarkerSpacing` to signatures and constructed methods ([860b748](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/860b748124694c0b5e3f722b8d1a488c9320646a))
* **stringify:** add missing `postGenericSpacing` to JsdocTypeFunction ([24f9672](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/24f967286b7acf3726613ed762658607b3b51b17))

# [6.9.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.8.0...v6.9.0) (2025-10-07)


### Features

* **stringify:** add `postColonSpacing`, `postKeySpacing`, and `postOptionalSpacing` options to object fields ([23d5be6](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/23d5be6c2bf03d8988ab1f9a80660f9c7b52edd2))

# [6.8.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.7.0...v6.8.0) (2025-10-07)


### Features

* **stringify:** make tuple, keyValue, function return type, and parameter spacing configurable ([124a498](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/124a498c3d4b5c01dfba7b18ca18602408bcf5e4))

# [6.7.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.6.0...v6.7.0) (2025-10-07)


### Features

* generic element spacing, computed method and signature spacing, parameter spacing ([3ed9f58](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/3ed9f58869fbb125e72fcbe2306a73e03f395198))

# [6.6.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.5.1...v6.6.0) (2025-10-06)


### Features

* add type parameters to call, constructor, and method signatures ([890e444](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/890e444802ba0d3bb5f33df9bc19510d4280b7f7))
* support type parameters with computed methods ([54e57f3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/54e57f3ebe973bbff65f7bd27d0d104f56cb305b))

## [6.5.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.5.0...v6.5.1) (2025-10-06)


### Bug Fixes

* add `classContext` to `tryParse` ([e69c21b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/e69c21b2e1dd0794f4443c4b057a088b2569a3b7))

# [6.5.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.4.0...v6.5.0) (2025-10-06)


### Features

* **parse:** add `classContext` argument ([e8157f7](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/e8157f70eecdf78e835d436a8582d4c3fe60a621))

# [6.4.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.3.3...v6.4.0) (2025-10-05)


### Bug Fixes

* **traverse:** ignore traversing non-Node keys ([8c62ae8](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8c62ae8962ced9780cbc8a83a89f2da79240a2d7))


### Features

* add missing visitor keys for function, import, object field types ([4418e44](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4418e44359dd3c5b53e24afa83891847a1ad3292))

## [6.3.3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.3.2...v6.3.3) (2025-10-04)


### Bug Fixes

* liberalize use of TypeScript keywords in object field and namepaths ([a379125](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/a3791258547fac52ca30c57d48a6e9c6d993a71f))

## [6.3.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.3.1...v6.3.2) (2025-10-03)


### Bug Fixes

* **`parseNamePath`:** liberalize reserved words in namepaths ([db8933b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/db8933bd37a5872f165b1cf4bae26de16db78235))

## [6.3.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.3.0...v6.3.1) (2025-10-03)


### Bug Fixes

* liberalize names/namepaths to allow more reserved words ([b9eaa95](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/b9eaa95fd42ccfcc72266ebcbff6ab283c243013))

# [6.3.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.2.0...v6.3.0) (2025-10-03)


### Bug Fixes

* add generic parsing to name/namepaths ([31b1c69](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/31b1c69fe6360d9e65ec30ad533442cf79c320b6))


### Features

* **`parseNamePath`:** allow parsing of special namepaths by option ([b2a34aa](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/b2a34aacb4b0d4665044889ae8fc31b2d46a0451))

# [6.2.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.1.2...v6.2.0) (2025-10-03)


### Bug Fixes

* allow reserved words which correspond to valid root TS types ([7cfee47](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/7cfee47c80ee1e70bf95479d55398d8f08127f89))


### Features

* add `parseName` and `parseNamePath`; check reserved names ([942f754](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/942f7546287e56e8649675f7cf3affe940d7c3a9))
* add `parseName` and `parseNamePath`; check reserved names (INCOMPLETE) ([50da564](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/50da564267ef81ee26e044e387b6ac37cbb7de0f))

# [6.2.0-dev.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.2.0-dev.1...v6.2.0-dev.2) (2025-10-03)


### Bug Fixes

* allow reserved words which correspond to valid root TS types ([cf0391a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/cf0391a8949eda3d142ef3874d12e56c3bf731ad))

# [6.2.0-dev.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.1.2...v6.2.0-dev.1) (2025-10-03)


### Features

* add `parseName` and `parseNamePath`; check reserved names (INCOMPLETE) ([8114c48](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8114c48fb72a66b7babc2611382aec1f4a1c5dda))

## [6.1.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.1.1...v6.1.2) (2025-10-01)


### Bug Fixes

* revert "feat: `parseNamePath` and `parseName`; add `parse` options (`strictMode`, `module`, `asyncFunctionBody`)" (proved problematic) ([c95f5a0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/c95f5a0c671308011fc9a84ec301e03edc34ef09))

## [6.1.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.1.0...v6.1.1) (2025-10-01)


### Bug Fixes

* revert name/namepath addition (proved problematic) ([79a9834](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/79a9834965f7c761b28032bf64b213cd92381819))

## [6.0.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v6.0.0...v6.0.1) (2025-09-29)


### Bug Fixes

* bump `engines`; fixes [#206](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/206) ([2aa5954](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/2aa59541adb6727bb188e633b7b94bb2c0f7867f))

# [6.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.9.2...v6.0.0) (2025-09-29)


### Bug Fixes

* deliberalize lexer to prohibit hyphens in typescript identifiers ([1f9d50a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/1f9d50a002bc913cd0f78a52a2812590f13a2c61))
* deliberalize lexer to prohibit NaN and -?Infinity in TypeScript identifiers ([bcd858b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/bcd858b09c0d02b057de5aec553fee439aa8ad75))


### BREAKING CHANGES

* Prohibits use of NaN and -?Infinity in TypeScript identifiers
* Prohibits use of hyphens in TypeScript identifiers

## [5.9.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.9.1...v5.9.2) (2025-09-28)


### Bug Fixes

* allow template literals to include non-token values (e.g., hyphens) as part of literal portions ([dcfae5b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dcfae5ba9b2bf54b1a05e5bf90b268857ebd7c83))

## [5.9.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.9.0...v5.9.1) (2025-09-27)


### Bug Fixes

* **mapped type clauses:** handle more complete types ([a50f4a2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/a50f4a2465d75d3444e31a21c856b31e1c3e7d90))

# [5.9.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.8.0...v5.9.0) (2025-09-26)


### Features

* support `computedPropertyParser` and computed property stringifier options ([4d1bea3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4d1bea3b623429e0089541bdcaa15f2f4d696c2f))

# [5.8.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.7.0...v5.8.0) (2025-09-26)


### Features

* computed properties and methods ([b621584](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/b6215849d6f112e6e29008cbad9909889735ec88))

# [5.7.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.6.0...v5.7.0) (2025-09-26)


### Features

* template literals; fixes [#166](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/166) ([fc8a268](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/fc8a26860aaa088d8b3ca50c46b0747c9499f9cc))

# [5.6.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.5.0...v5.6.0) (2025-09-26)


### Features

* add `JsdocTypeIndexedAccessIndex`; fixes [#147](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/147) ([2d54a4c](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/2d54a4c07795783bdac2b6841eec4318b8bbc863))

# [5.5.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.4.0...v5.5.0) (2025-09-26)


### Features

* add `JsdocTypeCallSignature`, `JsdocTypeConstructorSignature`, and `JsdocTypeMethodSignature` ([4ca386c](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4ca386c4283eaf85c5e24873819d6da8e2e1be5e))

# [5.4.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.3.0...v5.4.0) (2025-09-10)


### Features

* add `meta.spacing` option to `JsdocTypeUnion` ([06bdfbe](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/06bdfbe852dee0607726e12814660cfcd0be9f47))

# [5.3.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.2.0...v5.3.0) (2025-09-10)


### Features

* `meta.trailingPunctuation` for `ObjectResult` ([63beb31](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/63beb31ddafa5e9f29792fbd52ca2cf8087c946f))

# [5.2.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.1.1...v5.2.0) (2025-09-08)


### Features

* allow `comma-and-linebreak` and `semicolon-and-linebreak` and `separatorForSingleObjectField: boolean` ([63e3451](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/63e345123ba0323303705f1a07533bf5356033a8))

## [5.1.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.1.0...v5.1.1) (2025-09-06)


### Bug Fixes

* **asserts, infer:** bad error messages ([8c06711](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8c0671121de3e4e170cff907bcd66ed91db17038))

# [5.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v5.0.0...v5.1.0) (2025-09-06)


### Features

* **typescript:** allow missing return type; fixes [#81](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/81) ([f3aa55b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/f3aa55b8ce97191fb4ed47c78eb31778c7842b87))

# [5.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.8.0...v5.0.0) (2025-09-05)


### Features

* add ESM export; fixes [#173](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/173) ([f5f4155](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/f5f4155e70630f994b70e3ad1c99801ade5b0cef))


### BREAKING CHANGES

* Adds `exports`

# [4.8.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.7.0...v4.8.0) (2025-08-15)


### Features

* add generic arrow function ([cf665a9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/cf665a90e6143cb5bf4b195d50c48efeac39f4ca))

# [4.7.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.6.0...v4.7.0) (2025-08-15)


### Features

* add `infer` support ([6ffcdc6](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/6ffcdc6d9964b82a3ba99c332535034e28897a08))
* make `ConditionalResult` ([28ace4a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/28ace4a9f9bbdc4fd746bca7636185606b5e3695))

# [4.6.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.5.0...v4.6.0) (2025-08-15)


### Features

* allow question mark as object property ([cb98813](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/cb98813708e506af80f4055b8340885af12718dc))

# [4.5.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.4.1...v4.5.0) (2025-08-15)


### Features

* `asserts` without `is` ([8a5ca3d](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8a5ca3d3a05cb12dbcb6ea2b27186c5204b1292e))

## [4.4.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.4.0...v4.4.1) (2025-08-15)


### Bug Fixes

* allow typeof as object key ([fc3db3e](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/fc3db3e5cafffc456805e33645fd0490907643c9))
* avoid adding linebreaks to linebreak separator when not > 1 item ([482bb4d](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/482bb4d1bfb0da9f6fef8f58e793665710a72152))
* handle stray commas/semi-colons in objects ([6764127](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/676412710e6cb0fbd733f5f72aba7002c64a862d))

# [4.4.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.3.0...v4.4.0) (2025-08-15)


### Features

* readonly index signature ([2560b7d](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/2560b7d44cd3dacd63879a448edc34ed6e7d6987))

# [4.3.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.2.0...v4.3.0) (2025-08-15)


### Features

* add `JsdocTypeReadonlyArray` type ([ef64e00](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/ef64e004feaf83b7be38f54b183bf8435a80759e))

# [4.2.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.1.0...v4.2.0) (2025-08-15)


### Bug Fixes

* **`stringify`:** allow for linebreak separator ([cb5007b](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/cb5007bfc18340974a5a744aeba2d8e028374a7d))


### Features

* add `propertyIndent` meta ([5016448](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/501644849cee0a437c24461e11722f21eb762c77))

# [4.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v4.0.0...v4.1.0) (2024-08-05)


### Bug Fixes

* allow unions in index signatures ([aeba637](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/aeba6373334a229637efae00519fa5badde81eb6))


### Features

* adds asserts keyword ([9e518af](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/9e518aff999762dd0d58ec2474e4e1ab9d6dfa46))

# [4.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.1.0...v4.0.0) (2023-03-15)


### Features

* allow square bracket property access ([cc01ccf](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/cc01ccfb8df4ef44cf47eea51203c9d796ea86d3))
* parse index signatures and mapped types ([dd49463](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dd49463bda73dfe4b75f33a5541d850919c10743))
* remove unneeded variadic property from `ObjectFieldResult` ([20bf77d](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/20bf77d93401aa702261d094a03307d8f44b595a))
* split KeyValueResult in different types for objects and other uses ([6b388d3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/6b388d3c9f4d1ed7537ce08049ff195ec893cc82))


### BREAKING CHANGES

* `ObjectResult` no longer contains `KeyValueResult`, but uses the new types `ObjectFieldResult` and `JsdocObjectFieldResult`.

For mode `typescript` this basically means a simple rename of type `JsdocTypeKeyValue` to `JsdocTypeObjectField`:
input: `{ key: string }`
before:
```
{
  "type": "JsdocTypeObject",
  "meta": {
    "separator": "comma"
  },
  "elements": [
    {
      "type": "JsdocTypeKeyValue",
      "key": "key",
      "right": {
        "type": "JsdocTypeName",
        "value": "string"
      },
      "optional": false,
      "readonly": false,
      "variadic": false,
      "meta": {
        "hasLeftSideExpression": false
      }
    }
  ]
}
```
after:
```
{
  "type": "JsdocTypeObject",
  "meta": {
    "separator": "comma"
  },
  "elements": [
    {
      "type": "JsdocTypeObjectField",
      "key": "key",
      "right": {
        "type": "JsdocTypeName",
        "value": "string"
      },
      "optional": false,
      "readonly": false,
      "variadic": false,
      "meta": {
        "quote": undefined
      }
    }
  ]
}
```

for `jsdoc` mode the `JsdocTypeKeyValue` can now be either `JsdocTypeObjectField` or `JsdocTypeJsdocObjectField`:
input: `{ Array<string>: string }`
before:
```
{
  "type": "JsdocTypeObject",
  "meta": {
    "separator": "comma"
  },
  "elements": [
    {
      "type": "JsdocTypeKeyValue",
      "left": {
        "type": "JsdocTypeGeneric",
        "left": {
          "type": "JsdocTypeName",
          "value": "Array"
        },
        "elements": [
          {
            "type": "JsdocTypeName",
            "value": "string"
          }
        ],
        "meta": {
          "brackets": "angle",
          "dot": false
        }
      },
      "right": {
        "type": "JsdocTypeName",
        "value": "string"
      },
      "meta": {
        "hasLeftSideExpression": true
      }
    }
  ]
}
```
after:
```
{
  "type": "JsdocTypeObject",
  "meta": {
    "separator": "comma"
  },
  "elements": [
    {
      "type": "JsdocTypeJsdocObjectField",
      "left": {
        "type": "JsdocTypeGeneric",
        "left": {
          "type": "JsdocTypeName",
          "value": "Array"
        },
        "elements": [
          {
            "type": "JsdocTypeName",
            "value": "string"
          }
        ],
        "meta": {
          "brackets": "angle",
          "dot": false
        }
      },
      "right": {
        "type": "JsdocTypeName",
        "value": "string"
      }
    }
  ]
}
```

# [3.2.0-dev.3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.2.0-dev.2...v3.2.0-dev.3) (2023-03-13)


### Features

* allow square bracket property access ([e069109](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/e069109123b705e1659f1e712b83e436585171a6))

# [3.2.0-dev.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.2.0-dev.1...v3.2.0-dev.2) (2023-03-13)


### Features

* parse index signatures and mapped types ([4373e01](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4373e011964ba7a36e4f04397d4a92837986216a))

# [3.2.0-dev.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.1.0...v3.2.0-dev.1) (2023-03-13)


### Features

* remove unneeded variadic property from `ObjectFieldResult` ([d392f93](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d392f93afbf453da96dd7fd63a7c7a3aeda23e9a))
* split KeyValueResult in different types for objects and other uses ([aa6c495](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/aa6c495665b71b6e44a322f1ab6e589373abad65))

# [3.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.0.1...v3.1.0) (2022-05-19)


### Bug Fixes

* tests ([ed172bc](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/ed172bc643ab7068ff07db1a5eb5e8eae61deb19))


### Features

* allow 'new' as a keyword for arrow functions ([5ab04e7](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/5ab04e7aa0792ccd8413d07e9c5c4b1dfc6e4f77))
* allow new as a function keyword ([58ace96](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/58ace96e6976a3b77791bb86423814f1ca56611d))
* allow typed args parameter for functions ([b538628](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/b538628a0092fc37e401fc979dfc877a994acb59))

## [3.0.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v3.0.0...v3.0.1) (2022-04-19)


### Bug Fixes

* **ObjectParslet:** accept linebreaks ([99d4bae](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/99d4bae3225d75a98ee54d76d67fddf540a7a123))

# [3.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.5...v3.0.0) (2022-04-19)


### Bug Fixes

* **Lexer:** use new lexer interface ([03ed15e](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/03ed15ebdd4d735560c379a885c29341c1ed73ee))


### Features

* Lexer has a readonly state ([13ec065](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/13ec065d3d2c0004aa183e8d35e7b94049794675))


### BREAKING CHANGES

* the advance function of the lexer does not change the internal state of the object, but does instead return a new Lexer object. The getters `token()`, `peek()` and `previous()` have been replaced with readonly properties `current`, `next`, `previous`.
* the API of the Parser class has changed. It can't parse multiple expressions anymore, but needs to be instantiated for each expression. The expression is passed to the constructor. The current lexer can be accessed via the property `lexer`.

## [2.2.5](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.4...v2.2.5) (2022-03-13)


### Bug Fixes

* **ObjectParslet:** support trailing comma or semicolon ([58b057a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/58b057aea903246a1d11c2fd15f12abc8925ff34))

## [2.2.4](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.3...v2.2.4) (2022-03-11)


### Bug Fixes

* typos in error messages ([1c7c372](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/1c7c3727cc64f745f7a8813c273d44cb618956d3))

## [2.2.3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.2...v2.2.3) (2022-02-12)


### Bug Fixes

* remove some unneeded code ([55b2e68](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/55b2e682729a48a69c62cd322ba325b9336a27d4))

## [2.2.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.1...v2.2.2) (2022-02-03)


### Bug Fixes

* **typescript:** ensure readonly discoverable within object context ([675e431](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/675e431c2f06f8f72dd07ea7e46fc90cecde228b))
* use correct precedence for right side of arrow function ([6b0a410](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/6b0a410a004a4345503ee7ebb33ba9237a511a92))

## [2.2.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.1...v2.2.2) (2022-01-17)


### Bug Fixes

* use correct precedence for right side of arrow function ([6b0a410](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/6b0a410a004a4345503ee7ebb33ba9237a511a92))

## [2.2.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.2.0...v2.2.1) (2022-01-09)


### Bug Fixes

* use `parseFloat` for number types ([09a0717](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/09a0717f9222321e12c121765dcb9b57988d4e63))

# [2.2.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.1.0...v2.2.0) (2022-01-09)


### Features

* add PredicateResult ([38bf20f](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/38bf20ffce79d86f449747c554bca7da6cdf2642))

# [2.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.0.2...v2.1.0) (2022-01-08)


### Features

* add path grammar for NamePathParslet ([9bb29c4](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/9bb29c410814a5712f0f05e37712285b897c0f4b))

## [2.0.2](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.0.1...v2.0.2) (2021-12-28)


### Bug Fixes

* allow more numbers ([8f3d524](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8f3d5249bff73e2b815e306f55bb71b91ba46098))

## [2.0.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v2.0.0...v2.0.1) (2021-12-28)


### Bug Fixes

* allow name module ([8794c1c](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8794c1c0ba54d1fa43b788b76b31fe8481fec980))
* allow property named module ([d54dea0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d54dea0f6f3e2b4547484f07077c4d75fa1a5a88)), closes [#102](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/102)

# [2.0.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.2.0...v2.0.0) (2021-10-15)


### Features

* **KeyValue:** add discriminator for different KeyValue types and rename `value` to `key` ([4cb9dd0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4cb9dd0508e32b8cd55274f74ebaa81031b53c84))
* **KeyValue:** enable labeled KeyValue results ([576c2d8](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/576c2d87b626cd96f7c9976cd98fc6f679f0eca6))
* **traverse:** use visitorKeys and sinon-chai for tests ([8a98f9a](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/8a98f9a2b8346c36e26cb8c292a13963f0b70af5))


### BREAKING CHANGES

* **KeyValue:** For `JsdocTypeKeyValue` results, if it is a key value with a string key. The key is no longer named `value` but `key` to avoid confusion.

# [1.2.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.1.1...v1.2.0) (2021-10-02)


### Features

* **parser:** add readonly modifier for object properties ([ad3f0c9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/ad3f0c9dbca50f01b810065bb341d50efbbaca2c))

## [1.1.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.1.0...v1.1.1) (2021-07-27)


### Bug Fixes

* trigger release ([0083be8](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/0083be8dc1213af9cd7c2737c4774f79dd49c1f1))

# [1.1.0](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.4...v1.1.0) (2021-07-27)


### Bug Fixes

* Add chores token. ([dc1d3e9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dc1d3e93be974dbb87f253b3e02a806d85cf912b))
* Allow semicolon as object entry separator. ([49b19a3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/49b19a34f81542d5e508e9f59c77eb6c28db48b7))
* Remove unneeded check. ([d7839ba](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d7839bae6985e5dbfe276c3e8eef5d44f434e975))


### Features

* trigger release ([2a701c5](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/2a701c5eba597216c06c3807ded279092991975b))

## [1.0.5](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.4...v1.0.5) (2021-07-27)


### Bug Fixes

* Add chores token. ([dc1d3e9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dc1d3e93be974dbb87f253b3e02a806d85cf912b))
* Allow semicolon as object entry separator. ([49b19a3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/49b19a34f81542d5e508e9f59c77eb6c28db48b7))
* Remove unneeded check. ([d7839ba](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d7839bae6985e5dbfe276c3e8eef5d44f434e975))

## [1.0.9-dev.1](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.8...v1.0.9-dev.1) (2021-07-20)


### Bug Fixes

* Add chores token. ([dc1d3e9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dc1d3e93be974dbb87f253b3e02a806d85cf912b))
* Allow semicolon as object entry separator. ([49b19a3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/49b19a34f81542d5e508e9f59c77eb6c28db48b7))
* Remove unneeded check. ([d7839ba](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d7839bae6985e5dbfe276c3e8eef5d44f434e975))

## [1.0.9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.4...v1.0.9) (2021-07-20)


### Bug Fixes

* Add chores token. ([dc1d3e9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/dc1d3e93be974dbb87f253b3e02a806d85cf912b))
* Allow semicolon as object entry separator. ([49b19a3](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/49b19a34f81542d5e508e9f59c77eb6c28db48b7))
* Remove unneeded check. ([d7839ba](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/d7839bae6985e5dbfe276c3e8eef5d44f434e975))

## [1.0.8](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.7...v1.0.8) (2021-06-02)


### Reverts

* fix: test release ([50e219c](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/50e219cb8e52e0af6ab858992cb497f5a14f3f96))

## [1.0.7](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.6...v1.0.7) (2021-06-02)


### Bug Fixes

* test release ([3d8ccc9](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/3d8ccc960c41d5ad1ecace89a307317d58429afd))

## [1.0.6](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.5...v1.0.6) (2021-06-02)


### Bug Fixes

* test release ([78308dc](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/78308dc9f76dcd49e36685a66867d61d4e2312a7))

## [1.0.5](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/compare/v1.0.4...v1.0.5) (2021-06-02)


### Bug Fixes

* test dev release ([4351ca4](https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/commit/4351ca456960eb39aa72338e011e389d36075832))

## [1.0.4](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.3...v1.0.4) (2021-06-02)


### Bug Fixes

* confine extended Unicode escapes to 0x10FFFF ([937bcfb](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/937bcfb74e69f552da5880c7c79eddce48054038))
* support Unicode escape sequences for identifiers ([edb18a0](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/edb18a0cc3b4a4880e0d931b14fa4317f9e60e29))

## [1.0.3](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.2...v1.0.3) (2021-06-01)


### Bug Fixes

* Precedence for key value pairs in objects ([ebde3ca](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/ebde3ca893cc06b09a2e2e9f5ddf59ab1252128d)), closes [#63](https://github.com/simonseyock/jsdoc-type-pratt-parser/issues/63)

## [1.0.2](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.1...v1.0.2) (2021-05-31)


### Bug Fixes

* Make NumberResult terminal ([9dc78b5](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/9dc78b5b0b9268186e1d78d5b34f035f5af1a6a0))
* Name paths have properties not names on the right side. ([34c85a7](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/34c85a70eaa7cc5e9fbeac7bff2d0670e521aeb1))

## [1.0.1](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0...v1.0.1) (2021-05-31)


### Bug Fixes

* liberalize ID start and continue values as per Unicode (keeping hyphen as part of continue) ([67f0929](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/67f0929cfbcc6a808962e396743661ed4d37da03))

# 1.0.0 (2021-05-30)


### Bug Fixes

* tsconfig.json no lib ([6df24dc](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/6df24dc0e0d7eb8c642c1943731dff2b1a024389))
* **gh-pages:** set author ([a28b3dd](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/a28b3dd6d88e469abe2ea34920a0d98fa6f7b587))
* **gh-pages:** use actor ([74256b1](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/74256b1e9a309d5b64edbae999fbb2137d1b6f91))
* **gh-pages:** whitespace ([16e97c4](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/16e97c4eb6c7fd96b3d24104c695179eb7d07ab6))
* **github actions:** rename test workflow ([d70f819](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/d70f8191eef3d37da82084fa04999975cf99deb3))
* **pages:** fix deploy script ([1e04ebb](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/1e04ebba96e6e28938c0bb08597581978af7829a))
* **pages:** move deployment to release.yaml ([748c18a](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/748c18a09c3f3c1150f0387ef31a2bd49f70aee8))
* **readme:** performance text ([824bdad](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/824bdad1fa56488ce55bef5699bc106de6eb135b))
* **readme:** test badge pointing to correct workflow ([dacfe87](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/dacfe87ca7b6ce7f917313b2e12041032d8dbcd5))
* **readme:** use npm links to alpha channel ([cf13883](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/cf13883a1a29bda25c74dbb12def52a851321944))


### Features

* `function` is of type `JsdocTypeName` now. ([225c337](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/225c33762a6c9c7a47fe4b4b5ce1b357f20d98a1))
* add module grammar, add parallel grammar ([2fe4fd7](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/2fe4fd7417261b5f32171b8f8b80d64f74187151))
* add not nullable to base grammar ([7d0910f](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/7d0910f33c7ee9bfde82231a86d11e2ea2b11e25))
* Keys of `KEY_VALUE` are now static values and no ParseResults. ([c2bfa24](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/c2bfa24ebe0f6b18ba7784fdfa7b2a9decc04d2b))
* make types eslint friendly ([497cd59](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/497cd59f2b87c460a46c6c97b2ae496ca6a19b5f))
* meta brackets change ([4bbc137](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/4bbc137ed0ac057007d4e94664a7b35c6a13c2b6))
* meta position change ([f85ce88](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/f85ce8867e32b3bfb0ecbb9c26dbdece7210ebbb))
* meta quotes changed ([3faf6c1](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/3faf6c11e67ed1fcf4343c3e79d39805d6d5eb79))
* Parser exposes infixParse and accepts Lexer ([415b7c9](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/415b7c9333ab8dd60177ac94820022d829d0c5eb))
* path type change ([7601ce5](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/7601ce5bb2899e273cf686b2b37083328a8eadde))
* remove reservedWord meta ([d73d64d](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/d73d64d1040980a0c2cdaa625057d4a62f0d5651))
* removed submodules ([dc87398](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/dc87398c90b81f8d104111686333a49dfe682719))
* SpecialNamePathParslet switches to other grammar. Allow `module:` in typescript and closure. ([25edc18](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/25edc18f9f666e065666381fa7bbf1a57d3a7ced))
* use `KEY_VALUE` for typed record entries ([80fd550](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/80fd550ec95ba4ae1e1d08f908146d89d8fcc9ea))


### BREAKING CHANGES

* Names no longer have the meta property `reservedWord`
* `pathType` property uses `'instance'`, `'inner'` and `'property'` now
* `brackets` property uses `'square'` and `'angle'` now
* position property is lowercase. example: `'suffix'`
* For meta properties use 'single' and 'double' instead of '\'' and '"'
* All types are now prefixed with `JsdocType` and are made CamelCase
* `JSDOC_OBJECT_KEY_VALUE` is now `KEY_VALUE`.
* key `left` was removed from `KEY_VALUE` and is replaced by `value`. For the special record entries of `jsdoc` mode a new type `JSDOC_OBJECT_KEY_VALUE` was introduced.

# [1.0.0-alpha.24](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.23...v1.0.0-alpha.24) (2021-05-29)


### Bug Fixes

* tsconfig.json no lib ([6df24dc](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/6df24dc0e0d7eb8c642c1943731dff2b1a024389))


### Features

* `function` is of type `JsdocTypeName` now. ([225c337](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/225c33762a6c9c7a47fe4b4b5ce1b357f20d98a1))
* add module grammar, add parallel grammar ([2fe4fd7](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/2fe4fd7417261b5f32171b8f8b80d64f74187151))
* add not nullable to base grammar ([7d0910f](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/7d0910f33c7ee9bfde82231a86d11e2ea2b11e25))
* Parser exposes infixParse and accepts Lexer ([415b7c9](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/415b7c9333ab8dd60177ac94820022d829d0c5eb))
* SpecialNamePathParslet switches to other grammar. Allow `module:` in typescript and closure. ([25edc18](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/25edc18f9f666e065666381fa7bbf1a57d3a7ced))

# [1.0.0-alpha.23](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.22...v1.0.0-alpha.23) (2021-05-24)


### Features

* removed submodules ([dc87398](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/dc87398c90b81f8d104111686333a49dfe682719))

# [1.0.0-alpha.22](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.21...v1.0.0-alpha.22) (2021-05-23)


### Features

* make types eslint friendly ([497cd59](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/497cd59f2b87c460a46c6c97b2ae496ca6a19b5f))
* meta brackets change ([4bbc137](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/4bbc137ed0ac057007d4e94664a7b35c6a13c2b6))
* meta position change ([f85ce88](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/f85ce8867e32b3bfb0ecbb9c26dbdece7210ebbb))
* meta quotes changed ([3faf6c1](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/3faf6c11e67ed1fcf4343c3e79d39805d6d5eb79))
* path type change ([7601ce5](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/7601ce5bb2899e273cf686b2b37083328a8eadde))
* remove reservedWord meta ([d73d64d](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/d73d64d1040980a0c2cdaa625057d4a62f0d5651))
* use `KEY_VALUE` for typed record entries ([80fd550](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/80fd550ec95ba4ae1e1d08f908146d89d8fcc9ea))


### BREAKING CHANGES

* Names no longer have the meta property `reservedWord`
* `pathType` property uses `'instance'`, `'inner'` and `'property'` now
* `brackets` property uses `'square'` and `'angle'` now
* position property is lowercase. example: `'suffix'`
* For meta properties use 'single' and 'double' instead of '\'' and '"'
* All types are now prefixed with `JsdocType` and are made CamelCase
* `JSDOC_OBJECT_KEY_VALUE` is now `KEY_VALUE`.

# [1.0.0-alpha.21](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.20...v1.0.0-alpha.21) (2021-05-23)


### Features

* Keys of `KEY_VALUE` are now static values and no ParseResults. ([c2bfa24](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/c2bfa24ebe0f6b18ba7784fdfa7b2a9decc04d2b))


### BREAKING CHANGES

* key `left` was removed from `KEY_VALUE` and is replaced by `value`. For the special record entries of `jsdoc` mode a new type `JSDOC_OBJECT_KEY_VALUE` was introduced.

# [1.0.0-alpha.20](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.19...v1.0.0-alpha.20) (2021-05-19)


### Bug Fixes

* **readme:** test badge pointing to correct workflow ([dacfe87](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/dacfe87ca7b6ce7f917313b2e12041032d8dbcd5))

# [1.0.0-alpha.19](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.18...v1.0.0-alpha.19) (2021-05-19)


### Bug Fixes

* **readme:** use npm links to alpha channel ([cf13883](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/cf13883a1a29bda25c74dbb12def52a851321944))

# [1.0.0-alpha.18](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.17...v1.0.0-alpha.18) (2021-05-19)


### Bug Fixes

* **gh-pages:** use actor ([74256b1](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/74256b1e9a309d5b64edbae999fbb2137d1b6f91))

# [1.0.0-alpha.17](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.16...v1.0.0-alpha.17) (2021-05-19)


### Bug Fixes

* **gh-pages:** whitespace ([16e97c4](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/16e97c4eb6c7fd96b3d24104c695179eb7d07ab6))

# [1.0.0-alpha.16](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.15...v1.0.0-alpha.16) (2021-05-19)


### Bug Fixes

* **gh-pages:** set author ([a28b3dd](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/a28b3dd6d88e469abe2ea34920a0d98fa6f7b587))
* **github actions:** rename test workflow ([d70f819](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/d70f8191eef3d37da82084fa04999975cf99deb3))

# [1.0.0-alpha.15](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2021-05-19)


### Bug Fixes

* **pages:** move deployment to release.yaml ([748c18a](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/748c18a09c3f3c1150f0387ef31a2bd49f70aee8))

# [1.0.0-alpha.14](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2021-05-19)


### Bug Fixes

* **pages:** fix deploy script ([1e04ebb](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/1e04ebba96e6e28938c0bb08597581978af7829a))

# [1.0.0-alpha.13](https://github.com/simonseyock/jsdoc-type-pratt-parser/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2021-05-19)


### Bug Fixes

* **readme:** performance text ([824bdad](https://github.com/simonseyock/jsdoc-type-pratt-parser/commit/824bdad1fa56488ce55bef5699bc106de6eb135b))
