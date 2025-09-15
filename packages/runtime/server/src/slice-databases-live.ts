import { FilesDb } from "@beep/files-infra/db";
import { IamDb } from "@beep/iam-infra/db";
import * as Layer from "effect/Layer";

export const SliceDatabasesLive = Layer.mergeAll(IamDb.layer, FilesDb.layer);
