/**
 * Pipeline message types — document ingestion stages.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { Term, Triple } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Pipeline");

/**
 * Shared metadata attached to graph pipeline stage messages.
 *
 * @since 0.1.0
 * @category models
 */
export class PipelineMetadata extends S.Class<PipelineMetadata>($I`PipelineMetadata`)({
  id: S.String.annotateKey({
    description: "Stable pipeline job identifier.",
  }),
  root: S.String.annotateKey({
    description: "Root document identifier for the ingestion job.",
  }),
  user: S.String.annotateKey({
    description: "Owner or tenant responsible for the pipeline job.",
  }),
  collection: S.String.annotateKey({
    description: "Collection identifier targeted by the ingestion job.",
  }),
}, $I.annote("PipelineMetadata", {
  description: "Shared metadata attached to graph pipeline stage messages.",
})) {}

/**
 * Pipeline stage payload referencing a document by identifier.
 *
 * @since 0.1.0
 * @category models
 */
export class Document extends S.Class<Document>($I`Document`)({
  metadata: PipelineMetadata.annotateKey({
    description: "Shared pipeline metadata for the document message.",
  }),
  documentId: S.String.annotateKey({
    description: "Stable document identifier carried through the pipeline.",
  }),
}, $I.annote("Document", {
  description: "Pipeline stage payload referencing a document by identifier.",
})) {}

/**
 * Pipeline stage payload carrying extracted document text.
 *
 * @since 0.1.0
 * @category models
 */
export class TextDocument extends S.Class<TextDocument>($I`TextDocument`)({
  metadata: PipelineMetadata.annotateKey({
    description: "Shared pipeline metadata for the text document message.",
  }),
  text: S.String.annotateKey({
    description: "Extracted text content for the document.",
  }),
  documentId: S.String.annotateKey({
    description: "Stable document identifier carried through the pipeline.",
  }),
}, $I.annote("TextDocument", {
  description: "Pipeline stage payload carrying extracted document text.",
})) {}

/**
 * Pipeline stage payload carrying a document chunk.
 *
 * @since 0.1.0
 * @category models
 */
export class Chunk extends S.Class<Chunk>($I`Chunk`)({
  metadata: PipelineMetadata.annotateKey({
    description: "Shared pipeline metadata for the chunk message.",
  }),
  chunk: S.String.annotateKey({
    description: "Chunk text emitted by the document chunking stage.",
  }),
  documentId: S.String.annotateKey({
    description: "Stable document identifier associated with the chunk.",
  }),
}, $I.annote("Chunk", {
  description: "Pipeline stage payload carrying a document chunk.",
})) {}

/**
 * Extracted entity plus its supporting chunk context.
 *
 * @since 0.1.0
 * @category models
 */
export class EntityContext extends S.Class<EntityContext>($I`EntityContext`)({
  entity: Term.annotateKey({
    description: "Entity term extracted from the chunk context.",
  }),
  context: S.String.annotateKey({
    description: "Textual context surrounding the extracted entity.",
  }),
  chunkId: S.String.annotateKey({
    description: "Identifier of the chunk from which the entity was extracted.",
  }),
}, $I.annote("EntityContext", {
  description: "Extracted entity plus its supporting chunk context.",
})) {}

/**
 * Pipeline stage payload carrying extracted entity contexts.
 *
 * @since 0.1.0
 * @category models
 */
export class EntityContexts extends S.Class<EntityContexts>($I`EntityContexts`)({
  metadata: PipelineMetadata.annotateKey({
    description: "Shared pipeline metadata for the entity-context message.",
  }),
  entities: S.Array(EntityContext).annotateKey({
    description: "Extracted entities and their supporting contexts.",
  }),
}, $I.annote("EntityContexts", {
  description: "Pipeline stage payload carrying extracted entity contexts.",
})) {}

/**
 * Pipeline stage payload carrying extracted semantic triples.
 *
 * @since 0.1.0
 * @category models
 */
export class Triples extends S.Class<Triples>($I`Triples`)({
  metadata: PipelineMetadata.annotateKey({
    description: "Shared pipeline metadata for the triple message.",
  }),
  triples: S.Array(Triple).annotateKey({
    description: "Semantic triples extracted during the pipeline run.",
  }),
}, $I.annote("Triples", {
  description: "Pipeline stage payload carrying extracted semantic triples.",
})) {}
