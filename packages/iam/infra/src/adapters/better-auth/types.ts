import type { $Infer, Auth, Session } from "./Auth.service";

export type { $Infer, Auth, Session };
export type $ErrorCodes = Auth["$ERROR_CODES"];
export type Organization = $Infer["Organization"];
export type AuthPromiseApi = Auth["api"];
