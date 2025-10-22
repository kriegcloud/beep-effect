"use client";
import { SessionImplementations } from "@beep/iam-sdk";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { useAtomValue } from "@effect-atom/atom-react";

export const getSessionAtom = iamAtomRuntime.atom(SessionImplementations.GetSession);
export const useGetSession = () => {
  const sessionResult = useAtomValue(getSessionAtom);

  return {
    sessionResult,
  };
};
