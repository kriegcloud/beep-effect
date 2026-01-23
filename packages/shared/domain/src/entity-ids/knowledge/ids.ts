/**
 * Knowledge entity IDs
 *
 * Defines branded entity identifiers for the knowledge slice.
 *
 * @module knowledge/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId as EntityIdBuilder } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const make = EntityIdBuilder.builder("knowledge");
const $I = $SharedDomainId.create("entity-ids/knowledge/ids");

/**
 * Embedding entity ID.
 *
 * Identifier for embedding vectors supporting hybrid search.
 *
 * @since 0.1.0
 * @category ids
 */
export const EmbeddingId = make("embedding", {
  brand: "EmbeddingId",
}).annotations(
  $I.annotations("EmbeddingId", {
    description: "A unique identifier for an Embedding entity",
  })
);

export declare namespace EmbeddingId {
  export type Type = S.Schema.Type<typeof EmbeddingId>;
  export type Encoded = S.Schema.Encoded<typeof EmbeddingId>;

  export namespace RowId {
    export type Type = typeof EmbeddingId.privateSchema.Type;
    export type Encoded = typeof EmbeddingId.privateSchema.Encoded;
  }
}

/**
 * KnowledgeEntity ID for extracted knowledge graph entities.
 *
 * Identifier for entities extracted from text (e.g., Person, Organization).
 *
 * @since 0.1.0
 * @category ids
 */
export const KnowledgeEntityId = make("entity", {
  brand: "KnowledgeEntityId",
}).annotations(
  $I.annotations("KnowledgeEntityId", {
    description: "A unique identifier for a knowledge graph entity",
  })
);

export declare namespace KnowledgeEntityId {
  export type Type = typeof KnowledgeEntityId.Type;
  export type Encoded = typeof KnowledgeEntityId.Encoded;

  export namespace RowId {
    export type Type = typeof KnowledgeEntityId.privateSchema.Type;
    export type Encoded = typeof KnowledgeEntityId.privateSchema.Encoded;
  }
}

/**
 * Relation ID for knowledge graph relations.
 *
 * Identifier for relations between entities (subject-predicate-object triples).
 *
 * @since 0.1.0
 * @category ids
 */
export const RelationId = make("relation", {
  brand: "RelationId",
}).annotations(
  $I.annotations("RelationId", {
    description: "A unique identifier for a knowledge graph relation",
  })
);

export declare namespace RelationId {
  export type Type = S.Schema.Type<typeof RelationId>;
  export type Encoded = S.Schema.Encoded<typeof RelationId>;

  export namespace RowId {
    export type Type = typeof RelationId.privateSchema.Type;
    export type Encoded = typeof RelationId.privateSchema.Encoded;
  }
}

/**
 * Ontology ID for ontology definitions.
 *
 * Identifier for OWL/RDFS ontology files used for extraction.
 *
 * @since 0.1.0
 * @category ids
 */
export const OntologyId = make("ontology", {
  brand: "OntologyId",
}).annotations(
  $I.annotations("OntologyId", {
    description: "A unique identifier for an ontology definition",
  })
);

export declare namespace OntologyId {
  export type Type = S.Schema.Type<typeof OntologyId>;
  export type Encoded = S.Schema.Encoded<typeof OntologyId>;

  export namespace RowId {
    export type Type = typeof OntologyId.privateSchema.Type;
    export type Encoded = typeof OntologyId.privateSchema.Encoded;
  }
}

/**
 * Extraction ID for extraction run records.
 *
 * Identifier for knowledge extraction runs from documents.
 *
 * @since 0.1.0
 * @category ids
 */
export const ExtractionId = make("extraction", {
  brand: "ExtractionId",
}).annotations(
  $I.annotations("ExtractionId", {
    description: "A unique identifier for a knowledge extraction run",
  })
);

export declare namespace ExtractionId {
  export type Type = S.Schema.Type<typeof ExtractionId>;
  export type Encoded = S.Schema.Encoded<typeof ExtractionId>;

  export namespace RowId {
    export type Type = typeof ExtractionId.privateSchema.Type;
    export type Encoded = typeof ExtractionId.privateSchema.Encoded;
  }
}

/**
 * Mention ID for entity mentions in source text.
 *
 * Identifier for individual mentions of entities with provenance.
 *
 * @since 0.1.0
 * @category ids
 */
export const MentionId = make("mention", {
  brand: "MentionId",
}).annotations(
  $I.annotations("MentionId", {
    description: "A unique identifier for an entity mention in source text",
  })
);

export declare namespace MentionId {
  export type Type = S.Schema.Type<typeof MentionId>;
  export type Encoded = S.Schema.Encoded<typeof MentionId>;

  export namespace RowId {
    export type Type = typeof MentionId.privateSchema.Type;
    export type Encoded = typeof MentionId.privateSchema.Encoded;
  }
}

/**
 * ClassDefinition ID for OWL/RDFS class definitions.
 *
 * Identifier for class definitions parsed from ontology files.
 *
 * @since 0.1.0
 * @category ids
 */
export const ClassDefinitionId = make("class_definition", {
  brand: "ClassDefinitionId",
}).annotations(
  $I.annotations("ClassDefinitionId", {
    description: "A unique identifier for an OWL/RDFS class definition",
  })
);

export declare namespace ClassDefinitionId {
  export type Type = S.Schema.Type<typeof ClassDefinitionId>;
  export type Encoded = S.Schema.Encoded<typeof ClassDefinitionId>;

  export namespace RowId {
    export type Type = typeof ClassDefinitionId.privateSchema.Type;
    export type Encoded = typeof ClassDefinitionId.privateSchema.Encoded;
  }
}

/**
 * PropertyDefinition ID for OWL/RDFS property definitions.
 *
 * Identifier for property definitions parsed from ontology files.
 *
 * @since 0.1.0
 * @category ids
 */
export const PropertyDefinitionId = make("property_definition", {
  brand: "PropertyDefinitionId",
}).annotations(
  $I.annotations("PropertyDefinitionId", {
    description: "A unique identifier for an OWL/RDFS property definition",
  })
);

export declare namespace PropertyDefinitionId {
  export type Type = S.Schema.Type<typeof PropertyDefinitionId>;
  export type Encoded = S.Schema.Encoded<typeof PropertyDefinitionId>;

  export namespace RowId {
    export type Type = typeof PropertyDefinitionId.privateSchema.Type;
    export type Encoded = typeof PropertyDefinitionId.privateSchema.Encoded;
  }
}

/**
 * EntityCluster ID for entity resolution clusters.
 *
 * Identifier for clusters of entities identified as referring to the same real-world entity.
 *
 * @since 0.1.0
 * @category ids
 */
export const EntityClusterId = make("entity_cluster", {
  brand: "EntityClusterId",
}).annotations(
  $I.annotations("EntityClusterId", {
    description: "A unique identifier for an entity resolution cluster",
  })
);

export declare namespace EntityClusterId {
  export type Type = S.Schema.Type<typeof EntityClusterId>;
  export type Encoded = S.Schema.Encoded<typeof EntityClusterId>;

  export namespace RowId {
    export type Type = typeof EntityClusterId.privateSchema.Type;
    export type Encoded = typeof EntityClusterId.privateSchema.Encoded;
  }
}

/**
 * SameAsLink ID for owl:sameAs provenance links.
 *
 * Identifier for links between entities that refer to the same real-world entity.
 *
 * @since 0.1.0
 * @category ids
 */
export const SameAsLinkId = make("same_as_link", {
  brand: "SameAsLinkId",
}).annotations(
  $I.annotations("SameAsLinkId", {
    description: "A unique identifier for an owl:sameAs provenance link",
  })
);

export declare namespace SameAsLinkId {
  export type Type = S.Schema.Type<typeof SameAsLinkId>;
  export type Encoded = S.Schema.Encoded<typeof SameAsLinkId>;

  export namespace RowId {
    export type Type = typeof SameAsLinkId.privateSchema.Type;
    export type Encoded = typeof SameAsLinkId.privateSchema.Encoded;
  }
}
