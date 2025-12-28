import { thunkNull } from "@beep/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { ApiClient } from "./api-client.ts";
export const useSession = () => {
  const sessionResult = useAtomValue(
    ApiClient.query("core", "getSession", {
      reactivityKeys: ["session"],
    })
  );

  return {
    session: Result.getOrElse(sessionResult, thunkNull),
  };
};
