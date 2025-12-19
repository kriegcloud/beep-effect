import type { IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as Layer from "effect/Layer";
import { Admin } from "./admin";
import { ApiKey } from "./api-key";
import { Core } from "./core";
import { OAuth2 } from "./oauth2";
import { Organization } from "./organization";
import { Passkey } from "./passkey";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";
import { SSO } from "./sso";
import { TwoFactor } from "./two-factor";

// NOTE: Device, Misc, MultiSession, PhoneNumber groups are handled internally
// by Better Auth plugins. They do not expose callable API methods via auth.api.
// These endpoints are still available via Better Auth's internal router.

export type Service =
  | SignIn.Service
  | SignUp.Service
  | Core.Service
  | Admin.Service
  | ApiKey.Service
  | OAuth2.Service
  | Organization.Service
  | Passkey.Service
  | SSO.Service
  | TwoFactor.Service;

export type Api = Layer.Layer<Service, IamAuthError, Auth.Service>;

export const layer: Api = Layer.mergeAll(
  SignIn.Routes,
  SignUp.Routes,
  Core.Routes,
  Admin.Routes,
  ApiKey.Routes,
  OAuth2.Routes,
  Organization.Routes,
  Passkey.Routes,
  SSO.Routes,
  TwoFactor.Routes
);
