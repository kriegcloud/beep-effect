"use client";

import { clientEnv } from "@beep/core-env/client";
import * as IamApi from "@beep/iam-infra/api/root";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { Atom, AtomHttpApi, useAtomValue } from "@effect-atom/atom-react";
import { SessionService } from "./session.service";

class IamClient extends AtomHttpApi.Tag<IamClient>()("IamClient", {
  api: IamApi.Api,
  httpClient: FetchHttpClient.layer,
  baseUrl: clientEnv.authUrl,
}) {}
export const sessionRuntime = makeAtomRuntime(SessionService.Live);

export const getSessionAtom = sessionRuntime.atom(SessionService.GetSession()).pipe(Atom.withReactivity(["session"]));

export const useGetSession = () => {
  const sessionResult = useAtomValue(getSessionAtom);
  const currentUser = useAtomValue(
    IamClient.query("currentUser", "get", {
      reactivityKeys: ["current-user"],
    })
  );

  return {
    sessionResult,
    currentUser,
  };
};
