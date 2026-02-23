import { env } from "@beep/notes/env";
import { generateFromUsername } from "@beep/notes/lib/generateFromUsername";
import { findOrCreateUser } from "@beep/notes/server/auth/findOrCreateUser";
import { Google } from "arctic";

import type { AuthProviderConfig } from "../lucia";

const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID ?? "",
  process.env.GOOGLE_CLIENT_SECRET ?? "",
  `${env.NEXT_PUBLIC_SITE_URL ?? ""}/api/auth/google/callback`
);

const config: AuthProviderConfig = {
  name: "google",
  pkce: true,
};

const getProviderAuthorizationUrl = (state: string, codeVerifier?: undefined | string) => {
  return googleAuth.createAuthorizationURL(state, codeVerifier!, ["profile", "email"]);
};

const handleProviderCallback = async (
  code: string,
  codeVerifier?: undefined | string,
  _userId?: undefined | string
) => {
  const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier!);
  const accessToken = tokens.accessToken();
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const googleUser = await response.json();

  const user = await findOrCreateUser({
    email: googleUser.email!,
    firstName: googleUser.given_name,
    lastName: googleUser.family_name,
    name: googleUser.name,
    profileImageUrl: googleUser.picture,
    providerId: "google",
    providerUserId: googleUser.sub,
    username: generateFromUsername(googleUser.name),
  });

  return user.id;
};

export const googleProvider = {
  config,
  getProviderAuthorizationUrl,
  handleProviderCallback,
};
