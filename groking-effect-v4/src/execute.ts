import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { generateModuleSurface, generatePackageSurface } from "./generator/generate.ts"

interface CliFlags {
  readonly packageName: string
  readonly moduleName: string | undefined
  readonly effectSmolRoot: string | undefined
  readonly outputRoot: string | undefined
  readonly dryRun: boolean
}

const parseFlags = (rawFlags: ReadonlyArray<string>): CliFlags => {
  let packageName = "effect"
  let moduleName: string | undefined
  let effectSmolRoot: string | undefined
  let outputRoot: string | undefined
  let dryRun = false

  const requireValue = (index: number, flag: string): string => {
    const value = rawFlags[index + 1]
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`)
    }
    return value
  }

  for (let index = 0; index < rawFlags.length; index++) {
    const flag = rawFlags[index]
    if (flag === "--package") {
      packageName = requireValue(index, flag)
      index++
      continue
    }
    if (flag === "--module") {
      moduleName = requireValue(index, flag)
      index++
      continue
    }
    if (flag === "--effect-smol-root") {
      effectSmolRoot = requireValue(index, flag)
      index++
      continue
    }
    if (flag === "--output-root") {
      outputRoot = requireValue(index, flag)
      index++
      continue
    }
    if (flag === "--dry-run") {
      dryRun = true
      continue
    }

    throw new Error(`Unknown flag: ${flag}`)
  }

  return {
    packageName,
    moduleName,
    effectSmolRoot,
    outputRoot,
    dryRun
  }
}

const main = (): void => {
  const args = process.argv.slice(2)
  const command = args[0] === "generate" ? "generate" : "generate"
  const flagArgs = args[0] === "generate" ? args.slice(1) : args

  if (command !== "generate") {
    throw new Error(`Unsupported command: ${command}`)
  }

  const flags = parseFlags(flagArgs)
  const thisFile = fileURLToPath(import.meta.url)
  const packageRoot = path.resolve(path.dirname(thisFile), "..")
  const repoRoot = path.resolve(packageRoot, "..")
  const effectSmolRoot = flags.effectSmolRoot === undefined
    ? path.join(repoRoot, ".repos/effect-smol")
    : path.resolve(process.cwd(), flags.effectSmolRoot)
  const outputRoot = flags.outputRoot === undefined
    ? path.join(packageRoot, "src")
    : path.resolve(process.cwd(), flags.outputRoot)

  if (flags.moduleName !== undefined) {
    const result = generateModuleSurface({
      packageName: flags.packageName,
      moduleName: flags.moduleName,
      effectSmolRoot,
      outputRoot,
      repoRoot,
      dryRun: flags.dryRun
    })
    console.log(
      [
        `Generated module: ${result.packageName}/${result.moduleName}`,
        `Exports: ${result.exportFiles.length}`,
        `README: ${result.moduleReadmePath}`,
        `SURFACE: ${result.moduleSurfacePath}`
      ].join("\n")
    )
    return
  }

  const packageResult = generatePackageSurface({
    packageName: flags.packageName,
    effectSmolRoot,
    outputRoot,
    repoRoot,
    dryRun: flags.dryRun
  })
  const exportCount = packageResult.moduleResults.reduce((total, result) => total + result.exportFiles.length, 0)

  console.log(
    [
      `Generated package: ${packageResult.packageName}`,
      `Modules: ${packageResult.moduleResults.length}`,
      `Exports: ${exportCount}`
    ].join("\n")
  )
}

main()
