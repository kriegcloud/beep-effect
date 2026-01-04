import type { File, Folder, Organization, Session, Team, UploadSession, User } from "@beep/shared-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./tables";

export const _checkSelectOrganization: typeof Organization.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.organization
>;
export const _checkInsertOrganization: InferInsertModel<typeof tables.user> = {} as typeof User.Model.insert.Encoded;

export const _checkSelectUser: typeof User.Model.select.Encoded = {} as InferSelectModel<typeof tables.user>;
export const _checkInsertUser: InferInsertModel<typeof tables.user> = {} as typeof User.Model.insert.Encoded;

export const _checkSelectTeam: typeof Team.Model.select.Encoded = {} as InferSelectModel<typeof tables.team>;
export const _checkInsertTeam: typeof Team.Model.insert.Encoded = {} as InferInsertModel<typeof tables.team>;
export const _sessionSelect: typeof Session.Model.select.Encoded = {} as InferSelectModel<typeof tables.session>;

export const _checkInsertSession: typeof Session.Model.insert.Encoded = {} as InferInsertModel<typeof tables.session>;

export const _checkSelectFolder: typeof Folder.Model.select.Encoded = {} as InferSelectModel<typeof tables.folder>;
export const _checkInsertFolder: typeof Folder.Model.insert.Encoded = {} as InferInsertModel<typeof tables.folder>;

export const _checkSelectFile: typeof File.Model.select.Encoded = {} as InferSelectModel<typeof tables.file>;
export const _checkInsertFile: typeof File.Model.insert.Encoded = {} as InferInsertModel<typeof tables.file>;

export const _checkSelectUploadSession: typeof UploadSession.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.uploadSession
>;
export const _checkInsertUploadSession: typeof UploadSession.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.uploadSession
>;
