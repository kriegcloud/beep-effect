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

// Strict tool input decode: reject unknown fields unless schema allows them.
/**
 * @since 0.0.0
 */
export const withToolInput = <Schema extends S.Top>(
  schema: Schema,
  annotation: S.Annotations.Documentation<S.Schema.Type<Schema>>
): Schema =>
  schema.pipe(
    S.annotate({
      ...annotation,
      parseOptions: toolInputParseOptions,
    })
  ) as Schema;

/**
 * @since 0.0.0
 */
export const withSdkMessage = <Schema extends S.Top>(
  schema: Schema,
  annotation: S.Annotations.Documentation<S.Schema.Type<Schema>>
): Schema =>
  schema.pipe(
    S.annotate({
      ...annotation,
      parseOptions: sdkMessageParseOptions,
    })
  ) as Schema;
