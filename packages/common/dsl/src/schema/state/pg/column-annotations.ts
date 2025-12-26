import { $DslId } from "@beep/identity/packages";
// import { dual, Option, SchemaAST } from 'effect'
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type { PgDSL } from "./db-schema/mod.ts";

const $I = $DslId.create("pg/column-annotations");

export const PrimaryKeyId = Symbol.for($I`PrimaryKeyId`);

export const ColumnType = Symbol.for($I`ColumnType`);

export const Default = Symbol.for($I`Default`);

export const AutoIncrement = Symbol.for($I`AutoIncrement`);

export const Unique = Symbol.for($I`Unique`);

// export const Check = Symbol.for('livestore/state/pg/annotations/check')

/*
Here are the knobs you can turn per-column when you CREATE TABLE (or ALTER TABLE … ADD COLUMN) in SQLite:
•	Declared type / affinity – INTEGER, TEXT, REAL, BLOB, NUMERIC, etc.  ￼
•	NULL vs NOT NULL – disallow NULL on inserts/updates.  ￼
•	PRIMARY KEY – makes the column the rowid (and, if the type is INTEGER, it enables rowid-based auto- numbering). Add the optional AUTOINCREMENT keyword if you need monotonic, never-reused ids.  ￼
•	UNIQUE – enforces per-column uniqueness.  ￼
•	DEFAULT <expr> – literal, function (e.g. CURRENT_TIMESTAMP), or parenthesised expression; since 3.46 you can even default to large hex blobs.  ￼
•	CHECK (<expr>) – arbitrary boolean expression evaluated on write.  ￼
•	COLLATE <name> – per-column collation sequence for text comparison.  ￼
•	REFERENCES tbl(col) [ON UPDATE/DELETE …] – column-local foreign key with its own cascade / restrict / set-null rules.  ￼
•	GENERATED ALWAYS AS (<expr>) [VIRTUAL | STORED] – computed columns (since 3.31).  ￼
•	CONSTRAINT name … – optional label in front of any of the above so you can refer to it in error messages or when dropping/recreating schemas.  
*/

/**
 * Adds a primary key annotation to a schema.
 */
export const withPrimaryKey = <T extends S.Schema.All>(schema: T) => applyAnnotations(schema, { [PrimaryKeyId]: true });

/**
 * Adds a column type annotation to a schema.
 */
export const withColumnType: {
  (type: PgDSL.FieldColumnType): <T extends S.Schema.All>(schema: T) => T;
  // TODO make type safe
  <T extends S.Schema.All>(schema: T, type: PgDSL.FieldColumnType): T;
} = F.dual(2, <T extends S.Schema.All>(schema: T, type: PgDSL.FieldColumnType) => {
  validateSchemaColumnTypeCompatibility(schema, type);
  return applyAnnotations(schema, { [ColumnType]: type });
});

/**
 * Adds an auto-increment annotation to a schema.
 */
export const withAutoIncrement = <T extends S.Schema.All>(schema: T) =>
  applyAnnotations(schema, { [AutoIncrement]: true });

/**
 * Adds a unique constraint annotation to a schema.
 */
export const withUnique = <T extends S.Schema.All>(schema: T) => applyAnnotations(schema, { [Unique]: true });

/**
 * Adds a default value annotation to a schema.
 */
export const withDefault: {
  // TODO make type safe
  <T extends S.Schema.All>(schema: T, value: unknown): T;
  (value: unknown): <T extends S.Schema.All>(schema: T) => T;
} = F.dual(2, <T extends S.Schema.All>(schema: T, value: unknown) => applyAnnotations(schema, { [Default]: value }));

/**
 * Validates that a schema is compatible with the specified SQLite column type
 */
const validateSchemaColumnTypeCompatibility = (_schema: S.Schema.All, _columnType: PgDSL.FieldColumnType): void => {
  // TODO actually implement this
};

const applyAnnotations = <T extends S.Schema.All>(schema: T, overrides: Record<PropertyKey, unknown>): T => {
  const identifier = AST.getIdentifierAnnotation(schema.ast);
  const shouldPreserveIdentifier = O.isSome(identifier) && !(AST.IdentifierAnnotationId in overrides);
  const annotations: Record<PropertyKey, unknown> = shouldPreserveIdentifier
    ? { ...overrides, [AST.IdentifierAnnotationId]: identifier.value }
    : overrides;

  return schema.annotations(annotations) as T;
};
