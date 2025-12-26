/**
 * Core utility helpers aggregated for convenient imports.
 *
 * Includes arbitraries, brands, merge helpers, and optional defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Utils } from "@beep/schema/core";
 *
 * const samples = Utils.makeArbs(S.String)("type", 3);
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * from "./arbitrary";
/**
 * Brands namespace re-export for nominal helpers.
 *
 * @example
 * import { Utils } from "@beep/schema/core";
 *
 * const tenantId = Utils.makeBranded<"TenantId", string>("tenant_123");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * from "./brands";
export * from "./encode-sync-debug";
export * from "./get-resolved-property-signatures";
export * from "./hash";
/**
 * Merge helper exports for struct field dictionaries.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Utils } from "@beep/schema/core";
 *
 * const merged = Utils.mergeFields({ id: S.String })({ name: S.String });
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * from "./merge-fields";
/**
 * Optional schema helper exports for defaulted property signatures.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Utils } from "@beep/schema/core";
 *
 * const schema = Utils.toOptionalWithDefault(S.String)("fallback");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * from "./to-optional-with";
/**
 * Default thunk namespace exports for optional helpers.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Utils } from "@beep/schema/core";
 *
 * const applyDefault = Utils.WithDefaultsThunk.make(S.optional(S.String));
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export * from "./with-defaults-thunk";
