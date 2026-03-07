## Provenance chain

A JSON schema defining objects that may be referenced or nested as a chain of Activities, Entities or Agents (or subclasses thereof)

This schema implements the PROV vocabulary semantics (through JSON-LD mapping directly to the PROV-O RDF model.)

## Object typing

Object typing needs to be explicit to support effective semantic mapping to the PROV vocabulary, and to support schema validation scope clarity (using the right sub-schema for objects in a collection representing the directed graph model of PROV).

`provType` may be used to map to the subClasses of the Provenance vocabulary.

Custom application object types are explicit (`activityType`, `agentType`, `entityType` to support schema validation clarity).



Note that entityType is optional and may be replaced by `featureType` for compatibility with the OGC Feature implementation (implicitly always an Entity)

likewise the use of the property `type` is not specified to allow compatibility with GeoJSON features that must have this property with a constant value ("Feature" or "FeatureCollection").

