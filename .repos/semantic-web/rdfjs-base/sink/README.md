# @rdfjs/sink

[![build status](https://img.shields.io/github/actions/workflow/status/rdfjs-base/sink/test.yaml?branch=master)](https://github.com/rdfjs-base/sink/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/@rdfjs/sink.svg)](https://www.npmjs.com/package/@rdfjs/sink)

The @rdfjs/sink package provides a wrapper for [stream](http://rdf.js.org/stream-spec/#stream-interface) classes implementing the [Sink](http://rdf.js.org/stream-spec/#sink-interface) interface.
It instantiates stream objects in the import method and forwards the options to the constructor.
