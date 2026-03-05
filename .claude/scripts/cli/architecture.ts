#!/usr/bin/env bun
import { renderCommonAncestors } from "@beep/claude/scripts/util";
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { HashMap, HashSet, MutableHashMap } from "effect";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Graph from "effect/Graph";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import {
  type AnalysisGraph,
  type ArchitectureGraph,
  buildAnalysisGraph,
  buildArchitectureGraph,
  computeBlastRadius,
  computeCommonAncestors,
  formatAgentWithHints,
  type LayerDefinition,
  renderBlastRadius,
  type ServiceDefinition,
} from "../analyze-architecture.ts";

interface GraphMetrics {
  readonly averageDegree: number;
  readonly density: number;
  readonly diameter: number;
}

interface GroupedServices {
  readonly leaf: ReadonlyArray<ServiceDefinition>;
  readonly mid: ReadonlyArray<ServiceDefinition>;
  readonly orphans: ReadonlyArray<ServiceDefinition>;
  readonly vm: ReadonlyArray<ServiceDefinition>;
}

const makeShortPath = (fullPath: string): string => Str.replace(/^(\.\/)?.*\/src\//, "")(fullPath);

const buildLayerMap = (layers: ReadonlyArray<LayerDefinition>): HashMap.HashMap<string, LayerDefinition> =>
  HashMap.fromIterable(layers.map((layer) => [layer.serviceName, layer] as const));

const detectOrphans = (analysisGraph: AnalysisGraph): HashSet.HashSet<string> => {
  const noIncomingIndices: Graph.NodeIndex[] = globalThis.Array.from(
    Graph.indices(Graph.externals(analysisGraph.graph, { direction: "incoming" }))
  );

  return pipe(
    noIncomingIndices,
    A.map((idx: Graph.NodeIndex) => {
      const node = Graph.getNode(analysisGraph.graph, idx);
      if (O.isNone(node)) return O.none<string>();

      const serviceName = node.value.name;
      const isVM = serviceName.endsWith("VM");
      const outgoingCount = Graph.neighbors(analysisGraph.graph, idx).length;

      if (isVM && outgoingCount > 0) {
        return O.none<string>();
      }

      return O.some(serviceName);
    }),
    A.getSomes,
    HashSet.fromIterable
  );
};

const groupServicesByType = (
  graph: ArchitectureGraph,
  layerByService: HashMap.HashMap<string, LayerDefinition>,
  analysisGraph: AnalysisGraph
): GroupedServices => {
  const orphanNames = detectOrphans(analysisGraph);

  const leaf: ServiceDefinition[] = [];
  const mid: ServiceDefinition[] = [];
  const vm: ServiceDefinition[] = [];
  const orphans: ServiceDefinition[] = [];

  graph.services.forEach((service) => {
    if (HashSet.has(orphanNames, service.name)) {
      orphans.push(service);
      return;
    }

    const layer = O.getOrUndefined(HashMap.get(layerByService, service.name));
    const hasDeps = (layer?.dependencies.length ?? 0) > 0;

    if (service.name.endsWith("VM")) {
      vm.push(service);
    } else if (!hasDeps) {
      leaf.push(service);
    } else {
      mid.push(service);
    }
  });

  return {
    leaf: pipe(leaf, A.sort(Order.mapInput(Order.String, (s: ServiceDefinition) => s.name))),
    mid: pipe(mid, A.sort(Order.mapInput(Order.String, (s: ServiceDefinition) => s.name))),
    vm: pipe(vm, A.sort(Order.mapInput(Order.String, (s: ServiceDefinition) => s.name))),
    orphans: pipe(orphans, A.sort(Order.mapInput(Order.String, (s: ServiceDefinition) => s.name))),
  };
};

const computeDensity = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph);
  if (nodeCount <= 1) return 0;

  const edgeCount = Graph.edgeCount(analysisGraph.graph);
  return edgeCount / (nodeCount * (nodeCount - 1));
};

const computeDiameter = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph);
  if (nodeCount <= 1) return 0;

  const result = Graph.floydWarshall(analysisGraph.graph, () => 1);

  return pipe(
    A.fromIterable(result.distances.values()),
    A.flatMap((innerMap) => A.fromIterable(innerMap.values())),
    A.filter((dist) => dist !== Number.POSITIVE_INFINITY),
    A.reduce(0, (max, dist) => Math.max(max, dist))
  );
};

const computeAverageDegree = (analysisGraph: AnalysisGraph): number => {
  const nodeCount = Graph.nodeCount(analysisGraph.graph);
  if (nodeCount === 0) return 0;

  return pipe(
    A.fromIterable(analysisGraph.serviceIndex),
    A.map(([, nodeIndex]) => Graph.neighbors(analysisGraph.graph, nodeIndex).length),
    A.reduce(0, (sum, count) => sum + count),
    (total) => total / nodeCount
  );
};

interface ServiceWithIndex {
  readonly depCount: number;
  readonly index: Graph.NodeIndex;
  readonly layer: LayerDefinition | undefined;
  readonly service: ServiceDefinition;
}

const orderServicesByDependencyCount = (
  graph: ArchitectureGraph,
  analysisGraph: AnalysisGraph
): ReadonlyArray<ServiceWithIndex> => {
  const layerByService = buildLayerMap(graph.layers);

  return pipe(
    graph.services,
    A.map((service: ServiceDefinition) => {
      const nodeIndex = O.getOrUndefined(MutableHashMap.get(analysisGraph.serviceIndex, service.name));
      if (nodeIndex === undefined) return O.none<ServiceWithIndex>();

      const depCount = Graph.neighbors(analysisGraph.graph, nodeIndex).length;

      return O.some({
        service,
        layer: O.getOrUndefined(HashMap.get(layerByService, service.name)),
        index: nodeIndex,
        depCount,
      });
    }),
    A.getSomes,
    A.sort(Order.mapInput(Order.Number, (item: ServiceWithIndex) => item.depCount))
  );
};

const renderLocations = (graph: ArchitectureGraph): string => {
  const locationLines = graph.services.map((s) => `  ${s.name} (${makeShortPath(s.path)})`);
  return `<locations n="${graph.services.length}">\n${locationLines.join("\n")}\n</locations>`;
};

const renderNodeClassification = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const layerByService = buildLayerMap(graph.layers);
  const grouped = groupServicesByType(graph, layerByService, analysisGraph);

  const leafCount = grouped.leaf.length;
  const midCount = grouped.mid.length;
  const vmCount = grouped.vm.length;
  const total = leafCount + midCount + vmCount;

  const sections = A.empty<string>();
  sections.push(`<node_classification n="${total}">`);
  sections.push(`  <leaf n="${leafCount}">${grouped.leaf.map((s) => s.name).join(", ")}</leaf>`);
  sections.push(`  <mid n="${midCount}">${grouped.mid.map((s) => s.name).join(", ")}</mid>`);
  sections.push(`  <vm n="${vmCount}">${grouped.vm.map((s) => s.name).join(", ")}</vm>`);
  sections.push(`</node_classification>`);

  return sections.join("\n");
};

const renderEdges = (graph: ArchitectureGraph, analysisGraph: AnalysisGraph): string => {
  const ordered = orderServicesByDependencyCount(graph, analysisGraph);
  const maxNameLen = Math.max(...graph.services.map((s) => s.name.length));

  const edgeLines = ordered.map((item) => {
    const deps = pipe(
      Graph.neighbors(analysisGraph.graph, item.index),
      A.map((depIndex: Graph.NodeIndex) => {
        const node = Graph.getNode(analysisGraph.graph, depIndex);
        return O.isSome(node) ? O.some(node.value.name) : O.none<string>();
      }),
      A.getSomes
    );

    const depCount = deps.length;
    const paddedName = item.service.name.padEnd(maxNameLen);

    const depDisplay = depCount === 0 ? "→ ∅" : `${depCount} → ${deps.join(", ")}`;

    return `  ${paddedName} ${depDisplay}`;
  });

  return `<edges n="${graph.services.length}">\n${edgeLines.join("\n")}\n</edges>`;
};

const renderMetrics = (metrics: GraphMetrics): string => {
  const sections = A.empty<string>();
  sections.push("<metrics>");
  sections.push(
    `  <density value="${metrics.density.toFixed(3)}" description="Edge count / max possible. <0.2 sparse (good), >0.4 dense (coupled)" />`
  );
  sections.push(
    `  <diameter value="${metrics.diameter}" description="Longest shortest path. ≤3 shallow (good), >5 deep (long chains)" />`
  );
  sections.push(
    `  <average_degree value="${metrics.averageDegree.toFixed(2)}" description="Average connections per service" />`
  );
  sections.push("</metrics>");
  return sections.join("\n");
};

const formatAgent = (graph: ArchitectureGraph): string => {
  const analysisGraph = buildAnalysisGraph(graph);

  const metrics: GraphMetrics = {
    density: computeDensity(analysisGraph),
    diameter: computeDiameter(analysisGraph),
    averageDegree: computeAverageDegree(analysisGraph),
  };

  const output = A.empty<string>();

  output.push(renderLocations(graph));
  output.push("");
  output.push(renderNodeClassification(graph, analysisGraph));
  output.push("");
  output.push(renderEdges(graph, analysisGraph));
  output.push("");
  output.push(renderMetrics(metrics));

  return output.join("\n");
};

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
`;

const main = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "help") {
    yield* Console.log(helpText);
    return;
  }

  let directory = "./src";

  const graph = yield* buildArchitectureGraph(directory);
  const analysisGraph = buildAnalysisGraph(graph);

  switch (command) {
    case "analyze": {
      const flags = args.slice(1).filter((arg) => arg.startsWith("--"));
      const positional = args.slice(1).filter((arg) => !arg.startsWith("--"));

      if (positional[0]) {
        directory = positional[0];
      }

      const showAll = flags.includes("--all");
      const options = {
        showMetrics: showAll || flags.includes("--metrics"),
        showDomains: showAll || flags.includes("--domains"),
        showAdvanced: showAll || flags.includes("--advanced"),
        showWarnings: showAll || flags.includes("--warnings"),
        showWorkflows: showAll || flags.includes("--workflows"),
        showCommands: showAll || flags.includes("--commands"),
      };

      const targetGraph = positional[0] ? yield* buildArchitectureGraph(directory) : graph;

      yield* Console.log(formatAgentWithHints(targetGraph, options));
      break;
    }

    case "blast-radius": {
      const service = args[1];
      if (!service) {
        yield* Console.error("Usage: architecture blast-radius <service> [directory]");
        return yield* Effect.fail("Missing service");
      }
      if (args[2]) {
        directory = args[2];
        const customGraph = yield* buildArchitectureGraph(directory);
        const customAnalysisGraph = buildAnalysisGraph(customGraph);
        const result = computeBlastRadius(customAnalysisGraph, service);
        yield* pipe(
          result,
          O.match({
            onNone: () => Console.error(`Service not found: ${service}`),
            onSome: (r) => Console.log(renderBlastRadius(r)),
          })
        );
      } else {
        const result = computeBlastRadius(analysisGraph, service);
        yield* pipe(
          result,
          O.match({
            onNone: () => Console.error(`Service not found: ${service}`),
            onSome: (r) => Console.log(renderBlastRadius(r)),
          })
        );
      }
      break;
    }

    case "common-ancestors": {
      const services = args.slice(1);
      if (services.length < 2) {
        yield* Console.error("Usage: architecture common-ancestors <service1> <service2> ... [directory]");
        return yield* Effect.fail("Need at least 2 services");
      }
      const result = computeCommonAncestors(analysisGraph, services);
      yield* Console.log(renderCommonAncestors(result));
      break;
    }

    case "metrics": {
      if (args[1]) {
        directory = args[1];
        const customGraph = yield* buildArchitectureGraph(directory);
        const fullOutput = formatAgent(customGraph);
        const metricsMatch = O.getOrNull(O.fromNullishOr(Str.match(/<metrics>[\s\S]*?<\/metrics>/)(fullOutput)));
        yield* Console.log(metricsMatch?.[0] ?? "<metrics />");
      } else {
        const fullOutput = formatAgent(graph);
        const metricsMatch = O.getOrNull(O.fromNullishOr(Str.match(/<metrics>[\s\S]*?<\/metrics>/)(fullOutput)));
        yield* Console.log(metricsMatch?.[0] ?? "<metrics />");
      }
      break;
    }

    case "domains": {
      if (args[1]) {
        directory = args[1];
        const customGraph = yield* buildArchitectureGraph(directory);
        const fullOutput = formatAgent(customGraph);
        const domainsMatch = O.getOrNull(O.fromNullishOr(Str.match(/<domains[\s\S]*?<\/domains>/)(fullOutput)));
        yield* Console.log(domainsMatch?.[0] ?? "<domains />");
      } else {
        const fullOutput = formatAgent(graph);
        const domainsMatch = O.getOrNull(O.fromNullishOr(Str.match(/<domains[\s\S]*?<\/domains>/)(fullOutput)));
        yield* Console.log(domainsMatch?.[0] ?? "<domains />");
      }
      break;
    }

    case "hot-services": {
      if (args[1]) {
        directory = args[1];
        const customGraph = yield* buildArchitectureGraph(directory);
        const fullOutput = formatAgent(customGraph);
        const hotMatch = O.getOrNull(O.fromNullishOr(Str.match(/<hot[\s\S]*?<\/hot>/)(fullOutput)));
        yield* Console.log(hotMatch?.[0] ?? "<hot />");
      } else {
        const fullOutput = formatAgent(graph);
        const hotMatch = O.getOrNull(O.fromNullishOr(Str.match(/<hot[\s\S]*?<\/hot>/)(fullOutput)));
        yield* Console.log(hotMatch?.[0] ?? "<hot />");
      }
      break;
    }

    default:
      yield* Console.error(`Unknown command: ${command}`);
      yield* Console.log(helpText);
      return yield* Effect.fail("Unknown command");
  }
}).pipe(
  Effect.catch((error) =>
    Effect.gen(function* () {
      yield* Console.error(`Error: ${String(error)}`);
      return yield* Effect.fail(error);
    })
  )
);

pipe(main, Effect.provide(BunServices.layer), BunRuntime.runMain);
