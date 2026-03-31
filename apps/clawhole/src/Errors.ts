/**
 * A module containing custom error classes for `@beep/clawhole`
 *
 * @module @beep/clawhole/Errors
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("Errors");

/**
 *
 * @category Errors
 * @since 0.0.0
 */
export class ConfigError extends TaggedErrorClass<ConfigError>($I`ConfigError`)(
  "ConfigError",
  {
    cause: S.DefectWithStack,
    message: S.String,
  },
  $I.annote("ConfigError", {
    description: "An error with the clawhole configuration",
  })
) {}
