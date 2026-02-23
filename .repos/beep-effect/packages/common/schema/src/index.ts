/**
 * Namespaced BS aggregate that exposes every schema bundle.
 *
 * @category Surface
 * @since 0.1.0
 * @example
 * import { BS } from "@beep/schema";
 *
 * const emailSchema = BS.Email;
 */
import * as SchemaNamespace from "./schema";

export { SchemaNamespace as BS };
