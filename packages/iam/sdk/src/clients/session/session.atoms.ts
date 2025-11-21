"use client";

import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { SessionService } from "./session.service";

export const sessionRuntime = makeAtomRuntime(SessionService.Live);

export const getSessionAtom = sessionRuntime.atom(SessionService.GetSession).pipe(Atom.withReactivity(["session"]));

export const useGetSession = () => {
  const sessionResult = useAtomValue(getSessionAtom);

  return {
    sessionResult,
  };
};
