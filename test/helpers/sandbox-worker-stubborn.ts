/**
 * Worker used in tests to force shutdown escalation.
 * It ignores both Shutdown IPC and SIGTERM.
 */

process.on("SIGTERM", () => {
  // Intentionally ignored.
})

process.on("message", (_message: unknown) => {
  // Ignore all IPC messages so graceful shutdown never completes.
})

setInterval(() => {
  // Keep process alive.
}, 1_000)
