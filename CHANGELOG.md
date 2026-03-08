# Changelog

## 0.4.0

* Add method aliases for RDF/JS DatasetCore compatibility

    In compliance with [RDF/JS: Dataset specification 1.0](https://rdf.js.org/dataset-spec/)

## 0.3.0

* Use the Map instead of dataset indices to retrieve and count quads: https://github.com/rdf-ext/rdf-dataset-indexed/pull/2

    This has dramatic effects on some dependencies, for instance https://github.com/rdf-ext/rdf-utils-dataset/blob/6039ad5edad37ac031c0423083239fbcdeedc9be/benchmark/resourcesToGraph.js

    ```diff
    ❯ node benchmark/resourcesToGraph.js
    - resourcesToGraph: 3609.302ms
    + resourcesToGraph:  494.445ms
    ```

## 0.2.0

* Fix a bug where the factory wasn't properly used: https://github.com/rdf-ext/rdf-dataset-indexed/pull/1

## 0.1.1

* Initial release