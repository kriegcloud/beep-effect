import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, extname, join, normalize, relative } from "node:path"
import { fileURLToPath } from "node:url"

const outputsDir = dirname(fileURLToPath(import.meta.url))
const specDir = dirname(outputsDir)

const manifestPath = join(outputsDir, "manifest.json")
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))

const expectedPhaseOrder = ["p0", "p1", "p2", "p3", "p4"]
const expectedImplementationFloor = [
  "bunx turbo run check --filter=@beep/v2t --filter=@beep/VT2",
  "bunx turbo run test --filter=@beep/v2t --filter=@beep/VT2",
  "bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2",
  "bun run --cwd apps/V2T lint"
]
const expectedRepoLawGate = [
  "bun run lint:effect-laws",
  "bun run lint:jsdoc",
  "bun run check:effect-laws-allowlist",
  "bun run lint:schema-first"
]
const expectedReadinessGate = [
  "bun run check",
  "bun run lint",
  "bun run test",
  "bun run docgen"
]
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

const failures = []

const pushFailure = (message) => {
  failures.push(message)
}

const toPosixPath = (path) => path.split("\\").join("/")

const sortStrings = (values) => [...values].sort()

const expectValue = (label, actual, expected) => {
  if (actual !== expected) {
    pushFailure(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const expectString = (label, value) => {
  if (typeof value !== "string" || value.length === 0) {
    pushFailure(`${label}: expected non-empty string`)
  }
}

const expectStringArray = (label, value) => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    pushFailure(`${label}: expected array of non-empty strings`)
  }
}

const expectSortedStringArray = (label, actual, expected) => {
  const sortedActual = sortStrings(actual)
  const sortedExpected = sortStrings(expected)
  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    pushFailure(
      `${label}: expected ${JSON.stringify(sortedExpected)}, got ${JSON.stringify(sortedActual)}`
    )
  }
}

const checkRelativePath = (baseDir, relativePath, sourceLabel) => {
  const resolved = normalize(join(baseDir, relativePath))
  if (!existsSync(resolved)) {
    pushFailure(`${sourceLabel}: missing ${relativePath}`)
  }
}

const isRelativeLocalLink = (target) =>
  target.length > 0 &&
  !target.startsWith("#") &&
  !target.startsWith("http://") &&
  !target.startsWith("https://") &&
  !target.startsWith("mailto:") &&
  !target.startsWith("javascript:")

const toPathOnly = (target) => target.split("#", 1)[0]

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

const getFilesRelativeToSpec = (startDir) => {
  const files = []

  const walk = (currentDir) => {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry)
      const stats = statSync(fullPath)
      if (stats.isDirectory()) {
        walk(fullPath)
        continue
      }
      files.push(toPosixPath(relative(specDir, fullPath)))
    }
  }

  walk(startDir)
  return files
}

const getRootMarkdownFiles = () =>
  readdirSync(specDir)
    .filter((entry) => extname(entry) === ".md" && statSync(join(specDir, entry)).isFile())
    .map(toPosixPath)

const markdownFiles = []
const walkMarkdownFiles = (currentDir) => {
  for (const entry of readdirSync(currentDir)) {
    const fullPath = join(currentDir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      walkMarkdownFiles(fullPath)
      continue
    }
    if (extname(fullPath) === ".md") {
      markdownFiles.push(fullPath)
    }
  }
}

const checkManifestStructure = () => {
  expectString("manifest.slug", manifest.slug)
  expectString("manifest.title", manifest.title)
  expectString("manifest.status", manifest.status)
  expectString("manifest.active_phase", manifest.active_phase)
  expectString("manifest.phase_session_role", manifest.phase_session_role)
  expectStringArray("manifest.status_model.phase", manifest.status_model?.phase)
  expectStringArray("manifest.phase_order", manifest.phase_order)
  expectSortedStringArray("manifest.phase_order", manifest.phase_order ?? [], expectedPhaseOrder)

  if (!(manifest.status_model?.phase ?? []).includes(manifest.status)) {
    pushFailure(`manifest.status: unknown status ${JSON.stringify(manifest.status)}`)
  }

  if (!(manifest.phase_order ?? []).includes(manifest.active_phase)) {
    pushFailure(`manifest.active_phase: unknown phase ${JSON.stringify(manifest.active_phase)}`)
  }

  const phaseKeys = Object.keys(manifest.phases ?? {})
  expectSortedStringArray("manifest.phases keys", phaseKeys, manifest.phase_order ?? [])

  for (const phaseKey of manifest.phase_order ?? []) {
    const phase = manifest.phases?.[phaseKey]
    if (!phase || typeof phase !== "object") {
      pushFailure(`manifest.phases.${phaseKey}: missing phase definition`)
      continue
    }

    expectString(`manifest.phases.${phaseKey}.name`, phase.name)
    expectString(`manifest.phases.${phaseKey}.status`, phase.status)
    expectValue(
      `manifest.phases.${phaseKey}.session_role`,
      phase.session_role,
      manifest.phase_session_role
    )
    expectString(`manifest.phases.${phaseKey}.handoff`, phase.handoff)
    expectString(`manifest.phases.${phaseKey}.orchestrator`, phase.orchestrator)
    expectString(`manifest.phases.${phaseKey}.output`, phase.output)

    if (!(manifest.status_model?.phase ?? []).includes(phase.status)) {
      pushFailure(`manifest.phases.${phaseKey}.status: unknown status ${JSON.stringify(phase.status)}`)
    }

    expectValue(`manifest.outputs.${phaseKey}`, manifest.outputs?.[phaseKey], phase.output)
  }

  const activePhase = manifest.phases?.[manifest.active_phase]
  if (activePhase) {
    expectValue(
      "manifest.active_phase_assets.handoff",
      manifest.active_phase_assets?.handoff,
      activePhase.handoff
    )
    expectValue(
      "manifest.active_phase_assets.orchestrator",
      manifest.active_phase_assets?.orchestrator,
      activePhase.orchestrator
    )
    expectValue(
      "manifest.active_phase_assets.output",
      manifest.active_phase_assets?.output,
      activePhase.output
    )
    expectSortedStringArray(
      "manifest.active_phase_assets.trackers",
      manifest.active_phase_assets?.trackers ?? [],
      activePhase.trackers ?? []
    )
  }

  expectValue(
    "manifest.phase_transition_rules.active_phase_is_authoritative",
    manifest.phase_transition_rules?.active_phase_is_authoritative,
    true
  )
  expectValue(
    "manifest.phase_transition_rules.active_phase_assets_are_authoritative",
    manifest.phase_transition_rules?.active_phase_assets_are_authoritative,
    true
  )
  expectValue(
    "manifest.phase_transition_rules.do_not_infer_active_phase_from_markdown_status_headings",
    manifest.phase_transition_rules?.do_not_infer_active_phase_from_markdown_status_headings,
    true
  )
  expectValue(
    "manifest.conformance.workspace_packages.app",
    manifest.conformance?.workspace_packages?.app,
    "@beep/v2t"
  )
  expectValue(
    "manifest.conformance.workspace_packages.sidecar",
    manifest.conformance?.workspace_packages?.sidecar,
    "@beep/VT2"
  )
  expectSortedStringArray(
    "manifest.conformance.implementation_floor",
    manifest.conformance?.implementation_floor ?? [],
    expectedImplementationFloor
  )
  expectSortedStringArray(
    "manifest.conformance.repo_law_gate",
    manifest.conformance?.repo_law_gate ?? [],
    expectedRepoLawGate
  )
  expectSortedStringArray(
    "manifest.conformance.readiness_gate",
    manifest.conformance?.readiness_gate ?? [],
    expectedReadinessGate
  )
  expectValue("manifest.outputs.manifest", manifest.outputs?.manifest, "outputs/manifest.json")
  expectValue(
    "manifest.outputs.validate_script",
    manifest.outputs?.validate_script,
    "outputs/validate-spec.mjs"
  )
  expectValue(
    "manifest.outputs.prompt",
    manifest.outputs?.prompt,
    "outputs/codex-plan-mode-prompt.md"
  )
  expectValue(
    "manifest.outputs.grill_log",
    manifest.outputs?.grill_log,
    "outputs/grill-log.md"
  )
  expectValue(
    "manifest.delegation.phase_session_role",
    manifest.delegation?.phase_session_role,
    manifest.phase_session_role
  )
  expectValue("manifest.phase_router", manifest.phase_router, "handoffs/P0-P4_ORCHESTRATOR_PROMPT.md")

  expectStringArray("manifest.root_files", manifest.root_files)
  expectStringArray("manifest.handoff_files", manifest.handoff_files)
  expectStringArray("manifest.prompt_files", manifest.prompt_files)
  expectStringArray("manifest.output_files", manifest.output_files)
  expectStringArray("manifest.fresh_session_read_order", manifest.fresh_session_read_order)

  expectSortedStringArray("manifest.root_files", manifest.root_files ?? [], getRootMarkdownFiles())
  expectSortedStringArray(
    "manifest.handoff_files",
    manifest.handoff_files ?? [],
    getFilesRelativeToSpec(join(specDir, "handoffs"))
  )
  expectSortedStringArray(
    "manifest.prompt_files",
    manifest.prompt_files ?? [],
    getFilesRelativeToSpec(join(specDir, "prompts"))
  )
  expectSortedStringArray(
    "manifest.output_files",
    manifest.output_files ?? [],
    getFilesRelativeToSpec(join(specDir, "outputs"))
  )
}

const checkRequiredHeadings = () => {
  for (const [relativePath, headings] of Object.entries(
    manifest.validation?.required_headings ?? {}
  )) {
    expectStringArray(`manifest.validation.required_headings.${relativePath}`, headings)

    const absolutePath = join(specDir, relativePath)
    if (!existsSync(absolutePath)) {
      pushFailure(`manifest.validation.required_headings: missing file ${relativePath}`)
      continue
    }

    const content = readFileSync(absolutePath, "utf8")
    for (const heading of headings) {
      if (!content.includes(heading)) {
        pushFailure(`${relativePath}: missing required heading ${heading}`)
      }
    }
  }
}

checkManifestStructure()

for (const manifestRef of collectManifestPaths(manifest)) {
  checkRelativePath(specDir, manifestRef, "manifest.json")
}

checkRequiredHeadings()

walkMarkdownFiles(specDir)

const markdownLinkPattern = /\[[^\]]*?\]\(([^)]+)\)/g

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, "utf8")
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
