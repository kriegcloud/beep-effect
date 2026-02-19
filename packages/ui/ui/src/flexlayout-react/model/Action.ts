import { $UiId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $UiId.create("flexlayout-react/model/Action");

export class Action extends S.Class<Action>($I`Action`)(
  {
    type: S.NonEmptyTrimmedString,
    data: S.Record({
      key: S.String,
      value: S.Any,
    }),
  },
  $I.annotations($I`Action`, {
    description: "A flexlayout-react action",
  })
) {
  static readonly new = (type: S.Schema.Type<typeof Action>["type"], data: S.Schema.Type<typeof Action>["data"]) =>
    new Action({
      type,
      data,
    });
}
