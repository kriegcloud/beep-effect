import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";
//----------------------------------------------------------------------------------------------------------------------
// Shared ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const OrganizationId = EntityId.make("organization", {
  brand: "OrganizationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/OrganizationId"),
    description: "A unique identifier for an organization",
  },
});

export declare namespace OrganizationId {
  export type Type = typeof OrganizationId.Type;
  export type Encoded = typeof OrganizationId.Encoded;
}
export const TeamId = EntityId.make("team", {
  brand: "TeamId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/TeamId"),
    description: "A unique identifier for a team",
  },
});

export declare namespace TeamId {
  export type Type = typeof TeamId.Type;
  export type Encoded = typeof TeamId.Encoded;
}

export const FileId = EntityId.make("file", {
  brand: "FileId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/FileId"),
    description: "A unique identifier for a file",
  },
});

export declare namespace FileId {
  export type Type = typeof FileId.Type;
  export type Encoded = typeof FileId.Encoded;
}

export const AuditLogId = EntityId.make("audit_log", {
  brand: "AuditLogId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/AuditLogId"),
    description: "A unique identifier for an audit log",
  },
});

export declare namespace AuditLogId {
  export type Type = typeof AuditLogId.Type;
  export type Encoded = typeof AuditLogId.Encoded;
}

export const UserId = EntityId.make("user", {
  brand: "UserId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/UserId"),
    description: "A unique identifier for a user",
  },
});

export declare namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;
}

export declare namespace SessionId {
  export type Type = S.Schema.Type<typeof SessionId>;
  export type Encoded = S.Schema.Encoded<typeof SessionId>;
}

export const SessionId = EntityId.make("session", {
  brand: "SessionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SessionId"),
    description: "A unique identifier for a session",
  },
});

export const FolderId = EntityId.make("folder", {
  brand: "FolderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/FolderId"),
    description: "A unique identifier for a Folder",
  },
});

export declare namespace FolderId {
  export type Type = typeof FolderId.Type;
  export type Encoded = typeof FolderId.Encoded;
}

export const UploadSessionId = EntityId.make("upload_session", {
  brand: "UploadSessionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared-domain/entity-ids/shared/UploadSessionId"),
    description: "A unique identifier for an upload session",
  },
});

export declare namespace UploadSessionId {
  export type Type = typeof UploadSessionId.Type;
  export type Encoded = typeof UploadSessionId.Encoded;
}

export const AgentId = EntityId.make("agent", {
  brand: "AgentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared-domain/entity-ids/shared/AgentId"),
    description: "A unique identifier for an Agent",
  },
});
