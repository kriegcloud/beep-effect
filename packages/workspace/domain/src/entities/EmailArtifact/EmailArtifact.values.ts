/**
 * Email Artifact value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/EmailArtifact/EmailArtifact.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the EmailArtifact entity.
 *
 * @example
 * ```ts
 * import { EmailArtifactProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(EmailArtifactProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EmailArtifactProfileMixin = EntityMixin.make($I`EmailArtifactProfileMixin`)(
  {
    artifactFixtureKey: S.String,
    body: S.String,
    from: UnknownRecord,
    receivedAt: S.String,
    sourceSpans: S.Array(S.String),
    subject: S.String,
    threadFixtureKey: S.String,
    to: S.Array(UnknownRecord),
  },
  {
    description: "Runtime proof fields owned by the EmailArtifact entity.",
    fields: {
      artifactFixtureKey: {
        columnName: "artifact_fixture_key",
        description: "Stable fixture key for the imported email artifact.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      body: {
        columnName: "body",
        description: "Normalized email body.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      from: {
        columnName: "from_contact",
        description: "Normalized sender payload retained for the fixture proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
      receivedAt: {
        columnName: "received_at",
        description: "Original email received timestamp.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      sourceSpans: {
        columnName: "source_spans",
        description: "Span identifiers parsed from the source email body.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
      subject: {
        columnName: "subject",
        description: "Email subject line.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      threadFixtureKey: {
        columnName: "thread_fixture_key",
        description: "Fixture key for the email thread.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      to: {
        columnName: "to_contacts",
        description: "Normalized recipient payloads retained for the fixture proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed EmailArtifact profile mixin.
 *
 * @example
 * ```ts
 * import { EmailArtifactProfilePack } from "@beep/workspace-domain"
 *
 * console.log(EmailArtifactProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EmailArtifactProfilePack = EntityMixin.pack(EmailArtifactProfileMixin);
