import { $IntegrationsId } from "./modules";

export const { $ConfigId, $HttpId, $SqlId, $FilesId } = $IntegrationsId.compose("config", "http", "sql", "files");
