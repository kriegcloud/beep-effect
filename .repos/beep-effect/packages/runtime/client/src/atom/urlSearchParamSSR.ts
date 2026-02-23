import type { UnsafeTypes } from "@beep/types";
import { Atom } from "@effect-atom/atom-react";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const searchParamState = {
  timeout: undefined as number | undefined,
  updates: new Map<string, string>(),
  updating: false,
};

function updateSearchParams() {
  searchParamState.timeout = undefined;
  searchParamState.updating = true;
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParamState.updates.entries()) {
    if (value.length > 0) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }
  searchParamState.updates.clear();
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, "", newUrl);
  searchParamState.updating = false;
}

export const urlSearchParamSSR = <A = never, I extends string = never>(
  name: string,
  options?:
    | {
        readonly schema?: S.Schema<A, I> | undefined;
      }
    | undefined
): Atom.Writable<[A] extends [never] ? string : O.Option<A>> => {
  const decode = options?.schema && S.decodeEither(options.schema);
  const encode = options?.schema && S.encodeEither(options.schema);

  return Atom.writable(
    (get) => {
      if (typeof window === "undefined") {
        get.setSelf(O.none());
        return;
      }
      const handleUpdate = () => {
        if (searchParamState.updating) return;
        const searchParams = new URLSearchParams(window.location.search);
        const newValue = searchParams.get(name) || "";
        if (decode) {
          get.setSelf(Either.getRight(decode(newValue as I)));
        } else if (newValue !== O.getOrUndefined(get.self())) {
          get.setSelf(newValue);
        }
      };
      window.addEventListener("popstate", handleUpdate);
      window.addEventListener("pushstate", handleUpdate);
      get.addFinalizer(() => {
        window.removeEventListener("popstate", handleUpdate);
        window.removeEventListener("pushstate", handleUpdate);
      });
      const value = new URLSearchParams(window.location.search).get(name) || "";
      return decode ? Either.getRight(decode(value as I)) : (value as UnsafeTypes.UnsafeAny);
    },
    (ctx, value: UnsafeTypes.UnsafeAny) => {
      if (encode) {
        const encoded = O.flatMap(value, (v) => Either.getRight(encode(v as A)));
        searchParamState.updates.set(
          name,
          O.getOrElse(encoded, () => "")
        );
        value = O.andThen(encoded, value);
      } else {
        searchParamState.updates.set(name, value);
      }
      ctx.setSelf(value);
      if (searchParamState.timeout) {
        clearTimeout(searchParamState.timeout);
      }
      searchParamState.timeout = setTimeout(updateSearchParams, 500) as unknown as number | undefined;
    }
  );
};
