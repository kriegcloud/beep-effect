import { A, O, Struct, P } from "@beep/utils";
import { $ScratchId } from "@beep/identity";
import { Layer, Context, Effect, FileSystem, Path, flow, pipe, identity } from "effect";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { BunServices, BunRuntime } from "@effect/platform-bun";
import { Model } from "effect/unstable/schema";
import { Table } from "@beep/shared-tables";


const $I = $ScratchId.create("index");

export class DomainError extends TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    cause: S.DefectWithStack,
    message: S.String,
  }
)
