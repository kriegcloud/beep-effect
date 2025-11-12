// =============================================================================
// Type Ids
// =============================================================================

/**
 * Unique identifier for user-defined contracts.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/contract/Contract";

/**
 * Type-level representation of the user-defined contract identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Unique identifier for provider-defined contracts.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const ProviderDefinedTypeId = "~@beep/contract/Contract/ProviderDefined";

/**
 * Type-level representation of the provider-defined contract identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type ProviderDefinedTypeId = typeof ProviderDefinedTypeId;
