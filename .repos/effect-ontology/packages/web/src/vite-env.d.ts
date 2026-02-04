/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY?: string
  readonly VITE_WS_MODE?: "dev" | "prod"
  readonly VITE_LOG_LEVEL?: "trace" | "debug" | "info" | "warning" | "error" | "fatal" | "none"
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
