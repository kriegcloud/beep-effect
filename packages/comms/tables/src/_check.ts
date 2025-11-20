import type { EmailTemplate } from "@beep/comms-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectTodo: typeof EmailTemplate.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.emailTemplate
>;

export const _checkInsertTodo: typeof EmailTemplate.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.emailTemplate
>;
