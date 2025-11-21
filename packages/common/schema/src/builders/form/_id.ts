import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

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
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/builders/form`);
