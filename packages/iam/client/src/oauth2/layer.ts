/**
 * @fileoverview
 * OAuth2 layer composition for Better Auth OAuth2 provider plugin.
 *
 * Composes OAuth2 handlers into a WrapperGroup and provides the complete layer
 * for dependency injection.
 *
 * @module @beep/iam-client/oauth2/layer
 * @category OAuth2
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Consent } from "./consent";
import { Continue } from "./continue";
import { DeleteClient } from "./delete-client";
import { DeleteConsent } from "./delete-consent";
import { GetClient } from "./get-client";
import { GetClients } from "./get-clients";
import { GetConsent } from "./get-consent";
import { GetConsents } from "./get-consents";
import { Link } from "./link";
import { PublicClient } from "./public-client";
import { Register } from "./register";
import { RotateSecret } from "./rotate-secret";
import { UpdateClient } from "./update-client";
import { UpdateConsent } from "./update-consent";

/**
 * Wrapper group combining all OAuth2 handlers.
 *
 * @example
 * ```typescript
 * import { OAuth2 } from "@beep/iam-client"
 *
 * const handlers = OAuth2.Group.accessHandlers("GetClient", "Register")
 * ```
 *
 * @category OAuth2/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  GetClient.Wrapper,
  PublicClient.Wrapper,
  GetClients.Wrapper,
  UpdateClient.Wrapper,
  RotateSecret.Wrapper,
  DeleteClient.Wrapper,
  GetConsent.Wrapper,
  GetConsents.Wrapper,
  UpdateConsent.Wrapper,
  DeleteConsent.Wrapper,
  Register.Wrapper,
  Consent.Wrapper,
  Continue.Wrapper,
  Link.Wrapper
);

/**
 * Effect layer providing OAuth2 handler implementations.
 *
 * @example
 * ```typescript
 * import { OAuth2 } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // OAuth2 handlers available via dependency injection
 * }).pipe(Effect.provide(OAuth2.layer))
 * ```
 *
 * @category OAuth2/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  GetOAuth2Client: GetClient.Handler,
  GetPublicOAuth2Client: PublicClient.Handler,
  GetOAuth2Clients: GetClients.Handler,
  UpdateOAuth2Client: UpdateClient.Handler,
  RotateOAuth2ClientSecret: RotateSecret.Handler,
  DeleteOAuth2Client: DeleteClient.Handler,
  GetOAuth2Consent: GetConsent.Handler,
  GetOAuth2Consents: GetConsents.Handler,
  UpdateOAuth2Consent: UpdateConsent.Handler,
  DeleteOAuth2Consent: DeleteConsent.Handler,
  RegisterOAuth2Client: Register.Handler,
  GrantOAuth2Consent: Consent.Handler,
  ContinueOAuth2Flow: Continue.Handler,
  LinkOAuth2Account: Link.Handler,
});
