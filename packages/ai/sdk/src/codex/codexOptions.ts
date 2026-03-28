/**
 * @module @beep/ai-sdk/codex/codexOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/codex/codexOptions");

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

export const CodexConfigValue: S.Codec<CodexConfigValue, CodexConfigValue.Encoded> = S.Union([
  S.String,
  S.Number,
  S.Boolean,
  S.Array(CodexConfigValue$ref),
  S.Record(S.String, CodexConfigValue$ref),
]).pipe(
  $I.annoteSchema("CodexConfigValue", {
    description: "Union of all Codex config values",
  })
);
