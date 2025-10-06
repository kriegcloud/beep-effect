import { FilesDb } from "@beep/files-infra/db";
export const dependencies = [FilesDb.FilesDb.Live] as const;
