import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {StringLiteralKit} from "./utils/index.js";

export const DialectLiteral = StringLiteralKit(
  "pg", "mysql", "sqlite", "mssql"
);

export type DialectLiteral = S.Schema.Type<typeof DialectLiteral>

export const Dialect = DialectLiteral.mapMembers(
  Tuple.evolve([
    (pg) => S.Struct({
      _tag: pg
    }),
    (mysql) => S.Struct({_tag: mysql}),
    (sqlite) => S.Struct({_tag: sqlite}),
    (mssql) => S.Struct({_tag: mssql})
  ])
);

export const RelationActionLiteral = StringLiteralKit(
  "cascade", "restrict", "no action", "set null", "set default"
);
export type RelationActionLiteral = S.Schema.Type<typeof RelationActionLiteral>

export const IndexMetaLiteral = StringLiteralKit(
  "btree", "hash", "gin", "gist", "unique"
);
export type IndexMetaLiteral = S.Schema.Type<typeof IndexMetaLiteral>

export const IndexMeta = IndexMetaLiteral.mapMembers(
  Tuple.evolve([
    (_) => S.Struct({
      _tag: S.tag("btree")
    }),
    (type) => S.Struct({_tag: S.tag("hash"), type}),
    (type) => S.Struct({_tag: S.tag("gin"), type}),
    (type) => S.Struct({_tag: S.tag("gist"), type}),
    (type) => S.Struct({_tag: S.tag("unique"), type}),
  ])).pipe(S.toTaggedUnion("_tag"));

export type IndexMeta = S.Schema.Type<typeof IndexMeta>

export const IndexMethodMeta = S.Union(
  [
    IndexMeta.cases.btree,
    IndexMeta.cases.gin,
    IndexMeta.cases.gist,
    IndexMeta.cases.unique
  ]
).pipe(S.toTaggedUnion("_tag"));


