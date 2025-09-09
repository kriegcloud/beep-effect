import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import type { StringTypes } from "@beep/types";
import * as pg from "drizzle-orm/pg-core";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export const idColumn = <const TableName extends StringTypes.NonEmptyString, const A, const E, const R>(
  prefix: BS.SnakeTag.Literal<TableName>,
  schema: S.Schema<A, E, R>
) => {
  const generatedId = Str.concat(Str.concat("__")(prefix), BS.UUIDLiteralEncoded.make());
  invariant(S.is(schema)(generatedId), "Invalid id generated", {
    file: "@beep/shared-tables/src/id.ts",
    line: 14,
    args: [generatedId],
  });
  return F.pipe(generatedId, (generatedId) =>
    pg
      .text("id")
      .notNull()
      .primaryKey()
      .$type<typeof schema.Type>()
      .$defaultFn(() => generatedId)
  );
};
