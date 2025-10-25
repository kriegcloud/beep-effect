import { AnonymousImplementations } from "./anonymous";
import { ApiKeyImplementations } from "./api-key";
import { DeviceAuthorizationImplementations } from "./device-authorization";
import { MultiSessionImplementations } from "./multi-session";
import { OAuthImplementations } from "./oauth";
import { OrganizationImplementations } from "./organization";
import { PasskeyImplementations } from "./passkey";
import { RecoverImplementations } from "./recover";
import { SessionImplementations } from "./session";
import { SignInImplementations } from "./sign-in";
import { SignOutImplementations } from "./sign-out";
import { SignUpImplementations } from "./sign-up";
import { TwoFactorImplementations } from "./two-factor";
import { VerifyImplementations } from "./verify";

export const IamImplementations = {
  ...VerifyImplementations,
  ...TwoFactorImplementations,
  ...OrganizationImplementations,
  ...SignInImplementations,
  ...SignUpImplementations,
  ...RecoverImplementations,
  ...SignOutImplementations,
  ...OAuthImplementations,
  ...PasskeyImplementations,
  ...MultiSessionImplementations,
  ...AnonymousImplementations,
  ...ApiKeyImplementations,
  ...DeviceAuthorizationImplementations,
  ...SessionImplementations,
};
