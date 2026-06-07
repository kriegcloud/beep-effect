/**
 * Box driver configuration models and Layers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $BoxId } from "@beep/identity";
import { Config, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";
import { BoxError } from "./Box.errors.ts";
import type { Redacted } from "effect";

const $I = $BoxId.create("Box.config");

/**
 * Developer-token configuration for local Box access.
 *
 * @example
 * ```ts
 * import { BoxDeveloperTokenConfig } from "@beep/box"
 * import { Redacted } from "effect"
 *
 * const config = BoxDeveloperTokenConfig.make({ token: Redacted.make("box-token") })
 * console.log(config)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BoxDeveloperTokenConfig extends S.Class<BoxDeveloperTokenConfig>($I`BoxDeveloperTokenConfig`)(
  {
    token: S.Redacted(S.String),
  },
  $I.annote("BoxDeveloperTokenConfig", {
    description: "Developer-token configuration for the Box technical driver.",
  })
) {}

/**
 * Client Credentials Grant configuration for enterprise Box access.
 *
 * @example
 * ```ts
 * import { BoxCcgConfig } from "@beep/box"
 * import { Redacted } from "effect"
 *
 * const config = BoxCcgConfig.make({
 *   clientId: "client-id",
 *   clientSecret: Redacted.make("client-secret"),
 *   enterpriseId: "enterprise-id"
 * })
 * console.log(config.enterpriseId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BoxCcgConfig extends S.Class<BoxCcgConfig>($I`BoxCcgConfig`)(
  {
    clientId: S.String,
    clientSecret: S.Redacted(S.String),
    enterpriseId: S.String.pipe(S.optionalKey),
    userId: S.String.pipe(S.optionalKey),
  },
  $I.annote("BoxCcgConfig", {
    description: "Client Credentials Grant configuration for the Box technical driver.",
  })
) {}

/**
 * Box developer-token configuration service.
 *
 * @example
 * ```ts
 * import { BoxConfig } from "@beep/box"
 *
 * console.log(BoxConfig)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class BoxConfig extends Context.Service<BoxConfig, BoxDeveloperTokenConfig>()($I`BoxConfig`) {}

/**
 * Live developer-token configuration layer backed by `CLOUD_BOX_TOKEN`.
 *
 * @example
 * ```ts
 * import { BoxConfigLayer } from "@beep/box"
 *
 * console.log(BoxConfigLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const BoxConfigLayer = Layer.effect(
  BoxConfig,
  Effect.gen(function* () {
    const token = yield* Config.redacted("CLOUD_BOX_TOKEN").pipe(
      Effect.mapError((cause) =>
        BoxError.fromReason("config", {
          cause,
        })
      )
    );
    return BoxDeveloperTokenConfig.make({ token });
  })
);

/**
 * Backward-compatible alias for {@link BoxConfigLayer}.
 *
 * @example
 * ```ts
 * import { layer } from "@beep/box"
 *
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = BoxConfigLayer;

/**
 * Construct a developer-token configuration layer from an explicit token.
 *
 * @example
 * ```ts
 * import { layerConfig } from "@beep/box"
 * import { Redacted } from "effect"
 *
 * const layer = layerConfig(Redacted.make("box-token"))
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerConfig = (token: Redacted.Redacted<string>): Layer.Layer<BoxConfig> =>
  Layer.succeed(BoxConfig, BoxDeveloperTokenConfig.make({ token }));
