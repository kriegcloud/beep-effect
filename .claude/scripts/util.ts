import type {
  ArchitectureGraph,
  CommonAncestorsResult,
  LayerDefinition,
  ServiceDefinition,
} from "@beep/claude/scripts/analyze-architecture";
import * as A from "effect/Array";

const buildService = (name: string): ServiceDefinition => ({
  name,
  path: `src/${name}.ts`,
  line: 1,
});

const buildLayer = (serviceName: string, dependencies: ReadonlyArray<string>): LayerDefinition => ({
  name: `${serviceName}Live`,
  serviceName,
  path: `src/${serviceName}.ts`,
  line: 10,
  dependencies: [...dependencies],
  errorTypes: [],
  isParametrized: false,
});

export const renderCommonAncestors = (result: CommonAncestorsResult): string => {
  const sections = A.empty<string>();

  sections.push(`<common_ancestors n="${result.inputServices.length}">`);

  sections.push("  <input>");
  for (const service of result.inputServices) {
    sections.push(`    <service>${service}</service>`);
  }
  sections.push("  </input>");
  sections.push("");

  sections.push(`  <shared_dependencies n="${result.commonDependencies.length}">`);
  for (const dep of result.commonDependencies) {
    const coverageStr = `${dep.coverage}/${result.inputServices.length}`;
    sections.push(`    <dependency coverage="${coverageStr}" risk="${dep.risk}">`);
    sections.push(`      <service>${dep.service}</service>`);
    sections.push(`      <affected_by>${dep.affectedBy.join(", ")}</affected_by>`);
    sections.push(`    </dependency>`);
  }
  sections.push("  </shared_dependencies>");
  sections.push("");

  sections.push("  <root_cause_candidates>");
  for (const candidate of result.rootCauseCandidates) {
    const coveragePct = Math.round((candidate.coverage / result.inputServices.length) * 100);
    sections.push(
      `    <candidate rank="${candidate.rank}" service="${candidate.service}" coverage="${coveragePct}%" />`
    );
  }
  sections.push("  </root_cause_candidates>");

  sections.push("</common_ancestors>");

  return sections.join("\n");
};

export const buildChainGraph = (nodeNames: ReadonlyArray<string>): ArchitectureGraph => {
  const services = nodeNames.map(buildService);
  const layers = nodeNames.map((name, idx) => buildLayer(name, idx < nodeNames.length - 1 ? [nodeNames[idx + 1]] : []));
  return { services, layers };
};

export const buildStarGraph = (centerName: string, spokeNames: ReadonlyArray<string>): ArchitectureGraph => {
  const services = [buildService(centerName), ...spokeNames.map(buildService)];
  const layers = [buildLayer(centerName, spokeNames), ...spokeNames.map((name) => buildLayer(name, []))];
  return { services, layers };
};

export const buildFullyConnectedGraph = (nodeNames: ReadonlyArray<string>): ArchitectureGraph => {
  const services = nodeNames.map(buildService);
  const layers = nodeNames.map((name) =>
    buildLayer(
      name,
      nodeNames.filter((otherName) => otherName !== name)
    )
  );
  return { services, layers };
};

export const buildHubGraph = (): ArchitectureGraph => {
  const services = ["Hub", "A", "B", "C"].map(buildService);
  const layers = [
    buildLayer("Hub", ["A", "B", "C"]),
    buildLayer("A", ["B", "C"]),
    buildLayer("B", ["C"]),
    buildLayer("C", []),
  ];
  return { services, layers };
};
