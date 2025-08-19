import type { StringTypes } from "@beep/types";
import * as S from "effect/Schema";

export namespace Op {
  export const make = <const Tag extends StringTypes.NonEmptyString<string>>(
    tag: Tag,
    label: string,
  ) => {
    return {
      Schema: S.Struct({ _tag: S.Literal(tag) }),
      op: tag,
      label,
    };
  };

  export type Type<Tag extends StringTypes.NonEmptyString<string>> = {
    readonly _tag: Tag;
  };
}
