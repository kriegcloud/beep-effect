"use client";
import { useAtomSet } from "@effect-atom/atom-react";
import { ApiClient } from "./api-client.ts";
export const useSignIn = () => {
  const signInEmail = useAtomSet(ApiClient.mutation("signIn", "email"), { mode: "promise" });

  return {
    signInEmail,
  };
};
