/**
 * AST KG indexing command implementing the frozen P2 contracts.
 *
 * @since 0.0.0
 * @module
 */

import { execFileSync, execSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as nodePath from "node:path";
import {
  AstKgEnvelopeVersion,tooling/agent-eval
  AstKgGroupId,
  callMcpTool,
  DomainError,
  ensureGraphitiProxyPreflight as ensureGraphitiProxyPreflightShared,
  initializeMcpSession,
  KgSchemaVersion,
  parsePositiveInt as parsePositiveIntShared,
  parsePositiveNumber as parsePositiveNumberShared,
} from "@beep/repo-utils";
import { Console, Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";

const DefaultGraphitiMcpUrl = "http://127.0.0.1:8123/mcp" as const;
const WorkspaceName = "beep-effect3" as const;
const ExtractorVersion = "p3-v1" as const;
const IncludeRoots = ["apps", "packages", "tooling", ".claude/hooks", ".claude/scripts"] as const;
const ExcludedRoots = ["specs", ".repos"] as const;
const AllowedExtensions = [".ts", ".tsx", ".mts", ".cts"] as const;
const MaxDeltaRatio = 0.2;

type IndexMode = "full" | "delta";
type Provenance = "ast" | "type" | "jsdoc";
type NodeKind = "module" | "function" | "class" | "interface" | "typeAlias" | "variable" | "enum" | "literal";

interface KgNode {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly nodeId: string;
  readonly kind: NodeKind;
  readonly symbol: string;
  readonly file: string;
  readonly signatureCanonical: string;
}

interface KgEdge {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly edgeId: string;
  readonly from: string;
  readonly to: string;
  readonly type: string;
  readonly provenance: Provenance;
  readonly confidence: number;
}

interface FileArtifact {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly workspace: string;
  readonly file: string;
  readonly commitSha: string;
  readonly nodes: ReadonlyArray<KgNode>;
  readonly edges: ReadonlyArray<KgEdge>;
  readonly stats: {
    readonly nodeCount: number;
    readonly edgeCount: number;
    readonly semanticEdgeCount: number;
  };
  readonly artifactHash: string;
}

interface SnapshotRecord {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly workspace: string;
  readonly commitSha: string;
  readonly file: string;
  readonly artifactHash: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly semanticEdgeCount: number;
}

interface SnapshotManifestEntry {
  readonly commitSha: string;
  readonly mode: IndexMode;
  readonly createdAtEpochMs: number;
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly extractorVersion: string;
  readonly tsconfigHash: string;
  readonly scopeHash: string;
  readonly recordHash: string;
  readonly records: number;
}

interface SnapshotManifest {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly extractorVersion: string;
  readonly snapshots: ReadonlyArray<SnapshotManifestEntry>;
  readonly consecutiveDeltaFailures: number;
}

interface GraphitiLedger {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly episodes: Readonly<Record<string, string>>;
}

interface IndexSummary {
  readonly mode: IndexMode;
  readonly effectiveMode: IndexMode;
  readonly commitSha: string;
  readonly changedCount: number;
  readonly selectedCount: number;
  readonly fullScopeCount: number;
  readonly writes: number;
  readonly replayHits: number;
  readonly spoolWrites: number;
  readonly packetNoThrow: boolean;
}

type PublishTarget = "falkor" | "graphiti" | "both";
type SinkTarget = "falkor" | "graphiti";
type ParityProfile = "code-graph-functional" | "code-graph-strict";

interface AstKgNodeV2 {
  readonly nodeId: string;
  readonly kind: NodeKind;
  readonly symbol: string;
  readonly file: string;
  readonly commitSha: string;
  readonly workspace: string;
}

interface AstKgEdgeV2 {
  readonly edgeId: string;
  readonly from: string;
  readonly to: string;
  readonly type: string;
  readonly provenance: Provenance;
  readonly commitSha: string;
}

interface AstKgWriteReceiptV1 {
  readonly target: PublishTarget | "falkor" | "graphiti";
  readonly attempted: number;
  readonly written: number;
  readonly replayed: number;
  readonly failed: number;
  readonly durationMs: number;
  readonly dedupeHits: number;
  readonly dedupeMisses: number;
}

interface PublishSummary {
  readonly mode: IndexMode;
  readonly commitSha: string;
  readonly group: string;
  readonly target: PublishTarget;
  readonly envelopes: number;
  readonly receipts: ReadonlyArray<AstKgWriteReceiptV1>;
}

interface SinkPublishLedger {
  readonly schemaVersion: typeof KgSchemaVersion;
  readonly sinks: Readonly<Record<string, string>>;
}

interface EnvelopeMetadata {
  readonly file: string;
  readonly workspace: string;
  readonly groupId: string;
  readonly commitSha: string;
  readonly parentSha: string;
  readonly branch: string;
  readonly artifactHash: string;
  readonly nodes: ReadonlyArray<AstKgNodeV2>;
  readonly edges: ReadonlyArray<AstKgEdgeV2>;
}

const semanticTagToEdge: Readonly<Record<string, string>> = {
  category: "IN_CATEGORY",
  module: "IN_MODULE",
  domain: "IN_DOMAIN",
  provides: "PROVIDES",
  depends: "DEPENDS_ON",
  errors: "THROWS_DOMAIN_ERROR",
};

const normalizePath = (value: string): string => value.replace(/\\/g, "/").replace(/^\.\//, "");
const canonicalSpaces = (value: string): string => value.trim().replace(/\s+/g, " ");
const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const buildNodeId = (file: string, symbol: string, kind: NodeKind, signatureCanonical: string): string => {
  const digestInput = [
    WorkspaceName,
    normalizePath(file),
    canonicalSpaces(symbol),
    kind,
    canonicalSpaces(signatureCanonical),
  ].join("|");
  const signatureHash = sha256Hex(digestInput);
  return [WorkspaceName, normalizePath(file), canonicalSpaces(symbol), kind, signatureHash].join("::");
};

const buildEdgeId = (from: string, type: string, to: string, provenance: Provenance): string =>
  sha256Hex([from, type, to, provenance].join("|"));

const GraphName = AstKgGroupId;

const escapeCypherString = (value: string): string => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const stringifyCypher = (value: string): string => `'${escapeCypherString(value)}'`;

const relationType = (value: string): string => {
  const upper = value.replace(/[^A-Za-z0-9_]/g, "_").toUpperCase();
  if (upper.length === 0) {
    return "RELATES_TO";
  }
  if (/^[0-9]/.test(upper)) {
    return `R_${upper}`;
  }
  return upper;
};

const resolveGraphitiMcpUrl = (): string => process.env.BEEP_GRAPHITI_URL ?? DefaultGraphitiMcpUrl;

const toNodeKind = (value: string): NodeKind => {
  if (
    value === "module" ||
    value === "function" ||
    value === "class" ||
    value === "interface" ||
    value === "typeAlias" ||
    value === "variable" ||
    value === "enum" ||
    value === "literal"
  ) {
    return value;
  }
  return "variable";
};

const toProvenance = (value: string): Provenance => {
  if (value === "ast" || value === "type" || value === "jsdoc") {
    return value;
  }
  return "ast";
};

const resolveRootDir = (): string =>
  process.env.BEEP_KG_ROOT_OVERRIDE ??
  String(
    execSync("git rev-parse --show-toplevel", {
      stdio: ["ignore", "pipe", "ignore"],
    })
  ).trim();

const falkorContainer = (): string => process.env.BEEP_FALKOR_CONTAINER ?? "graphiti-mcp-falkordb-1";
const falkorUrl = (): string => process.env.BEEP_FALKOR_REDIS_URL ?? "";
const quoteRedisCliArg = (value: string): string => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const runFalkorQueryRaw = (query: string): string => {
  const redisUrl = falkorUrl();
  if (redisUrl.length > 0) {
    return String(
      execFileSync("redis-cli", ["-u", redisUrl, "GRAPH.QUERY", GraphName, query], {
        stdio: ["ignore", "pipe", "pipe"],
      })
    );
  }

  const container = falkorContainer();
  return String(
    execFileSync("docker", ["exec", container, "redis-cli", "GRAPH.QUERY", GraphName, query], {
      stdio: ["ignore", "pipe", "pipe"],
    })
  );
};

const runFalkorQueries = (queries: ReadonlyArray<string>): void => {
  if (queries.length === 0) {
    return;
  }

  const commandBody = `${queries.map((query) => `GRAPH.QUERY ${GraphName} ${quoteRedisCliArg(query)}`).join("\n")}\n`;
  const redisUrl = falkorUrl();

  if (redisUrl.length > 0) {
    execFileSync("redis-cli", ["-u", redisUrl], {
      input: commandBody,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return;
  }

  execFileSync("docker", ["exec", "-i", falkorContainer(), "redis-cli"], {
    input: commandBody,
    stdio: ["pipe", "pipe", "pipe"],
  });
};

const readGitMeta = (): { readonly sha: string; readonly parentSha: string; readonly branch: string } => {
  const read = (command: string): string => {
    try {
      return String(execSync(command, { stdio: ["ignore", "pipe", "ignore"] })).trim();
    } catch {
      return "unknown";
    }
  };

  return {
    sha: read("git rev-parse HEAD"),
    parentSha: read("git rev-parse HEAD^"),
    branch: read("git rev-parse --abbrev-ref HEAD"),
  };
};

const snapshotRoot = (rootDir: string): string => nodePath.join(rootDir, "tooling", "ast-kg", ".cache", "snapshots");
const reverseDepsFile = (rootDir: string, commitSha: string): string =>
  nodePath.join(snapshotRoot(rootDir), "reverse-deps", `${commitSha}.json`);
const symbolIndexFile = (rootDir: string, commitSha: string): string =>
  nodePath.join(snapshotRoot(rootDir), "symbol-index", `${commitSha}.json`);
const snapshotFile = (rootDir: string, commitSha: string): string =>
  nodePath.join(snapshotRoot(rootDir), `${commitSha}.jsonl`);
const manifestFile = (rootDir: string): string => nodePath.join(snapshotRoot(rootDir), "manifest.json");
const spoolFile = (rootDir: string, commitSha: string): string =>
  nodePath.join(rootDir, "tooling", "ast-kg", ".cache", "graphiti-spool", `${commitSha}.jsonl`);
const ledgerFile = (rootDir: string): string =>
  nodePath.join(rootDir, "tooling", "ast-kg", ".cache", "graphiti-ledger.json");
const publishLedgerFile = (rootDir: string): string =>
  nodePath.join(rootDir, "tooling", "ast-kg", ".cache", "publish-ledger.json");

const isIndexableFile = (relativePath: string): boolean => {
  const normalized = normalizePath(relativePath);
  const included = IncludeRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
  const excluded = ExcludedRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
  const extensionAllowed = AllowedExtensions.some((extension) => normalized.endsWith(extension));
  return included && !excluded && extensionAllowed && !normalized.endsWith(".d.ts");
};

const collectFiles = async (rootDir: string): Promise<ReadonlyArray<string>> => {
  const results: Array<string> = [];

  const walk = async (absoluteDir: string): Promise<void> => {
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".turbo" || entry.name === ".git") {
        continue;
      }

      const absolutePath = nodePath.join(absoluteDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        const relative = normalizePath(nodePath.relative(rootDir, absolutePath));
        if (isIndexableFile(relative)) {
          results.push(relative);
        }
      }
    }
  };

  for (const includeRoot of IncludeRoots) {
    const absoluteRoot = nodePath.join(rootDir, includeRoot);
    try {
      const stats = await fs.stat(absoluteRoot);
      if (stats.isDirectory()) {
        await walk(absoluteRoot);
      }
    } catch {
      // Optional include roots can be missing.
    }
  }

  return results.sort((left, right) => left.localeCompare(right));
};

const parseJSDocTags = (block: string): ReadonlyArray<readonly [string, string]> => {
  const tags: Array<readonly [string, string]> = [];
  const pattern = /@(category|module|domain|provides|depends|errors)\s+([^\n*]+)/g;
  for (const match of block.matchAll(pattern)) {
    const tag = match[1];
    const value = match[2];
    if (tag !== undefined && value !== undefined) {
      tags.push([tag, canonicalSpaces(value)]);
    }
  }
  return tags;
};

const parseImportTargets = (content: string): ReadonlyArray<string> => {
  const imports: Array<string> = [];
  const pattern = /import(?:[\s\S]*?from\s+)?["']([^"']+)["']/g;
  for (const match of content.matchAll(pattern)) {
    const target = match[1];
    if (target !== undefined) {
      imports.push(target);
    }
  }
  return imports;
};

const normalizeImportTarget = (file: string, target: string): string => {
  if (!target.startsWith(".")) {
    return `external:${target}`;
  }

  const baseDir = nodePath.dirname(file);
  const resolved = normalizePath(nodePath.normalize(nodePath.join(baseDir, target)));
  const hasExtension = AllowedExtensions.some((extension) => resolved.endsWith(extension));
  return hasExtension ? resolved : `${resolved}.ts`;
};

const parseArtifact = async (rootDir: string, file: string, commitSha: string): Promise<FileArtifact> => {
  const absoluteFile = nodePath.join(rootDir, file);
  const content = await fs.readFile(absoluteFile, "utf8");

  const nodes: Array<KgNode> = [];
  const edges: Array<KgEdge> = [];
  const semanticEdges: Array<KgEdge> = [];

  const moduleSymbol = `module:${file}`;
  const moduleNode: KgNode = {
    schemaVersion: KgSchemaVersion,
    nodeId: buildNodeId(file, moduleSymbol, "module", file),
    kind: "module",
    symbol: moduleSymbol,
    file,
    signatureCanonical: file,
  };
  nodes.push(moduleNode);

  for (const importTarget of parseImportTargets(content)) {
    const normalizedTarget = normalizeImportTarget(file, importTarget);
    const targetNode: KgNode = {
      schemaVersion: KgSchemaVersion,
      nodeId: buildNodeId(file, `module:${normalizedTarget}`, "module", normalizedTarget),
      kind: "module",
      symbol: `module:${normalizedTarget}`,
      file,
      signatureCanonical: normalizedTarget,
    };
    nodes.push(targetNode);
    edges.push({
      schemaVersion: KgSchemaVersion,
      edgeId: buildEdgeId(moduleNode.nodeId, "IMPORTS", targetNode.nodeId, "ast"),
      from: moduleNode.nodeId,
      to: targetNode.nodeId,
      type: "IMPORTS",
      provenance: "ast",
      confidence: 1,
    });
  }

  const declarationPattern =
    /(?:\/\*\*([\s\S]*?)\*\/\s*)?export\s+(?:async\s+)?(function|class|interface|type|const|let|var|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  for (const match of content.matchAll(declarationPattern)) {
    const rawKind = match[2];
    const symbol = match[3];
    const jsdoc = match[1] ?? "";
    if (rawKind === undefined || symbol === undefined) {
      continue;
    }

    let kind: NodeKind;
    if (rawKind === "type") {
      kind = "typeAlias";
    } else if (rawKind === "const" || rawKind === "let" || rawKind === "var") {
      kind = "variable";
    } else if (rawKind === "function") {
      kind = "function";
    } else if (rawKind === "class") {
      kind = "class";
    } else if (rawKind === "interface") {
      kind = "interface";
    } else {
      kind = "enum";
    }

    const start = match.index ?? 0;
    const snippet = content.slice(start, Math.min(start + 320, content.length));
    const signature = canonicalSpaces(snippet.split("\n")[0] ?? "");

    const symbolNode: KgNode = {
      schemaVersion: KgSchemaVersion,
      nodeId: buildNodeId(file, symbol, kind, signature),
      kind,
      symbol,
      file,
      signatureCanonical: signature,
    };
    nodes.push(symbolNode);

    edges.push({
      schemaVersion: KgSchemaVersion,
      edgeId: buildEdgeId(moduleNode.nodeId, "CONTAINS", symbolNode.nodeId, "ast"),
      from: moduleNode.nodeId,
      to: symbolNode.nodeId,
      type: "CONTAINS",
      provenance: "ast",
      confidence: 1,
    });

    for (const [tag, value] of parseJSDocTags(jsdoc)) {
      const edgeType = semanticTagToEdge[tag];
      if (edgeType === undefined || value.length === 0) {
        continue;
      }
      const literalNode: KgNode = {
        schemaVersion: KgSchemaVersion,
        nodeId: buildNodeId(file, `literal:${value}`, "literal", value),
        kind: "literal",
        symbol: `literal:${value}`,
        file,
        signatureCanonical: value,
      };
      nodes.push(literalNode);
      const semanticEdge: KgEdge = {
        schemaVersion: KgSchemaVersion,
        edgeId: buildEdgeId(symbolNode.nodeId, edgeType, literalNode.nodeId, "jsdoc"),
        from: symbolNode.nodeId,
        to: literalNode.nodeId,
        type: edgeType,
        provenance: "jsdoc",
        confidence: 1,
      };
      edges.push(semanticEdge);
      semanticEdges.push(semanticEdge);
    }
  }

  const uniqueNodes = [...new Map(nodes.map((node) => [node.nodeId, node])).values()].sort((a, b) =>
    a.nodeId.localeCompare(b.nodeId)
  );
  const uniqueEdges = [...new Map(edges.map((edge) => [edge.edgeId, edge])).values()].sort((a, b) =>
    a.edgeId.localeCompare(b.edgeId)
  );

  const artifactWithoutHash = {
    schemaVersion: KgSchemaVersion,
    workspace: WorkspaceName,
    file,
    commitSha,
    nodes: uniqueNodes,
    edges: uniqueEdges,
    stats: {
      nodeCount: uniqueNodes.length,
      edgeCount: uniqueEdges.length,
      semanticEdgeCount: semanticEdges.length,
    },
  };

  return {
    ...artifactWithoutHash,
    artifactHash: sha256Hex(JSON.stringify(artifactWithoutHash)),
  };
};

const readJson = async <A>(file: string, fallback: A): Promise<A> => {
  try {
    const content = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(content) as A;
    return parsed;
  } catch {
    return fallback;
  }
};

const writeJson = async (file: string, value: unknown): Promise<void> => {
  await fs.mkdir(nodePath.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const formatCliJson = (value: unknown): string => {
  // CLI command summaries are intentionally machine-readable JSON payloads.
  return JSON.stringify(value, null, 2);
};

const buildSinkLedgerKey = (
  sink: SinkTarget,
  groupId: string,
  workspace: string,
  commitSha: string,
  file: string
): string => [sink, canonicalSpaces(groupId), workspace, commitSha, normalizePath(file)].join("|");

const readSinkPublishLedger = async (rootDir: string): Promise<SinkPublishLedger> =>
  readJson<SinkPublishLedger>(publishLedgerFile(rootDir), {
    schemaVersion: KgSchemaVersion,
    sinks: {},
  });

const writeSinkPublishLedger = async (rootDir: string, sinks: Readonly<Record<string, string>>): Promise<void> =>
  writeJson(publishLedgerFile(rootDir), {
    schemaVersion: KgSchemaVersion,
    sinks,
  });

const parseEnvelopeMetadata = (
  envelope: Readonly<Record<string, unknown>>,
  fallbackCommitSha: string,
  fallbackGroupId: string
): EnvelopeMetadata => {
  const file = String(envelope.file ?? "unknown.ts");
  const workspace = String(envelope.workspace ?? WorkspaceName);
  const groupId = String(envelope.groupId ?? fallbackGroupId);
  const artifactHash = String(envelope.artifactHash ?? sha256Hex(JSON.stringify(envelope)));
  const commit =
    typeof envelope.commit === "object" && envelope.commit !== null
      ? (envelope.commit as Record<string, unknown>)
      : { sha: fallbackCommitSha, parentSha: "unknown", branch: "unknown" };
  const commitSha = String(commit.sha ?? fallbackCommitSha);
  const parentSha = String(commit.parentSha ?? "unknown");
  const branch = String(commit.branch ?? "unknown");

  const nodes: Array<AstKgNodeV2> = [];
  if (Array.isArray(envelope.nodes)) {
    for (const candidate of envelope.nodes) {
      if (typeof candidate !== "object" || candidate === null) {
        continue;
      }
      const raw = candidate as Record<string, unknown>;
      nodes.push({
        nodeId: String(raw.nodeId ?? ""),
        kind: toNodeKind(String(raw.kind ?? "variable")),
        symbol: String(raw.symbol ?? ""),
        file: String(raw.file ?? file),
        commitSha,
        workspace,
      });
    }
  }

  const edges: Array<AstKgEdgeV2> = [];
  if (Array.isArray(envelope.edges)) {
    for (const candidate of envelope.edges) {
      if (typeof candidate !== "object" || candidate === null) {
        continue;
      }
      const raw = candidate as Record<string, unknown>;
      edges.push({
        edgeId: String(raw.edgeId ?? ""),
        from: String(raw.from ?? ""),
        to: String(raw.to ?? ""),
        type: String(raw.type ?? "RELATES_TO"),
        provenance: toProvenance(String(raw.provenance ?? "ast")),
        commitSha,
      });
    }
  }

  return {
    file,
    workspace,
    groupId,
    commitSha,
    parentSha,
    branch,
    artifactHash,
    nodes,
    edges,
  };
};

const applyGroupOverride = (
  envelopes: ReadonlyArray<Record<string, unknown>>,
  groupOverride: O.Option<string>
): ReadonlyArray<Record<string, unknown>> =>
  O.match(groupOverride, {
    onNone: () => envelopes,
    onSome: (groupId) => envelopes.map((envelope) => ({ ...envelope, groupId })),
  });

const publishGroupFromEnvelopes = (envelopes: ReadonlyArray<Record<string, unknown>>): string => {
  for (const envelope of envelopes) {
    const groupId = envelope.groupId;
    if (typeof groupId === "string" && groupId.length > 0) {
      return groupId;
    }
  }
  return AstKgGroupId;
};

const readSnapshotRecords = async (rootDir: string, commitSha: string): Promise<ReadonlyArray<SnapshotRecord>> => {
  const file = snapshotFile(rootDir, commitSha);
  try {
    const content = await fs.readFile(file, "utf8");
    const records: Array<SnapshotRecord> = [];
    for (const line of content
      .split("\n")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)) {
      try {
        const raw = JSON.parse(line) as Partial<SnapshotRecord>;
        if (
          raw.file !== undefined &&
          raw.artifactHash !== undefined &&
          raw.commitSha !== undefined &&
          raw.nodeCount !== undefined &&
          raw.edgeCount !== undefined &&
          raw.semanticEdgeCount !== undefined
        ) {
          records.push({
            schemaVersion: KgSchemaVersion,
            workspace: WorkspaceName,
            file: raw.file,
            artifactHash: raw.artifactHash,
            commitSha: raw.commitSha,
            nodeCount: raw.nodeCount,
            edgeCount: raw.edgeCount,
            semanticEdgeCount: raw.semanticEdgeCount,
          });
        }
      } catch {
        // Skip malformed line.
      }
    }
    return records;
  } catch {
    return [];
  }
};

const writeSnapshotRecords = async (
  rootDir: string,
  commitSha: string,
  records: ReadonlyArray<SnapshotRecord>
): Promise<void> => {
  await fs.mkdir(snapshotRoot(rootDir), { recursive: true });
  const body = [...records]
    .sort((a, b) => a.file.localeCompare(b.file))
    .map((record) => JSON.stringify(record))
    .join("\n");
  await fs.writeFile(snapshotFile(rootDir, commitSha), body.length === 0 ? "" : `${body}\n`, "utf8");
};

const writeIndexes = async (
  rootDir: string,
  commitSha: string,
  artifacts: ReadonlyArray<FileArtifact>
): Promise<void> => {
  const reverse = new Map<string, Array<string>>();
  const symbol = new Map<string, Array<string>>();

  for (const artifact of artifacts) {
    const moduleNodeId = buildNodeId(artifact.file, `module:${artifact.file}`, "module", artifact.file);
    for (const edge of artifact.edges) {
      if (edge.type === "IMPORTS" && edge.from === moduleNodeId) {
        const targetNode = artifact.nodes.find((node) => node.nodeId === edge.to);
        if (targetNode !== undefined) {
          const owners = reverse.get(targetNode.signatureCanonical) ?? [];
          if (!owners.includes(artifact.file)) {
            reverse.set(targetNode.signatureCanonical, [...owners, artifact.file]);
          }
        }
      }
    }

    for (const node of artifact.nodes) {
      if (node.kind === "module" || node.kind === "literal") {
        continue;
      }
      const owners = symbol.get(node.symbol) ?? [];
      if (!owners.includes(artifact.file)) {
        symbol.set(node.symbol, [...owners, artifact.file]);
      }
    }
  }

  const reverseObject = Object.fromEntries([...reverse.entries()].map(([key, value]) => [key, [...value].sort()]));
  const symbolObject = Object.fromEntries([...symbol.entries()].map(([key, value]) => [key, [...value].sort()]));

  await writeJson(reverseDepsFile(rootDir, commitSha), reverseObject);
  await writeJson(symbolIndexFile(rootDir, commitSha), symbolObject);
};

const toSnapshotRecord = (artifact: FileArtifact): SnapshotRecord => ({
  schemaVersion: KgSchemaVersion,
  workspace: WorkspaceName,
  commitSha: artifact.commitSha,
  file: artifact.file,
  artifactHash: artifact.artifactHash,
  nodeCount: artifact.stats.nodeCount,
  edgeCount: artifact.stats.edgeCount,
  semanticEdgeCount: artifact.stats.semanticEdgeCount,
});

const buildEpisodeUuid = (commitSha: string, file: string): string =>
  sha256Hex([AstKgGroupId, WorkspaceName, commitSha, file, KgSchemaVersion].join("|"));

const buildRecordHash = (records: ReadonlyArray<SnapshotRecord>): string => {
  const canonical = [...records]
    .sort((a, b) => a.file.localeCompare(b.file))
    .map((record) => [record.file, record.artifactHash, String(record.nodeCount), String(record.edgeCount)].join("|"))
    .join("\n");
  return sha256Hex(canonical);
};

const buildScopeHash = (): string => sha256Hex(JSON.stringify({ include: IncludeRoots, exclude: ExcludedRoots }));

const tsconfigHash = (rootDir: string): string => {
  try {
    const content = String(
      execSync("cat tsconfig.packages.json", { cwd: rootDir, stdio: ["ignore", "pipe", "ignore"] })
    );
    return sha256Hex(content);
  } catch {
    return "unknown";
  }
};

const parseChanged = (changedFlag: O.Option<string>): ReadonlyArray<string> =>
  O.match(changedFlag, {
    onNone: () => [],
    onSome: (raw) =>
      raw
        .split(",")
        .map((entry) => normalizePath(entry.trim()))
        .filter((entry) => entry.length > 0),
  });

/**
 * Run one KG index operation and return a structured summary.
 *
 * This helper is exported for command integration and targeted tests.
 *
 * @param mode - Requested indexing mode (`full` or `delta`).
 * @param changedFlag - Optional comma-separated changed-file list used for delta mode selection.
 * @returns Structured summary for the indexing run and emitted artifact counts.
 * @domain kg-cli
 * @provides IndexSummary
 * @depends FileSystem, Git, SnapshotStore
 * @errors DomainError
 * @since 0.0.0
 * @category UseCase
 * @internal
 */
export const runKgIndexNode = async (mode: IndexMode, changedFlag: O.Option<string>): Promise<IndexSummary> => {
  const rootDir = resolveRootDir();
  const git = readGitMeta();

  const manifest = await readJson<SnapshotManifest>(manifestFile(rootDir), {
    schemaVersion: KgSchemaVersion,
    extractorVersion: ExtractorVersion,
    snapshots: [],
    consecutiveDeltaFailures: 0,
  });

  const allFiles = await collectFiles(rootDir);
  const changed = parseChanged(changedFlag);

  if (mode === "delta" && changed.length === 0) {
    return {
      mode,
      effectiveMode: mode,
      commitSha: git.sha,
      changedCount: 0,
      selectedCount: 0,
      fullScopeCount: allFiles.length,
      writes: 0,
      replayHits: 0,
      spoolWrites: 0,
      packetNoThrow: true,
    };
  }

  const parentSha =
    manifest.snapshots.length > 0 ? (manifest.snapshots[manifest.snapshots.length - 1]?.commitSha ?? "") : "";
  const reverse =
    parentSha.length > 0
      ? await readJson<Record<string, ReadonlyArray<string>>>(reverseDepsFile(rootDir, parentSha), {})
      : {};
  const symbols =
    parentSha.length > 0
      ? await readJson<Record<string, ReadonlyArray<string>>>(symbolIndexFile(rootDir, parentSha), {})
      : {};

  let effectiveMode: IndexMode = mode;
  let selectedFiles: ReadonlyArray<string>;
  const tombstones: Array<string> = [];

  if (mode === "full") {
    selectedFiles = allFiles;
  } else {
    const changedInScope = changed.filter((file) => isIndexableFile(file));
    const widened = new Set<string>();

    for (const file of changedInScope) {
      if (allFiles.includes(file)) {
        widened.add(file);
      } else {
        tombstones.push(file);
      }

      for (const importer of reverse[file] ?? []) {
        if (allFiles.includes(importer)) {
          widened.add(importer);
        }
      }

      const basename =
        file
          .split("/")
          .at(-1)
          ?.replace(/\.(ts|tsx|mts|cts)$/, "") ?? "";
      if (basename.length > 0) {
        for (const owner of symbols[basename] ?? []) {
          if (allFiles.includes(owner)) {
            widened.add(owner);
          }
        }
      }
    }

    const widenedList = [...widened].sort((a, b) => a.localeCompare(b));
    if (allFiles.length > 0 && widenedList.length / allFiles.length > MaxDeltaRatio) {
      effectiveMode = "full";
      selectedFiles = allFiles;
    } else {
      selectedFiles = widenedList;
    }
  }

  const artifacts: Array<FileArtifact> = [];
  for (const file of selectedFiles) {
    artifacts.push(await parseArtifact(rootDir, file, git.sha));
  }

  for (const file of tombstones) {
    artifacts.push({
      schemaVersion: KgSchemaVersion,
      workspace: WorkspaceName,
      file,
      commitSha: git.sha,
      nodes: [],
      edges: [],
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        semanticEdgeCount: 0,
      },
      artifactHash: sha256Hex(JSON.stringify({ file, tombstone: true, commit: git.sha })),
    });
  }

  const previousRecords =
    effectiveMode === "delta" && parentSha.length > 0 ? await readSnapshotRecords(rootDir, parentSha) : [];
  const recordMap = new Map(previousRecords.map((record) => [record.file, record]));
  const currentRecords = artifacts.map(toSnapshotRecord);

  if (effectiveMode === "full") {
    for (const [key] of recordMap) {
      recordMap.delete(key);
    }
  }

  for (const record of currentRecords) {
    const isTombstone = tombstones.includes(record.file) && record.nodeCount === 0 && record.edgeCount === 0;
    if (isTombstone) {
      recordMap.delete(record.file);
    } else {
      recordMap.set(record.file, record);
    }
  }

  const finalRecords = effectiveMode === "full" ? currentRecords : [...recordMap.values()];
  await writeSnapshotRecords(rootDir, git.sha, finalRecords);
  await writeIndexes(
    rootDir,
    git.sha,
    artifacts.filter((artifact) => artifact.nodes.length > 0 || artifact.edges.length > 0)
  );

  const ledger = await readJson<GraphitiLedger>(ledgerFile(rootDir), { schemaVersion: KgSchemaVersion, episodes: {} });
  const episodes: Record<string, string> = { ...ledger.episodes };
  const forceOutage = process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE === "true";
  const jsonUnavailable = process.env.BEEP_KG_GRAPHITI_JSON_UNAVAILABLE === "true";
  const ignoreLedger = process.env.BEEP_KG_IGNORE_LEDGER === "true";

  let writes = 0;
  let replayHits = 0;
  let spoolWrites = 0;

  for (const artifact of artifacts) {
    const episodeUuid = buildEpisodeUuid(git.sha, artifact.file);
    const existing = episodes[episodeUuid];
    if (!ignoreLedger && existing !== undefined) {
      if (existing === artifact.artifactHash) {
        replayHits += 1;
        continue;
      }
      throw new DomainError({
        message: `Graphiti deterministic conflict for ${artifact.file}: same UUID with different artifact hash`,
      });
    }

    if (forceOutage) {
      const envelope = jsonUnavailable
        ? [
            "AST_KG_EPISODE_V1",
            `workspace=${WorkspaceName}`,
            `group=${AstKgGroupId}`,
            `commit=${git.sha}`,
            `file=${artifact.file}`,
            `artifactHash=${artifact.artifactHash}`,
            `nodeCount=${String(artifact.stats.nodeCount)}`,
            `edgeCount=${String(artifact.stats.edgeCount)}`,
          ].join("|")
        : JSON.stringify({
            envelopeVersion: AstKgEnvelopeVersion,
            schemaVersion: KgSchemaVersion,
            workspace: WorkspaceName,
            groupId: AstKgGroupId,
            mode: effectiveMode,
            commit: git,
            file: artifact.file,
            artifactHash: artifact.artifactHash,
            nodeCount: artifact.stats.nodeCount,
            edgeCount: artifact.stats.edgeCount,
            semanticEdgeCount: artifact.stats.semanticEdgeCount,
            nodes: artifact.nodes,
            edges: artifact.edges,
          });

      await fs.mkdir(nodePath.dirname(spoolFile(rootDir, git.sha)), { recursive: true });
      await fs.appendFile(spoolFile(rootDir, git.sha), `${envelope}\n`, "utf8");
      spoolWrites += 1;
      continue;
    }

    episodes[episodeUuid] = artifact.artifactHash;
    writes += 1;
  }

  await writeJson(ledgerFile(rootDir), {
    schemaVersion: KgSchemaVersion,
    episodes,
  });

  const nextEntry: SnapshotManifestEntry = {
    commitSha: git.sha,
    mode: effectiveMode,
    createdAtEpochMs: Date.now(),
    schemaVersion: KgSchemaVersion,
    extractorVersion: ExtractorVersion,
    tsconfigHash: tsconfigHash(rootDir),
    scopeHash: buildScopeHash(),
    recordHash: buildRecordHash(finalRecords),
    records: finalRecords.length,
  };

  const snapshots = [...manifest.snapshots.filter((entry) => entry.commitSha !== git.sha), nextEntry]
    .sort((a, b) => b.createdAtEpochMs - a.createdAtEpochMs)
    .slice(0, 50);

  await writeJson(manifestFile(rootDir), {
    schemaVersion: KgSchemaVersion,
    extractorVersion: ExtractorVersion,
    snapshots,
    consecutiveDeltaFailures: 0,
  });

  return {
    mode,
    effectiveMode,
    commitSha: git.sha,
    changedCount: changed.length,
    selectedCount: selectedFiles.length,
    fullScopeCount: allFiles.length,
    writes,
    replayHits,
    spoolWrites,
    packetNoThrow: true,
  };
};

const readSpoolEnvelopes = async (
  rootDir: string,
  commitSha: string
): Promise<ReadonlyArray<Record<string, unknown>>> => {
  const file = spoolFile(rootDir, commitSha);
  try {
    const content = await fs.readFile(file, "utf8");
    const envelopes: Array<Record<string, unknown>> = [];
    for (const line of content.split("\n").map((entry) => entry.trim())) {
      if (line.length === 0 || line.startsWith("AST_KG_EPISODE_V1")) {
        continue;
      }
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>;
        envelopes.push(parsed);
      } catch {
        // Ignore malformed lines.
      }
    }
    return envelopes;
  } catch {
    return [];
  }
};

const generatePublishEnvelopes = async (
  mode: IndexMode,
  changed: O.Option<string>
): Promise<{
  readonly rootDir: string;
  readonly commitSha: string;
  readonly envelopes: ReadonlyArray<Record<string, unknown>>;
}> => {
  const previousOutage = process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE;
  const previousIgnore = process.env.BEEP_KG_IGNORE_LEDGER;
  process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE = "true";
  process.env.BEEP_KG_IGNORE_LEDGER = "true";

  try {
    const summary = await runKgIndexNode(mode, changed);
    const rootDir = resolveRootDir();

    const envelopes = await readSpoolEnvelopes(rootDir, summary.commitSha);
    return { rootDir, commitSha: summary.commitSha, envelopes };
  } finally {
    if (previousOutage === undefined) {
      delete process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE;
    } else {
      process.env.BEEP_KG_FORCE_GRAPHITI_OUTAGE = previousOutage;
    }

    if (previousIgnore === undefined) {
      delete process.env.BEEP_KG_IGNORE_LEDGER;
    } else {
      process.env.BEEP_KG_IGNORE_LEDGER = previousIgnore;
    }
  }
};

const initializeMcp = async (url: string): Promise<string> => {
  return Effect.runPromise(initializeMcpSession(url, "beep-kg", "0.0.0")).catch((cause) => {
    throw cause instanceof DomainError ? cause : new DomainError({ message: "Graphiti MCP initialize failed", cause });
  });
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  return parsePositiveIntShared(O.fromNullishOr(value), fallback);
};

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  return parsePositiveNumberShared(O.fromNullishOr(value), fallback);
};

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);

const ensureGraphitiProxyPreflight = async (graphitiUrl: string): Promise<void> => {
  return Effect.runPromise(ensureGraphitiProxyPreflightShared(graphitiUrl)).catch((cause) => {
    throw cause instanceof DomainError
      ? cause
      : new DomainError({
          message: "Graphiti proxy preflight failed",
          cause,
        });
  });
};

const recordValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<Record<string, unknown>> => {
  const value = record[key];
  if (isRecord(value)) {
    return O.some(value);
  }
  return O.none();
};

const stringValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<string> => {
  const value = record[key];
  return P.isString(value) ? O.some(value) : O.none();
};

const arrayValue = (record: Readonly<Record<string, unknown>>, key: string): O.Option<ReadonlyArray<unknown>> => {
  const value = record[key];
  return A.isArray(value) ? O.some(value) : O.none();
};

const sleep = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isCommitShaLike = (value: string): boolean => /^[0-9a-f]{7,64}$/i.test(value.trim());
const normalizeCommitSha = (value: string): string => value.trim().toLowerCase();

const commitShaFromEpisodeName = (name: string): O.Option<string> => {
  const parts = name.split(":");
  const candidate = parts[2] ?? "";
  if (!isCommitShaLike(candidate)) {
    return O.none();
  }
  return O.some(normalizeCommitSha(candidate));
};

const commitShaFromEpisodeContent = (content: string): O.Option<string> => {
  const parseJson = S.decodeUnknownSync(S.UnknownFromJsonString);
  let decoded: unknown;
  try {
    decoded = parseJson(content);
  } catch {
    return O.none();
  }
  if (!isRecord(decoded)) {
    return O.none();
  }

  const metadata = recordValue(decoded, "metadata");
  if (O.isSome(metadata)) {
    const metadataCommit = stringValue(metadata.value, "commitSha");
    if (O.isSome(metadataCommit) && isCommitShaLike(metadataCommit.value)) {
      return O.some(normalizeCommitSha(metadataCommit.value));
    }
  }

  const topLevelCommit = stringValue(decoded, "commitSha");
  if (O.isSome(topLevelCommit) && isCommitShaLike(topLevelCommit.value)) {
    return O.some(normalizeCommitSha(topLevelCommit.value));
  }

  return O.none();
};

const extractGraphitiEpisodes = (
  payload: O.Option<Record<string, unknown>>
): ReadonlyArray<Readonly<Record<string, unknown>>> => {
  if (O.isNone(payload)) {
    return [];
  }
  const result = recordValue(payload.value, "result");
  if (O.isNone(result)) {
    return [];
  }
  const structured = recordValue(result.value, "structuredContent");
  if (O.isNone(structured)) {
    return [];
  }
  const structuredResult = recordValue(structured.value, "result");
  if (O.isNone(structuredResult)) {
    return [];
  }
  const episodes = arrayValue(structuredResult.value, "episodes");
  if (O.isNone(episodes)) {
    return [];
  }

  const normalized: Array<Readonly<Record<string, unknown>>> = [];
  for (const entry of episodes.value) {
    if (isRecord(entry)) {
      normalized.push(entry);
    }
  }
  return normalized;
};

const countCommitMatchedEpisodes = (
  episodes: ReadonlyArray<Readonly<Record<string, unknown>>>,
  expectedCommitSha: string
): number => {
  let matched = 0;
  for (const episode of episodes) {
    const nameValue = stringValue(episode, "name");
    const contentValue = stringValue(episode, "content");
    const fromName = O.isSome(nameValue) ? commitShaFromEpisodeName(nameValue.value) : O.none();
    const commitSha =
      O.isSome(fromName) || O.isNone(contentValue) ? fromName : commitShaFromEpisodeContent(contentValue.value);

    if (O.isSome(commitSha) && commitSha.value === expectedCommitSha) {
      matched += 1;
    }
  }
  return matched;
};

const verifyGraphitiEpisodes = async (
  url: string,
  sessionId: string,
  group: string,
  commitSha: string
): Promise<{
  readonly status: number;
  readonly bodySnippet: string;
  readonly message: string;
  readonly episodesObserved: number;
  readonly episodesScanned: number;
  readonly episodesCommitMatched: number;
  readonly expectedCommitSha: string;
  readonly requiresCommitMatch: boolean;
  readonly contractSatisfied: boolean;
  readonly attempts: number;
  readonly waitedMs: number;
  readonly pollMs: number;
  readonly pollMaxMs: number;
  readonly pollMultiplier: number;
  readonly maxWaitMs: number;
  readonly requestTimeoutMs: number;
  readonly firstVisibleAtMs: number;
  readonly timedOut: boolean;
}> => {
  const maxWaitMs = parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_WAIT_MS, 180_000);
  const pollMinMs = parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_POLL_MIN_MS, 500);
  const legacyPollMs = parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_POLL_MS, pollMinMs);
  const pollMs = Math.max(1, legacyPollMs);
  const pollMaxMs = Math.max(pollMs, parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_POLL_MAX_MS, 4_000));
  const pollMultiplier = parsePositiveNumber(process.env.BEEP_GRAPHITI_VERIFY_POLL_MULTIPLIER, 1.5);
  const maxEpisodes = parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_MAX_EPISODES, 1);
  const requestTimeoutMs = parsePositiveInt(process.env.BEEP_GRAPHITI_VERIFY_REQUEST_TIMEOUT_MS, 10_000);
  const expectedCommitSha = normalizeCommitSha(commitSha);
  const requiresCommitMatch = isCommitShaLike(expectedCommitSha);
  const startedAt = Date.now();

  let attempts = 0;
  let status = 0;
  let bodySnippet = "";
  let message = "";
  let episodesObserved = 0;
  let episodesScanned = 0;
  let episodesCommitMatched = 0;
  let firstVisibleAtMs = 0;
  let nextPollMs = pollMs;

  while (true) {
    attempts += 1;

    try {
      const response = await Effect.runPromise(
        callMcpTool(
          url,
          sessionId,
          "get_episodes",
          {
            group_ids: [group],
            max_episodes: maxEpisodes,
          },
          "kg-verify-episodes",
          O.some(requestTimeoutMs)
        )
      );

      const parsed = response.result;
      status = response.status;
      bodySnippet = response.body.slice(0, 400);
      message = parsed.message;

      if (parsed.isError) {
        if (response.status >= 400 && response.status < 500) {
          throw new DomainError({
            message: `Graphiti get_episodes failed for group ${group}: ${parsed.message}`,
          });
        }
      } else {
        const episodes = extractGraphitiEpisodes(parsed.payload);
        episodesObserved = episodes.length;
        episodesScanned = episodes.length;
        episodesCommitMatched = requiresCommitMatch
          ? countCommitMatchedEpisodes(episodes, expectedCommitSha)
          : episodes.length;
        if (episodesObserved > 0 && firstVisibleAtMs === 0) {
          firstVisibleAtMs = Date.now() - startedAt;
        }
      }
    } catch (cause) {
      if (cause instanceof DomainError) {
        throw cause;
      }
      status = 0;
      bodySnippet = "";
      message = cause instanceof Error ? cause.message : String(cause);
    }

    const waitedMs = Date.now() - startedAt;
    const contractSatisfied = episodesObserved > 0 && episodesCommitMatched > 0;
    if (contractSatisfied) {
      return {
        status,
        bodySnippet,
        message,
        episodesObserved,
        episodesScanned,
        episodesCommitMatched,
        expectedCommitSha,
        requiresCommitMatch,
        contractSatisfied,
        attempts,
        waitedMs,
        pollMs,
        pollMaxMs,
        pollMultiplier,
        maxWaitMs,
        requestTimeoutMs,
        firstVisibleAtMs,
        timedOut: false,
      };
    }

    if (waitedMs >= maxWaitMs) {
      return {
        status,
        bodySnippet,
        message: message.length > 0 ? message : "No episodes found",
        episodesObserved,
        episodesScanned,
        episodesCommitMatched,
        expectedCommitSha,
        requiresCommitMatch,
        contractSatisfied,
        attempts,
        waitedMs,
        pollMs,
        pollMaxMs,
        pollMultiplier,
        maxWaitMs,
        requestTimeoutMs,
        firstVisibleAtMs,
        timedOut: true,
      };
    }

    const jitterCeiling = Math.max(1, Math.floor(nextPollMs * 0.2));
    const jitter = Math.floor(Math.random() * jitterCeiling);
    const sleepMs = Math.min(pollMaxMs, nextPollMs + jitter);
    await sleep(sleepMs);
    const scaled = Math.round(nextPollMs * pollMultiplier);
    nextPollMs = Math.max(pollMs, Math.min(pollMaxMs, scaled));
  }
};

const publishToGraphiti = async (
  envelopes: ReadonlyArray<Record<string, unknown>>,
  commitSha: string,
  rootDir: string
): Promise<AstKgWriteReceiptV1> => {
  const start = Date.now();
  const url = resolveGraphitiMcpUrl();
  const defaultGroupId = process.env.BEEP_GRAPHITI_GROUP_ID ?? AstKgGroupId;
  const sessionId = await initializeMcp(url);
  const ledger = await readSinkPublishLedger(rootDir);
  const sinkEntries: Record<string, string> = { ...ledger.sinks };
  let written = 0;
  let failed = 0;
  let dedupeHits = 0;
  let dedupeMisses = 0;

  for (const envelope of envelopes) {
    const metadata = parseEnvelopeMetadata(envelope, commitSha, defaultGroupId);
    const sinkKey = buildSinkLedgerKey(
      "graphiti",
      metadata.groupId,
      metadata.workspace,
      metadata.commitSha,
      metadata.file
    );
    const existingHash = sinkEntries[sinkKey];
    if (existingHash !== undefined && existingHash === metadata.artifactHash) {
      dedupeHits += 1;
      continue;
    }

    const name = `ast-kg:${metadata.workspace}:${metadata.commitSha}:${metadata.file}`;
    const response = await Effect.runPromise(
      callMcpTool(
        url,
        sessionId,
        "add_memory",
        {
          name,
          episode_body: JSON.stringify(envelope),
          source: "json",
          source_description: "p6 dual-write publish",
          group_id: metadata.groupId,
        },
        `kg-add-${written + failed + 1}`
      )
    );
    const parsed = response.result;
    if (!parsed.isError) {
      written += 1;
      dedupeMisses += 1;
      sinkEntries[sinkKey] = metadata.artifactHash;
    } else {
      failed += 1;
    }
  }

  await writeSinkPublishLedger(rootDir, sinkEntries);

  return {
    target: "graphiti",
    attempted: envelopes.length,
    written,
    replayed: dedupeHits,
    failed,
    durationMs: Date.now() - start,
    dedupeHits,
    dedupeMisses,
  };
};

const nodeLabelForKind = (kind: string): string => {
  if (kind === "module") {
    return "Module";
  }
  if (kind === "literal") {
    return "Literal";
  }
  return "Symbol";
};

const publishToFalkor = async (
  envelopes: ReadonlyArray<Record<string, unknown>>,
  commitSha: string,
  rootDir: string
): Promise<AstKgWriteReceiptV1> => {
  const start = Date.now();
  const defaultGroupId = AstKgGroupId;
  const ledger = await readSinkPublishLedger(rootDir);
  const sinkEntries: Record<string, string> = { ...ledger.sinks };
  let written = 0;
  let failed = 0;
  let dedupeHits = 0;
  let dedupeMisses = 0;

  try {
    runFalkorQueries([
      "CREATE INDEX FOR (n:File) ON (n.nodeId)",
      "CREATE INDEX FOR (n:Symbol) ON (n.nodeId)",
      "CREATE INDEX FOR (n:Module) ON (n.nodeId)",
      "CREATE INDEX FOR (n:Literal) ON (n.nodeId)",
      "CREATE INDEX FOR (n:Commit) ON (n.sha)",
    ]);
  } catch {
    // Indexes may already exist.
  }

  for (const envelope of envelopes) {
    try {
      const metadata = parseEnvelopeMetadata(envelope, commitSha, defaultGroupId);
      const sinkKey = buildSinkLedgerKey(
        "falkor",
        metadata.groupId,
        metadata.workspace,
        metadata.commitSha,
        metadata.file
      );
      const existingHash = sinkEntries[sinkKey];
      if (existingHash !== undefined && existingHash === metadata.artifactHash) {
        dedupeHits += 1;
        continue;
      }

      const fileNodeId = buildNodeId(metadata.file, `module:${metadata.file}`, "module", metadata.file);
      const queries: Array<string> = [
        `MERGE (c:Commit {sha:${stringifyCypher(metadata.commitSha)}, groupId:${stringifyCypher(metadata.groupId)}}) SET c.parentSha=${stringifyCypher(metadata.parentSha)}, c.branch=${stringifyCypher(metadata.branch)}, c.workspace=${stringifyCypher(metadata.workspace)}`,
        `MERGE (f:File:Searchable {nodeId:${stringifyCypher(fileNodeId)}, groupId:${stringifyCypher(metadata.groupId)}}) SET f.file=${stringifyCypher(metadata.file)}, f.workspace=${stringifyCypher(metadata.workspace)}, f.commitSha=${stringifyCypher(metadata.commitSha)}`,
        `MATCH (c:Commit {sha:${stringifyCypher(metadata.commitSha)}, groupId:${stringifyCypher(metadata.groupId)}}), (f:File {nodeId:${stringifyCypher(fileNodeId)}, groupId:${stringifyCypher(metadata.groupId)}}) MERGE (c)-[:CONTAINS]->(f)`,
      ];

      for (const rawNode of metadata.nodes) {
        const nodeId = rawNode.nodeId;
        if (nodeId.length === 0) {
          continue;
        }
        const kind = rawNode.kind;
        const symbol = rawNode.symbol;
        const label = nodeLabelForKind(kind);
        queries.push(
          `MERGE (n:${label}:Searchable {nodeId:${stringifyCypher(nodeId)}, groupId:${stringifyCypher(metadata.groupId)}}) SET n.kind=${stringifyCypher(kind)}, n.symbol=${stringifyCypher(symbol)}, n.file=${stringifyCypher(metadata.file)}, n.commitSha=${stringifyCypher(metadata.commitSha)}, n.workspace=${stringifyCypher(metadata.workspace)}`
        );
      }

      for (const rawEdge of metadata.edges) {
        const from = rawEdge.from;
        const to = rawEdge.to;
        const edgeType = relationType(rawEdge.type);
        const provenance = rawEdge.provenance;
        if (from.length === 0 || to.length === 0) {
          continue;
        }
        queries.push(
          `MATCH (a {nodeId:${stringifyCypher(from)}, groupId:${stringifyCypher(metadata.groupId)}}), (b {nodeId:${stringifyCypher(to)}, groupId:${stringifyCypher(metadata.groupId)}}) MERGE (a)-[r:${edgeType}]->(b) SET r.provenance=${stringifyCypher(provenance)}, r.commitSha=${stringifyCypher(metadata.commitSha)}, r.groupId=${stringifyCypher(metadata.groupId)}`
        );
      }

      runFalkorQueries(queries);
      written += 1;
      dedupeMisses += 1;
      sinkEntries[sinkKey] = metadata.artifactHash;
    } catch {
      failed += 1;
    }
  }

  await writeSinkPublishLedger(rootDir, sinkEntries);

  return {
    target: "falkor",
    attempted: envelopes.length,
    written,
    replayed: dedupeHits,
    failed,
    durationMs: Date.now() - start,
    dedupeHits,
    dedupeMisses,
  };
};

const publishEnvelopes = async (
  target: PublishTarget,
  envelopes: ReadonlyArray<Record<string, unknown>>,
  commitSha: string,
  rootDir: string
): Promise<ReadonlyArray<AstKgWriteReceiptV1>> => {
  if (target === "graphiti") {
    return [await publishToGraphiti(envelopes, commitSha, rootDir)];
  }
  if (target === "falkor") {
    return [await publishToFalkor(envelopes, commitSha, rootDir)];
  }
  return [await publishToFalkor(envelopes, commitSha, rootDir), await publishToGraphiti(envelopes, commitSha, rootDir)];
};

const parseTarget = (raw: string): O.Option<PublishTarget> => {
  if (raw === "falkor") {
    return O.some("falkor");
  }
  if (raw === "graphiti") {
    return O.some("graphiti");
  }
  if (raw === "both") {
    return O.some("both");
  }
  return O.none();
};

const falkorCount = (query: string): number => {
  const output = runFalkorQueryRaw(query);
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  for (let index = 0; index < lines.length; index += 1) {
    const value = Number(lines[index]);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return 0;
};

const parseMode = (raw: string): O.Option<IndexMode> => {
  if (raw === "full") {
    return O.some("full");
  }
  if (raw === "delta") {
    return O.some("delta");
  }
  return O.none();
};

const parseParityProfile = (raw: string): O.Option<ParityProfile> => {
  if (raw === "code-graph-functional") {
    return O.some("code-graph-functional");
  }
  if (raw === "code-graph-strict") {
    return O.some("code-graph-strict");
  }
  return O.none();
};

const parseStrictMinPaths = (raw: string): O.Option<number> => {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    return O.none();
  }
  return O.some(value);
};

const kgIndexCommand = Command.make(
  "index",
  {
    mode: Flag.string("mode").pipe(Flag.withDescription("Index mode: full|delta")),
    changed: Flag.string("changed").pipe(
      Flag.withDescription("Comma-separated changed paths for delta mode"),
      Flag.optional
    ),
  },
  Effect.fn(function* ({ mode, changed }) {
    const normalizedMode = parseMode(mode);
    if (O.isNone(normalizedMode)) {
      return yield* new DomainError({ message: `Invalid --mode value: ${mode}. Expected full|delta.` });
    }

    const summary = yield* Effect.tryPromise({
      try: () => runKgIndexNode(normalizedMode.value, changed),
      catch: (cause) =>
        cause instanceof DomainError ? cause : new DomainError({ message: "KG index run failed", cause }),
    });

    yield* Console.log(formatCliJson(summary));
  })
).pipe(Command.withDescription("Index AST KG artifacts in full or delta mode"));

const kgPublishCommand = Command.make(
  "publish",
  {
    target: Flag.string("target").pipe(Flag.withDescription("Publish target: falkor|graphiti|both")),
    mode: Flag.string("mode").pipe(Flag.withDescription("Index mode prior to publish: full|delta")),
    changed: Flag.string("changed").pipe(
      Flag.withDescription("Comma-separated changed paths for delta mode"),
      Flag.optional
    ),
    group: Flag.string("group").pipe(Flag.withDescription("Optional group id override for publish"), Flag.optional),
  },
  Effect.fn(function* ({ target, mode, changed, group }) {
    const normalizedTarget = parseTarget(target);
    if (O.isNone(normalizedTarget)) {
      return yield* new DomainError({ message: `Invalid --target value: ${target}. Expected falkor|graphiti|both.` });
    }

    const normalizedMode = parseMode(mode);
    if (O.isNone(normalizedMode)) {
      return yield* new DomainError({ message: `Invalid --mode value: ${mode}. Expected full|delta.` });
    }

    const publishSummary = yield* Effect.tryPromise({
      try: async (): Promise<PublishSummary> => {
        if (normalizedTarget.value === "graphiti" || normalizedTarget.value === "both") {
          await ensureGraphitiProxyPreflight(resolveGraphitiMcpUrl());
        }
        const generated = await generatePublishEnvelopes(normalizedMode.value, changed);
        const envelopes = applyGroupOverride(generated.envelopes, group);
        const receipts = await publishEnvelopes(
          normalizedTarget.value,
          envelopes,
          generated.commitSha,
          generated.rootDir
        );
        return {
          mode: normalizedMode.value,
          commitSha: generated.commitSha,
          group: publishGroupFromEnvelopes(envelopes),
          target: normalizedTarget.value,
          envelopes: envelopes.length,
          receipts,
        };
      },
      catch: (cause) =>
        cause instanceof DomainError ? cause : new DomainError({ message: "KG publish run failed", cause }),
    });

    yield* Console.log(formatCliJson(publishSummary));
  })
).pipe(Command.withDescription("Dual-write AST KG envelopes to Falkor, Graphiti, or both"));

const kgReplayCommand = Command.make(
  "replay",
  {
    fromSpool: Flag.string("from-spool").pipe(Flag.withDescription("Spool file or directory to replay")),
    target: Flag.string("target").pipe(Flag.withDescription("Replay target: falkor|graphiti|both")),
    group: Flag.string("group").pipe(Flag.withDescription("Optional group id override for replay"), Flag.optional),
  },
  Effect.fn(function* ({ fromSpool, target, group }) {
    const normalizedTarget = parseTarget(target);
    if (O.isNone(normalizedTarget)) {
      return yield* new DomainError({ message: `Invalid --target value: ${target}. Expected falkor|graphiti|both.` });
    }

    const result = yield* Effect.tryPromise({
      try: async (): Promise<PublishSummary> => {
        const stat = await fs.stat(fromSpool);
        const files = stat.isDirectory()
          ? (await fs.readdir(fromSpool)).map((entry) => nodePath.join(fromSpool, entry))
          : [fromSpool];

        const envelopes: Array<Record<string, unknown>> = [];
        for (const file of files.filter((entry) => entry.endsWith(".jsonl"))) {
          const content = await fs.readFile(file, "utf8");
          for (const line of content
            .split("\n")
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)) {
            if (line.startsWith("AST_KG_EPISODE_V1")) {
              continue;
            }
            try {
              envelopes.push(JSON.parse(line) as Record<string, unknown>);
            } catch {
              // Ignore malformed lines.
            }
          }
        }

        const rootDir = resolveRootDir();
        const overridden = applyGroupOverride(envelopes, group);
        const commitSha = readGitMeta().sha;
        const receipts = await publishEnvelopes(normalizedTarget.value, overridden, commitSha, rootDir);
        return {
          mode: "full",
          commitSha,
          group: publishGroupFromEnvelopes(overridden),
          target: normalizedTarget.value,
          envelopes: overridden.length,
          receipts,
        };
      },
      catch: (cause) =>
        cause instanceof DomainError ? cause : new DomainError({ message: "KG replay run failed", cause }),
    });

    yield* Console.log(formatCliJson(result));
  })
).pipe(Command.withDescription("Replay AST KG spool entries to selected publish targets"));

const kgVerifyCommand = Command.make(
  "verify",
  {
    target: Flag.string("target").pipe(Flag.withDescription("Verify target: falkor|graphiti|both")),
    group: Flag.string("group").pipe(Flag.withDescription("Graph group id"), Flag.withDefault(AstKgGroupId)),
    commit: Flag.string("commit").pipe(
      Flag.withDescription("Commit SHA to verify"),
      Flag.withDefault(readGitMeta().sha)
    ),
  },
  Effect.fn(function* ({ target, group, commit }) {
    const normalizedTarget = parseTarget(target);
    if (O.isNone(normalizedTarget)) {
      return yield* new DomainError({ message: `Invalid --target value: ${target}. Expected falkor|graphiti|both.` });
    }

    const verification = yield* Effect.tryPromise({
      try: async () => {
        const graphitiRequested = normalizedTarget.value === "graphiti" || normalizedTarget.value === "both";
        const graphitiUrl = graphitiRequested ? resolveGraphitiMcpUrl() : "";
        if (graphitiRequested) {
          await ensureGraphitiProxyPreflight(graphitiUrl);
        }

        const checks: Record<string, unknown> = {
          target: normalizedTarget.value,
          group,
          commit,
        };

        if (normalizedTarget.value === "falkor" || normalizedTarget.value === "both") {
          const commitLiteral = stringifyCypher(commit);
          const groupLiteral = stringifyCypher(group);
          checks.falkor = {
            nodeCount: falkorCount(`MATCH (n {groupId:${groupLiteral}}) RETURN count(n)`),
            edgeCount: falkorCount(`MATCH ()-[r]->() WHERE r.groupId=${groupLiteral} RETURN count(r)`),
            fileCount: falkorCount(`MATCH (f:File {groupId:${groupLiteral}}) RETURN count(f)`),
            commitCount: falkorCount(
              `MATCH (c:Commit {sha:${commitLiteral}, groupId:${groupLiteral}}) RETURN count(c)`
            ),
            commitContextCount: falkorCount(
              `MATCH (c:Commit {sha:${commitLiteral}, groupId:${groupLiteral}})-[:CONTAINS]->(f:File {groupId:${groupLiteral}}) RETURN count(f)`
            ),
          };
        }

        if (graphitiRequested) {
          const session = await initializeMcp(graphitiUrl);
          const graphitiCheck = await verifyGraphitiEpisodes(graphitiUrl, session, group, commit);
          checks.graphiti = graphitiCheck;

          if (!graphitiCheck.contractSatisfied) {
            throw new DomainError({
              message: `Graphiti verify timed out after ${String(graphitiCheck.waitedMs)}ms for group ${group} commit ${commit}. Consider increasing BEEP_GRAPHITI_VERIFY_WAIT_MS or tuning BEEP_GRAPHITI_VERIFY_POLL_MIN_MS/BEEP_GRAPHITI_VERIFY_POLL_MAX_MS/BEEP_GRAPHITI_VERIFY_REQUEST_TIMEOUT_MS.`,
            });
          }
        }

        return checks;
      },
      catch: (cause) =>
        cause instanceof DomainError ? cause : new DomainError({ message: "KG verify run failed", cause }),
    });

    yield* Console.log(formatCliJson(verification));
  })
).pipe(Command.withDescription("Verify published AST KG state for selected targets"));

const kgParityCommand = Command.make(
  "parity",
  {
    profile: Flag.string("profile").pipe(
      Flag.withDescription("Parity profile: code-graph-functional|code-graph-strict"),
      Flag.withDefault("code-graph-functional")
    ),
    group: Flag.string("group").pipe(Flag.withDescription("Graph group id"), Flag.withDefault(AstKgGroupId)),
    strictMinPaths: Flag.string("strict-min-paths").pipe(
      Flag.withDescription("Strict profile minimum observed CALLS path count"),
      Flag.withDefault("1")
    ),
  },
  Effect.fn(function* ({ profile, group, strictMinPaths }) {
    const normalizedProfile = parseParityProfile(profile);
    if (O.isNone(normalizedProfile)) {
      return yield* new DomainError({
        message: `Invalid --profile value: ${profile}. Expected code-graph-functional|code-graph-strict.`,
      });
    }

    const normalizedStrictMinPaths = parseStrictMinPaths(strictMinPaths);
    if (O.isNone(normalizedStrictMinPaths)) {
      return yield* new DomainError({
        message: `Invalid --strict-min-paths value: ${strictMinPaths}. Expected integer >= 1.`,
      });
    }

    const result = yield* Effect.tryPromise({
      try: async () => {
        const groupLiteral = stringifyCypher(group);
        const entityCount = falkorCount(`MATCH (f:File {groupId:${groupLiteral}}) RETURN count(f)`);
        const neighborCount = falkorCount(`MATCH (n)-[r]->(m) WHERE r.groupId=${groupLiteral} RETURN count(r)`);
        const commitContextCount = falkorCount(
          `MATCH (c:Commit {groupId:${groupLiteral}})-[:CONTAINS]->(f:File {groupId:${groupLiteral}}) RETURN count(f)`
        );
        const eligibleCallEdges = falkorCount(`MATCH ()-[r:CALLS]->() WHERE r.groupId=${groupLiteral} RETURN count(r)`);
        const observedPaths = falkorCount(
          `MATCH p=()-[:CALLS*1..3]->() WHERE all(rel IN relationships(p) WHERE rel.groupId=${groupLiteral}) RETURN count(p)`
        );
        const strictFallback = eligibleCallEdges === 0;
        const strictPathPass = strictFallback || observedPaths >= normalizedStrictMinPaths.value;
        const pathCheck =
          normalizedProfile.value === "code-graph-strict"
            ? {
                name: "path-finding-query",
                pass: strictPathPass,
                observedPaths,
                minRequiredPaths: normalizedStrictMinPaths.value,
                eligibleCallEdges,
                fallback: strictFallback ? "no-eligible-call-edges" : "none",
              }
            : {
                name: "path-finding-query",
                pass: true,
                observedPaths,
                mode: "functional-execution-only",
              };

        const matrix = {
          profile: normalizedProfile.value,
          group,
          strictMinPaths: normalizedStrictMinPaths.value,
          checks: [
            {
              name: "entity-listing",
              pass: entityCount > 0,
              observed: entityCount,
            },
            {
              name: "neighbor-expansion",
              pass: neighborCount > 0,
              observed: neighborCount,
            },
            {
              name: "commit-context",
              pass: commitContextCount > 0,
              observed: commitContextCount,
            },
            pathCheck,
          ],
        };
        return matrix;
      },
      catch: (cause) =>
        cause instanceof DomainError ? cause : new DomainError({ message: "KG parity run failed", cause }),
    });

    yield* Console.log(formatCliJson(result));
  })
).pipe(Command.withDescription("Run functional parity checks against code-graph expectations"));

/**
 * CLI command group for AST KG indexing operations.
 *
 * @domain kg-cli
 * @provides KgCliCommandGroup
 * @depends EffectCli, Console
 * @errors DomainError
 * @since 0.0.0
 * @category UseCase
 */
export const kgCommand = Command.make(
  "kg",
  {},
  Effect.fn(function* () {
    yield* Console.log(
      "Use subcommands: index | publish | verify | parity | replay (bun run beep kg <subcommand> ...)"
    );
  })
).pipe(
  Command.withDescription("AST KG indexing and integration commands"),
  Command.withSubcommands([kgIndexCommand, kgPublishCommand, kgVerifyCommand, kgParityCommand, kgReplayCommand])
);
