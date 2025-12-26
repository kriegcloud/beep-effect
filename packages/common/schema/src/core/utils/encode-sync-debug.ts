import { invariant } from "@beep/invariant";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

export const encodeSyncDebug: <A, I>(
  schema: S.Schema<A, I, never>,
  options?: AST.ParseOptions
) => (a: A, overrideOptions?: AST.ParseOptions) => I = (schema, options) => (input, overrideOptions) => {
  const res = S.encodeEither(schema, options)(input, overrideOptions);
  invariant(res._tag === "Right", `encodeSyncDebug failed:`, {
    file: "@beep/schema/core/utils/encode-sync-debug.ts",
    line: 11,
    args: [res],
  });
  return res.right;
};
