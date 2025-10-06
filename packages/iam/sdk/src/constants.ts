import { paths } from "@beep/shared-domain";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import type { ReadonlyURLSearchParams } from "next/navigation";

export namespace AuthCallback {
  const paramName = "callbackURL" as const;
  const allowed = HashSet.make(paths.dashboard.root, paths.auth.device.root);

  export const getURL = (queryParams: ReadonlyURLSearchParams) =>
    F.pipe(
      queryParams.get(paramName),
      O.fromNullable,
      O.match({
        onNone: () => paths.dashboard.root,
        onSome: (callbackUrl) => (HashSet.has(callbackUrl)(allowed) ? callbackUrl : paths.dashboard.root),
      })
    );
}
