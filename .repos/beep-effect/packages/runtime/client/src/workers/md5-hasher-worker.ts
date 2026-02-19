/**
 * MD5 Hasher Worker Entry Point
 *
 * This worker handles MD5 hash computation using the Effect Platform
 * WorkerRunner for typed, serialized communication.
 *
 * @module
 */

import { launchWorker } from "@beep/utils/md5";
import * as BrowserRuntime from "@effect/platform-browser/BrowserRuntime";
import * as Effect from "effect/Effect";

BrowserRuntime.runMain(Effect.scoped(launchWorker));
