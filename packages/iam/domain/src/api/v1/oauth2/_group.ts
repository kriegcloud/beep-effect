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
import * as Authorize from "./authorize.ts";
import * as Callback from "./callback.ts";
import * as Consent from "./consent.ts";
import * as GetClient from "./get-client.ts";
import * as Link from "./link.ts";
import * as Register from "./register.ts";
import * as Token from "./token.ts";
import * as Userinfo from "./userinfo.ts";

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
