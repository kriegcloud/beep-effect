import { EntityId } from "@beep/schema/identity";

export const KnowledgePageId = EntityId.make("knowledge_page", {
  brand: "KnowledgePageId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/knowledge-management/KnowledgePageId"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace KnowledgePageId {
  export type Type = typeof KnowledgePageId.Type;
  export type Encoded = typeof KnowledgePageId.Encoded;
}

export const KnowledgeBlockId = EntityId.make("knowledge_block", {
  brand: "KnowledgeBlockId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/knowledge-management/KnowledgeBlockId"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace KnowledgeBlockId {
  export type Type = typeof KnowledgeBlockId.Type;
  export type Encoded = typeof KnowledgeBlockId.Encoded;
}

export const PageLinkId = EntityId.make("page_link", {
  brand: "PageLinkId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/knowledge-management/PageLinkId"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace PageLinkId {
  export type Type = typeof PageLinkId.Type;
  export type Encoded = typeof PageLinkId.Encoded;
}

export const KnowledgeSpaceId = EntityId.make("knowledge_space", {
  brand: "KnowledgeSpaceId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/knowledge-management/KnowledgeSpaceId"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace KnowledgeSpaceId {
  export type Type = typeof KnowledgeSpaceId.Type;
  export type Encoded = typeof KnowledgeSpaceId.Encoded;
}
