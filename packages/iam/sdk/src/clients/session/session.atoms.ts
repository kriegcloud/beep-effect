"use client";
import * as IamApi from "@beep/iam-infra/api/root";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { Atom, AtomHttpApi, Result, useAtomValue } from "@effect-atom/atom-react";
import * as Layer from "effect/Layer";
import React from "react";
// import * as Console from "effect/Console";
// import * as Effect from "effect/Effect";
import { SessionImplementations } from "./session.implementations";
import { SessionService } from "./session.service";

class IamClient extends AtomHttpApi.Tag<IamClient>()("IamClient", {
  api: IamApi.Api,
  httpClient: FetchHttpClient.layer,
  baseUrl: "http://localhost:3000",
}) {}

export const sessionRuntime = makeAtomRuntime(Layer.mergeAll(SessionService.Live));

export const getSessionAtom = sessionRuntime
  .atom(SessionImplementations.GetSession)
  .pipe(Atom.withReactivity(["session"]));

export const useGetSession = () => {
  const sessionResult = useAtomValue(getSessionAtom);
  const currentUser = useAtomValue(
    IamClient.query("currentUser", "get", {
      reactivityKeys: ["current-user"],
    })
  );

  React.useEffect(() => {
    Result.match(currentUser, {
      onInitial: () => console.log("initial"),
      onFailure: (e) => console.log(JSON.stringify(e, null, 2)),
      onSuccess: (current) => console.log(JSON.stringify(current, null, 2)),
    });
  }, [currentUser]);

  return {
    sessionResult,
    currentUser,
  };
};
