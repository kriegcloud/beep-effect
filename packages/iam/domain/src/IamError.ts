import { BeepError } from "@beep/errors/shared";
import * as S from "effect/Schema";
export class IamError extends S.TaggedError<IamError>()("IamError", { message: S.String }) {}

export class IamUnknownError extends BeepError.UnknownError {}
