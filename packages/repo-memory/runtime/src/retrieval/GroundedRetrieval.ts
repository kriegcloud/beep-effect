import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import { VariantText } from "@beep/nlp";
import {
  Citation,
  type QueryRepoRunInput,
  type RepoDocumentedParameter,
  type RepoDocumentedReturn,
  type RepoDocumentedThrow,
  type RepoId,
  type RepoImportEdge,
  type RepoSemanticArtifacts,
  type RepoSourceFile,
  type RepoSymbolDocumentation,
  type RepoSymbolRecord,
  RetrievalAmbiguousIssue,
  RetrievalCandidate,
  RetrievalCountPayload,
  RetrievalDeclarationFacet,
  RetrievalDeprecationFacet,
  RetrievalDocumentationFacet,
  RetrievalFileRequestedTarget,
  RetrievalFileSubject,
  type RetrievalIssue,
  RetrievalLocationFacet,
  RetrievalModuleSubject,
  RetrievalNoMatchIssue,
  type RetrievalOutcome,
  RetrievalPacket,
  RetrievalParameterItem,
  RetrievalParametersFacet,
  type RetrievalPayload,
  type RetrievalQueryKind,
  RetrievalQuestionRequestedTarget,
  RetrievalRelationListPayload,
  RetrievalReturnItem,
  RetrievalReturnsFacet,
  RetrievalSearchResultsPayload,
  type RetrievalSubjectDetailAspect,
  RetrievalSubjectDetailPayload,
  RetrievalSymbolRequestedTarget,
  RetrievalSymbolSubject,
  RetrievalThrowItem,
  RetrievalThrowsFacet,
  RetrievalUnsupportedIssue,
  renderRetrievalPacketAnswer,
  type SourceSnapshotId,
} from "@beep/repo-memory-model";
import {
  RepoSemanticStore,
  type RepoSemanticStoreShape,
  RepoSnapshotStore,
  type RepoSnapshotStoreShape,
  type RepoStoreError,
  RepoSymbolStore,
  type RepoSymbolStoreShape,
} from "@beep/repo-memory-store";
import {
  type FilePath,
  makeStatusCauseError,
  NonNegativeInt,
  PosInt,
  StatusCauseFields,
  TaggedErrorClass,
} from "@beep/schema";
import * as Str from "@beep/utils/Str";
import { DateTime, Effect, HashSet, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  findSymbolMatches,
  type GroundedQuestionPreparation,
  prepareGroundedQuery,
  QueryInterpretation,
  resolveFileCandidates,
  searchKeywordMatches,
  selectImporterEdges,
  selectSingleMatch,
} from "../internal/QueryPreparation.js";
import { recordQueryInterpretation, recordQueryResult } from "../telemetry/RepoMemoryTelemetry.js";

const $I = $RepoMemoryRuntimeId.create("retrieval/GroundedRetrieval");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const citationOrder = Order.mapInput(
  Order.String,
  (citation: Citation) => `${citation.span.filePath}:${citation.span.startLine}:${citation.label}:${citation.id}`
);
type GroundedRetrievalStoreShape = RepoSemanticStoreShape & RepoSnapshotStoreShape & RepoSymbolStoreShape;

/**
 * Deterministic grounded result returned by the repo-memory retrieval service.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GroundedQueryResult extends S.Class<GroundedQueryResult>($I`GroundedQueryResult`)(
  {
    answer: S.String,
    citations: S.Array(Citation),
    packet: RetrievalPacket,
  },
  $I.annote("GroundedQueryResult", {
    description: "Deterministic grounded query result assembled from indexed repository artifacts.",
  })
) {}

type GroundingArtifact = GroundedQuestionPreparation & {
  readonly repoId: RepoId;
  readonly question: string;
};

type RetrievedEvidence = {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly normalizedQuery: string;
  readonly queryKind: RetrievalQueryKind;
  readonly outcome: RetrievalOutcome;
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
  readonly payload: O.Option<RetrievalPayload>;
  readonly issue: O.Option<RetrievalIssue>;
};

/**
 * Typed retrieval failure raised while resolving deterministic grounded queries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GroundedRetrievalError extends TaggedErrorClass<GroundedRetrievalError>($I`GroundedRetrievalError`)(
  "GroundedRetrievalError",
  StatusCauseFields,
  $I.annote("GroundedRetrievalError", {
    description: "Typed error raised while resolving a bounded deterministic grounded query.",
  })
) {}

/**
 * Service contract for deterministic grounded repo retrieval.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface GroundedRetrievalServiceShape {
  readonly draftAnswer: (packet: RetrievalPacket) => Effect.Effect<string, GroundedRetrievalError>;
  readonly ground: (payload: QueryRepoRunInput) => Effect.Effect<GroundingArtifact, GroundedRetrievalError>;
  readonly materializePacket: (evidence: RetrievedEvidence) => Effect.Effect<RetrievalPacket, GroundedRetrievalError>;
  readonly resolve: (payload: QueryRepoRunInput) => Effect.Effect<GroundedQueryResult, GroundedRetrievalError>;
  readonly retrieve: (grounding: GroundingArtifact) => Effect.Effect<RetrievedEvidence, GroundedRetrievalError>;
}

/**
 * Service tag for deterministic grounded repo retrieval.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class GroundedRetrievalService extends ServiceMap.Service<
  GroundedRetrievalService,
  GroundedRetrievalServiceShape
>()($I`GroundedRetrievalService`) {
  static readonly layer: Layer.Layer<
    GroundedRetrievalService,
    never,
    RepoSemanticStore | RepoSnapshotStore | RepoSymbolStore
  > = Layer.effect(
    GroundedRetrievalService,
    Effect.suspend(() => makeGroundedRetrievalService()).pipe(
      Effect.withSpan("GroundedRetrievalService.make"),
      Effect.annotateLogs({ component: "grounded-retrieval" })
    )
  );
}

const toRetrievalError = makeStatusCauseError(GroundedRetrievalError);

const mapStoreError = <A>(effect: Effect.Effect<A, RepoStoreError>) =>
  effect.pipe(Effect.mapError((error) => toRetrievalError(error.message, error.status, error.cause)));

const latestSnapshotForRepo = (store: GroundedRetrievalStoreShape) =>
  Effect.fn("GroundedRetrieval.latestSnapshotForRepo")(function* (
    repoId: RepoId
  ): Effect.fn.Return<SourceSnapshotId, GroundedRetrievalError> {
    const latestSnapshot = yield* mapStoreError(store.latestSourceSnapshot(repoId));

    return yield* O.match(latestSnapshot, {
      onNone: () => toRetrievalError(`Repo "${repoId}" does not have a completed source snapshot yet.`, 400, undefined),
      onSome: (snapshot) => Effect.succeed(snapshot.id),
    });
  });

const symbolCitation = (
  symbol: Pick<RepoSymbolRecord, "repoId" | "symbolId" | "symbolName" | "filePath" | "startLine" | "endLine">
): Citation =>
  new Citation({
    id: symbol.symbolId,
    repoId: symbol.repoId,
    label: symbol.symbolName,
    rationale: `Symbol declaration for ${symbol.symbolName}.`,
    span: {
      filePath: symbol.filePath,
      startLine: decodePosInt(symbol.startLine),
      endLine: decodePosInt(symbol.endLine),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: O.some(symbol.symbolName),
    },
  });

const importEdgeCitation = (edge: RepoImportEdge): Citation =>
  new Citation({
    id: `${edge.importerFilePath}::${edge.moduleSpecifier}::${edge.startLine}:${pipe(edge.importedName, O.getOrNull) ?? "*"}`,
    repoId: edge.repoId,
    label: `${edge.importerFilePath}:${edge.startLine}`,
    rationale: `Import of "${edge.moduleSpecifier}" in ${edge.importerFilePath}.`,
    span: {
      filePath: edge.importerFilePath,
      startLine: decodePosInt(edge.startLine),
      endLine: decodePosInt(edge.endLine),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: edge.importedName,
    },
  });

const fileCitation = (file: Pick<RepoSourceFile, "repoId" | "filePath">): Citation =>
  new Citation({
    id: file.filePath,
    repoId: file.repoId,
    label: file.filePath,
    rationale: `Source file ${file.filePath}.`,
    span: {
      filePath: file.filePath,
      startLine: decodePosInt(1),
      endLine: decodePosInt(1),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: O.none(),
    },
  });

const documentationCitation = (
  symbol: Pick<RepoSymbolRecord, "repoId" | "symbolId" | "symbolName" | "documentation">
): O.Option<Citation> =>
  pipe(
    symbol.documentation,
    O.map(
      (documentation) =>
        new Citation({
          id: `${symbol.symbolId}::jsdoc`,
          repoId: symbol.repoId,
          label: `${symbol.symbolName} JSDoc`,
          rationale: `JSDoc documentation for ${symbol.symbolName}.`,
          span: documentation.span,
        })
    )
  );

const documentationCitations = (
  symbol: RepoSymbolRecord,
  options?: {
    readonly includeDeclaration?: boolean | undefined;
  }
): ReadonlyArray<Citation> =>
  normalizeCitations(
    pipe(
      A.make(
        pipe(documentationCitation(symbol), O.getOrNull),
        options?.includeDeclaration === true ? symbolCitation(symbol) : null
      ),
      A.filter((citation): citation is Citation => citation !== null)
    )
  );

const normalizeCitations = (citations: ReadonlyArray<Citation>): ReadonlyArray<Citation> =>
  pipe(
    citations,
    A.sort(citationOrder),
    A.dedupeWith((left, right) => left.id === right.id)
  );

const citationIds = (citations: ReadonlyArray<Citation>): ReadonlyArray<string> =>
  pipe(
    citations,
    A.map((citation) => citation.id)
  );

const issueMatchKind = (nlpNotes: ReadonlyArray<string>): "exact" | "normalized" | "fuzzy" =>
  A.isReadonlyArrayNonEmpty(nlpNotes) ? "normalized" : "exact";

const fileRequestedTarget = (value: string) => new RetrievalFileRequestedTarget({ value });
const symbolRequestedTarget = (value: string) => new RetrievalSymbolRequestedTarget({ value });
const questionRequestedTarget = (value: string) => new RetrievalQuestionRequestedTarget({ value });

const fileSubject = (filePath: FilePath, ids: ReadonlyArray<string> = A.empty()) =>
  new RetrievalFileSubject({
    label: filePath,
    filePath,
    citationIds: ids,
  });

const fileSubjectFromRecord = (file: Pick<RepoSourceFile, "filePath">, ids: ReadonlyArray<string> = A.empty()) =>
  fileSubject(file.filePath, ids);

const moduleSubject = (moduleSpecifier: string, ids: ReadonlyArray<string> = A.empty()) =>
  new RetrievalModuleSubject({
    label: moduleSpecifier,
    moduleSpecifier,
    citationIds: ids,
  });

const symbolSubject = (
  symbol: Pick<RepoSymbolRecord, "symbolId" | "symbolName" | "qualifiedName" | "symbolKind" | "filePath">,
  ids: ReadonlyArray<string> = A.empty()
) =>
  new RetrievalSymbolSubject({
    label: symbol.symbolName,
    symbolId: symbol.symbolId,
    symbolName: symbol.symbolName,
    qualifiedName: symbol.qualifiedName,
    symbolKind: symbol.symbolKind,
    filePath: symbol.filePath,
    citationIds: ids,
  });

const parameterItem = (parameter: RepoDocumentedParameter, ids: ReadonlyArray<string>) =>
  new RetrievalParameterItem({
    name: parameter.name,
    type: parameter.type,
    description: parameter.description,
    citationIds: ids,
  });

const returnItem = (documentation: RepoDocumentedReturn, ids: ReadonlyArray<string>) =>
  new RetrievalReturnItem({
    type: documentation.type,
    description: documentation.description,
    citationIds: ids,
  });

const throwItem = (documentation: RepoDocumentedThrow, ids: ReadonlyArray<string>) =>
  new RetrievalThrowItem({
    type: documentation.type,
    description: documentation.description,
    citationIds: ids,
  });

const locationFacet = (
  symbol: Pick<RepoSymbolRecord, "filePath" | "startLine" | "endLine">,
  ids: ReadonlyArray<string>
) =>
  new RetrievalLocationFacet({
    filePath: symbol.filePath,
    startLine: decodePosInt(symbol.startLine),
    endLine: decodePosInt(symbol.endLine),
    citationIds: ids,
  });

const documentationFacet = (documentation: RepoSymbolDocumentation, ids: ReadonlyArray<string>) =>
  new RetrievalDocumentationFacet({
    summary: documentation.summary,
    description: documentation.description,
    remarks: documentation.remarks,
    citationIds: ids,
  });

const deprecationFacet = (documentation: RepoSymbolDocumentation, ids: ReadonlyArray<string>) =>
  new RetrievalDeprecationFacet({
    isDeprecated: documentation.isDeprecated,
    note: documentation.deprecationNote,
    citationIds: ids,
  });

const returnsFacet = (documentation: RepoSymbolDocumentation, ids: ReadonlyArray<string>) =>
  new RetrievalReturnsFacet({
    item: pipe(
      documentation.returns,
      O.map((value) => returnItem(value, ids))
    ),
  });

const throwsFacet = (documentation: RepoSymbolDocumentation, ids: ReadonlyArray<string>) =>
  new RetrievalThrowsFacet({
    items: pipe(
      documentation.throws,
      A.map((value) => throwItem(value, ids))
    ),
  });

const symbolDetailPayload = (
  symbol: RepoSymbolRecord,
  aspect: RetrievalSubjectDetailAspect
): RetrievalSubjectDetailPayload => {
  const declarationCitation = symbolCitation(symbol);
  const docCitations = documentationCitations(symbol);
  const declarationIds = A.make(declarationCitation.id);
  const documentationIds = citationIds(docCitations);
  const subject = symbolSubject(symbol, declarationIds);
  const facets =
    aspect === "location"
      ? A.make(locationFacet(symbol, declarationIds))
      : aspect === "description"
        ? pipe(
            symbol.documentation,
            O.match({
              onNone: () =>
                A.make(
                  locationFacet(symbol, declarationIds),
                  new RetrievalDeclarationFacet({
                    signature: symbol.signature,
                    exported: O.some(symbol.exported),
                    citationIds: declarationIds,
                  })
                ),
              onSome: (documentation) =>
                A.make(
                  locationFacet(symbol, declarationIds),
                  new RetrievalDeclarationFacet({
                    signature: symbol.signature,
                    exported: O.some(symbol.exported),
                    citationIds: declarationIds,
                  }),
                  documentationFacet(documentation, documentationIds)
                ),
            })
          )
        : aspect === "params"
          ? pipe(
              symbol.documentation,
              O.match({
                onNone: A.empty,
                onSome: (documentation) =>
                  A.make(
                    new RetrievalParametersFacet({
                      items: pipe(
                        documentation.params,
                        A.map((parameter) => parameterItem(parameter, documentationIds))
                      ),
                    })
                  ),
              })
            )
          : aspect === "returns"
            ? pipe(
                symbol.documentation,
                O.match({
                  onNone: A.empty,
                  onSome: (documentation) => A.make(returnsFacet(documentation, documentationIds)),
                })
              )
            : aspect === "throws"
              ? pipe(
                  symbol.documentation,
                  O.match({
                    onNone: A.empty,
                    onSome: (documentation) => A.make(throwsFacet(documentation, documentationIds)),
                  })
                )
              : pipe(
                  symbol.documentation,
                  O.match({
                    onNone: A.empty,
                    onSome: (documentation) => A.make(deprecationFacet(documentation, documentationIds)),
                  })
                );

  return new RetrievalSubjectDetailPayload({
    aspect,
    subject,
    facets,
  });
};

const retrievalIssue = (issue: RetrievalIssue): O.Option<RetrievalIssue> => O.some(issue);
const retrievalPayload = (payload: RetrievalPayload): O.Option<RetrievalPayload> => O.some(payload);

const packetEvidence = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly normalizedQuery: string;
  readonly queryKind: RetrievalQueryKind;
  readonly outcome: RetrievalOutcome;
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
  readonly payload: O.Option<RetrievalPayload>;
  readonly issue: O.Option<RetrievalIssue>;
}): RetrievedEvidence => ({
  repoId: options.repoId,
  sourceSnapshotId: options.sourceSnapshotId,
  query: options.query,
  normalizedQuery: options.normalizedQuery,
  queryKind: options.queryKind,
  outcome: options.outcome,
  summary: options.summary,
  citations: options.citations,
  notes: options.notes,
  payload: options.payload,
  issue: options.issue,
});

const makePacket = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly normalizedQuery: string;
  readonly queryKind: RetrievalQueryKind;
  readonly outcome: RetrievalOutcome;
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
  readonly payload: O.Option<RetrievalPayload>;
  readonly issue: O.Option<RetrievalIssue>;
}): Effect.Effect<RetrievalPacket> =>
  Effect.map(
    DateTime.now,
    (retrievedAt) =>
      new RetrievalPacket({
        repoId: options.repoId,
        sourceSnapshotId: O.some(options.sourceSnapshotId),
        query: options.query,
        normalizedQuery: options.normalizedQuery,
        queryKind: options.queryKind,
        retrievedAt,
        outcome: options.outcome,
        summary: options.summary,
        citations: options.citations,
        notes: VariantText.orderedDedupe(A.append(options.notes, `sourceSnapshotId=${options.sourceSnapshotId}`)),
        payload: options.payload,
        issue: options.issue,
      })
  );

const resolvedEvidence = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly normalizedQuery: string;
  readonly queryKind: RetrievalQueryKind;
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
  readonly payload: RetrievalPayload;
}): RetrievedEvidence =>
  packetEvidence({
    repoId: options.repoId,
    sourceSnapshotId: options.sourceSnapshotId,
    query: options.query,
    normalizedQuery: options.normalizedQuery,
    queryKind: options.queryKind,
    outcome: "resolved",
    summary: options.summary,
    citations: options.citations,
    notes: options.notes,
    payload: retrievalPayload(options.payload),
    issue: O.none(),
  });

const unresolvedEvidence = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly normalizedQuery: string;
  readonly queryKind: RetrievalQueryKind;
  readonly outcome: "none" | "ambiguous" | "unsupported";
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
  readonly issue: RetrievalIssue;
}): RetrievedEvidence =>
  packetEvidence({
    repoId: options.repoId,
    sourceSnapshotId: options.sourceSnapshotId,
    query: options.query,
    normalizedQuery: options.normalizedQuery,
    queryKind: options.queryKind,
    outcome: options.outcome,
    summary: options.summary,
    citations: options.citations,
    notes: options.notes,
    payload: O.none(),
    issue: retrievalIssue(options.issue),
  });

const queryResultOutcome = (packet: RetrievalPacket): "cited" | "notCited" | "unsupported" =>
  packet.outcome === "unsupported" ? "unsupported" : A.isReadonlyArrayNonEmpty(packet.citations) ? "cited" : "notCited";

const loadSemanticArtifacts = (store: GroundedRetrievalStoreShape) =>
  Effect.fn("GroundedRetrieval.loadSemanticArtifacts")(function* (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): Effect.fn.Return<O.Option<RepoSemanticArtifacts>> {
    return yield* store
      .getSemanticArtifacts(repoId, sourceSnapshotId)
      .pipe(
        Effect.catch((error) =>
          Effect.logWarning(
            `Semantic artifact lookup failed for repo "${repoId}" and snapshot "${sourceSnapshotId}": ${error.message}`
          ).pipe(Effect.as(O.none<RepoSemanticArtifacts>()))
        )
      );
  });

const matchedSemanticAnchorCount = (
  citations: ReadonlyArray<Citation>,
  semanticArtifacts: O.Option<RepoSemanticArtifacts>
): number => {
  if (O.isNone(semanticArtifacts) || A.isReadonlyArrayEmpty(citations)) {
    return 0;
  }

  const citationIds = pipe(
    citations,
    A.map((citation) => citation.id),
    HashSet.fromIterable
  );
  return pipe(
    semanticArtifacts.value.evidenceAnchors,
    A.filter(
      (anchor) =>
        O.isSome(anchor.note) &&
        pipe(anchor.note.value, Str.startsWith("citationId=")) &&
        HashSet.has(citationIds, pipe(anchor.note.value, Str.slice("citationId=".length)))
    ),
    A.length
  );
};

const withSemanticOverlay = (
  packet: RetrievalPacket,
  semanticArtifacts: O.Option<RepoSemanticArtifacts>
): RetrievalPacket => {
  if (O.isNone(semanticArtifacts)) {
    return packet;
  }

  const matchedAnchorCount = matchedSemanticAnchorCount(packet.citations, semanticArtifacts);

  return new RetrievalPacket({
    ...packet,
    notes: pipe(
      packet.notes,
      A.append(`semanticDatasetQuads=${semanticArtifacts.value.dataset.quads.length}`),
      A.append(`semanticProvenanceRecords=${semanticArtifacts.value.provenance.records.length}`),
      A.append(`semanticEvidenceAnchors=${semanticArtifacts.value.evidenceAnchors.length}`),
      A.append(`semanticCitationAnchors=${matchedAnchorCount}/${A.length(packet.citations)}`)
    ),
  });
};

const makeGroundedRetrievalService = Effect.fn("GroundedRetrieval.make")(function* () {
  const semanticStore = yield* RepoSemanticStore;
  const snapshotStore = yield* RepoSnapshotStore;
  const symbolStore = yield* RepoSymbolStore;
  const store: GroundedRetrievalStoreShape = { ...semanticStore, ...snapshotStore, ...symbolStore };
  const latestSnapshot = latestSnapshotForRepo(store);
  const latestSemanticArtifacts = loadSemanticArtifacts(store);

  const ground: GroundedRetrievalServiceShape["ground"] = Effect.fn("GroundedRetrieval.ground")(function* (payload) {
    const preparation = prepareGroundedQuery(payload.question);
    yield* Effect.annotateCurrentSpan({
      repo_id: payload.repoId,
      query_kind: preparation.queryKind,
    });
    yield* recordQueryInterpretation(preparation.queryKind);

    return {
      repoId: payload.repoId,
      question: payload.question,
      ...preparation,
    };
  });

  const retrieve: GroundedRetrievalServiceShape["retrieve"] = Effect.fn("GroundedRetrieval.retrieve")(
    function* (grounding) {
      const sourceSnapshotId = yield* latestSnapshot(grounding.repoId);
      const prepareSymbolMatches = findSymbolMatches(store, grounding.repoId, sourceSnapshotId);
      const prepareFileCandidates = resolveFileCandidates(store);
      const prepareKeywordMatches = searchKeywordMatches(store, grounding.repoId, sourceSnapshotId);
      const findMatches = Effect.fn("GroundedRetrieval.findMatches")((symbolName: string) =>
        prepareSymbolMatches(symbolName).pipe(mapStoreError)
      );
      const findFiles = Effect.fn("GroundedRetrieval.findFiles")((fileQuery: string) =>
        prepareFileCandidates(grounding.repoId, sourceSnapshotId, fileQuery).pipe(mapStoreError)
      );
      const findKeywordMatches = Effect.fn("GroundedRetrieval.findKeywordMatches")((query: string) =>
        prepareKeywordMatches(query).pipe(mapStoreError)
      );
      const withGroundingNotes = (notes: ReadonlyArray<string>) =>
        VariantText.orderedDedupe(A.appendAll(grounding.questionNotes, notes));
      const symbolCandidates = (matches: ReadonlyArray<RepoSymbolRecord>, nlpNotes: ReadonlyArray<string>) =>
        pipe(
          matches,
          A.take(10),
          A.map(
            (symbol) =>
              new RetrievalCandidate({
                subject: symbolSubject(symbol, A.make(symbol.symbolId)),
                matchKind: issueMatchKind(nlpNotes),
                note: O.none(),
              })
          )
        );
      const fileCandidates = (matches: ReadonlyArray<RepoSourceFile>, nlpNotes: ReadonlyArray<string>) =>
        pipe(
          matches,
          A.take(10),
          A.map(
            (file) =>
              new RetrievalCandidate({
                subject: fileSubjectFromRecord(file, A.make(file.filePath)),
                matchKind: issueMatchKind(nlpNotes),
                note: O.none(),
              })
          )
        );

      yield* Effect.annotateCurrentSpan({
        repo_id: grounding.repoId,
        source_snapshot_id: sourceSnapshotId,
        query_kind: grounding.queryKind,
      });

      return yield* QueryInterpretation.match(grounding.interpretation, {
        countFiles: () =>
          Effect.gen(function* () {
            const fileCount = yield* mapStoreError(store.countSourceFiles(grounding.repoId, sourceSnapshotId));
            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Counted indexed TypeScript source files for snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: withGroundingNotes(A.make(`countFiles=${fileCount}`)),
              payload: new RetrievalCountPayload({
                target: "files",
                count: decodeNonNegativeInt(fileCount),
              }),
            });
          }),
        countSymbols: () =>
          Effect.gen(function* () {
            const symbolCount = yield* mapStoreError(store.listSymbolRecords(grounding.repoId, sourceSnapshotId)).pipe(
              Effect.map(A.length)
            );
            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Counted indexed TypeScript symbols for snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: withGroundingNotes(A.make(`countSymbols=${symbolCount}`)),
              payload: new RetrievalCountPayload({
                target: "symbols",
                count: decodeNonNegativeInt(symbolCount),
              }),
            });
          }),
        locateSymbol: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("locateSymbol=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "locateSymbol=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = normalizeCitations(A.make(symbolCitation(symbol)));

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Located symbol "${symbol.symbolName}" from indexed symbol records.`,
              citations,
              notes: withGroundingNotes(A.appendAll(A.make(`symbolId=${symbol.symbolId}`), selection.nlpNotes)),
              payload: symbolDetailPayload(symbol, "location"),
            });
          }),
        describeSymbol: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("describeSymbol=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "describeSymbol=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = O.isSome(symbol.documentation)
              ? documentationCitations(symbol, { includeDeclaration: true })
              : normalizeCitations(A.make(symbolCitation(symbol)));

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: O.isSome(symbol.documentation)
                ? `Described symbol "${symbol.symbolName}" from its indexed declaration and JSDoc semantics.`
                : `Described symbol "${symbol.symbolName}" from its indexed declaration because no JSDoc semantics were captured.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(`signature=${symbol.signature}`, `documentation=${O.isSome(symbol.documentation)}`),
                  selection.nlpNotes
                )
              ),
              payload: symbolDetailPayload(symbol, "description"),
            });
          }),
        symbolParams: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("symbolParams=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "symbolParams=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = O.isSome(symbol.documentation)
              ? documentationCitations(symbol)
              : normalizeCitations(A.make(symbolCitation(symbol)));
            const notes = O.isSome(symbol.documentation)
              ? A.appendAll(A.make(`paramCount=${A.length(symbol.documentation.value.params)}`), selection.nlpNotes)
              : A.appendAll(A.make("symbolParams=no-documentation"), selection.nlpNotes);

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: O.isSome(symbol.documentation)
                ? `Returned documented parameters for symbol "${symbol.symbolName}".`
                : `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations,
              notes: withGroundingNotes(notes),
              payload: symbolDetailPayload(symbol, "params"),
            });
          }),
        symbolReturns: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("symbolReturns=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "symbolReturns=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = O.isSome(symbol.documentation)
              ? documentationCitations(symbol)
              : normalizeCitations(A.make(symbolCitation(symbol)));
            const notes = O.isSome(symbol.documentation)
              ? A.appendAll(A.make(`hasReturns=${O.isSome(symbol.documentation.value.returns)}`), selection.nlpNotes)
              : A.appendAll(A.make("symbolReturns=no-documentation"), selection.nlpNotes);

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: O.isSome(symbol.documentation)
                ? `Returned documented return semantics for symbol "${symbol.symbolName}".`
                : `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations,
              notes: withGroundingNotes(notes),
              payload: symbolDetailPayload(symbol, "returns"),
            });
          }),
        symbolThrows: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("symbolThrows=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "symbolThrows=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = O.isSome(symbol.documentation)
              ? documentationCitations(symbol)
              : normalizeCitations(A.make(symbolCitation(symbol)));
            const notes = O.isSome(symbol.documentation)
              ? A.appendAll(A.make(`throwCount=${A.length(symbol.documentation.value.throws)}`), selection.nlpNotes)
              : A.appendAll(A.make("symbolThrows=no-documentation"), selection.nlpNotes);

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: O.isSome(symbol.documentation)
                ? `Returned documented throw semantics for symbol "${symbol.symbolName}".`
                : `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations,
              notes: withGroundingNotes(notes),
              payload: symbolDetailPayload(symbol, "throws"),
            });
          }),
        symbolDeprecation: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("symbolDeprecation=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "symbolDeprecation=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const citations = O.isSome(symbol.documentation)
              ? documentationCitations(symbol)
              : normalizeCitations(A.make(symbolCitation(symbol)));
            const notes = O.isSome(symbol.documentation)
              ? A.appendAll(A.make(`deprecated=${symbol.documentation.value.isDeprecated}`), selection.nlpNotes)
              : A.appendAll(A.make("symbolDeprecation=no-documentation"), selection.nlpNotes);

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: O.isSome(symbol.documentation)
                ? `Returned deprecation documentation for symbol "${symbol.symbolName}".`
                : `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations,
              notes: withGroundingNotes(notes),
              payload: symbolDetailPayload(symbol, "deprecation"),
            });
          }),
        listFileExports: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findFiles(value.fileQuery));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("listFileExports=no-file-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  note: "listFileExports=no-file-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(fileCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `File query "${value.fileQuery}" matched multiple indexed files.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  candidates: fileCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const file = selection.match;
            const symbols = yield* mapStoreError(
              store.listExportedSymbolsForFile(grounding.repoId, sourceSnapshotId, file.filePath)
            );
            const citations = normalizeCitations(pipe(symbols, A.map(symbolCitation)));

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed exported symbols for ${file.filePath}.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(A.make(`filePath=${file.filePath}`, `exportCount=${A.length(symbols)}`), selection.nlpNotes)
              ),
              payload: new RetrievalRelationListPayload({
                relation: "exports",
                subject: fileSubjectFromRecord(file),
                items: pipe(
                  symbols,
                  A.map((symbol) => symbolSubject(symbol, A.make(symbol.symbolId)))
                ),
              }),
            });
          }),
        listFileImports: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findFiles(value.fileQuery));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("listFileImports=no-file-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  note: "listFileImports=no-file-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(fileCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `File query "${value.fileQuery}" matched multiple indexed files.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  candidates: fileCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const file = selection.match;
            const matchingEdges = yield* mapStoreError(
              store.listImportEdgesForImporterFile(grounding.repoId, sourceSnapshotId, file.filePath)
            );
            const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
            const items = pipe(
              matchingEdges,
              A.map((edge) => moduleSubject(edge.moduleSpecifier, A.make(importEdgeCitation(edge).id))),
              A.dedupeWith((left, right) => left.moduleSpecifier === right.moduleSpecifier)
            );

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed import declarations captured for ${file.filePath}.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(`filePath=${file.filePath}`, `importCount=${A.length(matchingEdges)}`),
                  selection.nlpNotes
                )
              ),
              payload: new RetrievalRelationListPayload({
                relation: "imports",
                subject: fileSubjectFromRecord(file),
                items,
              }),
            });
          }),
        listFileDependencies: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findFiles(value.fileQuery));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(
                  A.appendAll(A.make("listFileDependencies=no-file-match"), selection.nlpNotes)
                ),
                issue: new RetrievalNoMatchIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  note: "listFileDependencies=no-file-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(fileCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `File query "${value.fileQuery}" matched multiple indexed files.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  candidates: fileCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const file = selection.match;
            const fileEdges = yield* mapStoreError(
              store.listImportEdgesForImporterFile(grounding.repoId, sourceSnapshotId, file.filePath)
            );
            const resolvedEdges = pipe(
              fileEdges,
              A.filter((edge) => O.isSome(edge.resolvedTargetFilePath))
            );
            const citations = normalizeCitations(pipe(resolvedEdges, A.map(importEdgeCitation)));
            const items = pipe(
              resolvedEdges,
              A.map((edge) =>
                fileSubject(O.getOrThrow(edge.resolvedTargetFilePath), A.make(importEdgeCitation(edge).id))
              ),
              A.dedupeWith((left, right) => left.filePath === right.filePath)
            );

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed repo-local resolved file dependencies for ${file.filePath}.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(
                    `filePath=${file.filePath}`,
                    `dependencyCount=${A.length(items)}`,
                    `unresolvedImportCount=${A.length(fileEdges) - A.length(resolvedEdges)}`
                  ),
                  selection.nlpNotes
                )
              ),
              payload: new RetrievalRelationListPayload({
                relation: "depends-on",
                subject: fileSubjectFromRecord(file),
                items,
              }),
            });
          }),
        listFileDependents: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findFiles(value.fileQuery));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("listFileDependents=no-file-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  note: "listFileDependents=no-file-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(fileCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `File query "${value.fileQuery}" matched multiple indexed files.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: fileRequestedTarget(value.fileQuery),
                  candidates: fileCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const file = selection.match;
            const matchingEdges = yield* mapStoreError(
              store.listImportEdgesForResolvedTargetFile(grounding.repoId, sourceSnapshotId, file.filePath)
            );
            const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
            const items = pipe(
              matchingEdges,
              A.map((edge) => fileSubject(edge.importerFilePath, A.make(importEdgeCitation(edge).id))),
              A.dedupeWith((left, right) => left.filePath === right.filePath)
            );

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed repo-local files depending on ${file.filePath}.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(`filePath=${file.filePath}`, `dependentCount=${A.length(items)}`),
                  selection.nlpNotes
                )
              ),
              payload: new RetrievalRelationListPayload({
                relation: "depended-on-by",
                subject: fileSubjectFromRecord(file),
                items,
              }),
            });
          }),
        listFileImporters: (value) =>
          Effect.gen(function* () {
            const importEdges = yield* mapStoreError(store.listImportEdges(grounding.repoId, sourceSnapshotId));
            const selection = selectImporterEdges(value.moduleQuery, importEdges);
            const matchingEdges = selection.matches;
            const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
            const items = pipe(
              matchingEdges,
              A.map((edge) => fileSubject(edge.importerFilePath, A.make(importEdgeCitation(edge).id))),
              A.dedupeWith((left, right) => left.filePath === right.filePath)
            );

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed files importing "${value.moduleQuery}" from captured import edges.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(`moduleQuery=${value.moduleQuery}`, `importerCount=${A.length(items)}`),
                  selection.nlpNotes
                )
              ),
              payload: new RetrievalRelationListPayload({
                relation: "imported-by",
                subject: moduleSubject(value.moduleQuery),
                items,
              }),
            });
          }),
        listSymbolImporters: (value) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* findMatches(value.symbolName));

            if (selection.kind === "none") {
              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "none",
                summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
                citations: A.empty(),
                notes: withGroundingNotes(A.appendAll(A.make("listSymbolImporters=no-match"), selection.nlpNotes)),
                issue: new RetrievalNoMatchIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  note: "listSymbolImporters=no-match",
                }),
              });
            }

            if (selection.kind === "ambiguous") {
              const citations = normalizeCitations(pipe(selection.matches, A.take(10), A.map(symbolCitation)));

              return unresolvedEvidence({
                repoId: grounding.repoId,
                sourceSnapshotId,
                query: grounding.question,
                normalizedQuery: grounding.normalizedQuery,
                queryKind: grounding.queryKind,
                outcome: "ambiguous",
                summary: `Symbol query "${value.symbolName}" matched multiple indexed symbols.`,
                citations,
                notes: withGroundingNotes(
                  A.appendAll(A.make(`candidateCount=${A.length(selection.matches)}`), selection.nlpNotes)
                ),
                issue: new RetrievalAmbiguousIssue({
                  requested: symbolRequestedTarget(value.symbolName),
                  candidates: symbolCandidates(selection.matches, selection.nlpNotes),
                }),
              });
            }

            const symbol = selection.match;
            const importEdges = yield* mapStoreError(
              store.listImportEdgesForResolvedTargetFile(grounding.repoId, sourceSnapshotId, symbol.filePath)
            );
            const matchingEdges = pipe(
              importEdges,
              A.filter((edge) => O.isSome(edge.importedName) && edge.importedName.value === symbol.symbolName)
            );
            const typeOnlyImporterCount = pipe(
              matchingEdges,
              A.filter((edge) => edge.typeOnly),
              A.map((edge) => edge.importerFilePath),
              A.dedupe,
              A.length
            );
            const citations = normalizeCitations(
              A.appendAll(A.make(symbolCitation(symbol)), pipe(matchingEdges, A.map(importEdgeCitation)))
            );
            const items = pipe(
              matchingEdges,
              A.map((edge) => fileSubject(edge.importerFilePath, A.make(importEdgeCitation(edge).id))),
              A.dedupeWith((left, right) => left.filePath === right.filePath)
            );

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Listed files importing symbol "${symbol.symbolName}" from ${symbol.filePath}.`,
              citations,
              notes: withGroundingNotes(
                A.appendAll(
                  A.make(
                    `symbolName=${symbol.symbolName}`,
                    `symbolFilePath=${symbol.filePath}`,
                    `importerCount=${A.length(items)}`,
                    `typeOnlyImporterCount=${typeOnlyImporterCount}`
                  ),
                  selection.nlpNotes
                )
              ),
              payload: new RetrievalRelationListPayload({
                relation: "imported-by",
                subject: symbolSubject(symbol, A.make(symbol.symbolId)),
                items,
              }),
            });
          }),
        keywordSearch: (value) =>
          Effect.gen(function* () {
            const selection = yield* findKeywordMatches(value.query);
            const matches = selection.matches;
            const citations = normalizeCitations(pipe(matches, A.map(symbolCitation)));

            return resolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              summary: `Keyword search over indexed symbols using "${value.query}".`,
              citations,
              notes: withGroundingNotes(A.appendAll(A.make(`matchCount=${A.length(matches)}`), selection.nlpNotes)),
              payload: new RetrievalSearchResultsPayload({
                query: value.query,
                items: pipe(
                  matches,
                  A.map((symbol) => symbolSubject(symbol, A.make(symbol.symbolId)))
                ),
              }),
            });
          }),
        unsupported: (value) =>
          Effect.succeed(
            unresolvedEvidence({
              repoId: grounding.repoId,
              sourceSnapshotId,
              query: grounding.question,
              normalizedQuery: grounding.normalizedQuery,
              queryKind: grounding.queryKind,
              outcome: "unsupported",
              summary: "The question did not match one of the supported deterministic query shapes.",
              citations: A.empty(),
              notes: withGroundingNotes(A.make(value.reason)),
              issue: new RetrievalUnsupportedIssue({
                requested: questionRequestedTarget(grounding.question),
                reason: value.reason,
              }),
            })
          ),
      });
    }
  );

  const materializePacket: GroundedRetrievalServiceShape["materializePacket"] = Effect.fn(
    "GroundedRetrieval.materializePacket"
  )(function* (evidence) {
    const semanticArtifacts = yield* latestSemanticArtifacts(evidence.repoId, evidence.sourceSnapshotId);
    const packet = yield* makePacket({
      repoId: evidence.repoId,
      sourceSnapshotId: evidence.sourceSnapshotId,
      query: evidence.query,
      normalizedQuery: evidence.normalizedQuery,
      queryKind: evidence.queryKind,
      outcome: evidence.outcome,
      summary: evidence.summary,
      citations: evidence.citations,
      notes: evidence.notes,
      payload: evidence.payload,
      issue: evidence.issue,
    });

    return withSemanticOverlay(packet, semanticArtifacts);
  });

  const draftAnswer: GroundedRetrievalServiceShape["draftAnswer"] = Effect.fn("GroundedRetrieval.draftAnswer")(
    (packet) => Effect.succeed(renderRetrievalPacketAnswer(packet))
  );

  const resolve: GroundedRetrievalServiceShape["resolve"] = Effect.fn("GroundedRetrieval.resolve")(function* (payload) {
    const grounding = yield* ground(payload);
    const evidence = yield* retrieve(grounding);
    const packet = yield* materializePacket(evidence);
    const answer = yield* draftAnswer(packet);
    const outcome = queryResultOutcome(packet);

    yield* Effect.annotateCurrentSpan({
      query_kind: grounding.queryKind,
      query_outcome: outcome,
      citation_count: A.length(packet.citations),
      retrieval_packet_citation_count: A.length(packet.citations),
      retrieval_note_count: A.length(packet.notes),
    });
    yield* recordQueryResult(grounding.queryKind, outcome, A.length(packet.citations));

    return new GroundedQueryResult({
      answer,
      citations: packet.citations,
      packet,
    });
  });

  return GroundedRetrievalService.of({ ground, retrieve, materializePacket, draftAnswer, resolve });
});
