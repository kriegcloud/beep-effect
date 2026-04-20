/**
 * Schema for the `Expect-CT` header.
 *
 * @since 0.0.0
 * @module \@beep/schema/http/headers/ExpectCT
 */
import { $SchemaId } from "@beep/identity";
import { Effect, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { ExpectCtError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/ExpectCT");

const headerName = "Expect-CT" as const;
const defaultMaxAge = 60 * 60 * 24;

/**
 * @since 0.0.0
 */
export class ExpectCTConfig extends S.Class<ExpectCTConfig>($I`ExpectCTConfig`)(
  {
    maxAge: S.optionalKey(S.Finite),
    enforce: S.optionalKey(S.Boolean),
    reportURI: S.optionalKey(internal.StringOrUrl),
  },
  $I.annote("ExpectCTConfig", {
    description: "Optional configuration values for the `Expect-CT` header.",
  })
) {}

/**
 * @since 0.0.0
 */
export const ExpectCTEnabled = S.Tuple([S.Literal(true), ExpectCTConfig]).pipe(
  $I.annoteSchema("ExpectCTEnabled", {
    description: "Tuple form used to enable `Expect-CT` with additional configuration.",
  })
);

/**
 * @since 0.0.0
 */
export type ExpectCTEnabled = typeof ExpectCTEnabled.Type;

/**
 * @since 0.0.0
 */
export const ExpectCTOption = S.Union([S.Boolean, ExpectCTEnabled]).pipe(
  $I.annoteSchema("ExpectCTOption", {
    description: "The supported `Expect-CT` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type ExpectCTOption = typeof ExpectCTOption.Type;

/**
 * @since 0.0.0
 */
export class ExpectCTResponseHeader extends S.Class<ExpectCTResponseHeader>($I`ExpectCTResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("ExpectCTResponseHeader", {
    description: "The `Expect-CT` response header.",
  })
) {}

type ExpectCTResponseHeaderEncoded = typeof ExpectCTResponseHeader.Encoded;

const formatExpectCTValue = (config: ExpectCTConfig): Effect.Effect<string, SecureHeaderError> =>
  Effect.gen(function* () {
    const reportUriValue = config.reportURI;

    const reportURI: O.Option<string> = P.isUndefined(reportUriValue)
      ? O.none<string>()
      : O.some(
          yield* Effect.try({
            try: () => String(internal.encodeStrictURI(reportUriValue)),
            catch: () =>
              new ExpectCtError({
                message: `Invalid value for "reportURI" option in ${headerName}: ${String(reportUriValue)}`,
                cause: O.none(),
              }),
          })
        );

    return pipe(
      A.make(
        `max-age=${config.maxAge ?? defaultMaxAge}`,
        config.enforce === true ? "enforce" : undefined,
        pipe(
          reportURI,
          O.map((value) => `report-uri=${value}`),
          O.getOrUndefined
        )
      ),
      A.filter(P.isNotUndefined),
      A.join(", ")
    );
  });

const decodeExpectCTValue = (
  input: ExpectCTOption | undefined
): Effect.Effect<ExpectCTResponseHeaderEncoded, SchemaIssue.Issue> =>
  Effect.gen(function* () {
    if (P.isUndefined(input) || input === false) {
      return {
        name: headerName,
        value: undefined,
      } as const;
    }

    if (input === true) {
      return {
        name: headerName,
        value: `max-age=${defaultMaxAge}`,
      } as const;
    }

    const value = yield* formatExpectCTValue(input[1]).pipe(
      Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
    );

    return {
      name: headerName,
      value,
    } as const;
  });

/**
 * @since 0.0.0
 */
export const ExpectCTHeader = S.Union([ExpectCTOption, S.Undefined]).pipe(
  S.decodeTo(
    ExpectCTResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: decodeExpectCTValue,
      encode: internal.makeHeaderEncodeForbidden("ExpectCTHeader"),
    })
  ),
  $I.annoteSchema("ExpectCTHeader", {
    description: "A one-way schema that decodes `Expect-CT` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (option?: undefined | ExpectCTOption) => Effect.Effect<O.Option<string>, SecureHeaderError> =
      Effect.fnUntraced(function* (option?: undefined | ExpectCTOption) {
        if (P.isUndefined(option) || option === false) {
          return O.none<string>();
        }

        if (option === true) {
          return O.some(`max-age=${defaultMaxAge}`);
        }

        const enabled = yield* S.decodeUnknownEffect(ExpectCTEnabled)(option).pipe(
          Effect.mapError(
            (cause) =>
              new ExpectCtError({
                message: cause.message,
                cause: O.none(),
              })
          )
        );

        return O.some(yield* formatExpectCTValue(enabled[1]));
      });

    const create: (
      option?: undefined | ExpectCTOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ExpectCTOption,
      headerValueCreator: typeof createValue = createValue
    ) {
      const value = yield* headerValueCreator(option);

      return internal.makeResponseHeaderOption(headerName, value);
    });

    return {
      createValue,
      create,
    };
  })
);

/**
 * @since 0.0.0
 */
export type ExpectCTHeader = typeof ExpectCTHeader.Type;
