import { DocumentsDb } from "@beep/documents-infra/db";
export const dependencies = [DocumentsDb.DocumentsDb.Live] as const;
