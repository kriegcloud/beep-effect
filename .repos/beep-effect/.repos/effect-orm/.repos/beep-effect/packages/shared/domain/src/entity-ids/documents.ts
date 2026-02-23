import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";

const $I = $SharedDomainId.create("entity-ids/documents");

export class DocumentId extends EntityId.make("document", {
  brand: "DocumentId",
}).annotations(
  $I.annotations("DocumentId", {
    description: "A unique identifier for a Document",
  })
) {}

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
