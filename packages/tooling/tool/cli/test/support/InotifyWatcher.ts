/**
 * A real inotify watcher for fence tests: a Bun process whose `fs.watch`
 * holds one inotify descriptor with a watch on the given directory and no
 * other handle on it, which is how an editor's file watcher (WebStorm's
 * `fsnotifier`) holds a checkout once it has finished walking it. Given
 * `holdOpen`, it also keeps that file open for reading, which is an editor
 * that both watches the tree and has a file in it open.
 *
 * The spawner picks the watcher's working directory, so a test keeps it
 * outside the tree it watches. The effect returns once the watch (and the
 * open file) is in place, and the handle belongs to the caller's scope.
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as ChildProcess from "effect/process/ChildProcess";
import * as Stream from "effect/Stream";

const WATCHED_DIRECTORY_ENV = "BEEP_TEST_WATCHED_DIRECTORY";
const HELD_FILE_ENV = "BEEP_TEST_HELD_FILE";

const WATCHER_SCRIPT = A.join(
  [
    `const fs = require("node:fs");`,
    `fs.watch(process.env.${WATCHED_DIRECTORY_ENV}, () => {});`,
    `const held = process.env.${HELD_FILE_ENV};`,
    `if (held !== undefined && held !== "") fs.openSync(held, "r");`,
    `console.log("watching");`,
    `setInterval(() => {}, 60000);`,
  ],
  " "
);

export const spawnInotifyWatcher = Effect.fn("InotifyWatcher.spawn")(function* (
  directory: string,
  cwd: string,
  holdOpen = ""
) {
  const handle = yield* ChildProcess.make("bun", ["-e", WATCHER_SCRIPT], {
    cwd,
    env: { [WATCHED_DIRECTORY_ENV]: directory, [HELD_FILE_ENV]: holdOpen },
    extendEnv: true,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "ignore",
  });
  // The ready line is printed after `fs.watch` and `openSync` return, so both holds exist.
  yield* handle.stdout.pipe(Stream.decodeText(), Stream.take(1), Stream.runDrain);
  return handle;
});
