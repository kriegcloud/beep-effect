import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/user-settings/user-settings.model");

export class Model extends M.Class<Model>($I`UserSettingsModel`)(
  makeFields(CommsEntityIds.UserSettingsId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user these settings belong to",
    }),

    defaultSignature: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Default email signature text",
      })
    ),

    timezone: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "User's preferred timezone for email display",
      })
    ),

    emailsPerPage: S.optional(S.Number).annotations({
      description: "Number of emails to display per page",
    }),

    autoMarkRead: BS.BoolWithDefault(true).annotations({
      description: "Automatically mark emails as read when opened",
    }),

    showNotifications: BS.BoolWithDefault(true).annotations({
      description: "Show browser notifications for new emails",
    }),

    compactMode: BS.BoolWithDefault(false).annotations({
      description: "Use compact view mode for email list",
    }),

    aiSummariesEnabled: BS.BoolWithDefault(true).annotations({
      description: "Enable AI-generated thread summaries",
    }),
  }),
  $I.annotations("UserSettingsModel", {
    title: "User Settings Model",
    description: "User email preferences and display settings",
  })
) {
  static readonly utils = modelKit(Model);
}
