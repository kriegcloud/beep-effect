import { Either, Hash } from "effect";
import * as F from "effect/Function";
import type * as S from "effect/Schema";

// NOTE this is a temporary workaround until Effect schema has a better way to hash schemas
// https://github.com/Effect-TS/effect/issues/2719
// TODO remove this once the issue is resolved
export const hash = (schema: S.Schema<any>) =>
  F.pipe(
    Either.try({
      try: () => Hash.string(JSON.stringify(schema.ast, null, 2)),
      catch: () => Hash.hash(schema.ast.toString()),
    }),
    Either.match({
      onRight: F.identity,
      onLeft: () => {
        console.warn(
          `Schema hashing failed, falling back to hashing the shortend schema AST string. This is less reliable and may cause false positives.`
        );
        return Hash.hash(schema.ast.toString());
      },
    })
  );
