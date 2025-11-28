import { EntityId } from "@beep/schema/identity";

export const KnowledgePageId = EntityId.make("knowledge_page", {
  brand: "KnowledgePageId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/KnowledgePageId"),
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
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/KnowledgeBlockId"),
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
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/PageLinkId"),
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
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/KnowledgeSpaceId"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace KnowledgeSpaceId {
  export type Type = typeof KnowledgeSpaceId.Type;
  export type Encoded = typeof KnowledgeSpaceId.Encoded;
}

export const DocumentId = EntityId.make("document", {
  brand: "DocumentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/DocumentId"),
    description: "A unique identifier for a Document",
  },
});

export declare namespace DocumentId {
  export type Type = typeof DocumentId.Type;
  export type Encoded = typeof DocumentId.Encoded;
}

export const DocumentVersionId = EntityId.make("document_version", {
  brand: "DocumentVersionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/DocumentVersionId"),
    description: "A unique identifier for a Document Version",
  },
});

export declare namespace DocumentVersionId {
  export type Type = typeof DocumentVersionId.Type;
  export type Encoded = typeof DocumentVersionId.Encoded;
}

export const DiscussionId = EntityId.make("discussion", {
  brand: "DiscussionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/DiscussionId"),
    description: "A unique identifier for a Discussion",
  },
});

export declare namespace DiscussionId {
  export type Type = typeof DiscussionId.Type;
  export type Encoded = typeof DiscussionId.Encoded;
}

export const CommentId = EntityId.make("comment", {
  brand: "CommentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/CommentId"),
    description: "A unique identifier for a Comment",
  },
});

export declare namespace CommentId {
  export type Type = typeof CommentId.Type;
  export type Encoded = typeof CommentId.Encoded;
}

export const DocumentFileId = EntityId.make("document_file", {
  brand: "DocumentFileId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/DocumentFileId"),
    description: "A unique identifier for a Document File",
  },
});

export declare namespace DocumentFileId {
  export type Type = typeof DocumentFileId.Type;
  export type Encoded = typeof DocumentFileId.Encoded;
}
