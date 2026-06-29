/**
 * Rule value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("values/Rule/Rule.model");

/**
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule"
 *
 * console.log(Rule.Effect.make("allow" as const))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Effect = LiteralKit(["allow", "deny", "ask"]).pipe(
  $I.annoteSchema("Effect", {
    description: "Effect of a rule: allow, deny, ask.",
  })
);

/**
 * Companion type for {@link Effect}.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule.Effect = Rule.Effect.Enum.allow
 * ```
 */
/**
 * Companion namespace for {@link Effect}.
 *
 * @since 0.0.0
 */
export declare namespace Effect {
  /**
   * Companion Encoded type for {@link Effect}.
   *
   * @example
   * ```ts
   * import type { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
   *
   *
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Effect.Encoded;
}

/**
 * Base class for making the  tagged union.
 *
 * @example
 *
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule.Effect = Rule.Effect.Enum.allow
 * ```
 *
 *
 * @category models
 * @since 0.0.0
 */
export class Base extends S.Class<Base>($I`Base`)(
  {
    action: S.String,
    resource: S.String,
  },
  $I.annote("Base", {
    description: "Base class for ",
  })
) {}

/**
 *  with discriminated `allow` effect field.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule.Effect = Rule.Effect.Enum.allow
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Allow extends Base.extend<Allow>($I`Allow`)(
  {
    effect: S.tag(Effect.Enum.allow),
  },
  $I.annote("Allow", {
    description: " with discriminated `allow` effect field",
  })
) {}

/**
 *  with discriminated `deny` effect field.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule.Effect = Rule.Effect.Enum.allow
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Deny extends Base.extend<Deny>($I`Deny`)(
  {
    effect: S.tag(Effect.Enum.deny),
  },
  $I.annote("Deny", {
    description: " with discriminated `deny` effect field",
  })
) {}

/**
 *  with discriminated `deny` effect field.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule.Effect = Rule.Effect.Enum.ask
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Ask extends Base.extend<Ask>($I`Ask`)(
  {
    effect: S.tag(Effect.Enum.ask),
  },
  $I.annote("Ask", {
    description: " with discriminated `ask` effect field",
  })
) {}

/**
 * Rule is a schema defining a tagged union composed of three possible effects: Allow, Deny, and Ask.
 * It is annotated as "Rule" with a description indicating its purpose as a RuleEffect tagged union.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const Rulething: Rule = Rule.Enum.allow
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Rule = S.Union([Allow, Deny, Ask]).pipe(
  S.toTaggedUnion("effect"),
  $I.annoteSchema("Rule", {
    description: "RuleEffect tagged union",
  })
);

/**
 * Companion type for {@link Rule}.
 *
 * @category models
 * @since 0.0.0
 */
export type Rule = typeof Rule.Type;

/**
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Ruleset = Rule.pipe(
  S.Array,
  $I.annoteSchema("Ruleset", {
    description: "Array of Rule",
  })
);

export type Ruleset = typeof Ruleset.Type;
