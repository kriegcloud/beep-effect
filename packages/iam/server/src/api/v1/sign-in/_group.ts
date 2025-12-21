import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Anonymous from "./anonymous.ts";
import * as Email from "./email.ts";
import * as OAuth2 from "./oauth2.ts";
import * as PhoneNumber from "./phone-number.ts";
import * as Social from "./social.ts";
import * as SSO from "./sso.ts";
import * as Username from "./username.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "signIn">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "signIn", (h) =>
  h
    .handle("anonymous", Anonymous.Handler)
    .handle("email", Email.Handler)
    .handle("oauth2", OAuth2.Handler)
    .handle("phone-number", PhoneNumber.Handler)
    .handle("social", Social.Handler)
    .handle("sso", SSO.Handler)
    .handle("username", Username.Handler)
);
