import { BS } from "@beep/schema";
import { StrUtils } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";

const VisibilityKit = BS.stringLiteralKit("only_me", "followers_only", "everyone");

export class Visibility extends VisibilityKit.Schema {
  static readonly Options = F.pipe(
    VisibilityKit.Options,
    A.map(
      (o) =>
        ({
          value: o,
          label: StrUtils.formatLabel(o),
        }) as const
    )
  );
  static readonly Enum = VisibilityKit.Enum;
}
