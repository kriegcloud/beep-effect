declare module "@opentui/react" {
  import type { CliRenderer, KeyEvent } from "@opentui/core"
  import type { ReactNode } from "react"

  export interface Root {
    render(node: ReactNode): void
    unmount(): void
  }

  export function createRoot(renderer: CliRenderer): Root

  export interface UseKeyboardOptions {
    readonly release?: boolean
    readonly active?: boolean
  }

  export const useKeyboard: (handler: (key: KeyEvent) => void, options?: UseKeyboardOptions) => void

  export const useTerminalDimensions: () => { width: number; height: number }
}
