import { BS } from "@beep/schema";
import { AnyTableName } from "@beep/shared-domain";
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
    AnyTableName.Options,
    A.reduce(
      {} as {
        readonly [AnyTableName.Type]: typeof CommonPermissions.Options;
      },
      (acc, option) => ({
        ...acc,
        [option]: CommonPermissions.Options,
      })
    )
  );

export const ac = createAccessControl(makeAccessControl());
