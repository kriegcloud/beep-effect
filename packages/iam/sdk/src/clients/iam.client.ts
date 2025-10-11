import { oauth2Client } from "@beep/iam-sdk/clients/oauth/oauth.client";
import { organizationClient } from "@beep/iam-sdk/clients/organization";
import { signUpClient } from "@beep/iam-sdk/clients/sign-up/sign-up.client";
import { twoFactorClient } from "@beep/iam-sdk/clients/two-factor";
import { verifyClient } from "@beep/iam-sdk/clients/verify";
import { recoverClient } from "./recover";
import { signInClient } from "./sign-in";
import { signOutClient } from "./sign-out";
export const iam = {
  signIn: signInClient,
  recover: recoverClient,
  signUp: signUpClient,
  verify: verifyClient,
  twoFactor: twoFactorClient,
  organization: organizationClient,
  oauth2: oauth2Client,
  signOut: signOutClient,
} as const;
