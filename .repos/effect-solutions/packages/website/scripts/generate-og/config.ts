import path from "node:path"

// =============================================================================
// Constants
// =============================================================================

export const VIEWPORT = { width: 1200, height: 630 }
export const DEVICE_SCALE = 2
export const OUTPUT_DIR = path.join(process.cwd(), "public", "og")
export const NEXT_CACHE_DIR = path.join(process.cwd(), ".next-og")
export const TEMPLATE_ROUTE = "/og/template"

// =============================================================================
// Environment Overrides (the only things that actually vary)
// =============================================================================

export const getOnlyFilter = (): readonly string[] =>
  (process.env.OG_ONLY ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

export const getBaseUrl = (): string | null => process.env.OG_BASE_URL?.trim().replace(/\/$/, "") ?? null
