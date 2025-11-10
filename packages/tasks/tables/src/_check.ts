import type { Todo } from "@beep/tasks-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectTodo: typeof Todo.Model.select.Encoded = {} as InferSelectModel<typeof tables.todo>;

export const _checkInsertTodo: typeof Todo.Model.insert.Encoded = {} as InferInsertModel<typeof tables.todo>;
