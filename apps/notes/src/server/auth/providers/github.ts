import { env } from "@beep/notes/env";
import { findOrCreateUser } from "@beep/notes/server/auth/findOrCreateUser";
import type { Endpoints } from "@octokit/types";
import { GitHub } from "arctic";

import type { AuthProviderConfig } from "../lucia";

const githubAuth = new GitHub(
  env.GITHUB_CLIENT_ID ?? "",
  env.GITHUB_CLIENT_SECRET ?? "",
  `${env.NEXT_PUBLIC_SITE_URL ?? ""}/api/auth/github/callback`
);

const config: AuthProviderConfig = {
  name: "github",
};

const getProviderAuthorizationUrl = (state: string, _codeVerifier?: string) => {
  return githubAuth.createAuthorizationURL(state, ["read:user", "user:email"]);
};

const handleProviderCallback = async (code: string, _codeVerifier?: string, _userId?: string) => {
  const tokens = await githubAuth.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const githubUser: Endpoints["GET /user"]["response"]["data"] = await response.json();

  let email = githubUser.email;

  if (!email) {
    /**
     * If the user does not have a public email, get another via the GitHub API
     * See
     * https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
     */
    const res = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "luciaauth",
      },
    });
    const emails: Endpoints["GET /user/emails"]["response"]["data"] = await res.json();

    const primaryEmail = emails.find((item) => item.primary);
    email = primaryEmail?.email ?? emails[0]!.email;
  }

  const user = await findOrCreateUser({
    bio: githubUser.bio ?? undefined,
    email,
    github: githubUser.login,
    location: githubUser.location ?? undefined,
    name: githubUser.name ?? githubUser.login ?? undefined,
    profileImageUrl: githubUser.avatar_url,
    providerId: "github",
    providerUserId: githubUser.id.toString(),
    username: githubUser.login,
    x: githubUser.twitter_username ?? undefined,
  });

  return user.id;
};

export const githubProvider = {
  config,
  getProviderAuthorizationUrl,
  handleProviderCallback,
};
