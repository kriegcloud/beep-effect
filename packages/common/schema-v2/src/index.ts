import * as BuildersNamespace from "./builders";
import * as CoreNamespace from "./core";
import * as DerivedNamespace from "./derived";
import * as IdentityNamespace from "./identity";
import * as IntegrationsNamespace from "./integrations";
import * as PrimitivesNamespace from "./primitives";

/**
 * Schema builders for forms, JSON Schema emission, and introspection surfaces.
 *
 * @category Surface/Builders
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const builderNamespace = SchemaV2.Builders;
 */
export * as Builders from "./builders";
/**
 * Core annotations, variance helpers, and shared utility exports.
 *
 * @category Surface/Core
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const coreNamespace = SchemaV2.Core;
 */
export * as Core from "./core";
/**
 * Derived helper kits (collection builders, transforms, nullable helpers, etc.).
 *
 * @category Surface/Derived
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const derivedNamespace = SchemaV2.Derived;
 */
export * as Derived from "./derived";
/**
 * Identity helpers for EntityId factories, derived kits, and brand wiring.
 *
 * @category Surface/Identity
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const identityNamespace = SchemaV2.Identity;
 */
export * as Identity from "./identity";
/**
 * Integration helpers spanning HTTP contracts, SQL annotations, and policy tooling.
 *
 * @category Surface/Integrations
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const integrationNamespace = SchemaV2.Integrations;
 */
export * as Integrations from "./integrations";
/**
 * Primitive schemas including string, number, binary, and locale helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const primitiveNamespace = SchemaV2.Primitives;
 */
export * as Primitives from "./primitives";

/**
 * Namespaced BS aggregate that exposes every schema bundle.
 *
 * @category Surface
 * @since 0.1.0
 * @example
 * import * as SchemaV2 from "@beep/schema-v2";
 *
 * const { primitives } = SchemaV2.BS;
 */
export const BS = {
  core: CoreNamespace,
  primitives: PrimitivesNamespace,
  identity: IdentityNamespace,
  derived: DerivedNamespace,
  builders: BuildersNamespace,
  integrations: IntegrationsNamespace,
} as const;
