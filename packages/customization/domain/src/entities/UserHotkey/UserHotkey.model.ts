import { $CustomizationDomainId } from "@beep/identity/packages";
import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CustomizationDomainId.create("entities/UserHotKey");

/**
 * Comment model representing individual comments within discussions.
 * Supports both plain text and rich text content formats,
 * with tracking for edited status.
 */
export class Model extends M.Class<Model>($I`UserHotkeyModel`)(
  makeFields(CustomizationEntityIds.UserHotkeyId, {
    userId: SharedEntityIds.UserId,
    // todo make better
    shortcuts: M.JsonFromString(S.Record({ key: S.String, value: S.String })),
  })
) {
  static readonly utils = modelKit(Model);
}
