# OGC Building Block template

This repository defines a "building block" for use of [PROV-O Vocabulary](https://www.w3.org/TR/prov-o/) using a schema valid for either JSON or JSON-LD implementation. (See ["Other Prov JSON serialisations"](#other-prov-json-serialisations) )



The "ready-to-use" form is generated [here:](https://ogcincubator.github.io/bblock-prov-schema/build/generateddocs/slate-build/ogc-utils/prov/index.html)

The **JSON schema** allows for either nested instances of PROV classes, or for arrays of objects linked by identifiers, and the use of external URI identifiers for PROV objects.

Such a schema is complex, and the purpose of this building block is to provide a canonical implementation supported by validation and examples.

The **JSON-LD** context binds these structures to the PROV-O vocabulary.

If provided **SHACL** rules perform consistency checking above and beyond schema validation.

## Other Prov JSON serialisations

NB. The W3C PROV working group published two early project drafts for JSON and JSON-LD serialisations, however these are not ideal solutions because:

- the JSON is not directly mappable to the PROV-O ontology via JSON-LD
- the JSON-LD serialisation is -LD specific and not compatible with normal JSON schemas. 
- neither is supported by a formally published JSON Schema.
- neither schema supports annotation of existing objects as prov:Entities - requiring specialised structures to register all entities under a "entities" property.

This building block defines a schema that avoids all these limitations. Users may choose to define a building block that allows either one of the published JSON forms or this schema for backwards compatibility, however there is little evidence of significant usage of the published drafts.

## General

[OGC Building Blocks](https://ogcincubator.github.io/bblocks-docs) are defined by the Open Geospatial Consortium to support implementation of customised applications consistent with OGC specifications.

Building Blocks are supported by git actions to post-process the components, testing the structure, examples and test-case data.
This post-processing handles the complex task of integrating references to other building blocks into a ready-to use form, allowing building blocks to be composed into complete applications.  

Many such BuildingBlocks define bindings to the object structures supported by APIs (such as GeoJSON Features). 

The PROV building block defines a **"datatype"** - i.e. a sub-schema that can be used to annotate such features or *any other schema*.

