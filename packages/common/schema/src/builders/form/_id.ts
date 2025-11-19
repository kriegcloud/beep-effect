import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for form builder schemas.
 *
 * Provides the namespace used when defining annotation metadata for form components.
 *
 * @example
 * import { Id } from "@beep/schema/builders/form/_id";
 *
 * const FieldAnnotation = Id.compose("Field").symbol();
 *
 * @category Builders/Form
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/builders/form`);
