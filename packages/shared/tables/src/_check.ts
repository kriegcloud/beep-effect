import type { Organization, Team } from "@beep/shared-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./tables";

export const _checkSelectOrganization: typeof Organization.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.organization
>;
export const _checkInsertOrganization: typeof Organization.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.organization
>;

export const _checkSelectTeam: typeof Team.Model.select.Encoded = {} as InferSelectModel<typeof tables.team>;
export const _checkInsertTeam: typeof Team.Model.insert.Encoded = {} as InferInsertModel<typeof tables.team>;
