declare module "@cloudflare/sandbox" {
  export type SandboxHandle = {
    exec(command: string, options?: {
      stream?: boolean
      timeout?: number
      env?: Record<string, string | undefined>
      cwd?: string
      onOutput?: (stream: "stdout" | "stderr", data: string) => void
      signal?: AbortSignal
    }): Promise<{
      success: boolean
      stdout: string
      stderr: string
      exitCode: number
      command: string
      duration: number
      timestamp: string
    }>
    execStream(command: string, options?: {
      timeout?: number
      env?: Record<string, string | undefined>
      cwd?: string
      bufferSize?: number
      signal?: AbortSignal
    }): Promise<ReadableStream>
    writeFile(path: string, content: string, options?: {
      encoding?: string
    }): Promise<{ success: boolean; path: string; timestamp: string }>
    readFile(path: string, options?: {
      encoding?: string
    }): Promise<{ content: string; encoding: string; success: boolean; path: string }>
    setEnvVars(envVars: Record<string, string | undefined>): Promise<void>
    destroy(): Promise<void>
  }

  export function getSandbox(
    binding: unknown,
    id: string,
    options?: { sleepAfter?: string | number; keepAlive?: boolean }
  ): SandboxHandle

  export function parseSSEStream<T>(stream: ReadableStream): AsyncIterable<T>
}
