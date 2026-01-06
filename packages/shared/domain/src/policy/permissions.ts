import { BS } from "@beep/schema";
import { EntityKind } from "@beep/shared-domain";
import { createAccessControl } from "better-auth/plugins/access";
import { pipe } from "effect";
import * as A from "effect/Array";

export class CommonPermissions extends BS.LiteralKit("read", "manage", "delete") {}
export declare namespace CommonPermissions {
  export type Type = typeof CommonPermissions.Type;
  export type Encoded = typeof CommonPermissions.Encoded;
}

export const makeAccessControl = () =>
  pipe(
    EntityKind.Options,
    A.reduce(
      {} as {
        readonly [EntityKind.Type]: typeof CommonPermissions.Options;
      },
      (acc, option) => ({
        ...acc,
        [option]: CommonPermissions.Options,
      })
    )
  );

export const ac = createAccessControl(makeAccessControl());
