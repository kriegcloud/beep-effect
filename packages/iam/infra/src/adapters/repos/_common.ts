import {IamDb} from "../../db";
import {PgLive} from "@beep/core-db";
export const dependencies = [IamDb.layerWithoutDeps, PgLive] as const;