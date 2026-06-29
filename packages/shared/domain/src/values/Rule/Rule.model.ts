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
 * import { Effect } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Effect.Enum.allow)
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
 * import type { Effect } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const useEffect = (_value: Effect) => true
 * console.log(useEffect)
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
   * import type { Effect } from "@beep/shared-domain/values/Rule/Rule.model"
   *
   * const useEncoded = (_value: Effect.Encoded) => true
   * console.log(useEncoded)
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
 * import { Base } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Base)
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
 * import { Allow } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Allow)
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
 * import { Deny } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Deny)
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
 * import { Ask } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Ask)
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
 * console.log(Rule.ast)
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
 * @example
 * ```ts
 * import type { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const useRule = (_value: Rule) => true
 * console.log(useRule)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Rule = typeof Rule.Type;

/**
 * Array schema for ordered rule effects.
 *
 * @example
 * ```ts
 * import { Ruleset } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Ruleset.ast)
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

/**
 * Type for {@link Ruleset}.
 *
 * @example
 * ```ts
 * import type { Ruleset } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * const useRuleset = (_value: Ruleset) => true
 * console.log(useRuleset)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Ruleset = typeof Ruleset.Type;
