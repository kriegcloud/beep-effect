// Ripped from https://usehooks-ts.com/react-hook/use-fetch

import type { FetchEsque } from "@uploadthing/shared";
import { safeParseJSON } from "@uploadthing/shared";
import { pipe } from "effect";
import { constant } from "effect/Function";
import * as Match from "effect/Match";
import { useEffect, useReducer, useRef } from "react";

interface State<T> {
  readonly data?: T | undefined;
  readonly error?: Error | undefined;
}

type Cache<T> = Record<string, T>;

// discriminated union type
type Action<T> =
  | { readonly type: "loading" }
  | { readonly type: "fetched"; readonly payload: T }
  | { readonly type: "error"; readonly payload: Error };

function useFetch<T = unknown>(fetch: FetchEsque, url?: string, options?: RequestInit): State<T> {
  const cache = useRef<Cache<T>>({});

  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef<boolean>(false);

  const initialState: State<T> = {
    error: undefined,
    data: undefined,
  };
  // Keep state logic separated
  const fetchReducer = (state: State<T>, action: Action<T>): State<T> =>
    pipe(
      action,
      Match.type<Action<T>>().pipe(
        Match.discriminators("type")({
          loading: () => ({ ...initialState }),
          fetched: (action) => ({ ...initialState, data: action.payload }),
          error: (action) => ({ ...initialState, error: action.payload }),
        }),
        Match.orElse(constant(state))
      )
    );

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    // Do nothing if the url is not given
    if (!url) return;

    cancelRequest.current = false;

    const fetchData = async () => {
      dispatch({ type: "loading" });

      // If a cache exists for this url, return it
      if (cache.current[url]) {
        dispatch({ type: "fetched", payload: cache.current[url] });
        return;
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const dataOrError = await safeParseJSON<T>(response);
        if (dataOrError instanceof Error) {
          throw dataOrError;
        }

        cache.current[url] = dataOrError;
        if (cancelRequest.current) return;

        dispatch({ type: "fetched", payload: dataOrError });
      } catch (error) {
        if (cancelRequest.current) return;

        dispatch({ type: "error", payload: error as Error });
      }
    };

    void fetchData();

    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true;
    };
  }, [url]);

  return state;
}

export default useFetch;
