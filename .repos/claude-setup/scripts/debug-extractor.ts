import * as ts from "typescript"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import { pipe } from "effect/Function"

const EFFECT_INFRASTRUCTURE = new Set([
  "never",
  "unknown",
  "Scope",
  "Clock",
  "Random",
  "ConfigProvider",
  "Tracer",
  "Console",
  "__type"
])

const EXCLUDED_FROM_GRAPH = new Set(["AtomRegistry", "Registry"])

const isEffectInfrastructure = (name: string): boolean =>
  EFFECT_INFRASTRUCTURE.has(name)

const isExcludedFromGraph = (name: string): boolean =>
  EXCLUDED_FROM_GRAPH.has(name)

const extractDepsFromType = (
  type: ts.Type,
  checker: ts.TypeChecker
): ReadonlyArray<string> => {
  const deps: string[] = []

  const processType = (t: ts.Type): void => {
    if (t.isUnion()) {
      for (const unionMember of t.types) {
        processType(unionMember)
      }
      return
    }

    if (t.isIntersection()) {
      for (const intersectionMember of t.types) {
        processType(intersectionMember)
      }
      return
    }

    const symbol = t.getSymbol() ?? t.aliasSymbol
    if (symbol) {
      const name = symbol.getName()
      if (
        !isEffectInfrastructure(name) &&
        !isExcludedFromGraph(name) &&
        !deps.includes(name)
      ) {
        deps.push(name)
      }
    }
  }

  processType(type)
  return deps
}

const extractErrorTypeNames = (
  errorType: ts.Type,
  checker: ts.TypeChecker
): ReadonlyArray<string> => {
  if (errorType.flags & ts.TypeFlags.Never) {
    return []
  }

  if (errorType.isUnion()) {
    return errorType.types.map((t) => checker.typeToString(t))
  }

  return [checker.typeToString(errorType)]
}

const debugLayerInfo = (
  filePath: string,
  layerName: string
) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  yield* Console.log(`\n=== Debugging ${layerName} in ${filePath} ===`)

  const content = yield* fs.readFileString(filePath)

  yield* Console.log(`File content length: ${content.length} bytes`)

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
    baseUrl: ".",
    paths: {
      "~/*": ["./src/*"]
    }
  }

  yield* Console.log(`Creating TypeScript program...`)
  const program = ts.createProgram([filePath], compilerOptions)
  const checker = program.getTypeChecker()

  yield* Console.log(`Getting source file...`)
  let sourceFile = program.getSourceFile(filePath)

  if (!sourceFile) {
    yield* Console.log(`Source file not found by exact path, trying alternatives...`)
    const allSourceFiles = program.getSourceFiles()
    yield* Console.log(`Total source files in program: ${allSourceFiles.length}`)

    sourceFile = allSourceFiles.find(sf =>
      sf.fileName === filePath ||
      sf.fileName.endsWith(filePath) ||
      filePath.endsWith(sf.fileName)
    )

    if (sourceFile) {
      yield* Console.log(`Found source file: ${sourceFile.fileName}`)
    } else {
      yield* Console.log(`ERROR: Could not find source file at all!`)
      yield* Console.log(`First few source files:`)
      for (const sf of allSourceFiles.slice(0, 10)) {
        yield* Console.log(`  - ${sf.fileName}`)
      }
      return
    }
  } else {
    yield* Console.log(`Source file found: ${sourceFile.fileName}`)
  }

  yield* Console.log(`Getting module symbol...`)
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) {
    yield* Console.log(`ERROR: No module symbol found!`)
    return
  }

  yield* Console.log(`Getting exports...`)
  const exports = checker.getExportsOfModule(moduleSymbol)
  yield* Console.log(`Total exports: ${exports.length}`)
  for (const exp of exports) {
    yield* Console.log(`  - ${exp.getName()}`)
  }

  yield* Console.log(`Looking for layer export: ${layerName}`)
  const layerExport = exports.find((s) => s.getName() === layerName)

  if (!layerExport) {
    yield* Console.log(`ERROR: Layer export "${layerName}" not found!`)
    return
  }

  yield* Console.log(`Getting type of layer...`)
  const type = checker.getTypeOfSymbol(layerExport)
  const typeString = checker.typeToString(type)
  yield* Console.log(`Type string: ${typeString}`)

  if (!typeString.startsWith("Layer<")) {
    yield* Console.log(`ERROR: Type doesn't start with "Layer<"`)
    return
  }

  yield* Console.log(`Casting to TypeReference...`)
  const typeRef = type as ts.TypeReference

  yield* Console.log(`Getting type arguments...`)
  const typeArgs = checker.getTypeArguments(typeRef)
  yield* Console.log(`Type args count: ${typeArgs.length}`)

  if (typeArgs.length >= 3) {
    yield* Console.log(`\nType argument 0 (Service):`)
    yield* Console.log(`  ${checker.typeToString(typeArgs[0])}`)

    yield* Console.log(`\nType argument 1 (Error):`)
    yield* Console.log(`  ${checker.typeToString(typeArgs[1])}`)
    const errorTypes = extractErrorTypeNames(typeArgs[1], checker)
    yield* Console.log(`  Extracted errors: ${errorTypes.join(", ")}`)

    yield* Console.log(`\nType argument 2 (Requirements):`)
    yield* Console.log(`  ${checker.typeToString(typeArgs[2])}`)
    const deps = extractDepsFromType(typeArgs[2], checker)
    yield* Console.log(`  Extracted deps: ${deps.join(", ")}`)
  } else {
    yield* Console.log(`ERROR: Expected at least 3 type arguments, got ${typeArgs.length}`)
  }
})

const main = Effect.gen(function* () {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    yield* Console.log("Usage: bun debug-extractor.ts <file-path> <layer-name>")
    yield* Console.log("Example: bun debug-extractor.ts src/services/TodoQueryService.live.ts TodoQueryServiceLive")
    return
  }

  const [filePath, layerName] = args
  yield* debugLayerInfo(filePath, layerName)
})

pipe(
  main,
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
