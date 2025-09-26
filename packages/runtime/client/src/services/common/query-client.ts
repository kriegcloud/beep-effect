import type { QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export class QueryClient extends Context.Tag("@beep/runtime-client/common/QueryClient")<
  QueryClient,
  TanstackQueryClient
>() {
  public static readonly make = (queryClient: TanstackQueryClient) => Layer.succeed(this, this.of(queryClient));
}
