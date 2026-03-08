# @beep/semantic-web — Quick Start

> Exploratory spec for a schema-first semantic-web foundation package in this monorepo.

## Current Goal

Use this folder to converge on the shape of `@beep/semantic-web` before writing the implementation spec.

## What Is Already Decided

- `@beep/semantic-web` should be the canonical home for semantic-web foundation modules in this repo.
- JSON-LD is first-class in the initial surface.
- The package should optimize for `foundation + adapters`.
- `IRI` and `ProvO` are valid seed assets, but not the final package design by themselves.
- Ontology builder DSL work is exploratory and should stay out of the package center.

## Read In This Order

1. [README.md](./README.md)
2. [2026-03-08-initial-exploration.md](./research/2026-03-08-initial-exploration.md)
3. [2026-03-08-effect-v4-module-selection.md](./research/2026-03-08-effect-v4-module-selection.md)
4. [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts)
5. [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts)
6. [`.repos/beep-effect/packages/common/semantic-web/README.md`](../../../.repos/beep-effect/packages/common/semantic-web/README.md)
7. [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts)

## Highest-Value Local Subtrees

- [`.repos/semantic-web/jsonld.js`](../../../.repos/semantic-web/jsonld.js)
- [`.repos/semantic-web/jsonld-context-parser.js`](../../../.repos/semantic-web/jsonld-context-parser.js)
- [`.repos/semantic-web/jsonld-streaming-parser.js`](../../../.repos/semantic-web/jsonld-streaming-parser.js)
- [`.repos/semantic-web/jsonld-streaming-serializer.js`](../../../.repos/semantic-web/jsonld-streaming-serializer.js)
- [`.repos/semantic-web/rdf-canonize`](../../../.repos/semantic-web/rdf-canonize)
- [`.repos/semantic-web/traqula`](../../../.repos/semantic-web/traqula)
- [`.repos/semantic-web/comunica`](../../../.repos/semantic-web/comunica)
- [`.repos/semantic-web/shacl-engine`](../../../.repos/semantic-web/shacl-engine)

## What Comes Next

Once the topology is settled, this folder should expand into:

- `./design` documents describing the chosen module boundaries
- `./plans` documents describing phased implementation
- `./handoffs` prompts for delegated implementation or research phases
