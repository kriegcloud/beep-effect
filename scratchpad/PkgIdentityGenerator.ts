import * as S from "effect/Schema";
import {$ScratchId} from "@beep/identity";
import { FileSystem, Path, Effect, Layer, Context } from "effect";
import { BunServices, BunRuntime } from "@effect/platform-bun";

const $I = $ScratchId.create("PkgIdentityGenerator");


