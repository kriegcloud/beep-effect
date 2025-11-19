import { BeepId, SchemaId } from "@beep/identity";

/**
 * Identity helper for no-input void function schemas.
 *
 * Keeps annotation identifiers stable for `NoInputVoidFn` utilities.
 *
 * @example
 * import { Id } from "@beep/schema/primitives/fn/no-input-void-fn/_id";
 *
 * const meta = Id.annotations("NoInputVoidFn", { description: "No input void fn" });
 *
 * @category Primitives/Fn
 * @since 0.1.0
 *
 */
export const Id = BeepId.from(`${SchemaId.string()}/primitives/fn/no-input-void-fn`);
