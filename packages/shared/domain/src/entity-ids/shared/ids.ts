import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/shared/ids");

export const OrganizationId = EntityId.make("organization", {
  brand: "OrganizationId",
}).annotations(
  $I.annotations("OrganizationId", {
    description: "A unique identifier for an organization",
  })
);

export declare namespace OrganizationId {
  export type Type = typeof OrganizationId.Type;
  export type Encoded = typeof OrganizationId.Encoded;
}

export const TeamId = EntityId.make("team", {
  brand: "TeamId",
}).annotations(
  $I.annotations("TeamId", {
    description: "A unique identifier for a team",
  })
);

export declare namespace TeamId {
  export type Type = typeof TeamId.Type;
  export type Encoded = typeof TeamId.Encoded;
}

export const FileId = EntityId.make("file", {
  brand: "FileId",
}).annotations(
  $I.annotations("FileId", {
    description: "A unique identifier for a file",
  })
);

export declare namespace FileId {
  export type Type = typeof FileId.Type;
  export type Encoded = typeof FileId.Encoded;
}

export const AuditLogId = EntityId.make("audit_log", {
  brand: "AuditLogId",
}).annotations(
  $I.annotations("AuditLogId", {
    description: "A unique identifier for an audit log",
  })
);

export declare namespace AuditLogId {
  export type Type = typeof AuditLogId.Type;
  export type Encoded = typeof AuditLogId.Encoded;
}

export const UserId = EntityId.make("user", {
  brand: "UserId",
}).annotations(
  $I.annotations("UserId", {
    description: "A unique identifier for a user",
  })
);

export declare namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;
}

export const SessionId = EntityId.make("session", {
  brand: "SessionId",
}).annotations(
  $I.annotations("SessionId", {
    description: "A unique identifier for a session",
  })
);

export declare namespace SessionId {
  export type Type = S.Schema.Type<typeof SessionId>;
  export type Encoded = S.Schema.Encoded<typeof SessionId>;
}

export const FolderId = EntityId.make("folder", {
  brand: "FolderId",
}).annotations(
  $I.annotations("FolderId", {
    description: "A unique identifier for a Folder",
  })
);

export declare namespace FolderId {
  export type Type = typeof FolderId.Type;
  export type Encoded = typeof FolderId.Encoded;
}

export const UploadSessionId = EntityId.make("upload_session", {
  brand: "UploadSessionId",
}).annotations(
  $I.annotations("UploadSessionId", {
    description: "A unique identifier for an upload session",
  })
);

export declare namespace UploadSessionId {
  export type Type = typeof UploadSessionId.Type;
  export type Encoded = typeof UploadSessionId.Encoded;
}

export const AgentId = EntityId.make("agent", {
  brand: "AgentId",
}).annotations(
  $I.annotations("AgentId", {
    description: "A unique identifier for an Agent",
  })
);
