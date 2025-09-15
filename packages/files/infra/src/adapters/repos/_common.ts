import { PgLive } from "@beep/core-db";
import { FileDb } from "../../db";
export const dependencies = [FileDb.layerWithoutDeps, PgLive] as const;
