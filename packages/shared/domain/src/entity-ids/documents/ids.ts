import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";

const $I = $SharedDomainId.create("entity-ids/documents/ids");
const make = EntityId.builder("documents");

export class DocumentId extends make("document", {
  brand: "DocumentId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("DocumentId", {
    description: "A unique identifier for a Document",
  })
) {}

export declare namespace DocumentId {
  export type Type = typeof DocumentId.Type;
  export type Encoded = typeof DocumentId.Encoded;
  export namespace RowId {
    export type Type = typeof DocumentId.privateSchema.Type;
    export type Encoded = typeof DocumentId.privateSchema.Encoded;
  }
}

export const DocumentVersionId = make("document_version", {
  brand: "DocumentVersionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("DocumentVersionId", {
    description: "A unique identifier for a Document Version",
  })
);

export declare namespace DocumentVersionId {
  export type Type = typeof DocumentVersionId.Type;
  export type Encoded = typeof DocumentVersionId.Encoded;
  export namespace RowId {
    export type Type = typeof DocumentVersionId.privateSchema.Type;
    export type Encoded = typeof DocumentVersionId.privateSchema.Encoded;
  }
}

export const DiscussionId = make("discussion", {
  brand: "DiscussionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("DiscussionId", {
    description: "A unique identifier for a Discussion",
  })
);

export declare namespace DiscussionId {
  export type Type = typeof DiscussionId.Type;
  export type Encoded = typeof DiscussionId.Encoded;
  export namespace RowId {
    export type Type = typeof DiscussionId.privateSchema.Type;
    export type Encoded = typeof DiscussionId.privateSchema.Encoded;
  }
}

export const CommentId = make("comment", {
  brand: "CommentId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("CommentId", {
    description: "A unique identifier for a Comment",
  })
);

export declare namespace CommentId {
  export type Type = typeof CommentId.Type;
  export type Encoded = typeof CommentId.Encoded;
  export namespace RowId {
    export type Type = typeof CommentId.privateSchema.Type;
    export type Encoded = typeof CommentId.privateSchema.Encoded;
  }
}

export const DocumentFileId = make("document_file", {
  brand: "DocumentFileId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("DocumentFileId", {
    description: "A unique identifier for a Document File",
  })
);

export declare namespace DocumentFileId {
  export type Type = typeof DocumentFileId.Type;
  export type Encoded = typeof DocumentFileId.Encoded;
  export namespace RowId {
    export type Type = typeof DocumentFileId.privateSchema.Type;
    export type Encoded = typeof DocumentFileId.privateSchema.Encoded;
  }
}

export class PageId extends make("page", {
  brand: "PageId",
  actions: ["create", "read", "update", "delete", "share", "move", "archive", "*"],
}).annotations(
  $I.annotations("PageId", {
    description: "A unique identifier for a Page (universal container with infinite nesting)",
  })
) {}

export declare namespace PageId {
  export type Type = typeof PageId.Type;
  export type Encoded = typeof PageId.Encoded;
  export namespace RowId {
    export type Type = typeof PageId.privateSchema.Type;
    export type Encoded = typeof PageId.privateSchema.Encoded;
  }
}

export const PageShareId = make("page_share", {
  brand: "PageShareId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("PageShareId", {
    description: "A unique identifier for a Page Share permission entry",
  })
);

export declare namespace PageShareId {
  export type Type = typeof PageShareId.Type;
  export type Encoded = typeof PageShareId.Encoded;
  export namespace RowId {
    export type Type = typeof PageShareId.privateSchema.Type;
    export type Encoded = typeof PageShareId.privateSchema.Encoded;
  }
}

export const Ids = {
  DocumentId,
  DocumentVersionId,
  DiscussionId,
  CommentId,
  DocumentFileId,
  PageId,
  PageShareId,
} as const;
