import * as PlatformError from "@effect/platform/Error"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Command, Options } from "@effect/cli"
import * as Array from "effect/Array"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Graph from "effect/Graph"
import * as Option from "effect/Option"
import * as Order from "effect/Order"
import * as ts from "typescript"

export interface ServiceDefinition {
  readonly name: string
  readonly path: string
  readonly line: number
}

export interface LayerDefinition {
  readonly name: string
  readonly serviceName: string
  readonly path: string
  readonly line: number
  readonly dependencies: ReadonlyArray<string>
  readonly errorTypes: ReadonlyArray<string>
  readonly isParametrized: boolean
  readonly factoryName?: string
}

export interface ArchitectureGraph {
  readonly services: ReadonlyArray<ServiceDefinition>
  readonly layers: ReadonlyArray<LayerDefinition>
}

export interface AnalysisGraph {
  readonly graph: Graph.DirectedGraph<ServiceDefinition, void>
  readonly serviceIndex: ReadonlyMap<string, Graph.NodeIndex>
}

interface GraphMetrics {
  readonly density: number
  readonly diameter: number
  readonly averageDegree: number
}

const SERVICE_TAG_PATTERN = /export\s+const\s+(\w+)\s*=\s*Context\.GenericTag<\1>/g

const LAYER_PATTERN = /(export\s+)?const\s+(\w+)(?:\s*:\s*Layer\.Layer<[\s\S]*?>)?\s*=\s*Layer\.(scoped|effect|succeed|sync)\s*\(\s*([\w.]+)\s*,/gm

const FACTORY_PATTERN = /(export\s+)?const\s+(\w+)\s*=\s*\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*(?:\{[^}]*(?:return\s+)?|)Layer\.(scoped|effect|succeed|sync)\s*\(\s*([\w.]+)\s*,/gm

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

export const countLinesBefore = (content: string, index: number): number =>
  content.substring(0, index).split("\n").length

export const extractServicesFromContent = (
  content: string,
  filePath: string
): ReadonlyArray<ServiceDefinition> => {
  const results: ServiceDefinition[] = []
  SERVICE_TAG_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = SERVICE_TAG_PATTERN.exec(content)) !== null) {
    results.push({
      name: match[1],
      path: filePath,
      line: countLinesBefore(content, match.index)
    })
  }

  return results
}

interface LayerMatch {
  readonly name: string
  readonly serviceName: string
  readonly line: number
  readonly isParametrized: boolean
  readonly factoryName?: string
}

export const extractLayerMatches = (
  content: string
): ReadonlyArray<LayerMatch> => {
  const results: LayerMatch[] = []

  LAYER_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = LAYER_PATTERN.exec(content)) !== null) {
    const varName = match[2]
    const layerType = match[3]
    const serviceNameRaw = match[4]
    const serviceName = serviceNameRaw.includes('.')
      ? serviceNameRaw.split('.').pop() ?? serviceNameRaw
      : serviceNameRaw

    results.push({
      name: varName,
      serviceName: serviceName,
      line: countLinesBefore(content, match.index),
      isParametrized: false
    })
  }

  FACTORY_PATTERN.lastIndex = 0
  while ((match = FACTORY_PATTERN.exec(content)) !== null) {
    const isExported = match[1] !== undefined
    const factoryName = match[2]
    const layerType = match[3]
    const serviceNameRaw = match[4]
    const serviceName = serviceNameRaw.includes('.')
      ? serviceNameRaw.split('.').pop() ?? serviceNameRaw
      : serviceNameRaw

    if (isExported) {
      results.push({
        name: factoryName,
        serviceName: serviceName,
        line: countLinesBefore(content, match.index),
        isParametrized: true,
        factoryName: factoryName
      })
    }
  }

  return results
}

const isEffectInfrastructure = (name: string): boolean =>
  EFFECT_INFRASTRUCTURE.has(name)

const isExcludedFromGraph = (name: string): boolean =>
  EXCLUDED_FROM_GRAPH.has(name)

const extractDepsFromType = (
  type: ts.Type,
  checker: ts.TypeChecker
): ReadonlyArray<string> => {
  const deps: string[] = []
  const visited = new Set<ts.Type>()

  const processType = (t: ts.Type): void => {
    if (visited.has(t)) return
    visited.add(t)

    const typeString = checker.typeToString(t)

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
    const symbolName = symbol?.getName()

    const typeRef = t as ts.TypeReference
    const isTypeReference = typeRef.target && checker.getTypeArguments

    if ((symbolName === "Identifier" || typeString.startsWith("Id<")) && isTypeReference) {
      const typeArgs = checker.getTypeArguments(typeRef)

      let typeArgString: string | undefined

      if (typeArgs && typeArgs.length > 0) {
        typeArgString = checker.typeToString(typeArgs[0])
      } else if (typeString.startsWith("Id<")) {
        const match = typeString.match(/^Id<(.+)>$/)
        if (match) {
          typeArgString = match[1]
        }
      }

      if (typeArgString) {
        if (typeArgString.startsWith("typeof ")) {
          const typeofContent = typeArgString.slice(7)
          const parts = typeofContent.split(".")
          const serviceName = parts[0]

          if (
            !isEffectInfrastructure(serviceName) &&
            !isExcludedFromGraph(serviceName) &&
            !deps.includes(serviceName)
          ) {
            deps.push(serviceName)
          }
        } else if (typeArgString.startsWith('"@')) {
          const match = typeArgString.match(/^"@[^/]+\/([^"]+)"$/)
          if (match) {
            const serviceName = match[1]

            if (
              !isEffectInfrastructure(serviceName) &&
              !isExcludedFromGraph(serviceName) &&
              !deps.includes(serviceName)
            ) {
              deps.push(serviceName)
            }
          }
        }
      }
      return
    }

    if (isTypeReference) {
      const typeArgs = checker.getTypeArguments(typeRef)
      if (typeArgs && typeArgs.length > 0) {
        for (const arg of typeArgs) {
          processType(arg)
        }
      }
    }

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

interface LayerInfo {
  readonly dependencies: ReadonlyArray<string>
  readonly errorTypes: ReadonlyArray<string>
}

const extractLayerInfo = (
  program: ts.Program,
  filePath: string,
  layerName: string
): LayerInfo => {
  const checker = program.getTypeChecker()

  let sourceFile = program.getSourceFile(filePath)

  if (!sourceFile) {
    const allSourceFiles = program.getSourceFiles()
    sourceFile = allSourceFiles.find(sf =>
      sf.fileName === filePath ||
      sf.fileName.endsWith(filePath) ||
      filePath.endsWith(sf.fileName)
    )
  }

  if (!sourceFile) {
    return { dependencies: [], errorTypes: [] }
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) {
    return { dependencies: [], errorTypes: [] }
  }

  const exports = checker.getExportsOfModule(moduleSymbol)
  const layerExport = exports.find((s) => s.getName() === layerName)

  if (!layerExport) {
    return { dependencies: [], errorTypes: [] }
  }

  const type = checker.getTypeOfSymbol(layerExport)
  const typeString = checker.typeToString(type)

  if (!typeString.startsWith("Layer<")) {
    return { dependencies: [], errorTypes: [] }
  }

  const typeRef = type as ts.TypeReference
  const typeArgs = checker.getTypeArguments(typeRef)

  if (typeArgs.length >= 3) {
    return {
      dependencies: extractDepsFromType(typeArgs[2], checker),
      errorTypes: extractErrorTypeNames(typeArgs[1], checker)
    }
  }

  return { dependencies: [], errorTypes: [] }
}

export const createTsProgram = (
  filePaths: ReadonlyArray<string>
): ts.Program => {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: false,
    esModuleInterop: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    noEmit: true,
    allowJs: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
    baseUrl: ".",
    paths: {
      "~/*": ["./src/*"],
      "@/*": ["./src/*"]
    }
  }

  return ts.createProgram([...filePaths], compilerOptions)
}

const DEBUG = process.env.DEBUG_ARCH === '1'

const debugLog = (msg: string) => {
  if (DEBUG) {
    console.error(`[DEBUG] ${msg}`)
  }
}

export const extractLayersFromContent = (
  content: string,
  filePath: string,
  program?: ts.Program
): ReadonlyArray<LayerDefinition> => {
  const layerMatches = extractLayerMatches(content)

  return layerMatches.map((match) => {
    const layerInfo = program
      ? extractLayerInfo(program, filePath, match.name)
      : { dependencies: [], errorTypes: [] }

    return {
      name: match.name,
      serviceName: match.serviceName,
      path: filePath,
      line: match.line,
      dependencies: layerInfo.dependencies,
      errorTypes: layerInfo.errorTypes,
      isParametrized: match.isParametrized,
      factoryName: match.factoryName
    }
  })
}

export const findTypeScriptFiles = (srcPath: string) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const resolvedPath = path.resolve(srcPath)

  const srcExists = yield* pipe(
    fs.exists(resolvedPath),
    Effect.orElseSucceed(() => false)
  )

  if (!srcExists) {
    return []
  }

  const scanDir = (
    dir: string
  ): Effect.Effect<ReadonlyArray<string>, PlatformError.PlatformError, FileSystem.FileSystem | Path.Path> =>
    Effect.gen(function* () {
      const entries = yield* pipe(
        fs.readDirectory(dir),
        Effect.catchTag("SystemError", (error) =>
          error.reason === "NotFound"
            ? Effect.succeed([])
            : Effect.fail(error)
        )
      )

      const processEntry = (entry: string) =>
        Effect.gen(function* () {
          const fullPath = path.join(dir, entry)
          const stat = yield* fs.stat(fullPath)

          if (stat.type === "Directory") {
            if (entry !== "node_modules" && entry !== "__tests__") {
              return yield* scanDir(fullPath)
            }
            return []
          }

          if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
            return [fullPath]
          }

          return []
        })

      const results = yield* Effect.forEach(entries, processEntry)
      return Array.flatten(results)
    })

  return yield* scanDir(resolvedPath)
})

export const findServiceDefinitions = (
  files: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<ServiceDefinition>, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const processFile = (filePath: string) =>
      pipe(
        fs.readFileString(filePath),
        Effect.map((content) => extractServicesFromContent(content, filePath))
      )

    const results = yield* Effect.forEach(files, processFile)
    return Array.flatten(results)
  })

export const findLayerDefinitions = (
  files: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<LayerDefinition>, PlatformError.PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const program = createTsProgram(files)

    const processFile = (filePath: string) =>
      pipe(
        fs.readFileString(filePath),
        Effect.map((content) => extractLayersFromContent(content, filePath, program))
      )

    const results = yield* Effect.forEach(files, processFile)
    return Array.flatten(results)
  })

export const buildArchitectureGraph = (srcPath: string) => Effect.gen(function* () {
  const files = yield* findTypeScriptFiles(srcPath)

  if (files.length === 0) {
    yield* Console.log(`No TypeScript files found in ${srcPath} directory`)
    yield* Console.log("The architecture analyzer expects services and layers in the specified directory")
    yield* Console.log("Returning empty graph...")
  }

  const services = yield* findServiceDefinitions(files)
  const layers = yield* findLayerDefinitions(files)

  return { services, layers } satisfies ArchitectureGraph
})

export const buildAnalysisGraph = (arch: ArchitectureGraph): AnalysisGraph => {
  const graph = Graph.directed<ServiceDefinition, void>((mutable) => {
    const serviceIndex = new Map<string, Graph.NodeIndex>()

    arch.services.forEach((service) => {
      const nodeIndex = Graph.addNode(mutable, service)
      serviceIndex.set(service.name, nodeIndex)
    })

    const layerMap = new Map(arch.layers.map((layer) => [layer.serviceName, layer]))

    arch.services.forEach((service) => {
      const layer = layerMap.get(service.name)
      if (!layer) return

      const sourceIndex = serviceIndex.get(service.name)
      if (sourceIndex === undefined) return

      layer.dependencies.forEach((depName) => {
        const targetIndex = serviceIndex.get(depName)
        if (targetIndex !== undefined) {
          Graph.addEdge(mutable, sourceIndex, targetIndex, undefined)
        }
      })
    })
  })

  const serviceIndex = new Map<string, Graph.NodeIndex>()
  let index = 0
  for (const service of arch.services) {
    serviceIndex.set(service.name, index)
    index++
  }

  return { graph, serviceIndex }
}

const computeStats = (graph: ArchitectureGraph) => {
  const serviceCount = graph.services.filter((s) => !s.name.endsWith("VM")).length
  const vmCount = graph.services.filter((s) => s.name.endsWith("VM")).length

  const depCounts = pipe(
    graph.layers,
    Array.flatMap((l) => l.dependencies),
    Array.groupBy((dep) => dep),
    (grouped) =>
      Object.entries(grouped).map(([name, deps]) => ({
        name,
        count: deps.length
      })),
    Array.sort(
      Order.reverse(Order.mapInput(Order.number, (item: { name: string; count: number }) => item.count))
    ),
    Array.take(5)
  )

  const complexLayers = pipe(
    graph.layers,
    Array.sort(
      Order.reverse(Order.mapInput(Order.number, (layer: LayerDefinition) => layer.dependencies.length))
    ),
    Array.take(5)
  )

  return { serviceCount, vmCount, depCounts, complexLayers }
}

const makeShortPath = (fullPath: string): string =>
  fullPath.replace(/^(\.\/)?.*\/src\//, "")

const buildServicePathMap = (graph: ArchitectureGraph): Map<string, string> =>
  new Map(graph.services.map((s) => [s.name, s.path]))

export const formatMermaid = (graph: ArchitectureGraph): string => {
  const serviceLines = graph.services.map((service) =>
    `  ${service.name}["${service.name}<br/><i>${makeShortPath(service.path)}</i>"]`
  )

  const dependencyLines = pipe(
    graph.layers,
    Array.flatMap((layer) =>
      layer.dependencies.map((dep) => `  ${layer.serviceName} --> ${dep}`)
    )
  )

  const vms = pipe(
    graph.services,
    Array.filter((s) => s.name.endsWith("VM")),
    Array.map((s) => s.name)
  )

  const services = pipe(
    graph.services,
    Array.filter((s) => !s.name.endsWith("VM")),
    Array.map((s) => s.name)
  )

  const styleLines: string[] = []
  if (vms.length > 0) {
    styleLines.push(`  classDef vm fill:#e1f5fe,stroke:#01579b`)
    styleLines.push(`  class ${vms.join(",")} vm`)
  }
  if (services.length > 0) {
    styleLines.push(`  classDef service fill:#f3e5f5,stroke:#4a148c`)
    styleLines.push(`  class ${services.join(",")} service`)
  }

  return [
    "flowchart TD",
    "",
    "  %% Services",
    ...serviceLines,
    "",
    "  %% Dependencies",
    ...dependencyLines,
    "",
    "  %% Styling",
    ...styleLines
  ].join("\n")
}


interface DependencyInfo {
  readonly direct: ReadonlyArray<string>
  readonly indirect: ReadonlyArray<string>
  readonly redundant: ReadonlyArray<string>
}

interface GroupedServices {
  readonly root: ReadonlyArray<ServiceDefinition>
  readonly intermediate: ReadonlyArray<ServiceDefinition>
  readonly leaf: ReadonlyArray<ServiceDefinition>
  readonly vm: ReadonlyArray<ServiceDefinition>
  readonly orphans: ReadonlyArray<ServiceDefinition>
}

const buildLayerMap = (layers: ReadonlyArray<LayerDefinition>): Map<string, LayerDefinition> =>
  new Map(layers.map((layer) => [layer.serviceName, layer]))

const collectTransitiveDeps = (
  analysisGraph: AnalysisGraph,
  serviceName: string
): ReadonlyArray<string> => {
  const nodeIndex = analysisGraph.serviceIndex.get(serviceName)
  if (nodeIndex === undefined) return []

  const visited = new Set<Graph.NodeIndex>()
  const result: string[] = []

  const walker = Graph.dfs(analysisGraph.graph, {
    start: [nodeIndex],
    direction: "outgoing"
  })

  for (const [idx, service] of walker) {
    if (idx === nodeIndex) continue
    if (!visited.has(idx)) {
      visited.add(idx)
      result.push(service.name)
    }
  }

  return result
}

const analyzeDependencies = (
  serviceName: string,
  layerByService: Map<string, LayerDefinition>,
  analysisGraph: AnalysisGraph
): DependencyInfo => {
  const layer = layerByService.get(serviceName)
  const direct = layer?.dependencies ?? []

  const indirect = new Set<string>()
  direct.forEach((dep) => {
    const transitive = collectTransitiveDeps(analysisGraph, dep)
    transitive.forEach((t) => indirect.add(t))
  })

  const redundant = direct.filter((d) => indirect.has(d))

  return {
    direct,
    indirect: [...indirect],
    redundant
  }
}

const detectOrphans = (analysisGraph: AnalysisGraph): Set<string> => {
  const noIncomingIndices: Graph.NodeIndex[] = globalThis.Array.from(
    Graph.indices(
      Graph.externals(analysisGraph.graph, { direction: "incoming" })
    )
  )

  return pipe(
    noIncomingIndices,
    Array.filterMap((idx: Graph.NodeIndex) => {
      const node = Graph.getNode(analysisGraph.graph, idx)
      if (Option.isNone(node)) return Option.none()

      const serviceName = node.value.name
      const isVM = serviceName.endsWith("VM")
      const outgoingCount = Graph.neighbors(analysisGraph.graph, idx).length

      if (isVM && outgoingCount > 0) {
        return Option.none()
      }

      return Option.some(serviceName)
    }),
    (names) => new Set(names)
  )
}

const groupServicesByType = (
  graph: ArchitectureGraph,
  layerByService: Map<string, LayerDefinition>,
  analysisGraph: AnalysisGraph
): GroupedServices => {
  const indegree = computeIndegrees(analysisGraph)
  const outdegree = computeOutdegrees(analysisGraph)

  const root: ServiceDefinition[] = []
  const intermediate: ServiceDefinition[] = []
  const leaf: ServiceDefinition[] = []
  const vm: ServiceDefinition[] = []
  const orphans: ServiceDefinition[] = []

  graph.services.forEach((service) => {
    const inDeg = indegree.get(service.name) ?? 0
    const outDeg = outdegree.get(service.name) ?? 0

    if (inDeg === 0 && outDeg === 0) {
      orphans.push(service)
      return
    }

    if (service.name.endsWith("VM")) {
      vm.push(service)
      return
    }

    if (outDeg === 0 && inDeg > 0) {
      root.push(service)
    } else if (outDeg > 0 && inDeg === 0) {
      leaf.push(service)
    } else {
      intermediate.push(service)
    }
  })

  return {
    root: pipe(root, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    intermediate: pipe(intermediate, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    leaf: pipe(leaf, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    vm: pipe(vm, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    orphans: pipe(orphans, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name)))
  }
}

const renderExpandedTree = (
  serviceName: string,
  layerByService: Map<string, LayerDefinition>,
  analysisGraph: AnalysisGraph,
  indent: string = "",
  visited: Set<string> = new Set()
): ReadonlyArray<string> => {
  const depInfo = analyzeDependencies(serviceName, layerByService, analysisGraph)
  const layer = layerByService.get(serviceName)
  const deps = layer?.dependencies ?? []

  const lines: string[] = []

  deps.forEach((dep, i) => {
    const isLastDep = i === deps.length - 1
    const connector = isLastDep ? "└─" : "├─"
    const marker = depInfo.redundant.includes(dep) ? " *(redundant)*" : ""

    lines.push(`${indent}${connector} ${dep}${marker}`)

    if (!visited.has(dep)) {
      const newIndent = indent + (isLastDep ? "   " : "│  ")
      const childLines = renderExpandedTree(
        dep,
        layerByService,
        analysisGraph,
        newIndent,
        new Set([...visited, dep])
      )
      lines.push(...childLines)
    }
  })

  return lines
}

export const formatHuman = (graph: ArchitectureGraph): string => {
  const layerByService = buildLayerMap(graph.layers)
  const analysisGraph = buildAnalysisGraph(graph)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const output: string[] = []

  const rootNames = grouped.root.map((s) => s.name).join(", ")
  output.push(`[Root] ${rootNames}`)
  output.push("")

  output.push("[Mid]")
  grouped.intermediate.forEach((service) => {
    output.push(`${service.name} (${makeShortPath(service.path)})`)
    output.push(...renderExpandedTree(service.name, layerByService, analysisGraph))
    output.push("")
  })

  output.push("[Leaf]")
  grouped.leaf.forEach((service) => {
    output.push(`${service.name} (${makeShortPath(service.path)})`)
    output.push(...renderExpandedTree(service.name, layerByService, analysisGraph))
    output.push("")
  })

  output.push("[VM]")
  grouped.vm.forEach((service) => {
    output.push(`${service.name} (${makeShortPath(service.path)})`)
    output.push(...renderExpandedTree(service.name, layerByService, analysisGraph))
    output.push("")
  })

  if (grouped.orphans.length > 0) {
    output.push("[Orphans]")
    grouped.orphans.forEach((service) => {
      output.push(`${service.name} (${makeShortPath(service.path)})`)
    })
    output.push("")
  }

  output.push("Markers:")
  output.push("- *(redundant)* - direct dep AND indirect dep (might be intentional or leak)")

  return output.join("\n")
}


interface Violation {
  readonly invariant: string
  readonly description: string
}

interface RedundantWarning {
  readonly service: string
  readonly target: string
  readonly via: string
}

interface HotWarning {
  readonly service: string
  readonly count: number
}

interface WideWarning {
  readonly service: string
  readonly count: number
}

interface Warnings {
  readonly redundant: ReadonlyArray<RedundantWarning>
  readonly hot: ReadonlyArray<HotWarning>
  readonly orphan: ReadonlyArray<string>
  readonly wide: ReadonlyArray<WideWarning>
}

interface Domain {
  readonly name: string
  readonly services: ReadonlyArray<string>
  readonly size: number
}

interface DomainAnalysis {
  readonly cutVertices: ReadonlyArray<string>
  readonly domains: ReadonlyArray<Domain>
}

interface AdvancedMetrics {
  readonly betweennessCentrality: Map<string, number>
  readonly clusteringCoefficient: Map<string, number>
  readonly domainAnalysis: DomainAnalysis
}

const computeIndegrees = (analysisGraph: AnalysisGraph): Map<string, number> => {
  const indegrees = new Map<string, number>()

  for (const [serviceName] of analysisGraph.serviceIndex) {
    indegrees.set(serviceName, 0)
  }

  for (const [serviceName, nodeIndex] of analysisGraph.serviceIndex) {
    const incomingCount = Graph.neighborsDirected(
      analysisGraph.graph,
      nodeIndex,
      "incoming"
    ).length
    indegrees.set(serviceName, incomingCount)
  }

  return indegrees
}

const computeOutdegrees = (analysisGraph: AnalysisGraph): Map<string, number> => {
  const outdegrees = new Map<string, number>()

  for (const [serviceName, nodeIndex] of analysisGraph.serviceIndex) {
    const outgoingCount = Graph.neighbors(analysisGraph.graph, nodeIndex).length
    outdegrees.set(serviceName, outgoingCount)
  }

  return outdegrees
}

const computeDensity = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph)
  if (nodeCount <= 1) return 0

  const edgeCount = Graph.edgeCount(analysisGraph.graph)
  return edgeCount / (nodeCount * (nodeCount - 1))
}

const computeDiameter = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph)
  if (nodeCount <= 1) return 0

  const result = Graph.floydWarshall(analysisGraph.graph, () => 1)

  return pipe(
    Array.fromIterable(result.distances.values()),
    Array.flatMap((innerMap) => Array.fromIterable(innerMap.values())),
    Array.filter((dist) => dist !== Infinity),
    Array.reduce(0, (max, dist) => Math.max(max, dist))
  )
}

const computeAverageDegree = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph)
  if (nodeCount === 0) return 0

  return pipe(
    Array.fromIterable(analysisGraph.serviceIndex.values()),
    Array.map((nodeIndex) => Graph.neighbors(analysisGraph.graph, nodeIndex).length),
    Array.reduce(0, (sum, count) => sum + count),
    (total) => total / nodeCount
  )
}

const detectCycles = (analysisGraph: AnalysisGraph): ReadonlyArray<ReadonlyArray<string>> => {
  const sccs = Graph.stronglyConnectedComponents(analysisGraph.graph)

  return sccs
    .filter((component) => component.length > 1)
    .map((component) =>
      component.map((nodeIndex) => {
        const nodeData = Graph.getNode(analysisGraph.graph, nodeIndex)
        return Option.isSome(nodeData) ? nodeData.value.name : `unknown-${nodeIndex}`
      })
    )
}

const checkInvariants = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): ReadonlyArray<Violation> => {
  const violations: Violation[] = []
  const layerByService = buildLayerMap(graph.layers)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const vmNames = new Set(grouped.vm.map((s) => s.name))
  const rootNames = new Set(grouped.root.map((s) => s.name))
  const intermediateNames = new Set(grouped.intermediate.map((s) => s.name))

  grouped.vm.forEach((vm) => {
    const layer = layerByService.get(vm.name)
    const deps = layer?.dependencies ?? []
    const vmDeps = deps.filter((d) => vmNames.has(d))
    if (vmDeps.length > 0) {
      violations.push({
        invariant: "INV-1",
        description: `${vm.name} depends on VMs: ${vmDeps.join(", ")}`
      })
    }
  })

  graph.services
    .filter((s) => !s.name.endsWith("VM"))
    .forEach((service) => {
      const layer = layerByService.get(service.name)
      const deps = layer?.dependencies ?? []
      const vmDeps = deps.filter((d) => vmNames.has(d))
      if (vmDeps.length > 0) {
        violations.push({
          invariant: "INV-2",
          description: `${service.name} depends on VMs: ${vmDeps.join(", ")}`
        })
      }
    })

  const cycles = detectCycles(analysisGraph)
  cycles.forEach((cycle) => {
    violations.push({
      invariant: "INV-3",
      description: `Cycle detected: ${cycle.join(" -> ")}`
    })
  })

  grouped.root.forEach((service) => {
    const layer = layerByService.get(service.name)
    const deps = layer?.dependencies ?? []
    if (deps.length > 0) {
      violations.push({
        invariant: "INV-4",
        description: `Root ${service.name} has deps: ${deps.join(", ")}`
      })
    }
  })

  grouped.intermediate.forEach((service) => {
    const layer = layerByService.get(service.name)
    const deps = layer?.dependencies ?? []
    const invalidDeps = deps.filter((d) => !rootNames.has(d) && !intermediateNames.has(d))
    if (invalidDeps.length > 0) {
      violations.push({
        invariant: "INV-5",
        description: `Intermediate ${service.name} depends on non-intermediate/root: ${invalidDeps.join(", ")}`
      })
    }
  })

  return violations
}

const computeBetweennessCentrality = (analysisGraph: AnalysisGraph): Map<string, number> => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph)
  if (nodeCount <= 2) return new Map()

  const betweenness = new Map<string, number>()
  for (const [serviceName] of analysisGraph.serviceIndex) {
    betweenness.set(serviceName, 0)
  }

  const result = Graph.floydWarshall(analysisGraph.graph, () => 1)
  const nodeIndices = Array.fromIterable(analysisGraph.serviceIndex.values())

  for (const source of nodeIndices) {
    for (const target of nodeIndices) {
      if (source === target) continue

      const distanceMap = result.distances.get(source)
      const pathMap = result.paths.get(source)
      if (!distanceMap || !pathMap) continue

      const distance = distanceMap.get(target)
      if (distance === undefined || distance === Infinity || distance <= 1) continue

      const path = pathMap.get(target)
      if (!path || path.length <= 2) continue

      const intermediateNodes = path.slice(1, -1)

      for (const nodeIndex of intermediateNodes) {
        const nodeOption = Graph.getNode(analysisGraph.graph, nodeIndex)
        if (Option.isSome(nodeOption)) {
          const serviceName = nodeOption.value.name
          const current = betweenness.get(serviceName) ?? 0
          betweenness.set(serviceName, current + 1)
        }
      }
    }
  }

  const allValues = Array.fromIterable(betweenness.values())
  const maxBetweenness = allValues.length > 0 ? Math.max(...allValues) : 1

  if (maxBetweenness > 0) {
    for (const [serviceName, value] of betweenness.entries()) {
      betweenness.set(serviceName, value / maxBetweenness)
    }
  }

  return betweenness
}

const computeClusteringCoefficient = (analysisGraph: AnalysisGraph): Map<string, number> => {
  const clustering = new Map<string, number>()

  for (const [serviceName, nodeIndex] of analysisGraph.serviceIndex) {
    const neighbors = Graph.neighbors(analysisGraph.graph, nodeIndex)
    const neighborCount = neighbors.length

    if (neighborCount < 2) {
      clustering.set(serviceName, 0)
      continue
    }

    const edgesBetweenNeighbors = pipe(
      neighbors,
      Array.flatMap((n1) =>
        pipe(
          neighbors,
          Array.filter((n2) => n1 < n2),
          Array.map((n2) => ({ n1, n2 }))
        )
      ),
      Array.filter(({ n1, n2 }) =>
        Graph.neighbors(analysisGraph.graph, n1).includes(n2)
      )
    ).length

    const possibleEdges = (neighborCount * (neighborCount - 1)) / 2
    clustering.set(serviceName, edgesBetweenNeighbors / possibleEdges)
  }

  return clustering
}

const countConnectedComponents = (
  analysisGraph: AnalysisGraph,
  excludeNode?: Graph.NodeIndex
): number => {
  const visited = new Set<Graph.NodeIndex>()
  const nodeIndices = Array.fromIterable(analysisGraph.serviceIndex.values())
  const validNodes = excludeNode !== undefined
    ? nodeIndices.filter(idx => idx !== excludeNode)
    : nodeIndices

  let componentCount = 0

  for (const startIndex of validNodes) {
    if (visited.has(startIndex)) continue

    componentCount++
    const walker = Graph.dfs(analysisGraph.graph, {
      start: [startIndex]
    })

    for (const [idx] of walker) {
      if (excludeNode === undefined || idx !== excludeNode) {
        visited.add(idx)
      }
    }
  }

  return componentCount
}

export interface BlastRadiusResult {
  readonly service: string
  readonly downstream: ReadonlyArray<{
    readonly depth: number
    readonly services: ReadonlyArray<string>
  }>
  readonly downstreamCount: number
  readonly risk: "HIGH" | "MEDIUM" | "LOW"
}

export interface AncestorsResult {
  readonly service: string
  readonly ancestors: ReadonlyArray<{
    readonly depth: number
    readonly services: ReadonlyArray<string>
  }>
  readonly totalCount: number
}

const groupByDepth = (
  analysisGraph: AnalysisGraph,
  startIdx: Graph.NodeIndex,
  direction: "incoming" | "outgoing"
): ReadonlyArray<{ readonly depth: number; readonly services: ReadonlyArray<string> }> => {
  const depthMap = new Map<Graph.NodeIndex, number>()
  const visited = new Set<Graph.NodeIndex>()

  depthMap.set(startIdx, 0)
  visited.add(startIdx)

  const queue: Array<{ idx: Graph.NodeIndex; depth: number }> = [{ idx: startIdx, depth: 0 }]

  while (queue.length > 0) {
    const { idx, depth } = queue.shift()!

    const neighbors = Graph.neighborsDirected(analysisGraph.graph, idx, direction)

    for (const neighborIdx of neighbors) {
      if (!visited.has(neighborIdx)) {
        visited.add(neighborIdx)
        depthMap.set(neighborIdx, depth + 1)
        queue.push({ idx: neighborIdx, depth: depth + 1 })
      }
    }
  }

  const levelGroups = new Map<number, string[]>()

  for (const [idx, depth] of depthMap) {
    if (idx === startIdx) continue

    const node = Graph.getNode(analysisGraph.graph, idx)
    if (Option.isSome(node)) {
      const group = levelGroups.get(depth) ?? []
      group.push(node.value.name)
      levelGroups.set(depth, group)
    }
  }

  return pipe(
    Array.fromIterable(levelGroups.entries()),
    Array.map(([depth, services]) => ({
      depth,
      services: services.sort()
    })),
    Array.sort(Order.mapInput(Order.number, (item: { depth: number; readonly services: ReadonlyArray<string> }) => item.depth))
  )
}

export const computeBlastRadius = (
  analysisGraph: AnalysisGraph,
  serviceName: string
): Option.Option<BlastRadiusResult> => {
  const serviceIdx = analysisGraph.serviceIndex.get(serviceName)
  if (serviceIdx === undefined) return Option.none()

  const downstream = groupByDepth(analysisGraph, serviceIdx, "incoming")
  const downstreamCount = pipe(
    downstream,
    Array.flatMap((level) => level.services)
  ).length

  const risk = downstreamCount >= 5 ? "HIGH" : downstreamCount >= 3 ? "MEDIUM" : "LOW"

  return Option.some({
    service: serviceName,
    downstream,
    downstreamCount,
    risk
  })
}

export const computeAncestors = (
  analysisGraph: AnalysisGraph,
  serviceName: string
): Option.Option<AncestorsResult> => {
  const serviceIdx = analysisGraph.serviceIndex.get(serviceName)
  if (serviceIdx === undefined) return Option.none()

  const ancestors = groupByDepth(analysisGraph, serviceIdx, "outgoing")
  const totalCount = pipe(
    ancestors,
    Array.flatMap((level) => level.services)
  ).length

  return Option.some({
    service: serviceName,
    ancestors,
    totalCount
  })
}

export const renderBlastRadius = (result: BlastRadiusResult): string => {
  const sections: string[] = []
  sections.push(`<blast_radius service="${result.service}">`)

  sections.push(`  <downstream n="${result.downstreamCount}" risk="${result.risk}">`)
  if (result.downstream.length > 0) {
    result.downstream.forEach((level) => {
      sections.push(`    <level depth="${level.depth}" count="${level.services.length}">`)
      level.services.forEach((service) => {
        sections.push(`      <service>${service}</service>`)
      })
      sections.push(`    </level>`)
    })
  }
  sections.push(`  </downstream>`)

  sections.push(`</blast_radius>`)
  return sections.join("\n")
}

export const renderAncestors = (result: AncestorsResult): string => {
  const sections: string[] = []
  sections.push(`<ancestors service="${result.service}">`)

  sections.push(`  <dependencies n="${result.totalCount}">`)
  if (result.ancestors.length > 0) {
    result.ancestors.forEach((level) => {
      sections.push(`    <level depth="${level.depth}" count="${level.services.length}">`)
      level.services.forEach((service) => {
        sections.push(`      <service>${service}</service>`)
      })
      sections.push(`    </level>`)
    })
  }
  sections.push(`  </dependencies>`)

  sections.push(`</ancestors>`)
  return sections.join("\n")
}

export interface CommonAncestor {
  readonly service: string
  readonly coverage: number
  readonly affectedBy: ReadonlyArray<string>
  readonly risk: "HIGH" | "MEDIUM" | "LOW"
}

export interface CommonAncestorsResult {
  readonly inputServices: ReadonlyArray<string>
  readonly commonDependencies: ReadonlyArray<CommonAncestor>
  readonly rootCauseCandidates: ReadonlyArray<{
    readonly rank: number
    readonly service: string
    readonly coverage: number
  }>
}

const intersection = <T>(sets: ReadonlyArray<Set<T>>): Set<T> => {
  if (sets.length === 0) return new Set()
  if (sets.length === 1) return sets[0]

  return pipe(
    sets.slice(1),
    Array.reduce(sets[0], (acc, set) => new Set([...acc].filter(x => set.has(x))))
  )
}

export const computeCommonAncestors = (
  analysisGraph: AnalysisGraph,
  serviceNames: ReadonlyArray<string>
): CommonAncestorsResult => {
  const dependencySets = new Map<string, Set<Graph.NodeIndex>>()

  for (const serviceName of serviceNames) {
    const nodeIndex = analysisGraph.serviceIndex.get(serviceName)
    if (nodeIndex === undefined) {
      dependencySets.set(serviceName, new Set())
      continue
    }

    const walker = Graph.bfs(analysisGraph.graph, {
      start: [nodeIndex],
      direction: "outgoing"
    })

    const deps = pipe(
      Graph.indices(walker),
      Array.fromIterable,
      Array.filter(idx => idx !== nodeIndex),
      (indices) => new Set(indices)
    )

    dependencySets.set(serviceName, deps)
  }

  const depSetArray = Array.fromIterable(dependencySets.values())
  if (depSetArray.length === 0) {
    return {
      inputServices: serviceNames,
      commonDependencies: [],
      rootCauseCandidates: []
    }
  }

  const commonIndices = intersection(depSetArray)

  const coverageMap = new Map<Graph.NodeIndex, Set<string>>()
  for (const [serviceName, depSet] of dependencySets.entries()) {
    for (const depIndex of commonIndices) {
      if (depSet.has(depIndex)) {
        const affected = coverageMap.get(depIndex) ?? new Set<string>()
        affected.add(serviceName)
        coverageMap.set(depIndex, affected)
      }
    }
  }

  const commonDependencies = pipe(
    Array.fromIterable(commonIndices),
    Array.filterMap((depIndex) => {
      const node = Graph.getNode(analysisGraph.graph, depIndex)
      if (Option.isNone(node)) return Option.none()

      const affectedBySet = coverageMap.get(depIndex) ?? new Set<string>()
      const affectedBy = Array.fromIterable(affectedBySet)
      const coverage = affectedBy.length

      const risk: "HIGH" | "MEDIUM" | "LOW" =
        coverage === serviceNames.length ? "HIGH"
        : coverage >= serviceNames.length * 0.5 ? "MEDIUM"
        : "LOW"

      return Option.some({
        service: node.value.name,
        coverage,
        affectedBy,
        risk
      })
    }),
    Array.sort(
      Order.reverse(
        Order.combine(
          Order.mapInput(Order.number, (a: CommonAncestor) => a.coverage),
          Order.mapInput(Order.string, (a: CommonAncestor) => a.service)
        )
      )
    )
  )

  const rootCauseCandidates = pipe(
    commonDependencies,
    Array.take(5),
    Array.map((ancestor, index) => ({
      rank: index + 1,
      service: ancestor.service,
      coverage: ancestor.coverage
    }))
  )

  return {
    inputServices: serviceNames,
    commonDependencies,
    rootCauseCandidates
  }
}

export const renderCommonAncestors = (result: CommonAncestorsResult): string => {
  const sections: string[] = []

  sections.push(`<common_ancestors n="${result.inputServices.length}">`)

  sections.push("  <input>")
  for (const service of result.inputServices) {
    sections.push(`    <service>${service}</service>`)
  }
  sections.push("  </input>")
  sections.push("")

  sections.push(`  <shared_dependencies n="${result.commonDependencies.length}">`)
  for (const dep of result.commonDependencies) {
    const coverageStr = `${dep.coverage}/${result.inputServices.length}`
    sections.push(`    <dependency coverage="${coverageStr}" risk="${dep.risk}">`)
    sections.push(`      <service>${dep.service}</service>`)
    sections.push(`      <affected_by>${dep.affectedBy.join(", ")}</affected_by>`)
    sections.push(`    </dependency>`)
  }
  sections.push("  </shared_dependencies>")
  sections.push("")

  sections.push("  <root_cause_candidates>")
  for (const candidate of result.rootCauseCandidates) {
    const coveragePct = Math.round((candidate.coverage / result.inputServices.length) * 100)
    sections.push(`    <candidate rank="${candidate.rank}" service="${candidate.service}" coverage="${coveragePct}%" />`)
  }
  sections.push("  </root_cause_candidates>")

  sections.push("</common_ancestors>")

  return sections.join("\n")
}

const detectCutVerticesAndDomains = (analysisGraph: AnalysisGraph): DomainAnalysis => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph)
  if (nodeCount === 0) return { cutVertices: [], domains: [] }

  const baseComponentCount = countConnectedComponents(analysisGraph)

  const cutVertexIndices = pipe(
    Array.fromIterable(analysisGraph.serviceIndex.values()),
    Array.filter((nodeIndex) => {
      const componentCountWithoutNode = countConnectedComponents(analysisGraph, nodeIndex)
      return componentCountWithoutNode > baseComponentCount
    })
  )

  const cutVertexNames = pipe(
    cutVertexIndices,
    Array.filterMap((idx) => {
      const nodeOption = Graph.getNode(analysisGraph.graph, idx)
      return Option.isSome(nodeOption) ? Option.some(nodeOption.value.name) : Option.none()
    })
  )

  const cutVertexSet = new Set(cutVertexIndices)
  const nodeIndicesWithoutCutVertices = pipe(
    Array.fromIterable(analysisGraph.serviceIndex.values()),
    Array.filter((idx) => !cutVertexSet.has(idx))
  )

  if (nodeIndicesWithoutCutVertices.length === 0) {
    return { cutVertices: cutVertexNames, domains: [] }
  }

  const visited = new Set<Graph.NodeIndex>()
  const domainsList: Domain[] = []

  for (const startIndex of nodeIndicesWithoutCutVertices) {
    if (visited.has(startIndex)) continue

    const componentServices: string[] = []
    const walker = Graph.dfs(analysisGraph.graph, {
      start: [startIndex]
    })

    for (const [idx, service] of walker) {
      if (!cutVertexSet.has(idx) && !visited.has(idx)) {
        visited.add(idx)
        componentServices.push(service.name)
      }
    }

    if (componentServices.length > 0) {
      domainsList.push({
        name: `Domain${domainsList.length + 1}`,
        services: componentServices.sort(),
        size: componentServices.length
      })
    }
  }

  const sortedDomains = pipe(
    domainsList,
    Array.filter((d: Domain) => d.size >= 2),
    Array.sort(Order.reverse(Order.mapInput(Order.number, (d: Domain) => d.size)))
  )

  return {
    cutVertices: cutVertexNames,
    domains: sortedDomains
  }
}

const computeWarnings = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): Warnings => {
  const layerByService = buildLayerMap(graph.layers)
  const indegrees = computeIndegrees(analysisGraph)
  const outdegrees = computeOutdegrees(analysisGraph)

  const redundant: RedundantWarning[] = []
  graph.layers.forEach((layer) => {
    const direct = new Set(layer.dependencies)
    layer.dependencies.forEach((dep) => {
      const depLayer = layerByService.get(dep)
      const transitive = depLayer?.dependencies ?? []
      transitive.forEach((t) => {
        if (direct.has(t)) {
          redundant.push({
            service: layer.serviceName,
            target: t,
            via: dep
          })
        }
      })
    })
  })

  const hot: HotWarning[] = []
  indegrees.forEach((count, service) => {
    if (count >= 4) {
      hot.push({ service, count })
    }
  })
  hot.sort((a, b) => b.count - a.count)

  const orphan: string[] = []
  graph.services.forEach((s) => {
    const inDeg = indegrees.get(s.name) ?? 0
    const outDeg = outdegrees.get(s.name) ?? 0
    if (inDeg === 0 && outDeg === 0) {
      orphan.push(s.name)
    }
  })

  const wide: WideWarning[] = []
  graph.layers.forEach((layer) => {
    if (layer.dependencies.length >= 5) {
      wide.push({ service: layer.serviceName, count: layer.dependencies.length })
    }
  })
  wide.sort((a, b) => b.count - a.count)

  return { redundant, hot, orphan, wide }
}

const renderLocations = (graph: ArchitectureGraph): string => {
  const locationLines = graph.services.map((s) => `  ${s.name} (${makeShortPath(s.path)})`)
  return `<locations n="${graph.services.length}">\n${locationLines.join("\n")}\n</locations>`
}

const renderNodeClassification = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const layerByService = buildLayerMap(graph.layers)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const orphanCount = grouped.orphans.length
  const rootCount = grouped.root.length
  const intermediateCount = grouped.intermediate.length
  const leafCount = grouped.leaf.length
  const vmCount = grouped.vm.length
  const total = orphanCount + rootCount + intermediateCount + leafCount + vmCount

  const sections: string[] = []
  sections.push(`<node_classification n="${total}">`)
  if (orphanCount > 0) {
    sections.push(`  <orphan n="${orphanCount}">${grouped.orphans.map((s) => s.name).join(", ")}</orphan>`)
  }
  sections.push(`  <root n="${rootCount}">${grouped.root.map((s) => s.name).join(", ")}</root>`)
  sections.push(`  <intermediate n="${intermediateCount}">${grouped.intermediate.map((s) => s.name).join(", ")}</intermediate>`)
  sections.push(`  <leaf n="${leafCount}">${grouped.leaf.map((s) => s.name).join(", ")}</leaf>`)
  sections.push(`  <vm n="${vmCount}">${grouped.vm.map((s) => s.name).join(", ")}</vm>`)
  sections.push(`</node_classification>`)

  return sections.join("\n")
}

const renderEdges = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const layerByService = buildLayerMap(graph.layers)
  const ordered = orderServicesByDependencyCount(graph, analysisGraph)

  const edgeLines = ordered.map((item) => {
    const deps = item.layer?.dependencies ?? []

    const errorTypes = item.layer?.errorTypes ?? []
    const serviceName = item.service.name
    const isParametrized = item.layer?.isParametrized ?? false

    const errorUnion = errorTypes.length > 0 ? errorTypes.join(" | ") : "never"
    const depUnion = deps.length > 0 ? deps.join(" | ") : "never"

    const prefix = isParametrized ? "() => " : ""
    return `  ${prefix}${serviceName}<${errorUnion}, ${depUnion}>`
  })

  return `<adjacency_list n="${graph.services.length}">\n${edgeLines.join("\n")}\n</adjacency_list>`
}

const renderInvariants = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const violations = checkInvariants(graph, analysisGraph)
  const violationsByInv = new Map<string, boolean>()

  violations.forEach(v => {
    violationsByInv.set(v.invariant, true)
  })

  const invariants = [
    { id: "1", description: "VMs never depend on VMs" },
    { id: "2", description: "Services never depend on VMs" },
    { id: "3", description: "Graph is acyclic" },
    { id: "4", description: "Root services have no dependencies" },
    { id: "5", description: "Intermediate services only depend on root or intermediate" }
  ]

  const sections: string[] = []
  sections.push("<invariants>")
  invariants.forEach(inv => {
    const status = violationsByInv.has(`INV-${inv.id}`) ? "fail" : "pass"
    sections.push(`  <inv id="${inv.id}" status="${status}">${inv.description}</inv>`)
  })
  sections.push("</invariants>")

  return sections.join("\n")
}

const renderWarnings = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): string => {
  const warnings = computeWarnings(graph, analysisGraph)
  const sections: string[] = []

  sections.push("<warnings>")

  const redundantDesc = "Direct dependency exists alongside indirect path. May be intentional (performance) or accidental (refactor remnant)."
  sections.push(`  <redundant n="${warnings.redundant.length}" description="${redundantDesc}">`)
  if (warnings.redundant.length > 0) {
    warnings.redundant.forEach((w) => {
      sections.push(`    ${w.service} → ${w.target} (redundant via ${w.via})`)
    })
  }
  sections.push(`  </redundant>`)

  const hotDesc = "Service with many dependents (≥4). Changes cascade widely. Needs comprehensive tests and stability."
  sections.push(`  <hot n="${warnings.hot.length}" description="${hotDesc}">`)
  if (warnings.hot.length > 0) {
    warnings.hot.forEach((h) => {
      sections.push(`    ${h.service} (${h.count} dependents)`)
    })
  }
  sections.push(`  </hot>`)

  const wideDesc = "Service with many dependencies (≥5). Complex integration point. For VMs: acceptable. For services: may violate SRP."
  if (warnings.wide.length > 0) {
    sections.push(`  <wide n="${warnings.wide.length}" description="${wideDesc}">`)
    warnings.wide.forEach((w) => {
      sections.push(`    ${w.service} (${w.count} dependencies)`)
    })
    sections.push(`  </wide>`)
  } else {
    sections.push(`  <wide n="0" description="${wideDesc}" />`)
  }

  const parametrizedLayers = graph.layers.filter(layer => layer.isParametrized)
  const parametrizedDesc = "Layers created by factory functions. May indicate runtime configuration or non-static dependencies."
  if (parametrizedLayers.length > 0) {
    sections.push(`  <parametrized_layers n="${parametrizedLayers.length}" severity="moderate" description="${parametrizedDesc}">`)
    parametrizedLayers.forEach((layer) => {
      sections.push(`    ${layer.serviceName} (${layer.factoryName})`)
    })
    sections.push(`  </parametrized_layers>`)
  } else {
    sections.push(`  <parametrized_layers n="0" severity="moderate" description="${parametrizedDesc}" />`)
  }

  sections.push("</warnings>")

  return sections.join("\n")
}

const renderViolations = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): string => {
  const violations = checkInvariants(graph, analysisGraph)

  if (violations.length === 0) {
    return `<violations n="0" />`
  }

  const sections: string[] = []
  sections.push(`<violations n="${violations.length}">`)
  violations.forEach((v) => {
    sections.push(`  ${v.invariant}: ${v.description}`)
  })
  sections.push("</violations>")

  return sections.join("\n")
}

const renderMetrics = (metrics: GraphMetrics): string => {
  const sections: string[] = []
  sections.push("<metrics>")

  const densityStatus =
    metrics.density < 0.2 ? "good" :
    metrics.density < 0.4 ? "moderate" :
    "bad"

  const densityMessage =
    metrics.density < 0.2 ? "Sparse architecture with loose coupling (below 0.2 threshold)" :
    metrics.density < 0.4 ? "Moderate coupling (0.2-0.4 range)" :
    "Dense architecture with tight coupling (above 0.4 threshold)"

  sections.push(`  <density value="${metrics.density.toFixed(3)}" status="${densityStatus}" description="${densityMessage}">${densityMessage}</density>`)

  const diameterStatus =
    metrics.diameter <= 3 ? "good" :
    metrics.diameter <= 5 ? "moderate" :
    "bad"

  const diameterMessage =
    metrics.diameter <= 3 ? "Shallow dependency chains (≤3 hops)" :
    metrics.diameter <= 5 ? "Moderate depth (4-5 hops)" :
    "Deep dependency chains (>5 hops)"

  sections.push(`  <diameter value="${metrics.diameter}" status="${diameterStatus}" description="${diameterMessage}">${diameterMessage}</diameter>`)

  const avgDegreeStatus =
    metrics.averageDegree < 2 ? "good" :
    metrics.averageDegree < 4 ? "moderate" :
    "bad"

  const avgDegreeMessage =
    metrics.averageDegree < 2 ? "Minimal coupling (< 2 connections per service)" :
    metrics.averageDegree < 4 ? "Moderate connectivity (2-4 connections per service)" :
    "High connectivity (≥4 connections per service)"

  sections.push(`  <average_degree value="${metrics.averageDegree.toFixed(2)}" status="${avgDegreeStatus}" description="${avgDegreeMessage}">${avgDegreeMessage}</average_degree>`)

  sections.push("</metrics>")
  return sections.join("\n")
}

const renderAdvancedMetrics = (metrics: AdvancedMetrics): string => {
  const sections: string[] = []
  sections.push("<advanced_metrics>")

  const betweennessDesc = "Measures how many shortest paths pass through each service. High values indicate critical services."
  const topBetweenness = pipe(
    Array.fromIterable(metrics.betweennessCentrality.entries()),
    Array.filter(([_, value]) => value > 0),
    Array.sort(Order.reverse(Order.mapInput(Order.number, ([_, value]: [string, number]) => value))),
    Array.take(10)
  )

  sections.push(`  <betweenness_centrality n="${topBetweenness.length}" description="${betweennessDesc}">`)
  if (topBetweenness.length > 0) {
    topBetweenness.forEach(([serviceName, value]) => {
      sections.push(`    ${serviceName} ${value.toFixed(2)}`)
    })
  }
  sections.push(`  </betweenness_centrality>`)

  const clusteringDesc = "Local clustering coefficient for each service. 1.0 means neighbors are fully connected."
  const topClustering = pipe(
    Array.fromIterable(metrics.clusteringCoefficient.entries()),
    Array.filter(([_, value]) => value > 0),
    Array.sort(Order.reverse(Order.mapInput(Order.number, ([_, value]: [string, number]) => value))),
    Array.take(10)
  )

  sections.push(`  <clustering_coefficient n="${topClustering.length}" description="${clusteringDesc}">`)
  if (topClustering.length > 0) {
    topClustering.forEach(([serviceName, value]) => {
      sections.push(`    ${serviceName} ${value.toFixed(2)}`)
    })
  }
  sections.push(`  </clustering_coefficient>`)

  const bridgeDesc = "Cut vertices connecting domains"
  const bridges = metrics.domainAnalysis.cutVertices
  sections.push(`  <domain_bridges n="${bridges.length}" description="${bridgeDesc}">`)
  if (bridges.length > 0) {
    bridges.forEach(serviceName => {
      sections.push(`    ${serviceName}`)
    })
  }
  sections.push(`  </domain_bridges>`)

  const domainDesc = "Isolated subgraphs after removing bridges"
  const domains = metrics.domainAnalysis.domains
  sections.push(`  <domains n="${domains.length}" description="${domainDesc}">`)
  domains.forEach(domain => {
    sections.push(`    <domain name="${domain.name}" size="${domain.size}">`)
    sections.push(`      ${domain.services.join(", ")}`)
    sections.push(`    </domain>`)
  })
  sections.push(`  </domains>`)

  sections.push("</advanced_metrics>")
  return sections.join("\n")
}

const renderWorkflows = (expanded: boolean): string => {
  const lines: string[] = []

  if (expanded) {
    lines.push("  <workflows>")

    lines.push("    <workflow name=\"Impact Assessment\">")
    lines.push("      <step>1. Run: architecture blast-radius ServiceName</step>")
    lines.push("      <step>2. Check downstream count and risk level</step>")
    lines.push("      <step>3. Review affected services by depth</step>")
    lines.push("      <step>4. Plan testing strategy based on risk</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Root Cause Analysis\">")
    lines.push("      <step>1. Identify all failing services</step>")
    lines.push("      <step>2. Run: architecture common-ancestors Service1 Service2 Service3</step>")
    lines.push("      <step>3. Check dependencies with 100% coverage (all services depend on it)</step>")
    lines.push("      <step>4. Investigate top root cause candidate first</step>")
    lines.push("      <step>5. Check recent changes to identified dependency</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Architecture Health Check\">")
    lines.push("      <step>1. Run: architecture metrics</step>")
    lines.push("      <step>2. Check density (should be less than 0.2 for good coupling)</step>")
    lines.push("      <step>3. Check diameter (should be less than or equal to 3 for shallow chains)</step>")
    lines.push("      <step>4. Run: architecture analyze --all for full analysis if metrics are concerning</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Domain Discovery\">")
    lines.push("      <step>1. Run: architecture domains</step>")
    lines.push("      <step>2. Identify domain bridges (cut vertices)</step>")
    lines.push("      <step>3. Review domain groupings</step>")
    lines.push("      <step>4. Consider package splits along domain boundaries</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Debugging Cascading Failures\">")
    lines.push("      <step>1. List all failing services</step>")
    lines.push("      <step>2. Run: architecture common-ancestors Service1 Service2 ...</step>")
    lines.push("      <step>3. Identify shared dependencies with highest coverage</step>")
    lines.push("      <step>4. Check logs and recent changes for root cause candidates</step>")
    lines.push("      <step>5. Verify fix propagates to all affected services</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Hot Service Investigation\">")
    lines.push("      <step>1. Run: architecture hot-services</step>")
    lines.push("      <step>2. For each hot service, run: architecture blast-radius ServiceName</step>")
    lines.push("      <step>3. Assess test coverage and stability requirements</step>")
    lines.push("      <step>4. Document breaking change process for high-risk services</step>")
    lines.push("      <step>5. Consider interface versioning or deprecation strategies</step>")
    lines.push("    </workflow>")

    lines.push("    <workflow name=\"Identifying Architectural Smells\">")
    lines.push("      <step>1. Run: architecture analyze --all</step>")
    lines.push("      <step>2. Check metrics: density &gt;0.4, diameter &gt;5, avg degree &gt;4</step>")
    lines.push("      <step>3. Review advanced metrics for high betweenness (god services)</step>")
    lines.push("      <step>4. Check warnings section for redundant deps and wide services</step>")
    lines.push("      <step>5. Prioritize refactoring based on risk and impact</step>")
    lines.push("    </workflow>")

    lines.push("  </workflows>")
  } else {
    lines.push("  <workflows>")
    lines.push("    <workflow name=\"Impact Assessment\"/>")
    lines.push("    <workflow name=\"Root Cause Analysis\"/>")
    lines.push("    <workflow name=\"Architecture Health Check\"/>")
    lines.push("    <workflow name=\"Domain Discovery\"/>")
    lines.push("    <workflow name=\"Debugging Cascading Failures\"/>")
    lines.push("    <workflow name=\"Hot Service Investigation\"/>")
    lines.push("    <workflow name=\"Identifying Architectural Smells\"/>")
    lines.push("    Include \"--workflows\" to see all")
    lines.push("  </workflows>")
  }

  return lines.join("\n")
}

const renderCommandsSummary = (expanded: boolean): string => {
  const lines: string[] = []

  if (expanded) {
    lines.push("  <available_commands>")

    lines.push("    <command name=\"blast-radius\">")
    lines.push("      <usage>architecture blast-radius SERVICE_NAME</usage>")
    lines.push("      <description>Shows downstream impact: all services that depend on this (full transitive closure)</description>")
    lines.push("      <when_to_use>Before making changes to assess blast radius and testing scope</when_to_use>")
    lines.push("      <example>architecture blast-radius TodoQueryService</example>")
    lines.push("      <output>Risk level (HIGH/MEDIUM/LOW), all affected services grouped by depth (unlimited depth)</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"ancestors\">")
    lines.push("      <usage>architecture ancestors SERVICE_NAME</usage>")
    lines.push("      <description>Shows all upstream dependencies (full transitive closure)</description>")
    lines.push("      <when_to_use>To understand complete dependency tree of a service</when_to_use>")
    lines.push("      <example>architecture ancestors SidebarVM</example>")
    lines.push("      <output>All dependencies grouped by depth level (unlimited depth)</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"common-ancestors\">")
    lines.push("      <usage>architecture common-ancestors SERVICE1 SERVICE2 ...</usage>")
    lines.push("      <description>Finds shared dependencies across multiple services</description>")
    lines.push("      <when_to_use>When multiple services fail - identifies root cause candidates</when_to_use>")
    lines.push("      <example>architecture common-ancestors SidebarVM DetailPanelVM StatsPanelVM</example>")
    lines.push("      <output>Shared dependencies ranked by coverage percentage, root cause candidates</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"metrics\">")
    lines.push("      <usage>architecture metrics</usage>")
    lines.push("      <description>Quick health check showing only graph metrics</description>")
    lines.push("      <when_to_use>Fast health assessment or trending over time</when_to_use>")
    lines.push("      <output>Density, diameter, average degree with interpretation thresholds</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"domains\">")
    lines.push("      <usage>architecture domains</usage>")
    lines.push("      <description>Discover architectural domains via cut vertex detection</description>")
    lines.push("      <when_to_use>Understanding module boundaries, planning package splits or microservices</when_to_use>")
    lines.push("      <output>Domain bridges (cut vertices) and grouped services by domain</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"hot-services\">")
    lines.push("      <usage>architecture hot-services</usage>")
    lines.push("      <description>Lists high-risk services with many dependents (≥4)</description>")
    lines.push("      <when_to_use>Identifying critical infrastructure needing stability and comprehensive testing</when_to_use>")
    lines.push("      <output>Services ranked by dependent count</output>")
    lines.push("    </command>")

    lines.push("    <command name=\"format\">")
    lines.push("      <usage>architecture format --format FORMAT</usage>")
    lines.push("      <description>Output analysis in different formats: mermaid, human, adjacency</description>")
    lines.push("      <when_to_use>Visualization (mermaid) or data export (adjacency)</when_to_use>")
    lines.push("      <example>architecture format --format mermaid --output diagram.mmd</example>")
    lines.push("      <formats>")
    lines.push("        <format name=\"mermaid\">Flowchart diagram for visualization</format>")
    lines.push("        <format name=\"human\">Tree structure with root/intermediate/leaf/VM grouping</format>")
    lines.push("        <format name=\"adjacency\">Simple list format for data export</format>")
    lines.push("      </formats>")
    lines.push("    </command>")

    lines.push("  </available_commands>")
  } else {
    lines.push("  <available_commands collapsed=\"true\">")
    lines.push("    <hint>Run with --commands for full command documentation</hint>")
    lines.push("    <available>blast-radius, ancestors, common-ancestors, metrics, domains, hot-services, format</available>")
    lines.push("  </available_commands>")
  }

  return lines.join("\n")
}

const renderDebugSection = (showWorkflows: boolean, showCommands: boolean): string => {
  const lines: string[] = []

  lines.push("<debug>")
  lines.push("  <hint>For impact analysis and debugging, these commands are available</hint>")
  lines.push("  ")

  lines.push(renderCommandsSummary(showCommands))
  lines.push("  ")

  lines.push(renderWorkflows(showWorkflows))

  lines.push("</debug>")

  return lines.join("\n")
}

const renderDomainsFromAdvanced = (advancedMetrics: AdvancedMetrics): string => {
  const sections: string[] = []

  const bridgeDesc = "Cut vertices connecting domains"
  const bridges = advancedMetrics.domainAnalysis.cutVertices
  sections.push(`<domains n="${bridges.length + advancedMetrics.domainAnalysis.domains.length}">`)
  sections.push(`  <domain_bridges n="${bridges.length}" description="${bridgeDesc}">`)
  if (bridges.length > 0) {
    bridges.forEach(serviceName => {
      sections.push(`    ${serviceName}`)
    })
  }
  sections.push(`  </domain_bridges>`)

  const domainDesc = "Isolated subgraphs after removing bridges"
  const domains = advancedMetrics.domainAnalysis.domains
  sections.push(`  <isolated_domains n="${domains.length}" description="${domainDesc}">`)
  domains.forEach(domain => {
    sections.push(`    <domain name="${domain.name}" size="${domain.size}">`)
    sections.push(`      ${domain.services.join(", ")}`)
    sections.push(`    </domain>`)
  })
  sections.push(`  </isolated_domains>`)
  sections.push("</domains>")

  return sections.join("\n")
}

interface RenderOptions {
  readonly showMetrics: boolean
  readonly showDomains: boolean
  readonly showAdvanced: boolean
  readonly showWarnings: boolean
  readonly showWorkflows: boolean
  readonly showCommands: boolean
}

export const formatAgentWithHints = (
  graph: ArchitectureGraph,
  options: RenderOptions
): string => {
  const analysisGraph = buildAnalysisGraph(graph)
  const layerByService = buildLayerMap(graph.layers)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const metrics: GraphMetrics = {
    density: computeDensity(analysisGraph),
    diameter: computeDiameter(analysisGraph),
    averageDegree: computeAverageDegree(analysisGraph)
  }

  const advancedMetrics: AdvancedMetrics = {
    betweennessCentrality: computeBetweennessCentrality(analysisGraph),
    clusteringCoefficient: computeClusteringCoefficient(analysisGraph),
    domainAnalysis: detectCutVerticesAndDomains(analysisGraph)
  }

  const output: string[] = []

  output.push("<architecture>")
  output.push("")

  output.push(renderLocations(graph))
  output.push("")

  output.push(renderNodeClassification(graph, analysisGraph))
  output.push("")

  output.push(renderEdges(graph, analysisGraph))
  output.push("")

  if (options.showMetrics) {
    output.push(renderMetrics(metrics))
  } else {
    output.push("<metrics collapsed=\"true\">")
    output.push("  <hint>Run with --metrics flag to show graph metrics</hint>")
    output.push("  <description>Graph metrics include density (coupling), diameter (chain length), and average degree (connections per service)</description>")
    output.push("  <usage>architecture analyze --metrics</usage>")
    output.push("</metrics>")
  }
  output.push("")

  if (options.showAdvanced) {
    output.push(renderAdvancedMetrics(advancedMetrics))
  } else {
    output.push("<advanced_metrics collapsed=\"true\">")
    output.push("  <hint>Run with --advanced flag for betweenness centrality and clustering analysis</hint>")
    output.push("  <description>Advanced metrics identify god services, tight clusters, and architectural smells</description>")
    output.push("  <usage>architecture analyze --advanced</usage>")
    output.push("</advanced_metrics>")
  }
  output.push("")

  if (options.showDomains) {
    output.push(renderDomainsFromAdvanced(advancedMetrics))
  } else {
    output.push("<domains collapsed=\"true\">")
    output.push("  <hint>Run with --domains flag to discover architectural domain boundaries</hint>")
    output.push("  <description>Domain analysis uses cut vertex detection to identify natural module boundaries and services that bridge separate domains</description>")
    output.push("  <usage>architecture analyze --domains</usage>")
    output.push("</domains>")
  }
  output.push("")

  if (grouped.orphans.length > 0) {
    const orphanLines = grouped.orphans.map(s => `  ${s.name} (${makeShortPath(s.path)})`)
    output.push(`<orphans n="${grouped.orphans.length}">`)
    output.push(orphanLines.join("\n"))
    output.push("</orphans>")
  } else {
    output.push(`<orphans n="0" />`)
  }
  output.push("")

  output.push(renderInvariants(graph, analysisGraph))
  output.push("")

  if (options.showWarnings) {
    output.push(renderWarnings(graph, analysisGraph))
  } else {
    const warnings = computeWarnings(graph, analysisGraph)
    const warningCount =
      (warnings.redundant?.length ?? 0) +
      (warnings.hot?.length ?? 0) +
      (warnings.wide?.length ?? 0)

    output.push("<warnings collapsed=\"true\">")
    output.push(`  <hint>${warningCount} potential warnings found (run with --warnings for details)</hint>`)
    output.push("  <summary>")
    output.push(`    <redundant n="${warnings.redundant?.length ?? 0}" />`)
    output.push(`    <hot n="${warnings.hot?.length ?? 0}" />`)
    output.push(`    <wide n="${warnings.wide?.length ?? 0}" />`)
    output.push("  </summary>")
    output.push("</warnings>")
  }
  output.push("")

  output.push(renderViolations(graph, analysisGraph))
  output.push("")

  output.push(renderDebugSection(options.showWorkflows, options.showCommands))
  output.push("")

  output.push("</architecture>")

  return output.join("\n")
}

export const formatAgent = (graph: ArchitectureGraph): string => {
  const analysisGraph = buildAnalysisGraph(graph)
  const layerByService = buildLayerMap(graph.layers)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const metrics: GraphMetrics = {
    density: computeDensity(analysisGraph),
    diameter: computeDiameter(analysisGraph),
    averageDegree: computeAverageDegree(analysisGraph)
  }

  const advancedMetrics: AdvancedMetrics = {
    betweennessCentrality: computeBetweennessCentrality(analysisGraph),
    clusteringCoefficient: computeClusteringCoefficient(analysisGraph),
    domainAnalysis: detectCutVerticesAndDomains(analysisGraph)
  }

  const output: string[] = []

  output.push(renderLocations(graph))
  output.push("")

  output.push(renderNodeClassification(graph, analysisGraph))
  output.push("")

  output.push(renderEdges(graph, analysisGraph))
  output.push("")

  output.push(renderMetrics(metrics))
  output.push("")

  if (grouped.orphans.length > 0) {
    const orphanLines = grouped.orphans.map(s => `  ${s.name} (${makeShortPath(s.path)})`)
    output.push(`<orphans n="${grouped.orphans.length}">`)
    output.push(orphanLines.join("\n"))
    output.push("</orphans>")
  } else {
    output.push(`<orphans n="0" />`)
  }
  output.push("")

  output.push(renderInvariants(graph, analysisGraph))
  output.push("")

  output.push(renderWarnings(graph, analysisGraph))
  output.push("")

  output.push(renderAdvancedMetrics(advancedMetrics))
  output.push("")

  output.push(renderViolations(graph, analysisGraph))

  return output.join("\n")
}

interface ServiceWithIndex {
  readonly service: ServiceDefinition
  readonly layer: LayerDefinition | undefined
  readonly index: Graph.NodeIndex
  readonly depCount: number
}

const orderServicesByDependencyCount = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): ReadonlyArray<ServiceWithIndex> => {
  const layerByService = buildLayerMap(graph.layers)

  return pipe(
    graph.services,
    Array.filterMap((service) => {
      const nodeIndex = analysisGraph.serviceIndex.get(service.name)
      if (nodeIndex === undefined) return Option.none()

      const depCount = Graph.neighbors(analysisGraph.graph, nodeIndex).length

      return Option.some({
        service,
        layer: layerByService.get(service.name),
        index: nodeIndex,
        depCount
      })
    }),
    Array.sort(
      Order.mapInput(Order.number, (item: ServiceWithIndex) => item.depCount)
    )
  )
}

const formatErrorInfo = (errorTypes: ReadonlyArray<string>, showErrors: boolean): string => {
  const errorCount = errorTypes.length

  if (errorCount === 0) {
    return showErrors ? " (no runtime errors)" : ""
  }

  if (showErrors) {
    return ` (errors: ${errorTypes.join(" | ")})`
  }

  return ` (${errorCount} runtime error${errorCount > 1 ? "s" : ""})`
}

export const formatAdjacencyList = (
  graph: ArchitectureGraph,
  showErrors: boolean
): string => {
  const analysisGraph = buildAnalysisGraph(graph)
  const ordered = orderServicesByDependencyCount(graph, analysisGraph)

  const maxNameLength = Math.max(...ordered.map(item => item.service.name.length))

  const lines = pipe(
    ordered,
    Array.map((item) => {
      const deps = pipe(
        Graph.neighbors(analysisGraph.graph, item.index),
        Array.filterMap((depIndex) => {
          const node = Graph.getNode(analysisGraph.graph, depIndex)
          return Option.isSome(node) ? Option.some(node.value.name) : Option.none()
        })
      )

      const errorTypes = item.layer?.errorTypes ?? []
      const errorInfo = formatErrorInfo(errorTypes, showErrors)

      const depCount = deps.length
      const paddedName = item.service.name.padEnd(maxNameLength)

      const depDisplay = depCount === 0
        ? "→ ∅"
        : `${depCount} → ${deps.join(", ")}`

      return `${paddedName} ${depDisplay}${errorInfo}`
    })
  )

  const indentedLines = lines.map(line => `  ${line}`)
  return `# Edges (direct deps only)\n${indentedLines.join("\n")}`
}

export const generateStats = (graph: ArchitectureGraph): string => {
  const stats = computeStats(graph)

  const depLines = stats.depCounts.map((d) => `- ${d.name}: ${d.count} dependents`)
  const complexLines = stats.complexLayers.map(
    (l) => `- ${l.name}: ${l.dependencies.length} dependencies`
  )

  return [
    "## Architecture Statistics",
    "",
    `- **Services:** ${stats.serviceCount}`,
    `- **ViewModels:** ${stats.vmCount}`,
    `- **Layers:** ${graph.layers.length}`,
    "",
    "### Most Depended-On Services",
    ...depLines,
    "",
    "### Most Complex Layers (by dependency count)",
    ...complexLines
  ].join("\n")
}

type OutputFormat = "mermaid" | "human" | "agent" | "adjacency"

const formatOption = Options.choice("format", ["mermaid", "human", "agent", "adjacency"]).pipe(
  Options.withDefault("agent" as OutputFormat),
  Options.withDescription("Output format: mermaid (diagram), human (tree), agent (formal spec), adjacency (list)")
)

const outputOption = Options.text("output").pipe(
  Options.optional,
  Options.withDescription("Output file path (mermaid format only)")
)

const showErrorsOption = Options.boolean("show-errors").pipe(
  Options.withDefault(false),
  Options.withDescription("Show detailed error types in adjacency list output")
)

const analyzeArchitecture = Command.make(
  "analyze-architecture",
  {
    format: formatOption,
    output: outputOption,
    showErrors: showErrorsOption
  },
  ({ format, output, showErrors }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      const graph = yield* buildArchitectureGraph("./src")

      const content =
        format === "mermaid"
          ? formatMermaid(graph)
          : format === "human"
            ? formatHuman(graph)
            : format === "adjacency"
              ? formatAdjacencyList(graph, showErrors)
              : formatAgent(graph)

      if (format === "mermaid" && Option.isSome(output)) {
        yield* fs.writeFileString(output.value, content)
        yield* Console.log(`Mermaid diagram written to ${output.value}`)
      } else {
        yield* Console.log(content)
      }

      if (format === "mermaid" && Option.isNone(output)) {
        yield* Console.log("")
        yield* Console.log("=== STATISTICS ===")
        yield* Console.log("")
        yield* Console.log(generateStats(graph))
      }
    })
)

const cli = Command.run(analyzeArchitecture, {
  name: "analyze-architecture",
  version: "1.0.0"
})

if (import.meta.main) {
  pipe(
    cli(process.argv),
    Effect.provide(BunContext.layer),
    BunRuntime.runMain
  )
}
