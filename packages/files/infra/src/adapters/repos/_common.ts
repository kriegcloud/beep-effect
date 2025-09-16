import { FilesDb } from "@beep/files-infra/db";
export const dependencies = [FilesDb.layerWithoutDependencies] as const;
