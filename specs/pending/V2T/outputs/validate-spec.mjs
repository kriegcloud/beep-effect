import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"

const outputsDir = dirname(fileURLToPath(import.meta.url))
const specDir = dirname(outputsDir)
const repoRoot = normalize(join(specDir, "../../.."))

const manifestPath = join(outputsDir, "manifest.json")
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
const manifestRelativeBaseDir = specDir
const appPackage = JSON.parse(
  readFileSync(join(repoRoot, "apps/V2T/package.json"), "utf8")
)
const sidecarPackage = JSON.parse(
  readFileSync(join(repoRoot, "packages/VT2/package.json"), "utf8")
)

const isRelativeLocalLink = (target) =>
  target.length > 0 &&
  !target.startsWith("#") &&
  !target.startsWith("http://") &&
  !target.startsWith("https://") &&
  !target.startsWith("mailto:") &&
  !target.startsWith("javascript:")

const toPathOnly = (target) => target.split("#", 1)[0]

const failures = []
const manifestRootFiles = new Set([
  "README.md",
  "QUICK_START.md",
  "AGENT_PROMPTS.md",
  "REFLECTION_LOG.md",
  "RESEARCH.md",
  "DESIGN_RESEARCH.md",
  "PLANNING.md",
  "EXECUTION.md",
  "VERIFICATION.md"
])
const manifestFileExtensions = new Set([
  ".md",
  ".json",
  ".mjs",
  ".html",
  ".png",
  ".toml"
])
const forbiddenWorkspaceTokens = new Map([
  ["@beep/V2T", `use ${appPackage.name}`]
])

const checkRelativePath = (baseDir, relativePath, sourceLabel) => {
  const resolved = normalize(join(baseDir, relativePath))
  if (!existsSync(resolved)) {
    failures.push(`${sourceLabel}: missing ${relativePath}`)
  }
}

const looksLikeManifestFilePath = (value) =>
  !value.includes(" ") &&
  (
    value.startsWith("handoffs/") ||
    value.startsWith("outputs/") ||
    value.startsWith("prompts/") ||
    value.startsWith("../") ||
    manifestRootFiles.has(value) ||
    manifestFileExtensions.has(extname(value))
  )

const collectManifestPaths = (value, collected = new Set()) => {
  if (typeof value === "string") {
    if (looksLikeManifestFilePath(value)) {
      collected.add(value)
    }
    return collected
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectManifestPaths(entry, collected)
    }
    return collected
  }

  if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectManifestPaths(nested, collected)
    }
  }

  return collected
}

for (const manifestRef of collectManifestPaths(manifest)) {
  checkRelativePath(manifestRelativeBaseDir, manifestRef, "manifest.json")
}

if (
  !Array.isArray(manifest.phase_order) ||
  !manifest.phase_order.includes(manifest.active_phase)
) {
  failures.push("manifest.json: active_phase must exist in phase_order")
}

if (
  manifest.phases == null ||
  typeof manifest.phases !== "object" ||
  !(manifest.active_phase in manifest.phases)
) {
  failures.push("manifest.json: active_phase must exist in phases")
}

const manifestText = JSON.stringify(manifest)
for (const [token, guidance] of forbiddenWorkspaceTokens) {
  if (manifestText.includes(token)) {
    failures.push(`manifest.json: forbidden token ${token}; ${guidance}`)
  }
}

for (const requiredToken of [appPackage.name, sidecarPackage.name]) {
  if (!manifestText.includes(requiredToken)) {
    failures.push(`manifest.json: missing workspace token ${requiredToken}`)
  }
}

for (const command of manifest.conformance?.implementation_floor ?? []) {
  if (
    typeof command !== "string" ||
    !command.includes(appPackage.name) ||
    !command.includes(sidecarPackage.name)
  ) {
    failures.push(
      `manifest.json: implementation_floor command must reference ${appPackage.name} and ${sidecarPackage.name} -> ${String(command)}`
    )
  }
}

const markdownFiles = []
const walk = (currentDir) => {
  for (const entry of readdirSync(currentDir)) {
    const fullPath = join(currentDir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (extname(fullPath) === ".md") {
      markdownFiles.push(fullPath)
    }
  }
}

walk(specDir)

const markdownLinkPattern = /\[[^\]]*?\]\(([^)]+)\)/g

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, "utf8")
  for (const [token, guidance] of forbiddenWorkspaceTokens) {
    if (content.includes(token)) {
      failures.push(`${markdownFile}: forbidden token ${token}; ${guidance}`)
    }
  }
  for (const match of content.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "")
    if (!isRelativeLocalLink(rawTarget)) {
      continue
    }
    const pathOnly = toPathOnly(rawTarget)
    if (pathOnly.length === 0) {
      continue
    }
    checkRelativePath(dirname(markdownFile), pathOnly, markdownFile)
  }
}

if (failures.length > 0) {
  console.error("V2T spec validation failed:")
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log("V2T spec validation passed")
