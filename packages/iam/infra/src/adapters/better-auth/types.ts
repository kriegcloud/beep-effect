import type { betterAuth } from "better-auth";
import type { Options } from "./Auth.service";

export type Auth = ReturnType<typeof betterAuth<Options>>;
export type $Infer = Auth["$Infer"];
export type $ErrorCodes = Auth["$ERROR_CODES"];
export type Session = $Infer["Session"];
export type Organization = $Infer["Organization"];
export type AuthApi = Auth["api"];
