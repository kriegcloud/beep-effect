import { $IntegrationsId } from "@beep/schema/internal/modules/modules";

export const { $ConfigId, $HttpId, $SqlId } = $IntegrationsId.compose("config", "http", "sql");
