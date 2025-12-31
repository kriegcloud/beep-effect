import { $BslId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $BslId.create("schemas/foreign-key-action");
export class ForeignKeyAction extends BS.StringLiteralKit(
  "cascade",
  "restrict",
  "no action",
  "set null",
  "set default"
).annotations(
  $I.annotations("ForeignKeyAction", {
    description: "Foreign key action literals for ON DELETE/ON UPDATE.",
  })
) {}

export declare namespace ForeignKeyAction {
  export type Type = typeof ForeignKeyAction.Type;
  export type Enum = typeof ForeignKeyAction.Enum;
}

export class ForeignKeyConfig extends S.Class<ForeignKeyConfig>($I`ForeignKeyConfig`)(
  {
    onDelete: S.optionalWith(ForeignKeyAction, { exact: true }),
    onUpdate: S.optionalWith(ForeignKeyAction, { exact: true }),
    name: S.optionalWith(BS.SnakeTag, { exact: true }),
  },
  $I.annotations("ForeignKeyConfig", {
    description: "Foreign key configuration.",
  })
) {}
