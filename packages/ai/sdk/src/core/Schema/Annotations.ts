import * as S from "effect/Schema";

export const toolInputParseOptions = {
  onExcessProperty: "error" as const,
  exact: true as const,
};

export const sdkMessageParseOptions = {
  onExcessProperty: "preserve" as const,
};

export const withIdentifier = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
    })
  ) as S;

// Strict tool input decode: reject unknown fields unless schema allows them.
export const withToolInput = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
      parseOptions: toolInputParseOptions,
    })
  ) as S;

export const withSdkMessage = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
      parseOptions: sdkMessageParseOptions,
    })
  ) as S;
