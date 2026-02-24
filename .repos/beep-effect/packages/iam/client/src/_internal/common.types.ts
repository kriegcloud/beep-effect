import type { UnsafeTypes } from "@beep/types";
import type { BetterFetchOption } from "@better-fetch/fetch";

export type ClientFetchOption<
  Body = UnsafeTypes.UnsafeAny,
  Query extends Record<string, UnsafeTypes.UnsafeAny> = UnsafeTypes.UnsafeAny,
  Params extends Record<string, UnsafeTypes.UnsafeAny> | Array<string> | undefined = UnsafeTypes.UnsafeAny,
  Res = UnsafeTypes.UnsafeAny,
> = BetterFetchOption<Body, Query, Params, Res> & {
  /**
   * Certain endpoints, upon successful response, will trigger atom signals and thus rerendering all hooks related to that atom.
   *
   * This option is useful when you want to skip hook rerenders.
   */
  readonly disableSignal?: boolean | undefined;
};
