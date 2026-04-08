/**
 * A module containing the OnePassword Service.
 *
 * @module @beep/infra/OnePassword
 * @since 0.0.0
 */
import {$InfraId} from "@beep/identity";
import * as S from "effect/Schema";
import {Config, Effect, Layer, ServiceMap} from "effect";
import {SchemaUtils, TaggedErrorClass} from "@beep/schema";
import {O} from "@beep/utils";
import {dual} from "effect/Function";

const $I = $InfraId.create("OnePassword");

export class OnePasswordConfigError extends TaggedErrorClass<OnePasswordConfigError>($I`OnePasswordConfigError`)(
  "OnePasswordConfigError",
  {
    message: S.String,
    cause: S.DefectWithStack
  },
  $I.annote(
    "OnePasswordConfigError",
    {
      description: ""
    }
  )
) {
  static readonly newCause: {
    (
      cause: unknown,
      message: string
    ): OnePasswordConfigError,
    (message: string): (cause: unknown) => OnePasswordConfigError
  } = dual(
    2,
    (
      cause: unknown,
      message: string
    ): OnePasswordConfigError => new OnePasswordConfigError({
      message,
      cause
    })
  )
}

class ServiceShape extends S.Class<ServiceShape>($I`ServiceShape`)(
  {
    serverURL: S.Redacted(S.URLFromString),
    token: S.Redacted(S.NonEmptyString),
    keepAlive: S.Boolean.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(false)
    )
  },
  $I.annote(
    "ServiceShape",
    {
      description: ""
    }
  )
) {
}


export class Service extends ServiceMap.Service<Service, ServiceShape>()($I`Service`) {

  static readonly config = Config.all({
    serverURL: Config.schema(
      ServiceShape.fields.serverURL,
      "1PASSWORD_CONNECT_SERVER_URL"
    ),
    token: Config.schema(
      ServiceShape.fields.token,
      "1PASSWORD_CONNECT_TOKEN"
    ),
    keepAlive: Config.schema(
      ServiceShape.fields.keepAlive,
      "1PASSWORD_CONNECT_KEEP_ALIVE"
    )
  })

  static readonly layerConfig = (overrides?: undefined | Partial<ServiceShape>) => {
    const configEffect = this.config

    const serviceEffect = Effect.gen(function* () {
      const config = yield* configEffect;

      return O.fromNullishOr(overrides)
        .pipe(
          O.map((overrides) => ({
            serverURL: overrides.serverURL ?? config.serverURL,
            token: overrides.token ?? config.token,
            keepAlive: overrides.keepAlive ?? config.keepAlive
          })),
          O.getOrElse(() => config)
        );
    })
      .pipe(
        Effect.mapError(OnePasswordConfigError.newCause("Failed to load config")),
        Effect.withSpan(
          $I`Service.Effect`,
          {
            attributes: {
              overrides,
            }
          }
        )
      );

    return Layer.effect(
      Service,
      serviceEffect
    )
  }
}




