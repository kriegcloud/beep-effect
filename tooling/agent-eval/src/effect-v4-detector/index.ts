/**
 * Effect v4 wrong-API detection utilities.
 *
 * @since 0.0.0
 * @module
 */

/**
 * Static wrong-API detection rule.
 *
 * @since 0.0.0
 * @category models
 */
export interface WrongApiRule {
  readonly id: string;
  readonly title: string;
  readonly regex: RegExp;
  readonly replacement: string;
  readonly severity: "critical" | "warning";
}

/**
 * One concrete wrong-API incident detected in content.
 *
 * @since 0.0.0
 * @category models
 */
export interface WrongApiIncident {
  readonly ruleId: string;
  readonly title: string;
  readonly replacement: string;
  readonly severity: "critical" | "warning";
  readonly line: number;
  readonly snippet: string;
}

/**
 * Aggregated wrong-API detection report.
 *
 * @since 0.0.0
 * @category models
 */
export interface WrongApiDetectionReport {
  readonly incidents: ReadonlyArray<WrongApiIncident>;
  readonly criticalCount: number;
  readonly warningCount: number;
}

/**
 * Canonical wrong-API rule set for Effect v4 migration enforcement.
 *
 * @since 0.0.0
 * @category constants
 */
export const WrongApiRules: ReadonlyArray<WrongApiRule> = [
  {
    id: "context-generic-tag",
    title: "Context.GenericTag removed in v4",
    regex: /Context\.GenericTag/g,
    replacement: "ServiceMap.Service",
    severity: "critical",
  },
  {
    id: "context-tag",
    title: "Context.Tag replaced in v4",
    regex: /Context\.Tag/g,
    replacement: "ServiceMap.Service",
    severity: "critical",
  },
  {
    id: "effect-catch-all",
    title: "Effect.catchAll removed in v4",
    regex: /Effect\.catchAll/g,
    replacement: "Effect.catch",
    severity: "critical",
  },
  {
    id: "layer-scoped",
    title: "Layer.scoped removed in v4",
    regex: /Layer\.scoped/g,
    replacement: "Layer.effect",
    severity: "critical",
  },
  {
    id: "schema-decode",
    title: "Schema.decode removed in v4",
    regex: /Schema\.decode\s*\(/g,
    replacement: "Schema.decodeUnknownSync / Schema.decodeUnknownEffect",
    severity: "critical",
  },
  {
    id: "effect-schema-package",
    title: "@effect/schema merged into effect",
    regex: /@effect\/schema/g,
    replacement: "Use effect/Schema",
    severity: "critical",
  },
];

/**
 * Scan arbitrary content for known v3/v4 API mismatches.
 *
 * @since 0.0.0
 * @category functions
 */
export const detectWrongApis = (content: string): WrongApiDetectionReport => {
  const lines = content.split("\n");
  const incidents: Array<WrongApiIncident> = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] ?? "";
    for (const rule of WrongApiRules) {
      const matches = Array.from(line.matchAll(rule.regex));
      for (const _match of matches) {
        incidents.push({
          ruleId: rule.id,
          title: rule.title,
          replacement: rule.replacement,
          severity: rule.severity,
          line: lineIndex + 1,
          snippet: line.trim(),
        });
      }
    }
  }

  const criticalCount = incidents.filter((incident) => incident.severity === "critical").length;
  const warningCount = incidents.filter((incident) => incident.severity === "warning").length;

  return {
    incidents,
    criticalCount,
    warningCount,
  };
};
