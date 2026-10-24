/**
 * The host's `node:path`, the `SyncPath` a Node consumer hands the sync entry
 * points, with its `posix` and `win32` flavors.
 *
 * It is reached the way `@beep/utils/Path` reaches it, through
 * `process.getBuiltinModule`, so the suites drive node's own path
 * implementations — the thing under test is that the consumer's
 * implementation is respected end to end — without importing a builtin.
 *
 * @packageDocumentation
 */

/** The host's `node:path`; a runtime without it fails the suite at load. */
export const hostPath: typeof import("node:path") = (() => {
  const path = globalThis.process?.getBuiltinModule?.("node:path");
  if (path === undefined) throw new Error("node:path is unavailable on this runtime");
  return path;
})();
