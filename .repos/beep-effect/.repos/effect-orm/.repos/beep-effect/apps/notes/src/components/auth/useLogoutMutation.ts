import { routes } from "@beep/notes/lib/navigation/routes";
import { encodeURL } from "@beep/notes/lib/url/encodeURL";
import { honoApi } from "@beep/notes/server/hono/hono-client";
import { useMutation } from "@tanstack/react-query";
import type { InferResponseType } from "hono";

const $post = honoApi.auth.logout.$post;

export const useLogoutMutation = () => {
  return useMutation<InferResponseType<typeof $post>>({
    mutationFn: async () => {
      const res = await $post();

      return await res.json();
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
    onSuccess: () => {
      window.location.href = `${routes.home()}?callbackUrl=${encodeURL(window.location.pathname, window.location.search)}`;
    },
  });
};
