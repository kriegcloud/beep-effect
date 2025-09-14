import type { DbPool } from "@beep/core-db";
import { FileDb } from "@beep/files-infra/db";
import { IamDb } from "@beep/iam-infra/db";
import type { ServerRuntimeError } from "@beep/runtime-server/types";
import type { SqlClient } from "@effect/sql/SqlClient";
import * as Layer from "effect/Layer";
export type SliceDatabases = IamDb.IamDb | FileDb.FileDb;

export type SliceDatabasesLive = Layer.Layer<SliceDatabases, ServerRuntimeError, SqlClient | DbPool>;

export const SliceDatabasesLive: SliceDatabasesLive = Layer.mergeAll(IamDb.layerWithoutDeps, FileDb.layerWithoutDeps);
