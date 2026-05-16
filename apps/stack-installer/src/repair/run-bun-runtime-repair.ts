#!/usr/bin/env bun

/**
 * Bun entrypoint for the focused Bun repair workflow.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  inspectBunRuntimeJson,
  provideBunRuntimeRepairLayer,
  repairBunRuntimeJson,
  runBunRuntimeRepairMain,
} from "./BunRuntimeRepair.js";

const argAfter = (name: string): O.Option<string> =>
  pipe(
    Bun.argv,
    A.findFirstIndex((value) => value === name),
    O.flatMap((index) => A.get(Bun.argv, index + 1))
  );

const mode = O.getOrElse(argAfter("--mode"), () => "inspect");
const appDir = process.cwd();
const repoRoot = new URL("../..", `file://${appDir.endsWith("/") ? appDir : `${appDir}/`}`).pathname;

const program =
  mode === "repair"
    ? provideBunRuntimeRepairLayer(repoRoot, repairBunRuntimeJson())
    : provideBunRuntimeRepairLayer(repoRoot, inspectBunRuntimeJson());

runBunRuntimeRepairMain(program.pipe(Effect.mapError(renderRepairError)));

function renderRepairError(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
    return error.reason;
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Bun runtime workflow failed.";
}
