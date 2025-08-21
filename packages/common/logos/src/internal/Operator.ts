import type { StringTypes } from "@beep/types";
import * as S from "effect/Schema";

export namespace Op {
  export function make<
    const Tag extends StringTypes.NonEmptyString<string>,
    const Fields extends S.Struct.Fields,
  >(tag: Tag, label: string, fields: Fields) {
    const Schema = S.Struct({ _tag: S.Literal(tag), ...fields });
    return {
      Schema,
      op: tag,
      label,
    } as const;
  }
  export type Type<Tag extends StringTypes.NonEmptyString<string>> = {
    readonly _tag: Tag;
  };
}
