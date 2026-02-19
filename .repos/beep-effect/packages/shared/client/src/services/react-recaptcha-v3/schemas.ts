/**
 * Effect Schema definitions for ReCaptcha v3 configuration and data types.
 * @module
 */

import { $SharedClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("services/react-recaptcha-v3/schemas");
/**
 * Script append target - where the script element should be inserted in the DOM.
 */
export const ScriptAppendTo = BS.StringLiteralKit("head", "body").annotations(
  $I.annotations("ScriptAppendTo", {
    description: "Script append target - where the script element should be inserted in the DOM.",
  })
);
export type ScriptAppendTo = typeof ScriptAppendTo.Type;

/**
 * ReCaptcha badge position options.
 */
export const BadgePosition = BS.StringLiteralKit("inline", "bottomleft", "bottomright").annotations(
  $I.annotations("BadgePosition", {
    description: "ReCaptcha badge position options.",
  })
);
export type BadgePosition = typeof BadgePosition.Type;

/**
 * ReCaptcha theme options.
 */
export const ReCaptchaTheme = BS.StringLiteralKit("dark", "light").annotations(
  $I.annotations("ReCaptchaTheme", {
    description: "ReCaptcha theme options.",
  })
);
export type ReCaptchaTheme = typeof ReCaptchaTheme.Type;

/**
 * Script loading properties for injecting the ReCaptcha script.
 */
export class ScriptProps extends S.Class<ScriptProps>($I`ScriptProps`)(
  {
    appendTo: S.optionalWith(ScriptAppendTo, { default: () => "body" as const }),
    async: S.optionalWith(S.Boolean, { default: () => true }),
    defer: S.optionalWith(S.Boolean, { default: () => true }),
    id: S.optionalWith(S.String, { default: () => "google-recaptcha-v3" }),
    nonce: S.optional(S.String),
    src: S.String,
  },
  $I.annotations("ScriptProps", {
    description: "Script loading properties for injecting the ReCaptcha script.",
  })
) {}

/**
 * Container parameters for explicit ReCaptcha rendering.
 */
export class ContainerParameters extends S.Class<ContainerParameters>($I`ContainerParameters`)(
  {
    badge: S.optionalWith(BadgePosition, { default: () => "inline" as const }),
    hidden: S.optionalWith(S.Boolean, { default: () => false }),
    tabindex: S.optional(S.Number),
    theme: S.optionalWith(ReCaptchaTheme, { default: () => "light" as const }),
  },
  $I.annotations("ContainerParameters", {
    description: "Container parameters for explicit ReCaptcha rendering.",
  })
) {}

/**
 * Schema for HTMLElement that only evaluates on the client.
 * Uses S.suspend to defer evaluation and avoid SSR issues.
 */
// const HTMLElementSchema = S.suspend(() =>
//   typeof HTMLElement !== "undefined" ? S.instanceOf(HTMLElement) : (S.Never as S.Schema<HTMLElement>)
// );
const HTMLElementSchema = S.declare(
  (u: unknown): u is HTMLElement => P.isNotUndefined(HTMLElement) && S.is(S.instanceOf(HTMLElement))(u)
);
/**
 * Container configuration for explicit ReCaptcha rendering.
 */
export class ContainerConfig extends S.Class<ContainerConfig>($I`ContainerConfig`)(
  {
    element: S.Union(S.String, HTMLElementSchema),
    parameters: ContainerParameters,
  },
  $I.annotations("ContainerConfig", {
    description: "Container configuration for explicit ReCaptcha rendering.",
  })
) {}

/**
 * ReCaptcha provider configuration.
 */
export class ReCaptchaConfig extends S.Class<ReCaptchaConfig>($I`ReCaptchaConfig`)(
  {
    reCaptchaKey: S.String,
    language: S.optional(S.String),
    useEnterprise: S.optionalWith(S.Boolean, { default: () => false }),
    useRecaptchaNet: S.optionalWith(S.Boolean, { default: () => false }),
    container: S.optional(ContainerConfig),
    scriptProps: S.optional(
      S.Struct({
        appendTo: S.optional(ScriptAppendTo),
        async: S.optional(S.Boolean),
        defer: S.optional(S.Boolean),
        id: S.optional(S.String),
        nonce: S.optional(S.String),
        onLoadCallbackName: S.optional(S.String),
      })
    ),
  },
  $I.annotations("ReCaptchaConfig", {
    description: "ReCaptcha provider configuration.",
  })
) {}

/**
 * ReCaptcha execution options.
 */
export class ExecuteOptions extends S.Class<ExecuteOptions>($I`ExecuteOptions`)(
  {
    action: S.optional(S.String),
  },
  $I.annotations("ExecuteOptions", {
    description: "ReCaptcha execution options.",
  })
) {}

/**
 * ReCaptcha token result.
 */
export class ReCaptchaToken extends S.Class<ReCaptchaToken>($I`ReCaptchaToken`)(
  {
    token: S.String,
    action: S.optional(S.String),
    timestamp: S.DateTimeUtc,
  },
  $I.annotations("ReCaptchaToken", {
    description: "ReCaptcha token result.",
  })
) {}
