#!/usr/bin/env bun
import * as Args from "@effect/cli/Args"
import * as CliApp from "@effect/cli/CliApp"
import * as Command from "@effect/cli/Command"
import * as PlatformError from "@effect/platform/Error"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Array from "effect/Array"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Graph from "effect/Graph"
import * as Option from "effect/Option"
import * as Order from "effect/Order"
import * as ts from "typescript"
import { formatAgentWithHints, buildArchitectureGraph } from "../analyze-architecture"

interface ServiceDefinition {
  readonly name: string
  readonly path: string
  readonly line: number
}

interface LayerDefinition {
  readonly name: string
  readonly serviceName: string
  readonly path: string
  readonly line: number
  readonly dependencies: ReadonlyArray<string>
  readonly errorTypes: ReadonlyArray<string>
  readonly isParametrized: boolean
  readonly factoryName?: string
}

interface ArchitectureGraph {
  readonly services: ReadonlyArray<ServiceDefinition>
  readonly layers: ReadonlyArray<LayerDefinition>
}

interface AnalysisGraph {
  readonly graph: Graph.DirectedGraph<ServiceDefinition, void>
  readonly serviceIndex: ReadonlyMap<string, Graph.NodeIndex>
}

const SERVICE_TAG_PATTERN = /export\s+const\s+(\w+)\s*=\s*Context\.GenericTag<\1>/g
const LAYER_SCOPED_PATTERN = /export\s+const\s+(\w+Live)(?::\s*[^=]+)?\s*=\s*Layer\.scoped\(\s*(\w+)\s*,/g
const LAYER_EFFECT_PATTERN = /export\s+const\s+(\w+Live)(?::\s*[^=]+)?\s*=\s*Layer\.effect\(\s*(\w+)\s*,/g

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

const countLinesBefore = (content: string, index: number): number =>
  content.substring(0, index).split("\n").length

const extractServicesFromContent = (
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
}

const extractLayerMatches = (
  content: string
): ReadonlyArray<LayerMatch> => {
  const extractWithPattern = (pattern: RegExp): LayerMatch[] => {
    const results: LayerMatch[] = []
    pattern.lastIndex = 0

    let match: RegExpExecArray | null
    while ((match = pattern.exec(content)) !== null) {
      results.push({
        name: match[1],
        serviceName: match[2],
        line: countLinesBefore(content, match.index)
      })
    }

    return results
  }

  return [
    ...extractWithPattern(LAYER_SCOPED_PATTERN),
    ...extractWithPattern(LAYER_EFFECT_PATTERN)
  ]
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
  if (!moduleSymbol) return { dependencies: [], errorTypes: [] }

  const exports = checker.getExportsOfModule(moduleSymbol)
  const layerExport = exports.find((s) => s.getName() === layerName)

  if (!layerExport) return { dependencies: [], errorTypes: [] }

  const type = checker.getTypeOfSymbol(layerExport)
  const typeString = checker.typeToString(type)

  if (!typeString.startsWith("Layer<")) return { dependencies: [], errorTypes: [] }

  const typeRef = type as ts.TypeReference
  if (!typeRef.typeArguments && !(type as ts.TypeReference).target) {
    const typeArgs = checker.getTypeArguments(typeRef)
    if (typeArgs.length >= 3) {
      return {
        dependencies: extractDepsFromType(typeArgs[2], checker),
        errorTypes: extractErrorTypeNames(typeArgs[1], checker)
      }
    }
  }

  const typeArgs = checker.getTypeArguments(typeRef)
  if (typeArgs.length >= 3) {
    return {
      dependencies: extractDepsFromType(typeArgs[2], checker),
      errorTypes: extractErrorTypeNames(typeArgs[1], checker)
    }
  }

  return { dependencies: [], errorTypes: [] }
}

const createTsProgram = (
  filePaths: ReadonlyArray<string>
): ts.Program => {
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

  return ts.createProgram([...filePaths], compilerOptions)
}

const extractLayersFromContent = (
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
      isParametrized: false,
      factoryName: undefined
    }
  })
}

const findTypeScriptFiles = (directory: string) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const srcPath = path.resolve(directory)

  const srcExists = yield* pipe(
    fs.exists(srcPath),
    Effect.orElseSucceed(() => false)
  )

  if (!srcExists) {
    return []
  }

  const scanDir = (
    dir: string
  ): Effect.Effect<ReadonlyArray<string>, PlatformError.PlatformError, FileSystem.FileSystem | Path.Path> =>
    Effect.gen(function* () {
      const entries = yield* fs.readDirectory(dir)

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

  return yield* scanDir(srcPath)
})

const buildAnalysisGraph = (arch: ArchitectureGraph): AnalysisGraph => {
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

interface GraphMetrics {
  readonly density: number
  readonly diameter: number
  readonly averageDegree: number
}

interface DependencyInfo {
  readonly direct: ReadonlyArray<string>
  readonly indirect: ReadonlyArray<string>
  readonly redundant: ReadonlyArray<string>
}

interface GroupedServices {
  readonly leaf: ReadonlyArray<ServiceDefinition>
  readonly mid: ReadonlyArray<ServiceDefinition>
  readonly vm: ReadonlyArray<ServiceDefinition>
  readonly orphans: ReadonlyArray<ServiceDefinition>
}

const makeShortPath = (fullPath: string): string =>
  fullPath.replace(/^(\.\/)?.*\/src\//, "")

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
  const orphanNames = detectOrphans(analysisGraph)

  const leaf: ServiceDefinition[] = []
  const mid: ServiceDefinition[] = []
  const vm: ServiceDefinition[] = []
  const orphans: ServiceDefinition[] = []

  graph.services.forEach((service) => {
    if (orphanNames.has(service.name)) {
      orphans.push(service)
      return
    }

    const layer = layerByService.get(service.name)
    const hasDeps = (layer?.dependencies.length ?? 0) > 0

    if (service.name.endsWith("VM")) {
      vm.push(service)
    } else if (!hasDeps) {
      leaf.push(service)
    } else {
      mid.push(service)
    }
  })

  return {
    leaf: pipe(leaf, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    mid: pipe(mid, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    vm: pipe(vm, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name))),
    orphans: pipe(orphans, Array.sort(Order.mapInput(Order.string, (s: ServiceDefinition) => s.name)))
  }
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

interface HotWarning {
  readonly service: string
  readonly count: number
}

interface Warnings {
  readonly redundant: ReadonlyArray<unknown>
  readonly hot: ReadonlyArray<HotWarning>
  readonly orphan: ReadonlyArray<string>
  readonly wide: ReadonlyArray<unknown>
}

const computeWarnings = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): Warnings => {
  const layerByService = buildLayerMap(graph.layers)
  const indegrees = computeIndegrees(analysisGraph)

  const hot: HotWarning[] = []
  indegrees.forEach((count, service) => {
    if (count >= 4) {
      hot.push({ service, count })
    }
  })
  hot.sort((a, b) => b.count - a.count)

  return {
    redundant: [],
    hot,
    orphan: [],
    wide: []
  }
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

const renderLocations = (graph: ArchitectureGraph): string => {
  const locationLines = graph.services.map((s) => `  ${s.name} (${makeShortPath(s.path)})`)
  return `<locations n="${graph.services.length}">\n${locationLines.join("\n")}\n</locations>`
}

const renderNodeClassification = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const layerByService = buildLayerMap(graph.layers)
  const grouped = groupServicesByType(graph, layerByService, analysisGraph)

  const leafCount = grouped.leaf.length
  const midCount = grouped.mid.length
  const vmCount = grouped.vm.length
  const total = leafCount + midCount + vmCount

  const sections: string[] = []
  sections.push(`<node_classification n="${total}">`)
  sections.push(`  <leaf n="${leafCount}">${grouped.leaf.map((s) => s.name).join(", ")}</leaf>`)
  sections.push(`  <mid n="${midCount}">${grouped.mid.map((s) => s.name).join(", ")}</mid>`)
  sections.push(`  <vm n="${vmCount}">${grouped.vm.map((s) => s.name).join(", ")}</vm>`)
  sections.push(`</node_classification>`)

  return sections.join("\n")
}

const renderEdges = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const ordered = orderServicesByDependencyCount(graph, analysisGraph)
  const maxNameLen = Math.max(...graph.services.map((s) => s.name.length))

  const edgeLines = ordered.map((item) => {
    const deps = pipe(
      Graph.neighbors(analysisGraph.graph, item.index),
      Array.filterMap((depIndex) => {
        const node = Graph.getNode(analysisGraph.graph, depIndex)
        return Option.isSome(node) ? Option.some(node.value.name) : Option.none()
      })
    )

    const depCount = deps.length
    const paddedName = item.service.name.padEnd(maxNameLen)

    const depDisplay = depCount === 0
      ? "→ ∅"
      : `${depCount} → ${deps.join(", ")}`

    return `  ${paddedName} ${depDisplay}`
  })

  return `<edges n="${graph.services.length}">\n${edgeLines.join("\n")}\n</edges>`
}

const renderMetrics = (metrics: GraphMetrics): string => {
  const sections: string[] = []
  sections.push("<metrics>")
  sections.push(`  <density value="${metrics.density.toFixed(3)}" description="Edge count / max possible. <0.2 sparse (good), >0.4 dense (coupled)" />`)
  sections.push(`  <diameter value="${metrics.diameter}" description="Longest shortest path. ≤3 shallow (good), >5 deep (long chains)" />`)
  sections.push(`  <average_degree value="${metrics.averageDegree.toFixed(2)}" description="Average connections per service" />`)
  sections.push("</metrics>")
  return sections.join("\n")
}

const formatAgent = (graph: ArchitectureGraph): string => {
  const analysisGraph = buildAnalysisGraph(graph)

  const metrics: GraphMetrics = {
    density: computeDensity(analysisGraph),
    diameter: computeDiameter(analysisGraph),
    averageDegree: computeAverageDegree(analysisGraph)
  }

  const output: string[] = []

  output.push(renderLocations(graph))
  output.push("")
  output.push(renderNodeClassification(graph, analysisGraph))
  output.push("")
  output.push(renderEdges(graph, analysisGraph))
  output.push("")
  output.push(renderMetrics(metrics))

  return output.join("\n")
}

interface BlastRadiusResult {
  readonly service: string
  readonly downstream: ReadonlyArray<{
    readonly depth: number
    readonly services: ReadonlyArray<string>
  }>
  readonly upstream: ReadonlyArray<{
    readonly depth: number
    readonly services: ReadonlyArray<string>
  }>
  readonly downstreamCount: number
  readonly upstreamCount: number
  readonly risk: "HIGH" | "MEDIUM" | "LOW"
}

const groupByDepth = (
  analysisGraph: AnalysisGraph,
  walker: Graph.NodeWalker<ServiceDefinition>,
  startIdx: Graph.NodeIndex
): ReadonlyArray<{ readonly depth: number; readonly services: ReadonlyArray<string> }> => {
  const depthMap = new Map<Graph.NodeIndex, number>()
  depthMap.set(startIdx, 0)

  for (const [idx, service] of walker) {
    if (idx === startIdx) continue

    const neighbors = Graph.neighbors(analysisGraph.graph, idx)
    const neighborDepths = pipe(
      neighbors,
      Array.filterMap((neighborIdx) => {
        const depth = depthMap.get(neighborIdx)
        return depth !== undefined ? Option.some(depth) : Option.none()
      })
    )

    if (neighborDepths.length > 0) {
      depthMap.set(idx, Math.min(...neighborDepths) + 1)
    }
  }

  const levelGroups = new Map<number, string[]>()
  for (const [idx, depth] of depthMap.entries()) {
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
    Array.sort(Order.mapInput(Order.number, (item: { depth: number; services: ReadonlyArray<string> }) => item.depth))
  )
}

const computeBlastRadius = (
  analysisGraph: AnalysisGraph,
  serviceName: string
): Option.Option<BlastRadiusResult> => {
  const serviceIdx = analysisGraph.serviceIndex.get(serviceName)
  if (serviceIdx === undefined) return Option.none()

  const downstreamWalker = Graph.bfs(analysisGraph.graph, {
    start: [serviceIdx],
    direction: "incoming"
  })

  const downstream = groupByDepth(analysisGraph, downstreamWalker, serviceIdx)
  const downstreamCount = pipe(
    downstream,
    Array.flatMap((level) => level.services)
  ).length

  const upstreamWalker = Graph.bfs(analysisGraph.graph, {
    start: [serviceIdx],
    direction: "outgoing"
  })

  const upstream = groupByDepth(analysisGraph, upstreamWalker, serviceIdx)
  const upstreamCount = pipe(
    upstream,
    Array.flatMap((level) => level.services)
  ).length

  const risk = downstreamCount >= 5 ? "HIGH" : downstreamCount >= 3 ? "MEDIUM" : "LOW"

  return Option.some({
    service: serviceName,
    downstream,
    upstream,
    downstreamCount,
    upstreamCount,
    risk
  })
}

const renderBlastRadius = (result: BlastRadiusResult): string => {
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

  sections.push(`  <upstream n="${result.upstreamCount}">`)
  if (result.upstream.length > 0) {
    result.upstream.forEach((level) => {
      sections.push(`    <level depth="${level.depth}" count="${level.services.length}">`)
      level.services.forEach((service) => {
        sections.push(`      <service>${service}</service>`)
      })
      sections.push(`    </level>`)
    })
  }
  sections.push(`  </upstream>`)

  sections.push(`</blast_radius>`)
  return sections.join("\n")
}

interface CommonAncestor {
  readonly service: string
  readonly coverage: number
  readonly affectedBy: ReadonlyArray<string>
  readonly risk: "HIGH" | "MEDIUM" | "LOW"
}

interface CommonAncestorsResult {
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

const computeCommonAncestors = (
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

const renderCommonAncestors = (result: CommonAncestorsResult): string => {
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

const helpText = `
Architecture Analysis CLI

USAGE:
  bun run architecture <command> [directory] [options]

COMMANDS:
  analyze [directory] [flags]      Full dependency graph analysis (default directory: ./src)
  blast-radius <service> [dir]     Show blast radius (upstream/downstream) for a service
  common-ancestors <svc1> <svc2>   Find shared dependencies across services
  metrics [directory]              Show graph metrics only
  domains [directory]              Show domain discovery via cut vertices
  hot-services [directory]         Show services with ≥4 dependents
  help                             Show this help

ANALYZE FLAGS:
  --metrics                        Show graph metrics (density, diameter, average degree)
  --domains                        Show domain boundaries via cut vertex analysis
  --advanced                       Show advanced metrics (betweenness, clustering)
  --warnings                       Show detailed warnings (redundant deps, hot services, wide services)
  --workflows                      Show expanded workflow examples
  --commands                       Show full command documentation
  --all                            Show all sections expanded (equivalent to all flags above)

ARGUMENTS:
  directory                        Optional directory to analyze (defaults to ./src)

OUTPUT:
  All commands output XML to stdout for agent consumption
  By default, analyze shows collapsed hints - use flags to expand specific sections

EXAMPLES:
  bun run architecture analyze                              # Collapsed hints (default)
  bun run architecture analyze --metrics                    # Show only metrics
  bun run architecture analyze --all                        # Show everything
  bun run architecture analyze --metrics --warnings         # Show metrics and warnings
  bun run architecture analyze ./apps/ui/src --metrics      # Custom directory with metrics
  bun run architecture blast-radius TodoQueryService
  bun run architecture common-ancestors SidebarVM DetailPanelVM
`

const main = Effect.gen(function* () {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === "--help" || command === "help") {
    yield* Console.log(helpText)
    return
  }

  let directory = "./src"

  const graph = yield* buildArchitectureGraph(directory)
  const analysisGraph = buildAnalysisGraph(graph)

  switch (command) {
    case "analyze": {
      const flags = args.slice(1).filter(arg => arg.startsWith("--"))
      const positional = args.slice(1).filter(arg => !arg.startsWith("--"))

      if (positional[0]) {
        directory = positional[0]
      }

      const showAll = flags.includes("--all")
      const options = {
        showMetrics: showAll || flags.includes("--metrics"),
        showDomains: showAll || flags.includes("--domains"),
        showAdvanced: showAll || flags.includes("--advanced"),
        showWarnings: showAll || flags.includes("--warnings"),
        showWorkflows: showAll || flags.includes("--workflows"),
        showCommands: showAll || flags.includes("--commands")
      }

      const targetGraph = positional[0] ? yield* buildArchitectureGraph(directory) : graph

      yield* Console.log(formatAgentWithHints(targetGraph, options))
      break
    }

    case "blast-radius": {
      const service = args[1]
      if (!service) {
        yield* Console.error("Usage: architecture blast-radius <service> [directory]")
        yield* Effect.fail(new Error("Missing service"))
      }
      if (args[2]) {
        directory = args[2]
        const customGraph = yield* buildArchitectureGraph(directory)
        const customAnalysisGraph = buildAnalysisGraph(customGraph)
        const result = computeBlastRadius(customAnalysisGraph, service)
        yield* pipe(
          result,
          Option.match({
            onNone: () => Console.error(`Service not found: ${service}`),
            onSome: (r) => Console.log(renderBlastRadius(r))
          })
        )
      } else {
        const result = computeBlastRadius(analysisGraph, service)
        yield* pipe(
          result,
          Option.match({
            onNone: () => Console.error(`Service not found: ${service}`),
            onSome: (r) => Console.log(renderBlastRadius(r))
          })
        )
      }
      break
    }

    case "common-ancestors": {
      const services = args.slice(1)
      if (services.length < 2) {
        yield* Console.error("Usage: architecture common-ancestors <service1> <service2> ... [directory]")
        yield* Effect.fail(new Error("Need at least 2 services"))
      }
      const result = computeCommonAncestors(analysisGraph, services)
      yield* Console.log(renderCommonAncestors(result))
      break
    }

    case "metrics": {
      if (args[1]) {
        directory = args[1]
        const customGraph = yield* buildArchitectureGraph(directory)
        const fullOutput = formatAgent(customGraph)
        const metricsMatch = fullOutput.match(/<metrics>[\s\S]*?<\/metrics>/)
        yield* Console.log(metricsMatch?.[0] ?? "<metrics />")
      } else {
        const fullOutput = formatAgent(graph)
        const metricsMatch = fullOutput.match(/<metrics>[\s\S]*?<\/metrics>/)
        yield* Console.log(metricsMatch?.[0] ?? "<metrics />")
      }
      break
    }

    case "domains": {
      if (args[1]) {
        directory = args[1]
        const customGraph = yield* buildArchitectureGraph(directory)
        const fullOutput = formatAgent(customGraph)
        const domainsMatch = fullOutput.match(/<domains[\s\S]*?<\/domains>/)
        yield* Console.log(domainsMatch?.[0] ?? "<domains />")
      } else {
        const fullOutput = formatAgent(graph)
        const domainsMatch = fullOutput.match(/<domains[\s\S]*?<\/domains>/)
        yield* Console.log(domainsMatch?.[0] ?? "<domains />")
      }
      break
    }

    case "hot-services": {
      if (args[1]) {
        directory = args[1]
        const customGraph = yield* buildArchitectureGraph(directory)
        const fullOutput = formatAgent(customGraph)
        const hotMatch = fullOutput.match(/<hot[\s\S]*?<\/hot>/)
        yield* Console.log(hotMatch?.[0] ?? "<hot />")
      } else {
        const fullOutput = formatAgent(graph)
        const hotMatch = fullOutput.match(/<hot[\s\S]*?<\/hot>/)
        yield* Console.log(hotMatch?.[0] ?? "<hot />")
      }
      break
    }

    default:
      yield* Console.error(`Unknown command: ${command}`)
      yield* Console.log(helpText)
      yield* Effect.fail(new Error("Unknown command"))
  }
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.error(`Error: ${error}`)
      yield* Effect.fail(error)
    })
  )
)

pipe(
  main,
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)

