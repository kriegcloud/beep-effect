/**
 * A module containing the Pulumi Service.
 *
 * @module @beep/infra/Pulumi
 * @since 0.0.0
 */
// import { Effect, Layer, Config, pipe, Cause } from "effect";
// import * as S from "effect/Schema";
// import { Str, A, O, P } from "@beep/utils";
import { $InfraId } from "@beep/identity";

const $I = $InfraId.create("Pulumi");

console.log($I);
