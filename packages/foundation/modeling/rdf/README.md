# @beep/rdf

Domain-safe RDF and linked-data modeling primitives.

`@beep/rdf` owns pure value models for IRI/URI identifiers, RDF/JS-aligned
terms and datasets, bounded JSON-LD value shapes, and core vocabulary constants.
It is a `foundation/modeling` package so domain schemas can import it without
taking a dependency on `@beep/semantic-web`.

## Canonical Imports

```ts
import { IRI } from "@beep/rdf/Iri"
import { NamedNode, makeNamedNode } from "@beep/rdf/Rdf"
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd"
```

## Development

```bash
bun run --filter=@beep/rdf check
bun run --filter=@beep/rdf test
bun run --filter=@beep/rdf lint
```
