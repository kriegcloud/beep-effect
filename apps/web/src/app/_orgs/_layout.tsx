// import {Registry, Hydration} from "@effect-atom/atom-react";

import { AuthService } from "@beep/iam-infra";
import { OrganizationListContract } from "@beep/iam-sdk";
import { IamError } from "@beep/iam-sdk/errors";
import { runServerPromise } from "@beep/runtime-server";
import { Effect } from "effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { headers } from "next/headers";

export const ssrGetUserOrganizations = async () =>
  runServerPromise(
    Effect.gen(function* () {
      const { auth } = yield* AuthService;

      return yield* F.pipe(
        Effect.tryPromise({
          try: async () =>
            auth.api.listOrganizations({
              headers: await headers(),
            }),
          catch: (e) => IamError.match(e),
        }),
        Effect.flatMap((r) => {
          return S.decode(OrganizationListContract.successSchema)(r.data);
        })
      );
    })
  );

// const _layout = async () => {
//
//   const serverSideUserOrganizations = await ssrGetUserOrganizations()
//
//   const registry = Registry.make({
//     defaultIdleTTL: Number.POSITIVE_INFINITY,
//   });
//
//   const dehydratedState: Array<Hydration.DehydratedAtom> = [
//     {
//       key: "userOrganizations",
//       value: serverSideUserOrganizations,
//       dehydratedAt: Date.now(),
//     }
//   ];
//
//   Hydration.hydrate(registry, dehydratedState);
//
//   return (
//
//
//
//   )
// };
