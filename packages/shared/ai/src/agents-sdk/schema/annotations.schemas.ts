import type * as S from "effect/Schema";

export const toolInputParseOptions = {
  onExcessProperty: "error",
  exact: true,
} as const;

export const sdkMessageParseOptions = {
  onExcessProperty: "preserve",
} as const;

export const withIdentifier = <A, E, R>(schema: S.Schema<A, E, R>, identifier: string): S.Schema<A, E, R> =>
  schema.annotations({
    identifier,
  });

export const withToolInput = <A, E, R>(schema: S.Schema<A, E, R>, identifier: string): S.Schema<A, E, R> =>
  schema.annotations({
    identifier,
    parseOptions: toolInputParseOptions,
  });

export const withSdkMessage = <A, E, R>(schema: S.Schema<A, E, R>, identifier: string): S.Schema<A, E, R> =>
  schema.annotations({
    identifier,
    parseOptions: sdkMessageParseOptions,
  });
