# P2 — Adapter and Representation Design

## Purpose

Define the representation boundaries and adapter seams that let `@beep/semantic-web` stay foundation-oriented while still being interoperable.

## Representation Layers

| Layer | v1 Posture | Notes |
|---|---|---|
| semantic domain values | first-class | identifiers, RDF values, provenance, evidence |
| RDF/JS interop | first-class | primary adapter alignment for terms, quads, datasets |
| JSON-LD documents and contexts | first-class | document-layer and streaming seams both included |
| JSON-facing contract export | selective | JSON Schema allowed for documentation and JSON-facing DTOs only |
| JSON-LD document patching | selective | `JsonPatch` and `JsonPointer` stay at the document layer |
| RDF/XML | deferred | generic XML encoding is not RDF/XML support |

## Adapter Targets

| Reference | Targeted For | Notes |
|---|---|---|
| `jsonld-streaming-parser.js` | streaming parse adapter | `JSON-LD -> RDF/JS` |
| `jsonld-streaming-serializer.js` | streaming serialization adapter | `RDF/JS -> JSON-LD` |
| `shacl-engine` | validation adapter | SHACL core plus optional SPARQL plugin |

## Implementation References

| Reference | Used For | Notes |
|---|---|---|
| `jsonld.js` | document algorithms | compact / expand / frame / normalize behavior reference |
| `jsonld-context-parser.js` | context behavior | normalization and IRI compaction / expansion reference |
| `rdf-canonize` | canonicalization | bounded dataset fingerprinting backend reference |
| old `beep-effect` semantic-web package | local prior art | identifier and IDNA surface prior art |

## Research-Only References

| Reference | Why Not v1 |
|---|---|
| `traqula` | useful for query AST work, but too query-tooling-specific for the v1 foundation package identity |
| `comunica` | useful for future query runtime work, but too large and engine-specific for the v1 package boundary |

## Hidden Pitfall Policy

- remote context and remote document loading must be bounded and policy-controlled
- streaming adapters must document the difference between true streaming and buffered fallbacks
- canonicalization must expose bounded work and abort posture
- JSON-LD document helpers must not be described as RDF semantic diff tools
- RDF/XML must stay a separate adapter concern

## Outcome

P2 is complete. The representation boundaries and adapter seams are explicit enough for service-contract design and later implementation planning.

## Remaining Open Question

Should framing be part of the initial public JSON-LD document contract or a follow-on extension?

Recommended default:

- include framing in the public contract
- allow the first implementation slice to defer non-critical framing helpers if needed
