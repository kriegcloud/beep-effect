import { paths } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const privateRoutePrefixes = [
  paths.dashboard.root,
  paths.settings.root,
  paths.admin.root,
  paths.organizations.root,
  paths.auth.device.root,
  "/account",
  paths.fileManager.root,
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

export namespace AuthCallback {
  export const paramName = "callbackURL" as const;
  export const defaultTarget = paths.dashboard.root;

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
}
