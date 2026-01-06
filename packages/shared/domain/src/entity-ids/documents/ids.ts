import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";

const $I = $SharedDomainId.create("entity-ids/documents/ids");

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
}).annotations(
  $I.annotations("DocumentVersionId", {
    description: "A unique identifier for a Document Version",
  })
);

export declare namespace DocumentVersionId {
  export type Type = typeof DocumentVersionId.Type;
  export type Encoded = typeof DocumentVersionId.Encoded;
}

export const DiscussionId = EntityId.make("discussion", {
  brand: "DiscussionId",
}).annotations(
  $I.annotations("DiscussionId", {
    description: "A unique identifier for a Discussion",
  })
);

export declare namespace DiscussionId {
  export type Type = typeof DiscussionId.Type;
  export type Encoded = typeof DiscussionId.Encoded;
}

export const CommentId = EntityId.make("comment", {
  brand: "CommentId",
}).annotations(
  $I.annotations("CommentId", {
    description: "A unique identifier for a Comment",
  })
);

export declare namespace CommentId {
  export type Type = typeof CommentId.Type;
  export type Encoded = typeof CommentId.Encoded;
}

export const DocumentFileId = EntityId.make("document_file", {
  brand: "DocumentFileId",
}).annotations(
  $I.annotations("DocumentFileId", {
    description: "A unique identifier for a Document File",
  })
);

export declare namespace DocumentFileId {
  export type Type = typeof DocumentFileId.Type;
  export type Encoded = typeof DocumentFileId.Encoded;
}
