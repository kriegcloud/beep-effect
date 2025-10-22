import { BS } from "@beep/schema";
import type { StringTypes } from "@beep/types";
import type * as A from "effect/Array";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
export const PermissionActionKit = BS.stringLiteralKit("read", "manage", "delete");

export class PermissionAction extends PermissionActionKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared-domain/_internal/policy/PermissionAction"),
  identifier: "PermissionAction",
  title: "Permission Action",
  description: "A value for a permission action",
}) {
  static readonly Options = PermissionActionKit.Options;
  static readonly Enum = PermissionActionKit.Enum;
}

export declare namespace PermissionAction {
  export type Type = S.Schema.Type<typeof PermissionAction>;
  export type Encoded = S.Schema.Encoded<typeof PermissionAction>;
}

export class PolicyBuilder<
  const Domain extends StringTypes.NonEmptyString,
  const PermissionAction extends StringTypes.NonEmptyString,
> extends Data.TaggedClass("PolicyBuilder")<{
  readonly permissionActions: A.NonEmptyReadonlyArray<PermissionAction>;
  readonly domains: A.NonEmptyReadonlyArray<Domain>;
}> {
  readonly PolicySchema: S.Record$<
    S.Literal<[Domain, ...Domain[]]>,
    S.mutable<S.Array$<S.Literal<[PermissionAction, ...PermissionAction[]]>>>
  >;

  constructor(params: {
    readonly permissionActions: A.NonEmptyReadonlyArray<PermissionAction>;
    readonly domains: A.NonEmptyReadonlyArray<Domain>;
  }) {
    super(params);
    this.PolicySchema = S.Record({
      key: S.Literal(...params.domains),
      value: S.mutable(S.Array(S.Literal(...params.permissionActions))),
    });
  }
}
