/**
 * @module OAuth2
 *
 * OAuth2 provider API routes.
 * Implements handlers for OAuth2 authorization server endpoints.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Authorize from "./authorize";
import * as Callback from "./callback";
import * as Consent from "./consent";
import * as GetClient from "./get-client";
import * as Link from "./link";
import * as Register from "./register";
import * as Token from "./token";
import * as Userinfo from "./userinfo";

export type Service = HttpApiGroup.ApiGroup<"iam", "oauth2">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

/**
 * OAuth2 API routes layer.
 *
 * @since 1.0.0
 * @category Layer
 */
export const Routes: Routes = HttpApiBuilder.group(IamApi, "oauth2", (h) =>
  h
    .handle("authorize", Authorize.Handler)
    .handle("callback", Callback.Handler)
    .handle("consent", Consent.Handler)
    .handle("get-client", GetClient.Handler)
    .handle("link", Link.Handler)
    .handle("register", Register.Handler)
    .handle("token", Token.Handler)
    .handle("userinfo", Userinfo.Handler)
);
