import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/shared/ids");

const make = EntityId.builder("shared");

export const OrganizationId = make("organization", {
  brand: "OrganizationId",
  actions: ["manage_settings", "manage_members", "delete", "transfer_ownership"],
}).annotations(
  $I.annotations("OrganizationId", {
    description: "A unique identifier for an organization",
  })
);

export declare namespace OrganizationId {
  export type Type = typeof OrganizationId.Type;
  export type Encoded = typeof OrganizationId.Encoded;

  export namespace RowId {
    export type Type = typeof OrganizationId.privateSchema.Type;
    export type Encoded = typeof OrganizationId.privateSchema.Encoded;
  }
}

export const TeamId = make("team", {
  brand: "TeamId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("TeamId", {
    description: "A unique identifier for a team",
  })
);

export declare namespace TeamId {
  export type Type = typeof TeamId.Type;
  export type Encoded = typeof TeamId.Encoded;

  export namespace RowId {
    export type Type = typeof TeamId.privateSchema.Type;
    export type Encoded = typeof TeamId.privateSchema.Encoded;
  }
}

export const FileId = make("file", {
  brand: "FileId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("FileId", {
    description: "A unique identifier for a file",
  })
);

export declare namespace FileId {
  export type Type = typeof FileId.Type;
  export type Encoded = typeof FileId.Encoded;

  export namespace RowId {
    export type Type = typeof FileId.privateSchema.Type;
    export type Encoded = typeof FileId.privateSchema.Encoded;
  }
}

export const AuditLogId = make("audit_log", {
  brand: "AuditLogId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("AuditLogId", {
    description: "A unique identifier for an audit log",
  })
);

export declare namespace AuditLogId {
  export type Type = typeof AuditLogId.Type;
  export type Encoded = typeof AuditLogId.Encoded;

  export namespace RowId {
    export type Type = typeof AuditLogId.privateSchema.Type;
    export type Encoded = typeof AuditLogId.privateSchema.Encoded;
  }
}

export const UserId = make("user", {
  brand: "UserId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("UserId", {
    description: "A unique identifier for a user",
  })
);

export declare namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;

  export namespace RowId {
    export type Type = typeof UserId.privateSchema.Type;
    export type Encoded = typeof UserId.privateSchema.Encoded;
  }
}

export const SessionId = make("session", {
  brand: "SessionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("SessionId", {
    description: "A unique identifier for a session",
  })
);

export declare namespace SessionId {
  export type Type = S.Schema.Type<typeof SessionId>;
  export type Encoded = S.Schema.Encoded<typeof SessionId>;

  export namespace RowId {
    export type Type = typeof SessionId.privateSchema.Type;
    export type Encoded = typeof SessionId.privateSchema.Encoded;
  }
}

export const FolderId = make("folder", {
  brand: "FolderId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("FolderId", {
    description: "A unique identifier for a Folder",
  })
);

export declare namespace FolderId {
  export type Type = typeof FolderId.Type;
  export type Encoded = typeof FolderId.Encoded;

  export namespace RowId {
    export type Type = typeof FolderId.privateSchema.Type;
    export type Encoded = typeof FolderId.privateSchema.Encoded;
  }
}

export const UploadSessionId = make("upload_session", {
  brand: "UploadSessionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("UploadSessionId", {
    description: "A unique identifier for an upload session",
  })
);

export declare namespace UploadSessionId {
  export type Type = typeof UploadSessionId.Type;
  export type Encoded = typeof UploadSessionId.Encoded;

  export namespace RowId {
    export type Type = typeof UploadSessionId.privateSchema.Type;
    export type Encoded = typeof UploadSessionId.privateSchema.Encoded;
  }
}

export const AgentId = make("agent", {
  brand: "AgentId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("AgentId", {
    description: "A unique identifier for an Agent",
  })
);
export declare namespace AgentId {
  export type Type = typeof AgentId.Type;
  export type Encoded = typeof AgentId.Encoded;

  export namespace RowId {
    export type Type = typeof AgentId.privateSchema.Type;
    export type Encoded = typeof AgentId.privateSchema.Encoded;
  }
}

export const Ids = {
  OrganizationId,
  TeamId,
  FileId,
  AuditLogId,
  UserId,
  SessionId,
  FolderId,
  UploadSessionId,
  AgentId,
} as const;
