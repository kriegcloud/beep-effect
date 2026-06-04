# @beep/ontology

Effect Schema style ontology authoring.

`@beep/ontology` stores ontology metadata in Effect Schema annotations, assembles
annotated schemas into an ontology model, and projects the result to compact
developer-friendly formats.

## Usage

```ts
import { Ontology } from "@beep/ontology"
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd"

console.log(Ontology)
console.log(XSD_STRING)
```

## Development

```bash
bun run --filter=@beep/ontology check
bun run --filter=@beep/ontology test
bun run --filter=@beep/ontology lint
```
