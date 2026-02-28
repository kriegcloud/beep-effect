import * as S from "effect/Schema";

/**
 * @since 0.0.0
 */
export const toolInputParseOptions = {
  onExcessProperty: "error" as const,
  exact: true as const,
};

/**
 * @since 0.0.0
 */
export const sdkMessageParseOptions = {
  onExcessProperty: "preserve" as const,
};

/**
 * @since 0.0.0
 */
export const withIdentifier = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
    })
  ) as S;

// Strict tool input decode: reject unknown fields unless schema allows them.
/**
 * @since 0.0.0
 */
export const withToolInput = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
      parseOptions: toolInputParseOptions,
    })
  ) as S;

/**
 * @since 0.0.0
 */
export const withSdkMessage = <S extends S.Top>(schema: S, identifier: string): S =>
  schema.pipe(
    S.annotate({
      identifier,
      parseOptions: sdkMessageParseOptions,
    })
  ) as S;
