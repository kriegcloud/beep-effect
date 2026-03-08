declare module "@opentui/core" {
  export class KeyEvent {
    name: string
    ctrl: boolean
    meta: boolean
    shift: boolean
    option: boolean
    sequence: string
    eventType: "press" | "repeat" | "release"
    repeated?: boolean
    preventDefault(): void
    stopPropagation(): void
  }

  export interface CliRendererConfig {
    readonly stdin?: NodeJS.ReadStream
    readonly stdout?: NodeJS.WriteStream
    readonly useMouse?: boolean
    readonly useAlternateScreen?: boolean
  }

  export class CliRenderer {
    readonly width: number
    readonly height: number
    start(): void
    stop(): void
    destroy(): void
  }

  export function createCliRenderer(config?: CliRendererConfig): Promise<CliRenderer>

  export interface StyleDefinition {
    readonly fg?: unknown
    readonly bg?: unknown
    readonly bold?: boolean
    readonly italic?: boolean
    readonly underline?: boolean
    readonly dim?: boolean
  }

  export class SyntaxStyle {
    static create(): SyntaxStyle
    static fromTheme(theme: ReadonlyArray<{ scope: string[]; style: Record<string, unknown> }>): SyntaxStyle
    static fromStyles(styles: Record<string, StyleDefinition>): SyntaxStyle
    registerStyle(name: string, style: StyleDefinition): number
    destroy(): void
  }
}
