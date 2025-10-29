import { BS } from "@beep/schema";
import { makeErrorCode } from "@beep/shared-domain/factories";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export const makeErrorProps = F.flow(
  makeErrorCode,
  (code) => (message: string) =>
    [
      code,
      {
        cause: S.Defect,
        message: BS.toOptionalWithDefault(S.String)(message),
      },
    ] as const
);
