# RDF/JS Types

Authoritative TypeScript typings for all RDF/JS specifications

The types should match the RDF/JS specifications ([Data Model](https://rdf.js.org/data-model-spec/), [Dataset](https://rdf.js.org/dataset-spec/) and [Stream](https://rdf.js.org/stream-spec/)). However, because they also take advantage of TypecScript-specific syntax features, some differences are inevitable. If something does not add up, please open an [issue](#contributing).

## Usage

Installed as usual using your favourite package manager.

```
yarn add @rdfjs/types
```

This package does not provide code, only interafces for the RDF/JS specifications. Import them to strong-type your RDF/JS code.

```typescript
import type { NamedNode, DatasetCore, Stream } from '@rdfjs/types'
```

Or import separately from type modules corresponding the specifications.

```typescript
import type { NamedNode } from '@rdfjs/types/data-model'
import type { DatasetCore } from '@rdfjs/types/dataset'
import type { Stream } from '@rdfjs/types/stream'
``````

## Additional Types

Note that some helper types exist that do not exist within the RDF/JS specifications. These include:

```typescript
import type { TripleTermName, QuadTermName } from '@rdfjs/types'
```

## Contributing

Everyone is invited to open issues and pull requests. When you create a PR, please add or update the `rdf-js-tests.ts` file to reflect your changes.

You may also create a [changeset](https://github.com/atlassian/changesets) file by running `npx run changeset` and following the simple wizard. If you don't do that, such as in the case when editing from your browser, do not worry. A maintainer can also create it for you when you open a PR.

## What about @types/rdf-js?

This package replaces typings previously managed in the [DefinitelyTyped repository](https://npm.im/@types/rdf-js) and a later proxy package [rdf-js](https://npm.im/rdf-js).

Both these old packages are deprecated. They will continue to work for backwards compatibility but library maintainers are encouraged to use `@rdfjs/types` instead.
