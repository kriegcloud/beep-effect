## Provenance object references

To support flexible provenance models, where provenance is naturally a DAG (acyclic graph) requires ability to cross-reference by identifiers. 

Sometimes however simple nesting is simpler than managing seperate objects elsewhere in a serialisation.

These utility schemas provide for referencing by identifier, arrays of identifiers, or nested objects. 

Identifiers are anything that can be turned into a URI - including qnames, CURIES and absolute URLs.
