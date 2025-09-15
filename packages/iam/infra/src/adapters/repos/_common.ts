import { PgLive } from "@beep/core-db";
import { IamDb } from "../../db";
export const dependencies = [IamDb.layerWithoutDeps, PgLive] as const;
