"use client";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { useAtomValue } from "@effect-atom/atom-react";
import { SessionService } from "./session.service";
export const sessionRuntime = makeAtomRuntime(SessionService.Live);

export const getSessionAtom = sessionRuntime.atom(SessionService.GetSession);
export const useGetSession = () => {
  const sessionResult = useAtomValue(getSessionAtom);

  return {
    sessionResult,
  };
};
