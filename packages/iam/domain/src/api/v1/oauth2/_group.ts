/**
 * @module OAuth2
 *
 * OAuth2 provider API group.
 * Implements OAuth2 authorization server endpoints for the OIDC Provider plugin.
 *
 * @category exports
 * @since 0.1.0
 */

import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Authorize from "./authorize";
import * as Callback from "./callback";
import * as Consent from "./consent";
import * as GetClient from "./get-client";
import * as Link from "./link";
import * as Register from "./register";
import * as Token from "./token";
import * as Userinfo from "./userinfo";

/**
 * OAuth2 API group containing all OAuth2 provider endpoints.
 *
 * @since 1.0.0
 * @category Group
 */
export class Group extends HttpApiGroup.make("oauth2")
  .add(Authorize.Contract)
  .add(Callback.Contract)
  .add(Consent.Contract)
  .add(GetClient.Contract)
  .add(Link.Contract)
  .add(Register.Contract)
  .add(Token.Contract)
  .add(Userinfo.Contract)
  .prefix("/oauth2") {}

export { Authorize, Callback, Consent, GetClient, Link, Register, Token, Userinfo };
