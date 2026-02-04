import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/user-hotkeys/user-hotkeys.model");

export class Model extends M.Class<Model>($I`UserHotkeysModel`)(
  makeFields(CommsEntityIds.UserHotkeysId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user these hotkeys belong to",
    }),

    hotkeyMap: S.String.annotations({
      description: "JSON object mapping action names to keybindings",
    }),
  }),
  $I.annotations("UserHotkeysModel", {
    title: "User Hotkeys Model",
    description: "User keyboard shortcut customization",
  })
) {
  static readonly utils = modelKit(Model);
}
