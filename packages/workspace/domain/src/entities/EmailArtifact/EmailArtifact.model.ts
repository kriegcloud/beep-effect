/**
 * Email artifact entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { UnknownRecord } from "@beep/schema";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/EmailArtifact/EmailArtifact.model");

/**
 * Normalized email artifact imported into a workspace thread.
 *
 * @example
 * ```ts
 * import { EmailArtifact } from "@beep/workspace-domain"
 *
 * console.log(EmailArtifact.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EmailArtifact extends BaseEntity.Class<EmailArtifact>($I`EmailArtifact`)(
  Workspace.EmailArtifactId,
  {
    fields: {
      artifactFixtureKey: S.String,
      body: S.String,
      from: UnknownRecord,
      receivedAt: S.String,
      sourceSpans: S.Array(S.String),
      subject: S.String,
      threadFixtureKey: S.String,
      to: S.Array(UnknownRecord),
    },
    persisted: {
      artifactFixtureKey: EntitySchema.persist.text({
        columnName: "artifact_fixture_key",
      }),
      body: EntitySchema.persist.text({
        columnName: "body",
      }),
      from: EntitySchema.persist.jsonb({
        columnName: "from_contact",
      }),
      receivedAt: EntitySchema.persist.text({
        columnName: "received_at",
      }),
      sourceSpans: EntitySchema.persist.jsonb({
        columnName: "source_spans",
      }),
      subject: EntitySchema.persist.text({
        columnName: "subject",
      }),
      threadFixtureKey: EntitySchema.persist.text({
        columnName: "thread_fixture_key",
      }),
      to: EntitySchema.persist.jsonb({
        columnName: "to_contacts",
      }),
    },
  },
  $I.annote("EmailArtifact", {
    description: "Normalized email artifact imported into a workspace thread.",
  })
) {}
