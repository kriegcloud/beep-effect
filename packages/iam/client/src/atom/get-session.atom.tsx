import { Result, useAtomValue } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import { ApiClient } from "./api-client.ts";
export const useSession = () => {
  const sessionResult = useAtomValue(
    ApiClient.query("core", "getSession", {
      reactivityKeys: ["session"],
    })
  );

  return {
    session: Result.getOrElse(sessionResult, F.constNull),
  };
};
