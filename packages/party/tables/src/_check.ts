import type { Party } from "@beep/party-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectTodo: typeof Party.Model.select.Encoded = {} as InferSelectModel<typeof tables.party>;

export const _checkInsertTodo: typeof Party.Model.insert.Encoded = {} as InferInsertModel<typeof tables.party>;
