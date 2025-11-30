import { $IntegrationsId } from "@beep/schema/internal/modules/modules";

export const { $ConfigId, $HttpId, $SqlId, $FilesId } = $IntegrationsId.compose("config", "http", "sql", "files");
