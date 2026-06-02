/**
 * Box driver configuration module.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import { Config, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";
import type { Redacted } from "effect";

const $I = $BoxId.create("Box.config");

/**
 * Runtime configuration required by the Box driver.
 *
 * @category models
 * @since 0.0.0
 */
export class BoxConfigShape extends S.Class<BoxConfigShape>($I`BoxConfigShape`)(
  {
    token: S.Redacted(S.String),
  },
  $I.annote("BoxConfigShape", {
    description: "Configuration schema for Box driver",
  })
) {}

/**
 * Box driver configuration service.
 *
 * @category services
 * @since 0.0.0
 */
export class BoxConfig extends Context.Service<BoxConfig, BoxConfigShape>()($I`BoxConfig`) {}

/**
 * Live Box configuration layer backed by process configuration.
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = Layer.effect(
  BoxConfig,
  Effect.gen(function* () {
    const token = yield* Config.redacted("CLOUD_BOX_TOKEN");

    return BoxConfigShape.make({
      token,
    });
  })
);

/**
 * Construct a Box configuration layer from an explicit token.
 *
 * @param token - Box API token.
 * @returns Layer providing the Box configuration service.
 * @category layers
 * @since 0.0.0
 */
export const layerConfig = (token: Redacted.Redacted<string>) =>
  Layer.effect(
    BoxConfig,
    Effect.gen(function* () {
      return BoxConfigShape.make({
        token,
      });
    })
  );
