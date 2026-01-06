import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

export const UserHotkeyId = EntityId.make("user_hotkey", {
  brand: "UserHotkeyId",
  annotations: {
    description: "A unique identifier for an UserHotkey",
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/customization/UserHotkey"),
  },
});

export declare namespace UserHotkeyId {
  export type Type = S.Schema.Type<typeof UserHotkeyId>;
  export type Encoded = S.Schema.Encoded<typeof UserHotkeyId>;
}
