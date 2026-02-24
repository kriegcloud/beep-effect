/**
 * Drizzle integration helpers that turn schema literal kits into strongly typed `pgEnum` definitions.
 *
 * Keeps SQL enum declarations synchronized with the literal values shipped to clients.
 *
 * @example
 * import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 * import { toPgEnum } from "@beep/schema/integrations/sql/pg-enum";
 *
 * const StatusKit = StringLiteralKit("pending", "active");
 * export const StatusEnum = toPgEnum(StatusKit)<"account_status">("account_status_enum");
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */

import type { ILiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import type { StringTypes } from "@beep/types";
import type { SnakeTag } from "@beep/types/tag.types";
import { pgEnum } from "drizzle-orm/pg-core";
import type * as A from "effect/Array";

/**
 * Creates a Drizzle `pgEnum` definition from a string literal kit.
 *
 * @example
 * import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 * import { toPgEnum } from "@beep/schema/integrations/sql/pg-enum";
 *
 * const StatusKit = StringLiteralKit("pending", "active");
 * export const StatusEnum = toPgEnum(StatusKit)<"account_status">("account_status_enum");
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const toPgEnum =
  <
    const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
    const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]> | undefined,
  >(
    kit: ILiteralKit<Literals, Mapping>
  ) =>
  <const Name extends StringTypes.NonEmptyString>(name: `${SnakeTag<Name>}_enum`) =>
    pgEnum(name, kit.Options);
