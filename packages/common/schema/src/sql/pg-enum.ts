import type { LiteralKit } from "@beep/schema/kits";
import type { StringTypes } from "@beep/types";
import type { SnakeTag } from "@beep/types/tag.types";
import { pgEnum } from "drizzle-orm/pg-core";
import type * as A from "effect/Array";

export const toPgEnum =
  <
    const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
    const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]> | undefined,
  >(
    kit: LiteralKit<Literals, Mapping>
  ) =>
  <const Name extends StringTypes.NonEmptyString>(name: `${SnakeTag<Name>}_enum`) =>
    pgEnum(name, kit.Options);
