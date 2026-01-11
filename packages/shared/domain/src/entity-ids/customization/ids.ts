import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/customization/ids");
const make = EntityId.builder("customization");
export const UserHotkeyId = make("user_hotkey", {
  brand: "UserHotkeyId",
}).annotations(
  $I.annotations("UserHotkeyId", {
    description: "A unique identifier for an UserHotkey",
  })
);

export declare namespace UserHotkeyId {
  export type Type = S.Schema.Type<typeof UserHotkeyId>;
  export type Encoded = S.Schema.Encoded<typeof UserHotkeyId>;

  export namespace RowId {
    export type Type = typeof UserHotkeyId.privateSchema.Type;
    export type Encoded = typeof UserHotkeyId.privateSchema.Encoded;
  }
}
