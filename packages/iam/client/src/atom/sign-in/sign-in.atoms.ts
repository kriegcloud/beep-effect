"use client";
import {useAtomSet} from "@effect-atom/atom-react";
import {ApiClient} from "../api-client.ts";

export const useSignIn = () => {
  const signInEmail = useAtomSet(ApiClient.mutation("signIn", "email"), {mode: "promise" as const});
  const signInAnonymous = useAtomSet(ApiClient.mutation("signIn", "anonymous",), {mode: "promise" as const});
  const signInOAuth2 = useAtomSet(ApiClient.mutation("signIn", "oauth2",), {mode: "promise" as const});
  const signInPhoneNumber = useAtomSet(ApiClient.mutation("signIn", "phoneNumber",), {mode: "promise" as const});
  const signInSocial = useAtomSet(ApiClient.mutation("signIn", "social",), {mode: "promise" as const});
  const signInSSO = useAtomSet(ApiClient.mutation("signIn", "sso",), {mode: "promise" as const});
  const signInUsername = useAtomSet(ApiClient.mutation("signIn", "username",), {mode: "promise" as const});

  return {
    signInEmail,
    signInAnonymous,
    signInOAuth2,
    signInPhoneNumber,
    signInSocial,
    signInSSO,
    signInUsername,
  };
};
