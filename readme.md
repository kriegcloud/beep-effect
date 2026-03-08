> ## RDFine /rɪdɪˈfaɪn/
> ### RDF/JS idiomatic, native, enjoyable

This is a monorepo containing JavaScript libraries which make it much easier to work with RDF using idiomatic JS object model yet at the same time keeping a close relation to the [RDF/JS data model specifications](https://rdf.js.org/data-model-spec/)

## Packages

### [@tpluscode/rdfine](packages/core)

Core library to define the JavaScript object model for RDF classes and properties

### Generated model packages for selected vocabularies:

* [@rdfine/as](vocabularies/as) - [Activity Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/)
* [@rdfine/csvw](vocabularies/csvw) - [Metadata Vocabulary for Tabular Data](https://www.w3.org/TR/tabular-metadata/)
* [@rdfine/dash](vocabularies/dash) - [DASH Data Shapes. Platform-independent extensions of SHACL for common tasks.](http://datashapes.org)
* [@rdfine/doap](vocabularies/doap) - [DOAP: Description Of A Project](https://github.com/ewilderj/doap)
* [@rdfine/foaf](vocabularies/foaf) - [FOAF: Friend of a Friend](http://xmlns.com/foaf/spec/)
* [@rdfine/hydra](vocabularies/hydra) - [Hydra Core Vocabulary](https://www.hydra-cg.com/spec/latest/core/)
* [@rdfine/owl](vocabularies/owl) - [OWL Web Ontology Language](https://www.w3.org/OWL/)
* [@rdfine/prov](vocabularies/prov) - [W3C PROVenance Interchange](https://www.w3.org/blog/SW/2013/03/21/prov-a-framework-for-provenance-interchange/)
* [@rdfine/rdf](vocabularies/rdf) - [The RDF Concepts Vocabulary](https://www.w3.org/TR/rdf11-concepts/)
* [@rdfine/rdfs](vocabularies/rdfs) - [The RDF Schema vocabulary](https://www.w3.org/TR/rdf-schema/)
* [@rdfine/rico](vocabularies/rico) - [Records in Contexts Ontology](https://ica-egad.github.io/RiC-O/)
* [@rdfine/schema](vocabularies/schema) - http://schema.org/
* [@rdfine/shacl](vocabularies/shacl) - [Shapes Constraint Language](https://www.w3.org/TR/shacl/)
* [@rdfine/sioc](vocabularies/sioc) - [SIOC (Semantically-Interlinked Online Communities)](http://rdfs.org/sioc/spec/)
* [@rdfine/skos](vocabularies/skos) - [SKOS Core Vocabulary](https://www.w3.org/TR/swbp-skos-core-spec/)
* [@rdfine/wgs](vocabularies/wgs) - [WGS84 Geo Positioning: an RDF vocabulary](https://www.w3.org/2003/01/geo/)

### [@rdfine/generator](packages/generator)

Used to generate the above `@rdfine/*` packages.
