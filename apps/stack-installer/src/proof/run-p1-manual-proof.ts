#!/usr/bin/env bun

/**
 * Bun entrypoint for the app-local P1 Manual Mode proof harness.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { AiProviderCli } from "@beep/ai-provider-cli";
import { Discord } from "@beep/discord";
import { P1ManualProofRequest, P1ManualProofResult } from "@beep/installer-workspace-use-cases";
import { OnePasswordCli } from "@beep/onepassword-cli";
import { BunChildProcessSpawner, BunHttpClient, BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { P1ManualProofSliceLayer, previewP1ManualProof, runP1ManualProof } from "./P1ManualProof.js";

const decodeRequestJson = S.decodeUnknownEffect(S.fromJsonString(P1ManualProofRequest));
const encodeProofResult = S.encodeUnknownEffect(S.fromJsonString(P1ManualProofResult));

const BaseLayer = Layer.mergeAll(BunServices.layer, BunHttpClient.layer);
const DriverLayer = Layer.mergeAll(OnePasswordCli.makeLayer(), AiProviderCli.makeLayer(), Discord.layer).pipe(
  Layer.provideMerge(BunChildProcessSpawner.layer),
  Layer.provideMerge(BaseLayer)
);
const RuntimeLayer = P1ManualProofSliceLayer.pipe(Layer.provideMerge(DriverLayer));

const argAfter = (name: string): O.Option<string> =>
  pipe(
    Bun.argv,
    A.findFirstIndex((value) => value === name),
    O.flatMap((index) => A.get(Bun.argv, index + 1))
  );

const hasArg = (name: string): boolean =>
  pipe(
    Bun.argv,
    A.findFirstIndex((value) => value === name),
    O.isSome
  );

const program = Effect.gen(function* () {
  const requestJson = yield* O.match(argAfter("--request-json"), {
    onNone: () => Effect.die("Missing --request-json"),
    onSome: Effect.succeed,
  });
  const request = yield* decodeRequestJson(requestJson);
  const result = hasArg("--app-local") ? yield* previewP1ManualProof(request) : yield* runP1ManualProof(request);
  const encoded = yield* encodeProofResult(result);
  yield* Effect.sync(() => {
    console.log(encoded);
  });
  // @effect-diagnostics-next-line strictEffectProvide:off
}).pipe(Effect.provide(RuntimeLayer));

BunRuntime.runMain(program);
