"use client";
import { useAtomSet } from "@effect-atom/atom-react";
import { ApiClient } from "../api-client.ts";
export const useSignUpEmail = () => {
  const signUpEmail = useAtomSet(
    ApiClient.mutation("signUp", "email", {
      withResponse: true,
    }),
    { mode: "promise" as const }
  );

  return {
    signUpEmail,
  };
};
