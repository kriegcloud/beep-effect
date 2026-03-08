/**
 * Test-only sandbox worker that reports process-level runtime details.
 * Used to verify host spawn isolation settings (cwd/env) in strict mode.
 */

let sandboxMode: "permissive" | "strict" = "permissive"

const send = (message: unknown) => {
  process.send!(message)
}

process.on("message", (message: unknown) => {
  if (typeof message !== "object" || message === null || !("_tag" in message)) return
  const msg = message as Record<string, unknown>

  switch (msg._tag) {
    case "Init": {
      sandboxMode = msg.sandboxMode === "strict" ? "strict" : "permissive"
      break
    }
    case "ExecRequest": {
      const requestId = String(msg.requestId)
      send({
        _tag: "ExecResult",
        requestId,
        output: JSON.stringify({
          sandboxMode,
          cwd: process.cwd(),
          envKeys: Object.keys(process.env).sort()
        })
      })
      break
    }
    case "Shutdown": {
      process.exit(0)
      break
    }
    case "SetVar": {
      send({ _tag: "SetVarAck", requestId: String(msg.requestId) })
      break
    }
    case "GetVarRequest": {
      send({ _tag: "GetVarResult", requestId: String(msg.requestId), value: undefined })
      break
    }
    default:
      break
  }
})

process.on("disconnect", () => {
  process.exit(1)
})
