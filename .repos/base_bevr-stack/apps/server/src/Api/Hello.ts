import { Api, type ApiResponse } from "@repo/domain/Api";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

export const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  }),
);
