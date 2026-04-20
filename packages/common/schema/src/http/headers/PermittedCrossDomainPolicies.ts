/**
 * Schema for the `X-Permitted-Cross-Domain-Policies` header.
 *
 * @since 0.0.0
 * @module \@beep/schema/http/headers/PermittedCrossDomainPolicies
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { PermittedCrossDomainPoliciesError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/PermittedCrossDomainPolicies");

const headerName = "X-Permitted-Cross-Domain-Policies" as const;
const defaultValue = "none" as const;

const PermittedCrossDomainPoliciesValueBase = LiteralKit([
  "none",
  "master-only",
  "by-content-type",
  "by-ftp-filename",
  "all",
]);

/**
 * @since 0.0.0
 */
export const PermittedCrossDomainPoliciesValue = PermittedCrossDomainPoliciesValueBase.pipe(
  $I.annoteSchema("PermittedCrossDomainPoliciesValue", {
    description: "The supported `X-Permitted-Cross-Domain-Policies` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(PermittedCrossDomainPoliciesValueBase)
);

/**
 * @since 0.0.0
 */
export type PermittedCrossDomainPoliciesValue = typeof PermittedCrossDomainPoliciesValue.Type;

const PermittedCrossDomainPoliciesOptionBase = LiteralKit([false, ...PermittedCrossDomainPoliciesValueBase.Options]);

/**
 * @since 0.0.0
 */
export const PermittedCrossDomainPoliciesOption = PermittedCrossDomainPoliciesOptionBase.pipe(
  $I.annoteSchema("PermittedCrossDomainPoliciesOption", {
    description: "The supported `X-Permitted-Cross-Domain-Policies` option values.",
  }),
  SchemaUtils.withLiteralKitStatics(PermittedCrossDomainPoliciesOptionBase)
);

/**
 * @since 0.0.0
 */
export type PermittedCrossDomainPoliciesOption = typeof PermittedCrossDomainPoliciesOption.Type;

/**
 * @since 0.0.0
 */
export class PermittedCrossDomainPoliciesResponseHeader extends S.Class<PermittedCrossDomainPoliciesResponseHeader>(
  $I`PermittedCrossDomainPoliciesResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("PermittedCrossDomainPoliciesResponseHeader", {
    description: "The `X-Permitted-Cross-Domain-Policies` response header.",
  })
) {}

type PermittedCrossDomainPoliciesResponseHeaderEncoded = typeof PermittedCrossDomainPoliciesResponseHeader.Encoded;

/**
 * @since 0.0.0
 */
export const PermittedCrossDomainPoliciesHeader = S.Union([PermittedCrossDomainPoliciesOption, S.Undefined]).pipe(
  S.decodeTo(
    PermittedCrossDomainPoliciesResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<PermittedCrossDomainPoliciesResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value: P.isUndefined(input) ? defaultValue : input === false ? undefined : input,
        }),
      encode: internal.makeHeaderEncodeForbidden("PermittedCrossDomainPoliciesHeader"),
    })
  ),
  $I.annoteSchema("PermittedCrossDomainPoliciesHeader", {
    description: "A one-way schema that decodes `X-Permitted-Cross-Domain-Policies` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | PermittedCrossDomainPoliciesOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | PermittedCrossDomainPoliciesOption
    ) {
      if (P.isUndefined(option)) {
        return O.some(defaultValue);
      }

      if (option === false) {
        return O.none<string>();
      }

      if (S.is(PermittedCrossDomainPoliciesValue)(option)) {
        return O.some(option);
      }

      return yield* new PermittedCrossDomainPoliciesError({
        message: `Invalid value for ${headerName}: ${option}`,
        cause: O.none(),
      });
    });

    const create: (
      option?: undefined | PermittedCrossDomainPoliciesOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | PermittedCrossDomainPoliciesOption,
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
export type PermittedCrossDomainPoliciesHeader = typeof PermittedCrossDomainPoliciesHeader.Type;
