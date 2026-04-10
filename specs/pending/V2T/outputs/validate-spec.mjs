import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, extname, join, normalize, relative } from "node:path"
import { fileURLToPath } from "node:url"

const outputsDir = dirname(fileURLToPath(import.meta.url))
const specDir = dirname(outputsDir)
const repoRootDir = dirname(dirname(dirname(specDir)))

const manifestPath = join(outputsDir, "manifest.json")
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
const rootPackageManifestPath = join(repoRootDir, "package.json")
const rootTurboManifestPath = join(repoRootDir, "turbo.json")
const codexConfigPath = join(repoRootDir, ".codex", "config.toml")
const codexAgentsReadmePath = join(repoRootDir, ".codex", "agents", "README.md")
const infraPackageManifestPath = join(repoRootDir, "infra", "package.json")
const appPackageManifestPath = join(repoRootDir, "apps", "V2T", "package.json")
const appTurboManifestPath = join(repoRootDir, "apps", "V2T", "turbo.json")
const sidecarPackageManifestPath = join(repoRootDir, "packages", "VT2", "package.json")
const sidecarTurboManifestPath = join(repoRootDir, "packages", "VT2", "turbo.json")
const codexConfigContent = readFileSync(codexConfigPath, "utf8")
const rootPackageManifest = JSON.parse(readFileSync(rootPackageManifestPath, "utf8"))
const infraPackageManifest = JSON.parse(readFileSync(infraPackageManifestPath, "utf8"))
const appPackageManifest = JSON.parse(readFileSync(appPackageManifestPath, "utf8"))
const sidecarPackageManifest = JSON.parse(readFileSync(sidecarPackageManifestPath, "utf8"))
const infraWorkspacePackageName = infraPackageManifest.name
const appWorkspacePackageName = appPackageManifest.name
const sidecarWorkspacePackageName = sidecarPackageManifest.name

const expectedPhaseOrder = ["p0", "p1", "p2", "p3", "p4"]
const expectedImplementationFloor = [
  `bunx turbo run check --filter=${infraWorkspacePackageName} --filter=${appWorkspacePackageName} --filter=${sidecarWorkspacePackageName}`,
  `bunx turbo run test --filter=${infraWorkspacePackageName} --filter=${appWorkspacePackageName} --filter=${sidecarWorkspacePackageName}`,
  `bunx turbo run build --filter=${appWorkspacePackageName} --filter=${sidecarWorkspacePackageName}`,
  "bun run --cwd apps/V2T lint",
  "bun run --cwd infra lint"
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
const expectedGraphitiConfig = {
  group_id: "beep-dev",
  search_group_ids_json: "[\"beep-dev\"]",
  add_memory_source: "text",
  add_memory_source_description: "codex-cli session",
  recall_order: [
    "search_memory_facts",
    "search_memory_facts_shorter_fallback",
    "get_episodes",
    "repo_local_fallback"
  ],
  require_exact_error_logging: true,
  require_session_end_summary_writeback: true
}
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
const textFilesetExtensions = new Set([
  ".json",
  ".md",
  ".mjs"
])
const staleCommandPatterns = [
  {
    description: "stale uppercase app package filter",
    pattern: /--filter=@beep\/V2T\b/
  },
  {
    description: "stale app path filter",
    pattern: /--filter=\.\/apps\/V2T\b/
  },
  {
    description: "stale sidecar path filter",
    pattern: /--filter=\.\/packages\/VT2\b/
  }
]
const staleProsePatterns = [
  {
    description: "stale README authority label",
    pattern: /normative source of truth for this spec package/
  },
  {
    description: "stale turbo lint nonexistent-task explanation",
    pattern: /(?:dry-run still expands to|dependency lint expansion still reaches).+@beep\/VT2#lint/s
  },
  {
    description: "stale competing startup-order heading",
    pattern: /^## Required Read Order$/m
  },
  {
    description: "stale codex prompt explicit startup list",
    pattern: /^Read these files first:$/m
  },
  {
    description: "stale codex prompt unconditional phase-artifact write instruction",
    pattern: /^- write or refine the named phase artifact$/m
  },
  {
    description: "stale codex prompt unconditional p0 grill-log instruction",
    pattern: /^- update `outputs\/grill-log\.md` when the active phase is `p0`$/m
  },
  {
    description: "stale P1 worker mixed read-only and write mode guidance",
    pattern: /Mode: `read-only` or `workspace-write`, depending on the orchestrator wave/
  },
  {
    description: "stale P1 worker direct canonical design artifact write scope",
    pattern: /Write scope:\s*- `specs\/pending\/V2T\/DESIGN_RESEARCH\.md`/s
  },
  {
    description: "stale infra future-work claim",
    pattern: /before this implementation pass it did not yet contain a real V2T workstation component or a usable Pulumi project entrypoint/
  },
  {
    description: "stale add-real-pulumi-project planning text",
    pattern: /add a real Pulumi project shape in `@beep\/infra` with a local stack entrypoint for `V2TWorkstation`/
  },
  {
    description: "stale infra tasks future-tense claim",
    pattern: /@beep\/infra should carry package-local `test` and `lint` tasks once the workstation installer exists/
  },
  {
    description: "stale Pulumi entrypoint path",
    pattern: /infra\/src\/entry\.ts/
  }
]

const failures = []

const pushFailure = (message) => {
  failures.push(message)
}

const toPosixPath = (path) => path.split("\\").join("/")

const expectedCommandTruthFiles = [
  toPosixPath(relative(specDir, rootPackageManifestPath)),
  toPosixPath(relative(specDir, rootTurboManifestPath)),
  toPosixPath(relative(specDir, infraPackageManifestPath)),
  toPosixPath(relative(specDir, appPackageManifestPath)),
  toPosixPath(relative(specDir, appTurboManifestPath)),
  toPosixPath(relative(specDir, sidecarPackageManifestPath)),
  toPosixPath(relative(specDir, sidecarTurboManifestPath))
]
const expectedCodexAgentFiles = [...codexConfigContent.matchAll(/^config_file = "\.\/(agents\/[^"]+\.toml)"$/gm)].map(
  ([, configFile]) => toPosixPath(relative(specDir, join(repoRootDir, ".codex", configFile)))
)
const expectedCodexFiles = [
  toPosixPath(relative(specDir, codexConfigPath)),
  toPosixPath(relative(specDir, codexAgentsReadmePath)),
  ...expectedCodexAgentFiles
]

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

const expectOrderedStringArray = (label, actual, expected) => {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    pushFailure(`${label}: expected array values`)
    return
  }

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    pushFailure(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const expectNoDuplicateStrings = (label, value) => {
  if (!Array.isArray(value)) {
    return
  }

  const duplicates = value.filter((entry, index) => value.indexOf(entry) !== index)
  if (duplicates.length > 0) {
    pushFailure(`${label}: duplicate entries ${JSON.stringify(sortStrings(new Set(duplicates)))}`)
  }
}

const expectScriptsPresent = (label, scripts, requiredKeys) => {
  for (const key of requiredKeys) {
    if (typeof scripts?.[key] !== "string" || scripts[key].length === 0) {
      pushFailure(`${label}: missing required script ${JSON.stringify(key)}`)
    }
  }
}

const expectScriptsAbsent = (label, scripts, forbiddenKeys) => {
  for (const key of forbiddenKeys) {
    if (typeof scripts?.[key] === "string" && scripts[key].length > 0) {
      pushFailure(`${label}: forbidden script present ${JSON.stringify(key)}`)
    }
  }
}

const expectStringArrayIncludes = (label, value, expectedEntry) => {
  if (!Array.isArray(value) || !value.includes(expectedEntry)) {
    pushFailure(`${label}: expected to include ${JSON.stringify(expectedEntry)}`)
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
const textFiles = []
const walkMarkdownFiles = (currentDir) => {
  for (const entry of readdirSync(currentDir)) {
    const fullPath = join(currentDir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      walkMarkdownFiles(fullPath)
      continue
    }
    if (textFilesetExtensions.has(extname(fullPath))) {
      textFiles.push(fullPath)
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
    "manifest.conformance.workspace_packages.infra",
    manifest.conformance?.workspace_packages?.infra,
    infraWorkspacePackageName
  )
  expectValue(
    "manifest.conformance.workspace_packages.app",
    manifest.conformance?.workspace_packages?.app,
    appWorkspacePackageName
  )
  expectValue(
    "manifest.conformance.workspace_packages.sidecar",
    manifest.conformance?.workspace_packages?.sidecar,
    sidecarWorkspacePackageName
  )
  expectSortedStringArray(
    "manifest.conformance.command_truth_files",
    manifest.conformance?.command_truth_files ?? [],
    expectedCommandTruthFiles
  )
  expectSortedStringArray(
    "manifest.conformance.required_script_keys.root",
    manifest.conformance?.required_script_keys?.root ?? [],
    [
      "check",
      "lint",
      "test",
      "docgen",
      "lint:effect-laws",
      "lint:jsdoc",
      "check:effect-laws-allowlist",
      "lint:schema-first"
    ]
  )
  expectSortedStringArray(
    "manifest.conformance.required_script_keys.app",
    manifest.conformance?.required_script_keys?.app ?? [],
    ["check", "test", "build", "lint"]
  )
  expectSortedStringArray(
    "manifest.conformance.required_script_keys.infra",
    manifest.conformance?.required_script_keys?.infra ?? [],
    ["check", "test", "lint", "pulumi:login:local", "stack:init:local", "preview", "up", "destroy", "refresh"]
  )
  expectSortedStringArray(
    "manifest.conformance.required_script_keys.sidecar",
    manifest.conformance?.required_script_keys?.sidecar ?? [],
    ["check", "test", "build"]
  )
  expectSortedStringArray(
    "manifest.conformance.forbidden_script_keys.sidecar",
    manifest.conformance?.forbidden_script_keys?.sidecar ?? [],
    ["lint", "docgen"]
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
  expectValue(
    "manifest.delegation.custom_agent_registry",
    manifest.delegation?.custom_agent_registry,
    toPosixPath(relative(specDir, codexConfigPath))
  )
  expectValue(
    "manifest.delegation.custom_agent_catalog",
    manifest.delegation?.custom_agent_catalog,
    toPosixPath(relative(specDir, codexAgentsReadmePath))
  )
  expectValue("manifest.phase_router", manifest.phase_router, "handoffs/P0-P4_ORCHESTRATOR_PROMPT.md")

  expectScriptsPresent(
    "root package manifest scripts",
    rootPackageManifest.scripts,
    manifest.conformance?.required_script_keys?.root ?? []
  )
  expectScriptsPresent(
    "app package manifest scripts",
    appPackageManifest.scripts,
    manifest.conformance?.required_script_keys?.app ?? []
  )
  expectScriptsPresent(
    "infra package manifest scripts",
    infraPackageManifest.scripts,
    manifest.conformance?.required_script_keys?.infra ?? []
  )
  expectScriptsPresent(
    "sidecar package manifest scripts",
    sidecarPackageManifest.scripts,
    manifest.conformance?.required_script_keys?.sidecar ?? []
  )
  expectScriptsAbsent(
    "sidecar package manifest scripts",
    sidecarPackageManifest.scripts,
    manifest.conformance?.forbidden_script_keys?.sidecar ?? []
  )
  expectValue(
    "manifest.conformance.notes.filtered_turbo_app_lint_is_dependency_expanded",
    manifest.conformance?.notes?.filtered_turbo_app_lint_is_dependency_expanded,
    true
  )

  for (const [key, value] of Object.entries(expectedGraphitiConfig)) {
    if (Array.isArray(value)) {
      expectOrderedStringArray(`manifest.graphiti.${key}`, manifest.graphiti?.[key], value)
      continue
    }

    expectValue(`manifest.graphiti.${key}`, manifest.graphiti?.[key], value)
  }

  expectStringArray("manifest.root_files", manifest.root_files)
  expectStringArray("manifest.handoff_files", manifest.handoff_files)
  expectStringArray("manifest.prompt_files", manifest.prompt_files)
  expectStringArray("manifest.output_files", manifest.output_files)
  expectStringArray("manifest.codex_files", manifest.codex_files)
  expectStringArray("manifest.fresh_session_read_order", manifest.fresh_session_read_order)
  expectStringArray("manifest.delegation.recommended_agents", manifest.delegation?.recommended_agents)
  expectNoDuplicateStrings("manifest.fresh_session_read_order", manifest.fresh_session_read_order)
  expectValue(
    "manifest.delegation.prompt_assets.memory_protocol",
    manifest.delegation?.prompt_assets?.memory_protocol,
    "prompts/GRAPHITI_MEMORY_PROTOCOL.md"
  )
  expectValue(
    "manifest.fresh_session_read_order[0]",
    manifest.fresh_session_read_order?.[0],
    "outputs/manifest.json"
  )
  expectStringArrayIncludes(
    "manifest.fresh_session_read_order",
    manifest.fresh_session_read_order,
    "prompts/GRAPHITI_MEMORY_PROTOCOL.md"
  )

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
  expectSortedStringArray("manifest.codex_files", manifest.codex_files ?? [], expectedCodexFiles)
  expectSortedStringArray(
    "manifest.delegation.recommended_agents",
    manifest.delegation?.recommended_agents ?? [],
    expectedCodexAgentFiles
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

const checkRequiredSnippets = () => {
  for (const [relativePath, snippets] of Object.entries(
    manifest.validation?.required_snippets ?? {}
  )) {
    expectStringArray(`manifest.validation.required_snippets.${relativePath}`, snippets)
    if (!Array.isArray(snippets)) {
      pushFailure(`manifest.validation.required_snippets.${relativePath}: expected array of non-empty strings`)
      continue
    }

    const absolutePath = join(specDir, relativePath)
    if (!existsSync(absolutePath)) {
      pushFailure(`manifest.validation.required_snippets: missing file ${relativePath}`)
      continue
    }

    const content = readFileSync(absolutePath, "utf8")
    for (const snippet of snippets) {
      if (!content.includes(snippet)) {
        pushFailure(`${relativePath}: missing required snippet ${JSON.stringify(snippet)}`)
      }
    }
  }
}

checkManifestStructure()

for (const manifestRef of collectManifestPaths(manifest)) {
  checkRelativePath(specDir, manifestRef, "manifest.json")
}

checkRequiredHeadings()
checkRequiredSnippets()

walkMarkdownFiles(specDir)

for (const textFile of textFiles) {
  if (textFile === fileURLToPath(import.meta.url)) {
    continue
  }

  const content = readFileSync(textFile, "utf8")
  for (const { description, pattern } of staleCommandPatterns) {
    if (pattern.test(content)) {
      pushFailure(`${toPosixPath(relative(specDir, textFile))}: ${description}`)
    }
  }

  for (const { description, pattern } of staleProsePatterns) {
    if (pattern.test(content)) {
      pushFailure(`${toPosixPath(relative(specDir, textFile))}: ${description}`)
    }
  }
}

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
