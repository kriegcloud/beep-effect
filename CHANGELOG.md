# rdf-canonize ChangeLog

## 5.0.0 - 2025-11-20

### Removed
- **BREAKING**: Remove support for `rdf-canonize-native` and only support the
  included JavaScript implementation. Calling code should be adapted to switch
  between `rdf-canon` implementations at a higher level. This change simplifies
  the API and packaging complexities.

## 4.0.1 - 2023-11-15

### Fixed
- Fix EARL Turtle report.

## 4.0.0 - 2023-11-15

### Added
- Test with karma.
- Test with Node.js 20.x.
- Add `inputFormat` option. Use "application/n-quads" for a N-Quads string that
  will be parsed. Omit option for a JSON dataset. This can simplify a common
  case of using the internal parser to generate a dataset.
  - **NOTE**: The `inputFormat` option was previously ignored and is now used.
    Any calling code that was passing in an incorrect value needs to be fixed.
- Add `signal` option to allow use of an `AbortSignal` for complexity control.
  Enables the algorithm to abort after a timeout, manual abort, or other
  condition.
- Add `maxWorkFactor` to calculate a deep iteration limit based on the number
  of non-unique blank nodes. This defaults to `1` for roughly O(n) behavior and
  will handle common graphs. It must be adjusted to higher values if there is a
  need to process graphs with complex blank nodes or other "poison" graphs. It
  is recommended to use this parameter instead of `maxDeepIterations` directly.
  If `maxDeepIterations` is provided, then `maxWorkFactor` will be ignored.
- **BREAKING**: Check output `format` parameter. Must be omitted, falsy, or
  "application/n-quads".
- Add EARL Turtle test result mode.
- Add `EARL_OFFICIAL` env flag to setup official test report mode.
- Add `"react-native"` section to `package.json` (same as `"browser"`), and
  instructions for how to use this library with React Native.

### Changed
- **BREAKING**: Remove support for Node.js < 18. This is done to allow updates
  to tooling that no longer support older Node.js versions. The library code
  has not yet changed to be incompatible with older Node.js versions but it
  will no longer be tested and may become incompatible at any time.
- **BREAKING**: Change algorithm name from "URDNA2015" to "RDFC-1.0" to match
  [rdf-canon][] changes. Use of "URDNA2015" is now deprecated and an alias for
  "RDFC-1.0". An API option `rejectURDNA2015` is available to disable
  "URDNA2015" support. A global `RDF_CANONIZE_TRACE_URDNA2015` is available to
  developers to trace calls that use "URDNA2015". See the README for important
  compatibility notes and API details.
- **BREAKING**: Use latest [rdf-canon][] N-Quads canonical form. This can
  change the canonical output! There is an expanded set of literal string
  control characters that are escaped as an `ECHAR` or `UCHAR` instead of using
  a native representation.
  - Previously: the canonical N-Quads form used here was encoding `\u000A`
    (`\n`), `\u000D` (`\r`), `\u0022` (`"`), and `\u005C` (`\`) as `ECHARs`:
    `\n`, `\r`, `\"`, and `\\`, All other characters were represented as native
    Unicode.
  - Now: the output also encodes `\u0008` (`\b`), `\u0009` (`\t`), `\u000C`
    (`\f`) as `ECHARs` `\b`, `\t`, and `\f`, and encodes the "control"
    characters in the range of `\u0000-\u001F` and `\u007F` as `UCHARs`
    `\u00xx`. All other characters are represented as native Unicode.
- **BREAKING**: Use `globalThis` to access `crypto` in browsers. Use a polyfill
  if your environment doesn't support `globalThis`.
- **BREAKING**: Change dataset handling of `BlankNodes` to match the [RDF/JS:
  Data model specification](https://rdf.js.org/data-model-spec/). The `_:`
  prefix is no longer used in the `BlankNode` `value` field. This should
  improve compatibility with other RDF/JS tooling but may cause compatibility
  issues with existing code. The previous behavior is historical and may
  predate the RDF/JS spec.
- **BREAKING**: Change maximum deep iterations error text.
- Update tooling.
- Update for latest [rdf-canon][] changes: test suite location, README, links,
  and identifiers.
- More closely align test code with the version in [jsonld.js][].
  - Use combined test/benchmark system.
  - Support running multiple test jobs in parallel.
- Refactor `MessageDigest-browser.js` to `MessageDigest-webcrypto.js` so it can
  also be optionally used with Node.js.
- Move platform specific support into `platform.js` and `platform-browser.js`.
- Optimize WebCrypto bytes to hex conversion:
  - Improvement depends on number of digests performed.
  - Node.js using the improved browser algorithm can be ~4-9% faster overall.
  - Node.js native `Buffer` conversion can be ~5-12% faster overall.
- Optimize a N-Quads serialization call.
- Optimize N-Quads escape/unescape calling replace:
  - Run regex test before doing a replace call.
  - Performance difference depends on data and how often escape/unescape would
    need to be called. A benchmark test data showed ~3-5% overall improvement.
- Optimize N-Quads escape replacement:
  - Use a pre-computed map of replacement values.
  - Performance difference depends on the number of replacements. The
    [rdf-canon][] escaping test showed up to 15% improvement.
- Support generalized RDF `BlankNode` predicate during N-Quads serialization.

### Fixed
- Disable native lib tests in a browser.
- Disable sync tests in a browser. The sync code attempts to use the async
  webcrypto calls and produces invalid results. It is an error that this
  doesn't fail, but sync code is currently only for testing.
- Fix various testing and benchmark bugs.
- Escape and unescape all data.
- Support 8 hex char Unicode values.

### Removed
- **BREAKING**: Remove URGNA2012 support. [rdf-canon][] no longer supports or
  has a test suite for URGNA2012. URDNA2015 has been the preferred algorithm
  for many years.
- **BREAKING**: Remove deprecated support for legacy dataset format.
- Remove `benchmark/benchmark.js` tool in favor of combined test system and
  benchmarking control via environment vars.

## 3.4.0 - 2023-05-19

### Added
- Allow `canonicalIdMap` to be passed to `canonize` which will be populated by
  the canonical identifier issuer with the bnode identifier mapping generated
  by the canonicalization algorithm. This feature is particularly useful when
  the resulting bnode labels need to be changed for use cases such as selective
  disclosure.

## 3.3.0 - 2022-09-17

### Added
- Add optional `createMessageDigest` factory function for generating a
  `MessageDigest` interface. This allows different hash implementations or even
  different hash algorithms, including HMACs to be used with URDNA2015.  Note
  that using a different hash algorithm from SHA-256 will change the output.

## 3.2.1 - 2022-09-02

### Fixed
- Fix typo in unsupported algorithm error.

## 3.2.0 - 2022-09-02

### Changed
- Test that input is not changed.
- Optimize quad processing.

## 3.1.0 - 2022-08-30

### Added
- Allow a maximum number of iterations of the N-Degree Hash Quads algorithm to
  be set, preventing unusual datasets (and likely meaningless or malicious) from
  consuming unnecessary CPU cycles. If the set maximum is exceeded then an
  error will be thrown, terminating the canonize process. This option has only
  been added to URDNA2015. A future major breaking release is expected to set
  the maximum number of iterations to a safe value by default; this release is
  backwards compatible and therefore sets no default. A recommended value is
  `1`, which will cause, at most, each blank node to have the N-degree algorithm
  executed on it just once.

## 3.0.0 - 2021-04-07

### Changed
- **BREAKING**: Only support Node.js >= 12. Remove related tests, dependencies,
  and generated `node6` output.
- **BREAKING**: Remove browser bundles. Simplifies package and reduces install
  size. If you have a use case that requires the bundles, please file an issue.
- Fix browser override file path style.

## 2.0.1 - 2021-01-21

### Fixed
- Use `setimmediate` package for `setImmediate` polyfill. The previous custom
  polyfill was removed. This should allow current projects using this package
  to stay the same and allow an easy future transition to webpack v5.

## 2.0.0 - 2021-01-20

### Removed
- **BREAKING**: Removed public API for `canonizeSync`. It is still available
  for testing purposes but does not run in the browser.
- **BREAKING**: Removed dependency on `forge` which means that this library
  will only run in browsers that have support for the WebCrypto API (or
  an external polyfill for it).
- **BREAKING**: Do not expose `existing` on `IdentifierIssuer`. The old
  IDs can be retrieved in order via `getOldIds`.

### Changed
- General optimizations and modernization of the library.

### Added
- Add `getOldIds` function to `IdentifierIssuer`.

## 1.2.0 - 2020-09-30

### Changed
- Use node-forge@0.10.0.

## 1.1.0 - 2020-01-17

### Changed
- Optimize away length check on paths.
- Update node-forge dependency.
- Update semver dependency.

## 1.0.3 - 2019-03-06

### Changed
- Update node-forge dependency.

## 1.0.2 - 2019-02-21

### Fixed
- Fix triple comparator in n-quads parser.

### Added
- Add eslint support.

## 1.0.1 - 2019-01-23

### Changed
- Remove use of deprecated `util.isUndefined()`. Avoids unneeded `util`
  polyfill in webpack build.

## 1.0.0 - 2019-01-23

### Notes
- **WARNING**: This release has a **BREAKING** change that could cause the
  canonical N-Quads output to differ from previous releases. Specifically, tabs
  in literals are no longer escaped. No backwards compatibility mode is
  provided at this time but if you believe it is needed, please file an issue.
- If you wish to use the native bindings, you must now install
  `rdf-canonize-native` yourself. It is no longer a dependency. See below.

### Fixed
- **BREAKING**: N-Quad canonical serialized output.
  - Only escape 4 chars.
  - Now compatible with https://www.w3.org/TR/n-triples/#canonical-ntriples

### Changed
- Improve N-Quads parsing.
  - Unescape literals.
  - Handle Unicode escapes.
- N-Quad serialization optimization.
  - Varies based on input by roughly ~1-2x.
- **BREAKING**: Remove `rdf-canonize-native` as a dependency. The native
  bindings will still be used if `rdf-canonize-native` can be loaded. This
  means if you want the native bindings you *must* install them yourself. This
  change was done due to various problems caused by having any type of
  dependency involving the native code. With modern runtimes the JavaScript
  implementation is in many cases *faster*. The native bindings do have
  overhead but can be useful in cases where you need to offload canonizing into
  the background. It is recommended to perform benchmarks to determine which
  method works best in your case.
- Update webpack and babel.
- **BREAKING**: Remove `usePureJavaScript` option and make the JavaScript
  implementation the default. Add explicit `useNative` option to force the use
  of the native implementation from `rdf-canonize-native`. An error will be
  thrown if native bindings are not available.

## 0.3.0 - 2018-11-01

### Changed
- **BREAKING**: Move native support to optional `rdf-canonize-native` package.
  If native support is **required** in your environment then *also* add a
  dependency on the `rdf-canonize-native` package directly. This package only
  has an *optional* dependency on the native package to allow systems without
  native binding build tools to use the JavaScript implementation alone.

### Added
- Istanbul coverage support.

## 0.2.5 - 2018-11-01

### Fixed
- Accept N-Quads upper case language tag.
- Improve acceptable N-Quads blank node labels.

## 0.2.4 - 2018-04-25

### Fixed
- Update for Node.js 10 / OpenSSL 1.1 API.

### Changed
- Update nan dependency for Node.js 10 support.

## 0.2.3 - 2017-12-05

### Fixed
- Avoid variable length arrays. Not supported by some C++ compilers.

## 0.2.2 - 2017-12-04

### Fixed
- Use const array initializer sizes.

### Changed
- Comment out debug logging.

## 0.2.1 - 2017-10-16

### Fixed
- Distribute `binding.gyp`.

## 0.2.0 - 2017-10-16

### Added
- Benchmark tool using the same manifests as the test system.
- Support Node.js 6.
- Native Node.js addon support for URDNA2015. Improves performance.
- `usePureJavaScript` option to only use JavaScript.

## 0.1.5 - 2017-09-18

### Changed
- **BREAKING**: Remove Node.js 4.x testing and native support. Use a transpiler
  such as babel if you need further 4.x support.

## 0.1.4 - 2017-09-17

### Added
- Expose `IdentifierIssuer` helper class.

## 0.1.3 - 2017-09-17

### Fixed
- Fix build.

## 0.1.2 - 2017-09-17

### Changed
- Change internals to use ES6.
- Return Promise from API for async method.

## 0.1.1 - 2017-08-15

### Fixed
- Move node-forge to dependencies.

## 0.1.0 - 2017-08-15

### Added
- RDF Dataset Normalization async implementation from [jsonld.js][].
- webpack support.
- Split messageDigest into Node.js and browser files.
  - Node.js file uses native crypto module.
  - Browser file uses forge.
- See git history for all changes.

[jsonld.js]: https://github.com/digitalbazaar/jsonld.js
[rdf-canon]: https://w3c.github.io/rdf-canon/
