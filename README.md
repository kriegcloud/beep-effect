# rdf-canonize

[![Build status](https://img.shields.io/github/actions/workflow/status/digitalbazaar/rdf-canonize/main.yaml)](https://github.com/digitalbazaar/rdf-canonize/actions/workflows/main.yaml)
[![Coverage status](https://img.shields.io/codecov/c/github/digitalbazaar/rdf-canonize)](https://codecov.io/gh/digitalbazaar/rdf-canonize)

An implementation of the [RDF Dataset Canonicalization][] specification in
JavaScript.

Introduction
------------

See the [RDF Dataset Canonicalization][] specification for details on the
specification and algorithm this library implements.

Installation
------------

### Node.js + npm

```
npm install rdf-canonize
```

```js
const canonize = require('rdf-canonize');
```


### Browser + npm

Install in your project with `npm` and use your favorite browser bundler tool.

Examples
--------

```js
// canonize a dataset with the default algorithm

const dataset = [
  // ...
];
const canonical = await canonize.canonize(dataset, {algorithm: 'RDFC-1.0'});

// parse and canonize N-Quads with the default algorithm

const nquads = "...";
const canonical = await canonize.canonize(nquads, {
  algorithm: 'RDFC-1.0',
  inputFormat: 'application/n-quads'
});
```

### Using with React Native

Using this library with React Native requires a polyfill such as
[`data-integrity-rn`](https://github.com/digitalcredentials/data-integrity-rn)
to be imported before this library:

```js
import '@digitalcredentials/data-integrity-rn'
import * as canonize from 'rdf-canonize'
```

The polyfill needs to provide the following globals:

* `crypto.subtle`
* `TextEncoder`

Algorithm Support
-----------------

* "[RDFC-1.0][]": Supported.
  * Primary algorithm in the [RDF Dataset Canonicalization][] specification.
* "[URDNA2015][]": Deprecated and supported as an alias for "RDFC-1.0".
  * Former algorithm name that evolved into "RDFC-1.0".
  * **NOTE**: There are minor differences in the [canonical N-Quads
    form](https://w3c.github.io/rdf-canon/spec/#canonical-quads) that *could*
    cause canonical output differences in some cases. See the 4.0.0 changelog
    or code for details. If strict "URDNA2015" support is required, use a 3.x
    version of this library.
  * See the migration section below if you have code that uses the "URDNA2015"
    algorithm name.
* "[URGNA2012][]": No longer supported.
  * Older algorithm with significant differences from newer algorithms.
  * Use older versions of this library if support is needed.

URDNA2015 Migration
-------------------

* The deprecated "URDNA2015" algorithm name is currently supported as an alias
  for "RDFC-1.0".
* There is a minor difference that could cause compatibility issues. It is
  considered an edge case that will not be an issue in practice. See above for
  details.
* Two tools are currently provided to help transition to "RDFC-1.0":
  * If the API option `rejectURDNA2015` is truthy, it will cause an error to be
    thrown if "URDNA2015" is used.
  * If the global `RDF_CANONIZE_TRACE_URDNA2015` is truthy, it will cause
    `console.trace()` to be called when "URDNA2015" is used. This is designed
    for *development use only* to find where "URDNA2015" is being used. It
    could be *very* verbose.

Complexity Control
------------------

Inputs may vary in complexity and some inputs may use more computational
resources than desired. There also exists a class of inputs that are sometimes
referred to as "poison" graphs. These are structured or designed specifically
to be difficult to process but often do not provide any useful purpose.

### Signals

The `canonize` API accepts an
[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
as the `signal` parameter that can be used to control processing of
computationally difficult inputs. `signal` is not set by default. It can be
used in a number of ways:

- Abort processing manually with
  [`AbortController.abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
- Abort processing after a timeout with
  [`AbortSignal.timeout()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- Abort after any other desired condition with a custom `AbortSignal`. This
  could track memory pressure or system load.
- A combination of conditions with an aggregated `AbortSignal` such as with
  [`AbortSignal.any()`](https://github.com/shaseley/abort-signal-any/) or
  [signals](https://github.com/toebeann/signals).

For performance reasons this signal is only checked periodically during
processing and is not immediate.

### Limits

The `canonize` API has parameters to limit how many times the blank node deep
comparison algorithm can be run to assign blank node labels before throwing an
error. It is designed to control exponential growth related to the number of
blank nodes. Graphs without blank nodes, and those with simple blank nodes will
not run the algorithms that use this parameter. Those with more complex deeply
connected blank nodes can result in significant time complexity which these
parameters can control.

The `canonize` API has the following parameters to control limits:

- `maxWorkFactor`: Used to calculate a maximum number of deep iterations based
  on the number of non-unique blank nodes.
  - `0`: Deep inspection disallowed.
  - `1`: Limit deep iterations to O(n). (default)
  - `2`: Limit deep iterations to O(n^2).
  - `3`: Limit deep iterations to O(n^3). Values at this level or higher will
    allow processing of complex "poison" graphs but may take significant
    amounts of computational resources.
  - `Infinity`: No limitation.
- `maxDeepIterations`: The exact number of deep iterations. This parameter is
  for specialized use cases and use of `maxWorkFactor` is recommended. Defaults
  to `Infinity` and any other value will override `maxWorkFactor`.

### Usage

In practice, callers must balance system load, concurrent processing, expected
input size and complexity, and other factors to determine which complexity
controls to use. This library defaults to a `maxWorkFactor` of `1` and no
timeout signal. These can be adjusted as needed.

Related Modules
---------------

* [jsonld.js][]: An implementation of the [JSON-LD][] specification.

Tests
-----

This library includes a sample testing utility which may be used to verify
that changes to the processor maintain the correct output.

The test suite is included in an external repository:

    https://github.com/w3c/rdf-canon

This should be a sibling directory of the `rdf-canonize` directory or in a
`test-suites` directory. To clone shallow copies into the `test-suites`
directory you can use the following:

    npm run fetch-test-suite

Node.js tests:

    npm test

Browser tests via Karma:

    npm run test-karma

If you installed the test suites elsewhere, or wish to run other tests, use
the `TEST_DIR` environment var:

    TEST_DIR="/tmp/tests" npm test

To generate EARL reports:

    # generate a JSON-LD EARL report with Node.js
    EARL=earl-node.jsonld npm test

    # generate a Turtle EARL report with Node.js
    EARL=js-rdf-canonize-earl.ttl npm test

    # generate official Turtle EARL report with Node.js
    # turns ASYNC on and SYNC and WEBCRYPTO off
    EARL_OFFICIAL=true EARL=js-rdf-canonize-earl.ttl npm test

Benchmark
---------

See docs in the [benchmark README](./benchmark/README.md).

Source
------

The source code for this library is available at:

https://github.com/digitalbazaar/rdf-canonize

Commercial Support
------------------

Commercial support for this library is available upon request from
[Digital Bazaar][]: support@digitalbazaar.com

[Digital Bazaar]: https://digitalbazaar.com/
[JSON-LD]: https://json-ld.org/
[RDF Dataset Canonicalization]: https://w3c.github.io/rdf-canon/spec/
[RDFC-1.0]: https://w3c.github.io/rdf-canon/spec/
[URDNA2015]: https://w3c.github.io/rdf-canon/spec/#urdna2015
[URGNA2012]: https://w3c.github.io/rdf-canon/spec/#urgna2012
[jsonld.js]: https://github.com/digitalbazaar/jsonld.js
