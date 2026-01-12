import { client } from "@beep/iam-client/adapters/better-auth";

export const useSession = () => {
  const sessionResult = client.useSession();

  return {
    session: sessionResult.data,
  };
};
