import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { LiteralKit } from "../LiteralKit.ts";

const $I = $SchemaId.create("Sql/ColumnDef");
const LiteralBoolean = LiteralKit([true, false]);
/**
 * @since 0.0.0
 */
export const PrimaryKey = LiteralBoolean.annotate(
  $I.annote(`PrimaryKey`, {
    description: "Literal type for primary key column definition.",
  })
);

/**
 * @since 0.0.0
 */
export type PrimaryKey = typeof PrimaryKey.Type;

/**
 * @since 0.0.0
 */
export const Unique = LiteralBoolean.annotate(
  $I.annote(`Unique`, {
    description: "Literal type for unique column definition.",
  })
);

/**
 * @since 0.0.0
 */
export type Unique = typeof Unique.Type;

/**
 * @since 0.0.0
 */
export const IsNull = LiteralBoolean.annotate(
  $I.annote(`IsNull`, {
    description: "Literal type for nullability column definition.",
  })
);

/**
 * @since 0.0.0
 */
export const AutoIncrement = LiteralBoolean.annotate(
  $I.annote(`AutoIncrement`, {
    description: "Literal type for auto-increment column definition.",
  })
);

/**
 * @since 0.0.0
 */
export type AutoIncrement = typeof AutoIncrement.Type;

/**
 * @since 0.0.0
 */
export const UniqueName = S.NonEmptyString.pipe(S.brand("UniqueName")).annotate(
  $I.annote(`UniqueName`, {
    description: "Branded SQL column name used when uniqueness metadata needs a stable identifier.",
  })
);

/**
 * @since 0.0.0
 */
export type UniqueName = typeof UniqueName.Type;
