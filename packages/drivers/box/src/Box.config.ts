/**
 *
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {$BoxId} from "@beep/identity";
import {Config, Context, Effect, Layer} from "effect";
import * as S from "effect/Schema";
import type {Redacted} from "effect";

const $I = $BoxId.create("Box.config");

export class BoxConfigShape extends S.Class<BoxConfigShape>($I`BoxConfigShape`)(
  {
    token: S.Redacted(S.String),
  },
  $I.annote("BoxConfigShape", {
    description: "Configuration schema for Box driver",
  })
) {
}

export class BoxConfig extends Context.Service<BoxConfig, BoxConfigShape>()($I`BoxConfig`) {
}

export const layer = Layer.effect(
  BoxConfig,
  Effect.gen(function* () {
    const token = yield* Config.redacted("CLOUD_BOX_TOKEN");

    return BoxConfigShape.make({
      token,
    });
  })
);

export const layerConfig = (token: Redacted.Redacted<string>) =>
  Layer.effect(
    BoxConfig,
    Effect.gen(function* () {
      return BoxConfigShape.make({
        token,
      });
    })
  );
