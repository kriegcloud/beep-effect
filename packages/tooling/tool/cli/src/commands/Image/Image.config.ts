/**
 * Image command configuration service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity";
import { PosInt, SchemaUtils } from "@beep/schema";
import { Str } from "@beep/utils";
import { Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Image/Image.config");

/**
 * Configuration Schema for the Image command.
 *
 * @example
 * ```typescript
 * import { Effect, Console } from "effect";
 * import * as ImageConfig from "@beep/repo-cli/commands/Image/Image.config";
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* ImageConfig.Config
 *   yield* Console.log(config)
 * })
 * ```
 * @category configuration
 * @since 0.0.0
 */
export class ConfigShape extends S.Class<ConfigShape>($I`ConfigShape`)(
  {
    barWidth: PosInt.pipe(SchemaUtils.withKeyDefaults(PosInt.make(24))),
  },
  $I.annote("ConfigShape", {
    description: "Configuration schema for the Image command, defining the bar width for progress bars.",
  })
) {
  static readonly new = (config?: undefined | Partial<ConfigShape>) => new ConfigShape(config ?? {});

  static readonly default = ConfigShape.new();

  static readonly repeatBarWidth = Str.repeat(this.default.barWidth);
}

/**
 * Image command configuration service tag.
 *
 * @category services
 * @since 0.0.0
 */
export class Config extends Context.Service<Config, ConfigShape>()($I`Config`) {
  static readonly layer = Layer.effect(
    Config,
    Effect.gen(function* () {
      return Config.of({
        barWidth: PosInt.make(24),
      });
    })
  );

  static readonly layerConfig = (barWidth: number) =>
    Layer.effect(
      Config,
      Effect.gen(function* () {
        return Config.of({
          barWidth: PosInt.make(barWidth),
        });
      })
    );
}
