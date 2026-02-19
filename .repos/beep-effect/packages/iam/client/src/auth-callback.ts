import { paths } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const privateRoutePrefixes = [
  "/dashboard",
  "/settings",
  "/admin",
  "/organizations",
  paths.auth.signIn,
  "/account",
  "/file-manager",
] as const;

const stripFragment = (value: string) =>
  F.pipe(
    Str.split("#")(value),
    A.head,
    O.getOrElse(() => value)
  );

const stripQuery = (value: string) =>
  F.pipe(
    Str.split("?")(value),
    A.head,
    O.getOrElse(() => value)
  );

const normalizePathname = (value: string) => F.pipe(value, stripFragment, stripQuery);

const startsWithPrefix = (pathname: string) =>
  A.some(privateRoutePrefixes, (prefix) => Str.startsWith(prefix)(pathname));

const isAbsolutePath = (value: string) => Str.startsWith("/")(value) && !Str.startsWith("//")(value);
export const paramName = "callbackURL";
export const defaultTarget = "/dashboard";

export type SearchParamsLike = Pick<URLSearchParams, "get">;

export const sanitizePath = (raw: string | null | undefined) => {
  if (!raw) {
    return defaultTarget;
  }

  if (!isAbsolutePath(raw)) {
    return defaultTarget;
  }

  const normalized = normalizePathname(raw);

  if (!startsWithPrefix(normalized)) {
    return defaultTarget;
  }

  return raw;
};

export const getURL = (queryParams: SearchParamsLike) => sanitizePath(queryParams.get(paramName));
