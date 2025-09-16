import { IamDb } from "@beep/iam-infra/db";
export const dependencies = [IamDb.layerWithoutDependencies] as const;
