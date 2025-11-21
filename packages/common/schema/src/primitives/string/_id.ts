import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/packages";

/**
 * Identity helper for string primitive schemas.
 *
 * Provides deterministic annotation namespaces for string helpers like Email or Slug.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/string/_id";
 *
 * const meta = Id.annotations("Email", { title: "Email" });
 *
 * @category Primitives/String
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/string`);
