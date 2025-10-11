import { WithDefaultsThunk } from "@beep/schema/utils/WithDefaultsThunk";
import * as S from "effect/Schema";

export const toOptionalWithDefault =
  <const A, const I, const R>(schema: S.Schema<A, I, R>) =>
  (
    defaultValue: Exclude<S.Schema.Type<S.Schema<A, I, R>>, undefined>
  ): S.PropertySignature<":", Exclude<A, undefined>, never, "?:", I | undefined, true, R> =>
    WithDefaultsThunk.make(S.optional(schema))(defaultValue);
