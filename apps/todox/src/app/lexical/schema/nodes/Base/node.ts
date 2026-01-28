import { $TodoxId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $TodoxId.create("app/lexical/schema/nodes/Base");

export class Version extends S.NonNegativeInt.pipe(S.brand("NodeVersion")).annotations(
  $I.annotations("Version", {
    description: "Node version",
  })
) {}

export declare namespace Version {
  export type Type = typeof Version.Type;
}

export class Type extends BS.StringLiteralKit("linebreak") {}
