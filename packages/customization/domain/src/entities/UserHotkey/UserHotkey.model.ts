import { $CustomizationDomainId } from "@beep/identity/packages";
import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CustomizationDomainId.create("entities/UserHotKey");

/**
 * UserHotkeyModel model representing user configured hotkeys.
 */
export class Model extends M.Class<Model>($I`UserHotkeyModel`)(
  makeFields(CustomizationEntityIds.UserHotkeyId, {
    userId: SharedEntityIds.UserId,
    // todo make better
    shortcuts: M.JsonFromString(S.Record({ key: S.String, value: S.String })),
  }),
  $I.annotations("UserHotkeyModel", {
    description: "UserHotkeyModel model representing user configured hotkeys.",
  })
) {
  static readonly utils = modelKit(Model);
}
