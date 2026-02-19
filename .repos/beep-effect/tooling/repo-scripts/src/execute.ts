#!/usr/bin/env node
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";

const program = Console.log("beep");

BunRuntime.runMain(program);
