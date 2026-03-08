RDF Dataset Canonicalization Benchmark
--------------------------------------

The benchmark system uses the same manifest setup as the test suite. This
allows setting up both tests and benchmarks with one setup.

In the root dir run **all** test suite tests:

    BENCHMARK=1 npm t

To run a particular dir or file:

    BENCHMARK=1 TESTS=`pwd`/benchmark npm t
    BENCHMARK=1 TESTS=`pwd`/benchmark/m2.jsonld npm t

The `EARL` env var can be used to output test results. The `TEST_ENV` env var
is used to control data in the output. See the test script for details. Use the
benchmark `compare` script in [jsonld.js][] to compare different benchmark
runs.

As an addition to the test suite, tests can be marked with boolean "skip" or
"only" flags. The "only" support is a hack and requies the env var "ONLY" to be
set:

    ONLY=1 npm run benchmark
    ONLY=1 TEST_DIR=./benchmark npm run benchmark

Tests are benchmarked with a matrix of {async/sync} {x1/x10}.

To run large "block" benchmarks, run the builder script first:

    node make-tests.js

[jsonld.js]: https://github.com/digitalbazaar/jsonld.js
