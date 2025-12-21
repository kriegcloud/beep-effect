import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as DeletePasskey from "./delete-passkey.ts";
import * as GenerateAuthenticateOptions from "./generate-authenticate-options.ts";
import * as GenerateRegisterOptions from "./generate-register-options.ts";
import * as ListUserPasskeys from "./list-user-passkeys.ts";
import * as UpdatePasskey from "./update-passkey.ts";
import * as VerifyAuthentication from "./verify-authentication.ts";
import * as VerifyRegistration from "./verify-registration.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "passkey">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "passkey", (h) =>
  h
    .handle("delete-passkey", DeletePasskey.Handler)
    .handle("generate-authenticate-options", GenerateAuthenticateOptions.Handler)
    .handle("generate-register-options", GenerateRegisterOptions.Handler)
    .handle("list-user-passkeys", ListUserPasskeys.Handler)
    .handle("update-passkey", UpdatePasskey.Handler)
    .handle("verify-authentication", VerifyAuthentication.Handler)
    .handle("verify-registration", VerifyRegistration.Handler)
);
