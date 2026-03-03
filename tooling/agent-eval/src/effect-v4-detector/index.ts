import { String as Str } from "effect";
import * as O from "effect/Option";

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
 * @category DomainModel
 */
export interface WrongApiRule {
  readonly id: string;
  readonly title: string;
  readonly regex: RegExp;
  readonly replacement: string;
  readonly category: "v3_symbol" | "wrong_module_path" | "removed_api" | "non_effect_pattern";
  readonly severity: "critical" | "warning";
}

/**
 * One concrete wrong-API incident detected in content.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface WrongApiIncident {
  readonly ruleId: string;
  readonly title: string;
  readonly replacement: string;
  readonly category: WrongApiRule["category"];
  readonly severity: "critical" | "warning";
  readonly line: number;
  readonly snippet: string;
}

/**
 * Aggregated wrong-API detection report.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category Configuration
 */
export const WrongApiRules: ReadonlyArray<WrongApiRule> = [
  {
    id: "context-generic-tag",
    title: "Context.GenericTag removed in v4",
    regex: /Context\.GenericTag/g,
    replacement: "ServiceMap.Service",
    category: "v3_symbol",
    severity: "critical",
  },
  {
    id: "context-tag",
    title: "Context.Tag replaced in v4",
    regex: /Context\.Tag/g,
    replacement: "ServiceMap.Service",
    category: "v3_symbol",
    severity: "critical",
  },
  {
    id: "effect-tag",
    title: "Effect.Tag replaced in v4",
    regex: /Effect\.Tag/g,
    replacement: "ServiceMap.Service",
    category: "v3_symbol",
    severity: "critical",
  },
  {
    id: "effect-catch-all",
    title: "Effect.catchAll removed in v4",
    regex: /Effect\.catchAll/g,
    replacement: "Effect.catch",
    category: "removed_api",
    severity: "critical",
  },
  {
    id: "layer-scoped",
    title: "Layer.scoped removed in v4",
    regex: /Layer\.scoped/g,
    replacement: "Layer.effect",
    category: "removed_api",
    severity: "critical",
  },
  {
    id: "schema-decode",
    title: "Schema.decode removed in v4",
    regex: /Schema\.decode\s*\(/g,
    replacement: "Schema.decodeUnknownSync / Schema.decodeUnknownEffect",
    category: "removed_api",
    severity: "critical",
  },
  {
    id: "effect-schema-package",
    title: "@effect/schema merged into effect",
    regex: /@effect\/schema/g,
    replacement: "Use effect/Schema",
    category: "wrong_module_path",
    severity: "critical",
  },
  {
    id: "platform-filesystem-path",
    title: "FileSystem moved into effect package",
    regex: /@effect\/platform\/?FileSystem/g,
    replacement: "Use effect/FileSystem",
    category: "wrong_module_path",
    severity: "critical",
  },
  {
    id: "platform-path-path",
    title: "Path moved into effect package",
    regex: /@effect\/platform\/?Path/g,
    replacement: "Use effect/Path",
    category: "wrong_module_path",
    severity: "critical",
  },
  {
    id: "runtime-generic",
    title: "Runtime<R> removed in v4",
    regex: /Runtime<\s*[A-Za-z0-9_.$]+\s*>/g,
    replacement: "Use runtime helpers without Runtime<R> generic",
    category: "removed_api",
    severity: "warning",
  },
];

/**
 * Mandatory Effect-first compliance rules for touched source code.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const EffectComplianceRules: ReadonlyArray<WrongApiRule> = [
  {
    id: "node-core-import",
    title: "Node core fs/path imports are disallowed in Effect-first benchmark tasks",
    regex: /^\s*import\s+.*\sfrom\s+["'](?:node:)?(?:fs|path)(?:\/[A-Za-z0-9._-]+)?["']\s*;?/gm,
    replacement: "Use Effect FileSystem/Path modules from root effect imports",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "node-core-require",
    title: "Node core fs/path require() calls are disallowed in Effect-first benchmark tasks",
    regex: /^\s*(?:const|let|var)\s+.*=\s*require\(\s*["'](?:node:)?(?:fs|path)(?:\/[A-Za-z0-9._-]+)?["']\s*\)\s*;?/gm,
    replacement: "Use Effect FileSystem/Path modules from root effect imports",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-date-now",
    title: "Date.now is disallowed in Effect-first benchmark tasks",
    regex: /\bDate\.now\s*\(/g,
    replacement: "Use Effect DateTime utilities instead of Date.now",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-new-date",
    title: "new Date() is disallowed in Effect-first benchmark tasks",
    regex: /\bnew\s+Date\s*\(/g,
    replacement: "Use Effect DateTime utilities instead of new Date()",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-array-method-chain",
    title: "Native Array method chains are disallowed in Effect-first benchmark tasks",
    regex: /\b(?!Effect\b|A\b|O\b|P\b|R\b|S\b)[A-Za-z_$][A-Za-z0-9_$]*\??\.(?:map|flatMap|filter|reduce)\s*\(/g,
    replacement: "Use effect/Array combinators (A.map/A.flatMap/A.filter/A.reduce)",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "json-parse-stringify",
    title: "JSON.parse/JSON.stringify are disallowed in Effect-first benchmark tasks",
    regex: /\bJSON\.(?:parse|stringify)\s*\(/g,
    replacement: "Use Schema decode/encode helpers instead of native JSON.parse/stringify",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "schema-union-literals-array",
    title: "S.Union([...S.Literal]) is disallowed when S.Literals is available",
    regex: /S\.Union\s*\(\s*\[[\s\S]*?S\.Literal\s*\([^)]*\)[\s\S]*?S\.Literal\s*\([^)]*\)[\s\S]*?\]\s*\)/g,
    replacement: "Use S.Literals([...]) for literal unions",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-error-construction",
    title: "Native Error construction is disallowed in Effect-first benchmark tasks",
    regex: /\bnew\s+Error\s*\(/g,
    replacement: "Use S.TaggedErrorClass-based typed errors",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-error-inheritance",
    title: "Extending native Error is disallowed in Effect-first benchmark tasks",
    regex: /\bclass\s+[A-Za-z_$][A-Za-z0-9_$]*\s+extends\s+Error\b/g,
    replacement: "Use S.TaggedErrorClass-based typed errors",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-try-catch",
    title: "try/catch blocks are disallowed in Effect-first benchmark tasks",
    regex: /\btry\s*\{[\s\S]*?\}\s*catch\s*(?:\([^)]*\))?\s*\{/g,
    replacement: "Use Effect.try / Effect.tryPromise / Effect.catch* combinators",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "nullable-type-union",
    title: "Nullable type unions are disallowed in Effect-first benchmark tasks",
    regex: /:\s*[^;\n=]*\|\s*null\b/g,
    replacement: "Use effect/Option for nullable domain values",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "nullable-initializer",
    title: "Null initializers are disallowed in Effect-first benchmark tasks",
    regex: /=\s*null\b/g,
    replacement: "Use Option.none() instead of null",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "type-assertion-as",
    title: "Type assertions are disallowed in Effect-first benchmark tasks",
    regex:
      /\sas\s+(?:const|unknown|never|any|string|number|boolean|object|Record<[^>]+>|ReadonlyArray<[^>]+>|Array<[^>]+>|[A-Z][A-Za-z0-9_$.<>{},|&? ]*)/g,
    replacement: "Remove assertions and model types/flows explicitly",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "non-null-assertion",
    title: "Non-null assertions are disallowed in Effect-first benchmark tasks",
    regex: /(?:\b[A-Za-z_$][A-Za-z0-9_$]*|\)|\])!\s*(?:\.|\[|\()/g,
    replacement: "Use Option or typed narrowing instead of non-null assertions",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-throw",
    title: "Throw statements are disallowed in Effect-first benchmark tasks",
    regex: /\bthrow\s+(?:new\s+)?[A-Za-z_$]/g,
    replacement: "Return failures via Effect/Result error channels",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-promise-construction",
    title: "Native Promise construction is disallowed in Effect-first benchmark tasks",
    regex: /\bnew\s+Promise\s*\(/g,
    replacement: "Use Effect.async / Effect.promise at boundary and keep Effect-first flow",
    category: "non_effect_pattern",
    severity: "critical",
  },
  {
    id: "native-promise-static",
    title: "Native Promise static APIs are disallowed in Effect-first benchmark tasks",
    regex: /\bPromise\.(?:all|allSettled|race|any|resolve|reject)\s*\(/g,
    replacement: "Use Effect.all / Effect.forEach / Effect.race variants",
    category: "non_effect_pattern",
    severity: "critical",
  },
];

const buildLineStarts = (content: string): ReadonlyArray<number> => {
  const starts: Array<number> = [0];
  for (let index = 0; index < content.length; index += 1) {
    if (O.getOrElse(O.fromUndefinedOr(Str.charCodeAt(index)(content)), () => Number.NaN) === 10) {
      starts.push(index + 1);
    }
  }
  return starts;
};

const findLineIndexForOffset = (lineStarts: ReadonlyArray<number>, offset: number): number => {
  let lower = 0;
  let upper = lineStarts.length - 1;
  let resolved = 0;

  while (lower <= upper) {
    const middle = lower + Math.floor((upper - lower) / 2);
    const start = lineStarts[middle] ?? 0;
    if (start <= offset) {
      resolved = middle;
      lower = middle + 1;
    } else {
      upper = middle - 1;
    }
  }

  return resolved;
};

const detectWithRules = (content: string, rules: ReadonlyArray<WrongApiRule>): WrongApiDetectionReport => {
  const lineStarts = buildLineStarts(content);
  const lines = Str.split("\n")(content);
  const incidents: Array<WrongApiIncident> = [];

  for (const rule of rules) {
    const flags = rule.regex.flags.includes("g") ? rule.regex.flags : `${rule.regex.flags}g`;
    const regex = new RegExp(rule.regex.source, flags);
    const matches = [...content.matchAll(regex)];

    for (const match of matches) {
      const offset = match.index ?? 0;
      const lineIndex = findLineIndexForOffset(lineStarts, offset);
      const line = lines[lineIndex] ?? "";
      incidents.push({
        ruleId: rule.id,
        title: rule.title,
        replacement: rule.replacement,
        category: rule.category,
        severity: rule.severity,
        line: lineIndex + 1,
        snippet: Str.trim(line),
      });
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

/**
 * Scan arbitrary content for known v3/v4 API mismatches.
 *
 * @param content - Source text blob to scan for wrong-API patterns.
 * @returns Detection report containing incidents and severity counts.
 * @since 0.0.0
 * @category Utility
 */
export const detectWrongApis = (content: string): WrongApiDetectionReport => {
  return detectWithRules(content, WrongApiRules);
};

/**
 * Scan source code for mandatory Effect-first compliance violations.
 *
 * @param content - Source text blob to scan for effect-compliance violations.
 * @returns Detection report containing incidents and severity counts.
 * @since 0.0.0
 * @category Utility
 */
export const detectEffectComplianceViolations = (content: string): WrongApiDetectionReport =>
  detectWithRules(content, EffectComplianceRules);
