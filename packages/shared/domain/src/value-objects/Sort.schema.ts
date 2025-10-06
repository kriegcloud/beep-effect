import { BS } from "@beep/schema";
import type { StructTypes } from "@beep/types";
import { StructUtils } from "@beep/utils";
import type * as A from "effect/Array";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
export const SortOrderKit = BS.stringLiteralKit("asc", "desc");

export class SortOrder extends SortOrderKit.Schema {
  static readonly Enum = SortOrderKit.Enum;
  static readonly Options = SortOrderKit.Options;
}

export namespace SortOrder {
  export type Type = S.Schema.Type<typeof SortOrder>;
  export type Encoded = S.Schema.Encoded<typeof SortOrder>;
}

export namespace Sort {
  export class Factory<const Fields extends StructTypes.StructFieldsWithStringKeys> extends Data.TaggedClass(
    "SortByFactory"
  )<{
    readonly fields: Fields;
  }> {
    readonly Schema: S.Struct<{
      sortOrder: BS.OptionalWithDefault<SortOrder.Type>;
      sortBy: S.Literal<A.NonEmptyReadonlyArray<keyof Fields & string>>;
    }>;

    constructor(readonly fields: StructTypes.NonEmptyStructFields<Fields>) {
      const keys = StructUtils.structKeys(fields);
      const SortBySchema = S.Literal(...keys);
      super({ fields });
      this.Schema = BS.Struct({
        sortOrder: BS.toOptionalWithDefault(SortOrder)(SortOrder.Enum.desc),
        sortBy: SortBySchema,
      });
    }
  }

  export const make = <const Fields extends StructTypes.StructFieldsWithStringKeys>(
    fields: StructTypes.NonEmptyStructFields<Fields>
  ) => {
    const factory = new Factory(fields);
    return factory.Schema;
  };
}
