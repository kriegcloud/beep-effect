declare const __RLM_COMPILED__: string | undefined

const isCompiled = typeof __RLM_COMPILED__ !== "undefined"

export const resolveWorkerPath = (): string => {
  if (isCompiled) {
    const execPath = process.execPath
    return execPath.slice(0, execPath.lastIndexOf("/") + 1) + "sandbox-worker.js"
  }
  return new URL("./sandbox-worker.ts", import.meta.url).pathname
}

export { isCompiled }
