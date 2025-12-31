import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Anonymous from "./anonymous";
import * as Email from "./email";
import * as OAuth2 from "./oauth2";
import * as PhoneNumber from "./phone-number";
import * as Social from "./social";
import * as SSO from "./sso";
import * as Username from "./username";

export type Service = HttpApiGroup.ApiGroup<"iam", "signIn">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "signIn", (h) =>
  h
    .handle("anonymous", Anonymous.Handler)
    .handle("email", Email.Handler)
    .handle("oauth2", OAuth2.Handler)
    .handle("phoneNumber", PhoneNumber.Handler)
    .handle("social", Social.Handler)
    .handle("sso", SSO.Handler)
    .handle("username", Username.Handler)
);
