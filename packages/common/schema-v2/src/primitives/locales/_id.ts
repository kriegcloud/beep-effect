import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for locale primitives.
 *
 * Keeps annotations scoped under `primitives/locales` so Locale schemas reuse the same namespace.
 *
 * @example
 * import { Id } from "@beep/schema-v2/primitives/locales/_id";
 *
 * const meta = Id.annotations("Locale", { title: "Locale" });
 *
 * @category Primitives/Locales
 * @since 0.1.0
 * @internal
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/locales`);
