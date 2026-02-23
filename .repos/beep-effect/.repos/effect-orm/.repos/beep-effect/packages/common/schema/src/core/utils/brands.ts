/**
 * Branding helpers to share nominal types across schema modules.
 *
 * Centralizes common brand constructors so docs/examples stay consistent.
 *
 * @example
 * import * as B from "effect/Brand";
 * import { brand } from "@beep/schema/core/utils/brands";
 *
 * const TenantId = brand<B.Brand<"TenantId">>("tenant_123");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as B from "effect/Brand";

/**
 * Casts a runtime value into a branded variant for schema-safe helpers.
 *
 * @example
 * import { makeBranded } from "@beep/schema/core/utils/brands";
 *
 * const PersonId = makeBranded<"PersonId", string>("person_123");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const makeBranded = <const Brand extends string, const Type>(value: Type) => value as B.Branded<Type, Brand>;

/**
 * Applies a nominal brand while preserving the inferred unbranded type.
 *
 * @example
 * import * as B from "effect/Brand";
 * import { brand } from "@beep/schema/core/utils/brands";
 *
 * type OrgId = B.Brand<"OrgId">;
 * const id = brand<OrgId>("org_1");
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const brand = <const Type extends B.Brand<UnsafeTypes.UnsafeAny>>(value: B.Brand.Unbranded<Type>) =>
  B.nominal<Type>()(value);
