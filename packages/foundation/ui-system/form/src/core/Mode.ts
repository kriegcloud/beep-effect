/**
 * Form validation mode schemas and parsing helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FormId } from "@beep/identity/packages";
import { Duration } from "effect";
import * as S from "effect/Schema";

const $I = $FormId.create("core/Mode");

/**
 * User-facing form validation mode configuration.
 *
 * @example
 * ```ts
 * import type { FormMode } from "@beep/form/core/Mode"
 *
 * const mode: FormMode = { validation: "onChange", debounce: "100 millis" }
 * console.log(mode.validation) // "onChange"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FormMode =
  | { readonly validation?: "onSubmit"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onBlur"; readonly autoSubmit?: boolean; readonly debounce?: never }
  | { readonly validation: "onChange"; readonly debounce?: Duration.Input; readonly autoSubmit?: boolean };

/**
 * Validation mode configuration with auto-submit disabled at the type level.
 *
 * @example
 * ```ts
 * import type { FormModeWithoutAutoSubmit } from "@beep/form/core/Mode"
 *
 * const mode: FormModeWithoutAutoSubmit = { validation: "onBlur", autoSubmit: false }
 * console.log(mode.validation) // "onBlur"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FormModeWithoutAutoSubmit =
  | { readonly validation?: "onSubmit"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onBlur"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onChange"; readonly debounce?: Duration.Input; readonly autoSubmit?: false };

const ValidationMode = S.Literals(["onSubmit", "onBlur", "onChange"]).pipe(
  $I.annoteSchema("ValidationMode", {
    description: "Supported form validation timing strategies.",
  })
);

/**
 * Normalized validation mode consumed by the atom runtime.
 *
 * @example
 * ```ts
 * import { ParsedMode } from "@beep/form/core/Mode"
 *
 * const mode = ParsedMode.make({ validation: "onSubmit", debounce: null, autoSubmit: false })
 * console.log(mode.autoSubmit) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParsedMode extends S.Class<ParsedMode>($I`ParsedMode`)(
  {
    autoSubmit: S.Boolean,
    debounce: S.NullOr(S.Finite),
    validation: ValidationMode,
  },
  $I.annote("ParsedMode", {
    description: "Normalized form mode used by atoms after applying defaults and duration conversion.",
  })
) {}

/**
 * Normalizes optional mode input into a parsed mode.
 *
 * @example
 * ```ts
 * import { parse } from "@beep/form/core/Mode"
 *
 * const mode = parse({ validation: "onChange", debounce: "10 millis" })
 * console.log(mode.validation) // "onChange"
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const parse = (mode?: FormMode): ParsedMode => {
  const validation = mode?.validation ?? "onSubmit";

  if (validation === "onBlur") {
    return ParsedMode.make({ validation: "onBlur", debounce: null, autoSubmit: mode?.autoSubmit === true });
  }

  if (validation === "onChange") {
    const debounceMs = mode?.debounce === undefined ? null : Duration.toMillis(mode.debounce);
    const autoSubmit = mode?.autoSubmit === true;
    return ParsedMode.make({ validation: "onChange", debounce: debounceMs, autoSubmit });
  }

  return ParsedMode.make({ validation: "onSubmit", debounce: null, autoSubmit: false });
};
