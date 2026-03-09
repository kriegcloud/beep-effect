import path from "node:path"

type ManagedProcess = {
  name: string
  process: Bun.Subprocess
}

const projectRoot = path.resolve(import.meta.dir, "..")

function startProcess(command: string[], name: string): ManagedProcess {
  const child = Bun.spawn(command, {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  })

  return { name, process: child }
}

const nextArgs = ["bun", "x", "next", "dev"]

// Pass through port if specified via -p/--port or PORT env
const portArgIndex = process.argv.findIndex((arg) => arg === "-p" || arg === "--port")
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  nextArgs.push("-p", process.argv[portArgIndex + 1])
} else if (process.env.PORT) {
  nextArgs.push("-p", process.env.PORT)
}

const processes: ManagedProcess[] = [
  startProcess(nextArgs, "next"),
  startProcess(["bun", "./scripts/content-watcher.ts"], "watcher"),
]

let shuttingDown = false

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }
  shuttingDown = true

  for (const { process } of processes) {
    if (process.exitCode === null) {
      process.kill("SIGTERM")
    }
  }

  await Promise.allSettled(processes.map(({ process }) => process.exited))
  process.exit(exitCode)
}

const signals = ["SIGINT", "SIGTERM"] as const
for (const signal of signals) {
  process.on(signal, () => {
    void shutdown(0)
  })
}

const firstExit = await Promise.race(
  processes.map(async ({ name, process }) => ({
    name,
    code: await process.exited,
  })),
)

if (firstExit.code !== 0) {
  console.error(`[dev-server] ${firstExit.name} exited unexpectedly with code ${firstExit.code}`)
}

await shutdown(firstExit.code ?? 0)
