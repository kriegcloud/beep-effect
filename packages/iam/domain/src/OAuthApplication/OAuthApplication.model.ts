import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * OAuth Application model representing registered OAuth applications.
 * Maps to the `oauth_application` table in the database.
 */
export class Model extends M.Class<Model>(`OAuthApplication.Model`)({
  /** Primary key identifier for the OAuth application */
  id: M.Generated(IamEntityIds.OAuthApplicationId),

  /** Application name */
  name: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "The OAuth application name",
    }),
  ),

  /** Application icon URL */
  icon: M.FieldOption(
    S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
      description: "URL to the application's icon",
    }),
  ),

  /** Application metadata */
  metadata: M.FieldOption(
    S.String.annotations({
      description: "JSON metadata for the OAuth application",
    }),
  ),

  /** OAuth client ID */
  clientId: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "The OAuth client identifier",
    }),
  ),

  /** OAuth client secret (sensitive) */
  clientSecret: M.FieldOption(
    M.Sensitive(
      S.NonEmptyString.annotations({
        description: "The OAuth client secret",
      }),
    ),
  ),

  /** Redirect URLs */
  redirectURLs: M.FieldOption(
    S.String.annotations({
      description: "JSON array of allowed redirect URLs",
    }),
  ),

  /** Application type */
  type: M.FieldOption(
    S.Literal("web", "mobile", "native", "spa").annotations({
      description: "Type of OAuth application",
    }),
  ),

  /** Whether the application is disabled */
  disabled: M.FieldOption(
    S.Boolean.annotations({
      description: "Whether the OAuth application is disabled",
    }),
  ),

  /** User who owns this application */
  userId: M.FieldOption(
    IamEntityIds.UserId.annotations({
      description: "ID of the user who owns this OAuth application",
    }),
  ),

  // Default columns include organizationId
  ...Common.defaultColumns,
}) {}
