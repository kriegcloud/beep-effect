/**
 * Comms entity IDs
 *
 * Defines branded entity identifiers for the comms slice.
 *
 * @module comms/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/comms/ids");

const make = EntityId.builder("comms");

/**
 * Unique identifier for email templates.
 *
 * @since 0.1.0
 * @category ids
 */
export const EmailTemplateId = make("email_template", {
  brand: "EmailTemplateId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("EmailTemplateId", {
    description: "A unique identifier for a EmailTemplate entity",
  })
);

export declare namespace EmailTemplateId {
  export type Type = S.Schema.Type<typeof EmailTemplateId>;
  export type Encoded = S.Schema.Encoded<typeof EmailTemplateId>;

  export namespace RowId {
    export type Type = typeof EmailTemplateId.privateSchema.Type;
    export type Encoded = typeof EmailTemplateId.privateSchema.Encoded;
  }
}

/**
 * Unique identifier for email provider connections (Gmail, Outlook, etc.).
 *
 * @since 0.1.0
 * @category ids
 */
export const ConnectionId = make("connection", {
  brand: "ConnectionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("ConnectionId", {
    description: "A unique identifier for an email provider Connection entity",
  })
);

export declare namespace ConnectionId {
  export type Type = S.Schema.Type<typeof ConnectionId>;
  export type Encoded = S.Schema.Encoded<typeof ConnectionId>;

  export namespace RowId {
    export type Type = typeof ConnectionId.privateSchema.Type;
    export type Encoded = typeof ConnectionId.privateSchema.Encoded;
  }
}

/**
 * Unique identifier for cached AI summaries of email threads.
 *
 * @since 0.1.0
 * @category ids
 */
export const ThreadSummaryId = make("thread_summary", {
  brand: "ThreadSummaryId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("ThreadSummaryId", {
    description: "A unique identifier for a cached ThreadSummary entity",
  })
);

export declare namespace ThreadSummaryId {
  export type Type = S.Schema.Type<typeof ThreadSummaryId>;
  export type Encoded = S.Schema.Encoded<typeof ThreadSummaryId>;

  export namespace RowId {
    export type Type = typeof ThreadSummaryId.privateSchema.Type;
    export type Encoded = typeof ThreadSummaryId.privateSchema.Encoded;
  }
}

/**
 * Unique identifier for user notes on email threads.
 *
 * @since 0.1.0
 * @category ids
 */
export const NoteId = make("note", {
  brand: "NoteId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("NoteId", {
    description: "A unique identifier for a user Note entity on an email thread",
  })
);

export declare namespace NoteId {
  export type Type = S.Schema.Type<typeof NoteId>;
  export type Encoded = S.Schema.Encoded<typeof NoteId>;

  export namespace RowId {
    export type Type = typeof NoteId.privateSchema.Type;
    export type Encoded = typeof NoteId.privateSchema.Encoded;
  }
}

/**
 * Unique identifier for user email settings.
 *
 * @since 0.1.0
 * @category ids
 */
export const UserSettingsId = make("user_settings", {
  brand: "UserSettingsId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("UserSettingsId", {
    description: "A unique identifier for a UserSettings entity",
  })
);

export declare namespace UserSettingsId {
  export type Type = S.Schema.Type<typeof UserSettingsId>;
  export type Encoded = S.Schema.Encoded<typeof UserSettingsId>;

  export namespace RowId {
    export type Type = typeof UserSettingsId.privateSchema.Type;
    export type Encoded = typeof UserSettingsId.privateSchema.Encoded;
  }
}

/**
 * Unique identifier for user hotkey customizations.
 *
 * @since 0.1.0
 * @category ids
 */
export const UserHotkeysId = make("user_hotkeys", {
  brand: "UserHotkeysId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("UserHotkeysId", {
    description: "A unique identifier for a UserHotkeys entity",
  })
);

export declare namespace UserHotkeysId {
  export type Type = S.Schema.Type<typeof UserHotkeysId>;
  export type Encoded = S.Schema.Encoded<typeof UserHotkeysId>;

  export namespace RowId {
    export type Type = typeof UserHotkeysId.privateSchema.Type;
    export type Encoded = typeof UserHotkeysId.privateSchema.Encoded;
  }
}

export const Ids = {
  EmailTemplateId,
  ConnectionId,
  ThreadSummaryId,
  NoteId,
  UserSettingsId,
  UserHotkeysId,
} as const;
