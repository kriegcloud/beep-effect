/**
 * @module @beep/ai-sdk/codex/codexOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { FilePath } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/codex/codexOptions");

/**
 * Recursive value supported by Codex CLI `--config` overrides.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CodexConfigValue =
  | string
  | number
  | boolean
  | ReadonlyArray<CodexConfigValue>
  | { readonly [key: string]: CodexConfigValue };

/**
 * Type namespace for {@link CodexConfigValue}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace CodexConfigValue {
  /**
   * Encoded type for {@link CodexConfigValue} {@inheritDoc CodexConfigValue}
   *
   * @since 0.0.0
   * @category DomainModel
   *
   */
  export type Encoded = string | number | boolean | ReadonlyArray<Encoded> | { readonly [key: string]: Encoded };
}

const CodexConfigValue$ref = S.suspend((): S.Codec<CodexConfigValue, CodexConfigValue.Encoded> => CodexConfigValue);

/**
 * Object-valued Codex CLI config override tree.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CodexConfigObject = S.Record(S.String, CodexConfigValue$ref);

/**
 * Type of {@link CodexConfigObject} {@inheritDoc CodexConfigObject}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CodexConfigObject = S.Schema.Type<typeof CodexConfigObject>;

/**
 * Schema for values accepted by Codex CLI `--config` overrides.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CodexConfigValue: S.Codec<CodexConfigValue, CodexConfigValue.Encoded> = S.Union([
  S.String,
  S.Number,
  S.Boolean,
  S.Array(CodexConfigValue$ref),
  CodexConfigObject,
]).pipe(
  $I.annoteSchema("CodexConfigValue", {
    description: "Union of all Codex config values",
  })
);

/**
 * Client options used when creating a Codex SDK instance.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CodexOptions extends S.Class<CodexOptions>($I`CodexOptions`)({
  codexPathOverride: S.OptionFromOptionalKey(FilePath),
  baseUrl: S.OptionFromOptionalKey(S.URLFromString),
  apiKey: S.String.pipe(S.RedactedFromValue, S.OptionFromOptionalKey),
  /**
   * Additional `--config key=value` overrides to pass to the Codex CLI.
   *
   * Provide a JSON object and the SDK will flatten it into dotted paths and
   * serialize values as TOML literals so they are compatible with the CLI's
   * `--config` parsing.
   */
  config: S.OptionFromOptionalKey(CodexConfigObject).annotateKey({
    description: "Additional `--config key=value` overrides to pass to" + " the Codex CLI.",
    documentation:
      "Provide a JSON object and the SDK will flatten it into dotted paths and\nserialize values as TOML literals so they are compatible with the CLI's\n`--config` parsing.",
  }),
  /**
   * Environment variables passed to the Codex CLI process. When provided, the SDK
   * will not inherit variables from `process.env`.
   */
  env: S.OptionFromOptionalKey(S.Record(S.String, S.String)).annotateKey({
    description:
      "Environment variables passed to the Codex CLI process. When provided, the SDK\n" +
      "will not inherit variables from `process.env`.\n",
  }),
}) {}
