import type { UserHotkey } from "@beep/customization-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

export const _checkSelectUserHotkey: typeof UserHotkey.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.userHotkey
>;

export const _checkInsertUserHotkey: typeof UserHotkey.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.userHotkey
>;
