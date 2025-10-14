import { EntityId } from "@beep/schema/EntityId";
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
