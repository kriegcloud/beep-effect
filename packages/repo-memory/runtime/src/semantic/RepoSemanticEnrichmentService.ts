import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import { RepoSemanticArtifacts, RunId, type SourceSnapshotId } from "@beep/repo-memory-model";
import { makeStatusCauseError, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { EvidenceAnchor, FragmentSelector } from "@beep/semantic-web/evidence";
import { IRIReference } from "@beep/semantic-web/iri";
import {
  Activity,
  Association,
  Derivation,
  Entity,
  Generation,
  ObjectRef,
  ProvBundle,
  SoftwareAgent,
  Usage,
} from "@beep/semantic-web/prov";
import { makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf";
import { RDFS_COMMENT, RDFS_LABEL } from "@beep/semantic-web/vocab/rdfs";
import { XSD_BOOLEAN, XSD_INTEGER, XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { Effect, HashSet, Layer, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { IndexedTypeScriptArtifacts as IndexedTypeScriptArtifactsSchema } from "../indexing/TypeScriptIndexer.js";

const $I = $RepoMemoryRuntimeId.create("semantic/RepoSemanticEnrichmentService");
const decodeIriReference = S.decodeUnknownSync(IRIReference);
const decodeObjectRef = S.decodeUnknownSync(ObjectRef);
const repoSemanticNamespace = "urn:beep:repo-memory:semantic#";
const agentId = "urn:beep:repo-memory:semantic-agent:deterministic-v1";
const fileSuffixes = [".ts", ".tsx", ".mts", ".cts"];
const indexSuffixes = ["/index.ts", "/index.tsx", "/index.mts", "/index.cts"];

const REPO_CLASS = makeNamedNode(`${repoSemanticNamespace}Repo`);
const SNAPSHOT_CLASS = makeNamedNode(`${repoSemanticNamespace}Snapshot`);
const FILE_CLASS = makeNamedNode(`${repoSemanticNamespace}File`);
const SYMBOL_CLASS = makeNamedNode(`${repoSemanticNamespace}Symbol`);
const DATASET_CLASS = makeNamedNode(`${repoSemanticNamespace}SemanticDataset`);
const CONTAINS_SNAPSHOT = makeNamedNode(`${repoSemanticNamespace}containsSnapshot`);
const CONTAINS_FILE = makeNamedNode(`${repoSemanticNamespace}containsFile`);
const DECLARES_SYMBOL = makeNamedNode(`${repoSemanticNamespace}declaresSymbol`);
const EXPORTS_SYMBOL = makeNamedNode(`${repoSemanticNamespace}exportsSymbol`);
const IMPORTS_MODULE = makeNamedNode(`${repoSemanticNamespace}importsModule`);
const IMPORTS_FILE = makeNamedNode(`${repoSemanticNamespace}importsFile`);
const FILE_PATH = makeNamedNode(`${repoSemanticNamespace}filePath`);
const SYMBOL_KIND = makeNamedNode(`${repoSemanticNamespace}symbolKind`);
const QUALIFIED_NAME = makeNamedNode(`${repoSemanticNamespace}qualifiedName`);
const SIGNATURE = makeNamedNode(`${repoSemanticNamespace}signature`);
const START_LINE = makeNamedNode(`${repoSemanticNamespace}startLine`);
const END_LINE = makeNamedNode(`${repoSemanticNamespace}endLine`);
const TYPE_ONLY = makeNamedNode(`${repoSemanticNamespace}typeOnly`);
const IMPORTED_NAME = makeNamedNode(`${repoSemanticNamespace}importedName`);
const DERIVED_FROM_SNAPSHOT = makeNamedNode(`${repoSemanticNamespace}derivedFromSnapshot`);

const encodeComponent = (value: string): string => encodeURIComponent(value);

const repoUrn = (repoId: string): string => `urn:beep:repo-memory:repo:${encodeComponent(repoId)}`;

const snapshotUrn = (repoId: string, sourceSnapshotId: SourceSnapshotId): string =>
  `urn:beep:repo-memory:snapshot:${encodeComponent(repoId)}:${encodeComponent(sourceSnapshotId)}`;

const fileUrn = (repoId: string, sourceSnapshotId: SourceSnapshotId, filePath: string): string =>
  `urn:beep:repo-memory:file:${encodeComponent(repoId)}:${encodeComponent(sourceSnapshotId)}:${encodeComponent(filePath)}`;

const sourceUrn = (repoId: string, sourceSnapshotId: SourceSnapshotId, filePath: string): string =>
  `urn:beep:repo-memory:source:${encodeComponent(repoId)}:${encodeComponent(sourceSnapshotId)}:${encodeComponent(filePath)}`;

const symbolUrn = (repoId: string, sourceSnapshotId: SourceSnapshotId, symbolId: string): string =>
  `urn:beep:repo-memory:symbol:${encodeComponent(repoId)}:${encodeComponent(sourceSnapshotId)}:${encodeComponent(symbolId)}`;

const datasetUrn = (repoId: string, sourceSnapshotId: SourceSnapshotId): string =>
  `urn:beep:repo-memory:semantic-dataset:${encodeComponent(repoId)}:${encodeComponent(sourceSnapshotId)}`;

const enrichmentActivityUrn = (runId: RunId): string =>
  `urn:beep:repo-memory:semantic-activity:${encodeComponent(runId)}`;

const symbolCitationId = (symbolId: string): string => symbolId;

const asIriReference = (value: string): typeof IRIReference.Type => decodeIriReference(value);

const asObjectRef = (value: string): typeof ObjectRef.Type => decodeObjectRef(value);

const someObjectRef = (value: string) => O.some(asObjectRef(value));

const someObjectRefs = (values: ReadonlyArray<string>) => O.some(pipe(values, A.map(asObjectRef)));

const emptyProvEntityFields = {
  wasAttributedTo: O.none(),
  hadPrimarySource: O.none(),
  wasQuotedFrom: O.none(),
  wasRevisionOf: O.none(),
  generatedAtTime: O.none(),
  invalidatedAtTime: O.none(),
  value: O.none(),
} as const;

const importEdgeCitationId = (input: {
  readonly importerFilePath: string;
  readonly moduleSpecifier: string;
  readonly startLine: number;
  readonly importedName: O.Option<string>;
}): string =>
  `${input.importerFilePath}::${input.moduleSpecifier}::${input.startLine}:${pipe(input.importedName, O.getOrNull) ?? "*"}`;

const normalizeRelativePath = (value: string): string => {
  const normalized = value.replaceAll("\\", "/");
  const absolutePrefix = normalized.startsWith("/") ? "/" : "";
  const parts = normalized.split("/");
  const reduced: Array<string> = [];

  for (const part of parts) {
    if (part === "" || part === ".") {
      continue;
    }

    if (part === "..") {
      if (reduced.length > 0 && reduced[reduced.length - 1] !== "..") {
        reduced.pop();
      } else if (absolutePrefix === "") {
        reduced.push(part);
      }
      continue;
    }

    reduced.push(part);
  }

  const joined = reduced.join("/");
  return joined === "" ? (absolutePrefix === "" ? "." : absolutePrefix) : `${absolutePrefix}${joined}`;
};

const dirname = (filePath: string): string => {
  const parts = filePath.split("/");
  return parts.length <= 1 ? "." : parts.slice(0, -1).join("/");
};

const resolveRelativeImportTarget = (
  filePaths: HashSet.HashSet<string>,
  importerFilePath: string,
  moduleSpecifier: string
) => {
  if (!moduleSpecifier.startsWith(".")) {
    return O.none<string>();
  }

  const base = normalizeRelativePath(`${dirname(importerFilePath)}/${moduleSpecifier}`);
  const candidates = [
    base,
    ...fileSuffixes.map((suffix) => `${base}${suffix}`),
    ...indexSuffixes.map((suffix) => `${base}${suffix}`),
  ];

  return pipe(
    A.fromIterable(candidates),
    A.findFirst((candidate) => HashSet.has(filePaths, candidate))
  );
};

const anchorForSymbol = (input: {
  readonly repoId: string;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly filePath: string;
  readonly symbolId: string;
  readonly startLine: number;
  readonly endLine: number;
}): EvidenceAnchor =>
  new EvidenceAnchor({
    id: asIriReference(
      `urn:beep:repo-memory:evidence:symbol:${encodeComponent(input.repoId)}:${encodeComponent(input.sourceSnapshotId)}:${encodeComponent(input.symbolId)}`
    ),
    target: {
      source: asIriReference(sourceUrn(input.repoId, input.sourceSnapshotId, input.filePath)),
      selector: new FragmentSelector({
        kind: "fragment",
        value: `line=${input.startLine},${input.endLine}`,
        conformsTo: O.none(),
      }),
    },
    note: O.some(`citationId=${symbolCitationId(input.symbolId)}`),
  });

const anchorForImportEdge = (input: {
  readonly repoId: string;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly importerFilePath: string;
  readonly moduleSpecifier: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly importedName: O.Option<string>;
}): EvidenceAnchor =>
  new EvidenceAnchor({
    id: asIriReference(
      `urn:beep:repo-memory:evidence:import:${encodeComponent(input.repoId)}:${encodeComponent(input.sourceSnapshotId)}:${encodeComponent(importEdgeCitationId(input))}`
    ),
    target: {
      source: asIriReference(sourceUrn(input.repoId, input.sourceSnapshotId, input.importerFilePath)),
      selector: new FragmentSelector({
        kind: "fragment",
        value: `line=${input.startLine},${input.endLine}`,
        conformsTo: O.none(),
      }),
    },
    note: O.some(`citationId=${importEdgeCitationId(input)}`),
  });

/**
 * Input required to derive semantic artifacts from a deterministic index run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoSemanticEnrichmentRequest extends S.Class<RepoSemanticEnrichmentRequest>(
  $I`RepoSemanticEnrichmentRequest`
)(
  {
    artifacts: IndexedTypeScriptArtifactsSchema,
    runId: RunId,
  },
  $I.annote("RepoSemanticEnrichmentRequest", {
    description: "Input required to derive semantic artifacts from a deterministic index run.",
  })
) {}

/**
 * Typed failure raised while deriving semantic artifacts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoSemanticEnrichmentError extends TaggedErrorClass<RepoSemanticEnrichmentError>(
  $I`RepoSemanticEnrichmentError`
)(
  "RepoSemanticEnrichmentError",
  StatusCauseFields,
  $I.annote("RepoSemanticEnrichmentError", {
    description: "Typed failure raised while deriving semantic artifacts.",
  })
) {}

/**
 * Service contract for deterministic semantic enrichment of indexed repo snapshots.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface RepoSemanticEnrichmentServiceShape {
  readonly deriveSemanticArtifacts: (
    request: RepoSemanticEnrichmentRequest
  ) => Effect.Effect<RepoSemanticArtifacts, RepoSemanticEnrichmentError>;
}

const toEnrichmentError = makeStatusCauseError(RepoSemanticEnrichmentError);

const deriveSemanticArtifacts = Effect.fn("RepoSemanticEnrichmentService.deriveSemanticArtifacts")(function* (
  request: RepoSemanticEnrichmentRequest
): Effect.fn.Return<RepoSemanticArtifacts, RepoSemanticEnrichmentError> {
  const { artifacts, runId } = request;
  const repoId = artifacts.snapshot.repoId;
  const sourceSnapshotId = artifacts.snapshot.id;

  return yield* Effect.try({
    try: () => {
      const repoNode = makeNamedNode(repoUrn(repoId));
      const snapshotNode = makeNamedNode(snapshotUrn(repoId, sourceSnapshotId));
      const semanticDatasetNode = makeNamedNode(datasetUrn(repoId, sourceSnapshotId));
      const quads = [
        makeQuad(repoNode, RDF_TYPE, REPO_CLASS),
        makeQuad(repoNode, RDFS_LABEL, makeLiteral(repoId, XSD_STRING.value)),
        makeQuad(repoNode, CONTAINS_SNAPSHOT, snapshotNode),
        makeQuad(snapshotNode, RDF_TYPE, SNAPSHOT_CLASS),
        makeQuad(snapshotNode, RDFS_LABEL, makeLiteral(sourceSnapshotId, XSD_STRING.value)),
        makeQuad(snapshotNode, DERIVED_FROM_SNAPSHOT, semanticDatasetNode),
        makeQuad(semanticDatasetNode, RDF_TYPE, DATASET_CLASS),
        makeQuad(semanticDatasetNode, DERIVED_FROM_SNAPSHOT, snapshotNode),
      ];
      const filePaths = pipe(
        artifacts.files,
        A.map((file) => file.filePath),
        HashSet.fromIterable
      );

      for (const file of artifacts.files) {
        const fileNode = makeNamedNode(fileUrn(repoId, sourceSnapshotId, file.filePath));
        quads.push(makeQuad(snapshotNode, CONTAINS_FILE, fileNode));
        quads.push(makeQuad(fileNode, RDF_TYPE, FILE_CLASS));
        quads.push(makeQuad(fileNode, FILE_PATH, makeLiteral(file.filePath, XSD_STRING.value)));
        quads.push(makeQuad(fileNode, RDFS_LABEL, makeLiteral(file.filePath, XSD_STRING.value)));
      }

      for (const symbol of artifacts.symbols) {
        const fileNode = makeNamedNode(fileUrn(repoId, sourceSnapshotId, symbol.filePath));
        const symbolNode = makeNamedNode(symbolUrn(repoId, sourceSnapshotId, symbol.symbolId));
        quads.push(makeQuad(fileNode, DECLARES_SYMBOL, symbolNode));
        quads.push(makeQuad(symbolNode, RDF_TYPE, SYMBOL_CLASS));
        quads.push(makeQuad(symbolNode, RDFS_LABEL, makeLiteral(symbol.symbolName, XSD_STRING.value)));
        quads.push(makeQuad(symbolNode, SYMBOL_KIND, makeLiteral(symbol.symbolKind, XSD_STRING.value)));
        quads.push(makeQuad(symbolNode, QUALIFIED_NAME, makeLiteral(symbol.qualifiedName, XSD_STRING.value)));
        quads.push(makeQuad(symbolNode, SIGNATURE, makeLiteral(symbol.signature, XSD_STRING.value)));
        quads.push(makeQuad(symbolNode, START_LINE, makeLiteral(`${symbol.startLine}`, XSD_INTEGER.value)));
        quads.push(makeQuad(symbolNode, END_LINE, makeLiteral(`${symbol.endLine}`, XSD_INTEGER.value)));

        if (symbol.exported) {
          quads.push(makeQuad(fileNode, EXPORTS_SYMBOL, symbolNode));
        }

        if (O.isSome(symbol.jsDocSummary)) {
          quads.push(makeQuad(symbolNode, RDFS_COMMENT, makeLiteral(symbol.jsDocSummary.value, XSD_STRING.value)));
        }
      }

      for (const edge of artifacts.importEdges) {
        const importerNode = makeNamedNode(fileUrn(repoId, sourceSnapshotId, edge.importerFilePath));
        quads.push(makeQuad(importerNode, IMPORTS_MODULE, makeLiteral(edge.moduleSpecifier, XSD_STRING.value)));
        quads.push(makeQuad(importerNode, TYPE_ONLY, makeLiteral(edge.typeOnly ? "true" : "false", XSD_BOOLEAN.value)));

        if (O.isSome(edge.importedName)) {
          quads.push(makeQuad(importerNode, IMPORTED_NAME, makeLiteral(edge.importedName.value, XSD_STRING.value)));
        }

        const resolvedTarget = resolveRelativeImportTarget(filePaths, edge.importerFilePath, edge.moduleSpecifier);
        if (O.isSome(resolvedTarget)) {
          quads.push(
            makeQuad(importerNode, IMPORTS_FILE, makeNamedNode(fileUrn(repoId, sourceSnapshotId, resolvedTarget.value)))
          );
        }
      }

      const provenance = new ProvBundle({
        records: [
          new Entity({
            provType: "Entity",
            id: someObjectRef(repoUrn(repoId)),
            wasGeneratedBy: O.none(),
            wasDerivedFrom: O.none(),
            ...emptyProvEntityFields,
          }),
          new Entity({
            provType: "Entity",
            id: someObjectRef(snapshotUrn(repoId, sourceSnapshotId)),
            wasGeneratedBy: O.none(),
            wasDerivedFrom: O.none(),
            ...emptyProvEntityFields,
          }),
          new Entity({
            provType: "Entity",
            id: someObjectRef(datasetUrn(repoId, sourceSnapshotId)),
            wasGeneratedBy: someObjectRefs(A.make(enrichmentActivityUrn(runId))),
            wasDerivedFrom: someObjectRefs(A.make(snapshotUrn(repoId, sourceSnapshotId))),
            ...emptyProvEntityFields,
          }),
          new Activity({
            provType: "Activity",
            id: someObjectRef(enrichmentActivityUrn(runId)),
            used: someObjectRefs(A.make(snapshotUrn(repoId, sourceSnapshotId))),
            wasAssociatedWith: someObjectRefs(A.make(agentId)),
            startedAtTime: O.some(artifacts.snapshot.capturedAt),
            endedAtTime: O.some(artifacts.snapshot.capturedAt),
          }),
          new SoftwareAgent({
            provType: "SoftwareAgent",
            id: someObjectRef(agentId),
            name: O.some("repo-memory-semantic-enrichment"),
          }),
          new Usage({
            activity: asObjectRef(enrichmentActivityUrn(runId)),
            entity: asObjectRef(snapshotUrn(repoId, sourceSnapshotId)),
            atTime: O.some(artifacts.snapshot.capturedAt),
          }),
          new Generation({
            entity: asObjectRef(datasetUrn(repoId, sourceSnapshotId)),
            activity: asObjectRef(enrichmentActivityUrn(runId)),
            atTime: O.some(artifacts.snapshot.capturedAt),
          }),
          new Association({
            activity: asObjectRef(enrichmentActivityUrn(runId)),
            agent: asObjectRef(agentId),
            hadPlan: O.none(),
          }),
          new Derivation({
            generatedEntity: asObjectRef(datasetUrn(repoId, sourceSnapshotId)),
            usedEntity: asObjectRef(snapshotUrn(repoId, sourceSnapshotId)),
          }),
        ],
        lifecycle: O.none(),
      });

      const evidenceAnchors = pipe(
        [
          ...pipe(
            artifacts.symbols,
            A.map((symbol) =>
              anchorForSymbol({
                repoId,
                sourceSnapshotId,
                filePath: symbol.filePath,
                symbolId: symbol.symbolId,
                startLine: symbol.startLine,
                endLine: symbol.endLine,
              })
            )
          ),
          ...pipe(
            artifacts.importEdges,
            A.map((edge) =>
              anchorForImportEdge({
                repoId,
                sourceSnapshotId,
                importerFilePath: edge.importerFilePath,
                moduleSpecifier: edge.moduleSpecifier,
                startLine: edge.startLine,
                endLine: edge.endLine,
                importedName: edge.importedName,
              })
            )
          ),
        ],
        A.dedupeWith((left, right) => left.id === right.id)
      );

      return new RepoSemanticArtifacts({
        repoId,
        sourceSnapshotId,
        dataset: makeDataset(quads),
        provenance,
        evidenceAnchors,
      });
    },
    catch: (cause) =>
      toEnrichmentError("Failed to derive semantic artifacts from indexed TypeScript artifacts.", 500, cause),
  });
});

/**
 * Service tag for deterministic repo semantic enrichment.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoSemanticEnrichmentService extends ServiceMap.Service<
  RepoSemanticEnrichmentService,
  RepoSemanticEnrichmentServiceShape
>()($I`RepoSemanticEnrichmentService`) {
  static readonly layer = Layer.succeed(
    RepoSemanticEnrichmentService,
    RepoSemanticEnrichmentService.of({
      deriveSemanticArtifacts,
    })
  );
}
