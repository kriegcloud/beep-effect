/**
 * Constants shared across the contract runtime.
 *
 * @since 0.1.0
 */

/**
 * Unique identifier for user-defined contracts. This is useful when building
 * diagnostics or serialization helpers that need to tag values originating from
 * application-authored contracts.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export const TypeId = "~@beep/contract/Contract";

/**
 * Type-level representation of the user-defined contract identifier.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Unique identifier for provider-defined contracts. Framework code can inspect
 * this tag to enforce that certain helpers are only called with contracts that
 * originate from infrastructure code instead of user code.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export const ProviderDefinedTypeId = "~@beep/contract/Contract/ProviderDefined";

/**
 * Type-level representation of the provider-defined contract identifier.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export type ProviderDefinedTypeId = typeof ProviderDefinedTypeId;
