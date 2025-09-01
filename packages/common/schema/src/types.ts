import type * as S from "effect/Schema";

export type OptionalWithDefault<T> = S.PropertySignature<
  ":",
  Exclude<T, undefined>,
  never,
  "?:",
  T | undefined,
  true,
  never
>;
