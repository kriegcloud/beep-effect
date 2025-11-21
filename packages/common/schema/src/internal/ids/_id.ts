import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

/**  */
export const Id = BeepId.from(`${SchemaId.string()}/internal/ids`);
