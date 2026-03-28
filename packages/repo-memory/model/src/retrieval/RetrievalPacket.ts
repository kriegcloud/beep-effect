import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type {
  RetrievalAmbiguousIssue,
  RetrievalCandidate,
  RetrievalCountPayload,
  RetrievalDeprecationFacet,
  RetrievalDocumentationFacet,
  RetrievalFacet,
  RetrievalIssue,
  RetrievalItem,
  RetrievalLocationFacet,
  RetrievalNoMatchIssue,
  RetrievalPacket,
  RetrievalPayload,
  RetrievalRelationListPayload,
  RetrievalReturnsFacet,
  RetrievalSearchResultsPayload,
  RetrievalSubject,
  RetrievalSubjectDetailPayload,
  RetrievalThrowsFacet,
  RetrievalUnsupportedIssue,
} from "../internal/domain.js";

const formatSnapshotSuffix = (packet: RetrievalPacket): string =>
  pipe(
    packet.sourceSnapshotId,
    O.match({
      onNone: () => "",
      onSome: (sourceSnapshotId) => ` in snapshot ${sourceSnapshotId}`,
    })
  );

const renderSubjectLabel = (subject: RetrievalSubject): string => {
  if (subject.kind === "file") {
    return subject.filePath;
  }

  if (subject.kind === "module") {
    return subject.moduleSpecifier;
  }

  return subject.symbolName;
};

const renderItem = (item: RetrievalItem): string => {
  if (item.kind === "file") {
    return item.filePath;
  }

  if (item.kind === "module") {
    return item.moduleSpecifier;
  }

  if (item.kind === "symbol") {
    return `${item.symbolName} (${item.symbolKind}) in ${item.filePath}`;
  }

  const header =
    item.kind === "parameter"
      ? pipe(
          item.type,
          O.match({
            onNone: () => item.name,
            onSome: (type) => `${item.name}: ${type}`,
          })
        )
      : pipe(
          item.type,
          O.getOrElse(() => "unspecified")
        );

  return pipe(
    item.description,
    O.match({
      onNone: () => header,
      onSome: (description) => `${header} - ${description}`,
    })
  );
};

const renderCandidates = (candidates: ReadonlyArray<RetrievalCandidate>): string =>
  pipe(
    candidates,
    A.map((candidate) => renderSubjectLabel(candidate.subject)),
    A.join(", ")
  );

const findLocationFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet): facet is RetrievalLocationFacet => facet.kind === "location")
  );

const findDeclarationFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet) => facet.kind === "declaration")
  );

const findDocumentationFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet): facet is RetrievalDocumentationFacet => facet.kind === "documentation")
  );

const findReturnsFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet): facet is RetrievalReturnsFacet => facet.kind === "returns")
  );

const findThrowsFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet): facet is RetrievalThrowsFacet => facet.kind === "throws")
  );

const findDeprecationFacet = (facets: ReadonlyArray<RetrievalFacet>) =>
  pipe(
    facets,
    A.findFirst((facet): facet is RetrievalDeprecationFacet => facet.kind === "deprecation")
  );

const renderCountPayload = (packet: RetrievalPacket, payload: RetrievalCountPayload): string =>
  payload.target === "files"
    ? `Indexed${formatSnapshotSuffix(packet)} currently contains ${payload.count} TypeScript source files.`
    : `Indexed${formatSnapshotSuffix(packet)} currently contains ${payload.count} captured TypeScript symbols.`;

const renderSubjectDetailPayload = (packet: RetrievalPacket, payload: RetrievalSubjectDetailPayload): string => {
  if (payload.aspect === "location") {
    return pipe(
      findLocationFacet(payload.facets),
      O.match({
        onNone: () =>
          `${renderSubjectLabel(payload.subject)} is grounded but no location facet was captured${formatSnapshotSuffix(packet)}.`,
        onSome: (facet) =>
          `${renderSubjectLabel(payload.subject)} is located in ${facet.filePath}:${facet.startLine}-${facet.endLine}${formatSnapshotSuffix(packet)}.`,
      })
    );
  }

  if (payload.aspect === "description") {
    const declaration = findDeclarationFacet(payload.facets);
    const documentation = findDocumentationFacet(payload.facets);

    return pipe(
      A.make(
        `Symbol "${renderSubjectLabel(payload.subject)}"${formatSnapshotSuffix(packet)}.`,
        pipe(
          declaration,
          O.match({
            onNone: () => "",
            onSome: (facet) => `Signature: ${facet.signature}.`,
          })
        ),
        pipe(
          documentation,
          O.match({
            onNone: () => "",
            onSome: (facet) =>
              pipe(
                A.make(
                  pipe(
                    facet.summary,
                    O.match({
                      onNone: () => "",
                      onSome: (summary) => `Summary: ${summary}.`,
                    })
                  ),
                  pipe(
                    facet.description,
                    O.match({
                      onNone: () => "",
                      onSome: (description) => `Description: ${description}.`,
                    })
                  ),
                  pipe(
                    facet.remarks,
                    O.match({
                      onNone: () => "",
                      onSome: (remarks) => `Remarks: ${remarks}.`,
                    })
                  )
                ),
                A.filter((part) => part.length > 0),
                A.join(" ")
              ),
          })
        )
      ),
      A.filter((part) => part.length > 0),
      A.join(" ")
    );
  }

  if (payload.aspect === "params") {
    return pipe(
      payload.facets,
      A.findFirst((facet) => facet.kind === "parameters"),
      O.match({
        onNone: () =>
          `Symbol "${renderSubjectLabel(payload.subject)}" has no documented parameters${formatSnapshotSuffix(packet)}.`,
        onSome: (facet) =>
          pipe(
            facet.items,
            A.match({
              onEmpty: () =>
                `Symbol "${renderSubjectLabel(payload.subject)}" has no documented parameters${formatSnapshotSuffix(packet)}.`,
              onNonEmpty: (items) =>
                `Documented parameters for "${renderSubjectLabel(payload.subject)}"${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
            })
          ),
      })
    );
  }

  if (payload.aspect === "returns") {
    return pipe(
      findReturnsFacet(payload.facets),
      O.match({
        onNone: () =>
          `Symbol "${renderSubjectLabel(payload.subject)}" has no documented return contract${formatSnapshotSuffix(packet)}.`,
        onSome: (facet) =>
          pipe(
            facet.item,
            O.match({
              onNone: () =>
                `Symbol "${renderSubjectLabel(payload.subject)}" has no documented return contract${formatSnapshotSuffix(packet)}.`,
              onSome: (item) =>
                `Returns for "${renderSubjectLabel(payload.subject)}"${formatSnapshotSuffix(packet)}: ${renderItem(item)}.`,
            })
          ),
      })
    );
  }

  if (payload.aspect === "throws") {
    return pipe(
      findThrowsFacet(payload.facets),
      O.match({
        onNone: () =>
          `Symbol "${renderSubjectLabel(payload.subject)}" has no documented throws contract${formatSnapshotSuffix(packet)}.`,
        onSome: (facet) =>
          pipe(
            facet.items,
            A.match({
              onEmpty: () =>
                `Symbol "${renderSubjectLabel(payload.subject)}" has no documented throws contract${formatSnapshotSuffix(packet)}.`,
              onNonEmpty: (items) =>
                `Throws for "${renderSubjectLabel(payload.subject)}"${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
            })
          ),
      })
    );
  }

  return pipe(
    findDeprecationFacet(payload.facets),
    O.match({
      onNone: () =>
        `No deprecation metadata was captured for "${renderSubjectLabel(payload.subject)}"${formatSnapshotSuffix(packet)}.`,
      onSome: (facet) =>
        facet.isDeprecated
          ? pipe(
              facet.note,
              O.match({
                onNone: () =>
                  `Symbol "${renderSubjectLabel(payload.subject)}" is deprecated${formatSnapshotSuffix(packet)}.`,
                onSome: (note) =>
                  `Symbol "${renderSubjectLabel(payload.subject)}" is deprecated${formatSnapshotSuffix(packet)}. ${note}`,
              })
            )
          : `Symbol "${renderSubjectLabel(payload.subject)}" is not marked deprecated${formatSnapshotSuffix(packet)}.`,
    })
  );
};

const renderRelationListPayload = (packet: RetrievalPacket, payload: RetrievalRelationListPayload): string => {
  const subjectLabel = renderSubjectLabel(payload.subject);

  if (payload.relation === "exports") {
    return pipe(
      payload.items,
      A.match({
        onEmpty: () => `No indexed exports were recorded for ${subjectLabel}${formatSnapshotSuffix(packet)}.`,
        onNonEmpty: (items) =>
          `Exports for ${subjectLabel}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
      })
    );
  }

  if (payload.relation === "imports") {
    return pipe(
      payload.items,
      A.match({
        onEmpty: () => `No indexed imports were recorded for ${subjectLabel}${formatSnapshotSuffix(packet)}.`,
        onNonEmpty: (items) =>
          `Imports for ${subjectLabel}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
      })
    );
  }

  if (payload.relation === "imported-by") {
    if (payload.subject.kind === "symbol") {
      const subject = payload.subject;

      return pipe(
        payload.items,
        A.match({
          onEmpty: () =>
            `No indexed files import symbol "${subject.symbolName}" from ${subject.filePath}${formatSnapshotSuffix(packet)}.`,
          onNonEmpty: (items) =>
            `Files importing symbol "${subject.symbolName}" from ${subject.filePath}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
        })
      );
    }

    return pipe(
      payload.items,
      A.match({
        onEmpty: () => `No indexed files import ${subjectLabel}${formatSnapshotSuffix(packet)}.`,
        onNonEmpty: (items) =>
          `Files importing ${subjectLabel}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
      })
    );
  }

  if (payload.relation === "depends-on") {
    return pipe(
      payload.items,
      A.match({
        onEmpty: () => `No repo-local dependencies were resolved for ${subjectLabel}${formatSnapshotSuffix(packet)}.`,
        onNonEmpty: (items) =>
          `Resolved repo-local dependencies for ${subjectLabel}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
      })
    );
  }

  return pipe(
    payload.items,
    A.match({
      onEmpty: () => `No repo-local files depend on ${subjectLabel}${formatSnapshotSuffix(packet)}.`,
      onNonEmpty: (items) =>
        `Files depending on ${subjectLabel}${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
    })
  );
};

const renderSearchResultsPayload = (packet: RetrievalPacket, payload: RetrievalSearchResultsPayload): string =>
  pipe(
    payload.items,
    A.match({
      onEmpty: () => `No indexed symbols matched keyword query "${payload.query}"${formatSnapshotSuffix(packet)}.`,
      onNonEmpty: (items) =>
        `Keyword search matched${formatSnapshotSuffix(packet)}: ${pipe(items, A.map(renderItem), A.join("; "))}.`,
    })
  );

const renderNoMatchIssue = (packet: RetrievalPacket, issue: RetrievalNoMatchIssue): string => {
  if (issue.requested.kind === "file-query") {
    return `No indexed TypeScript file matching "${issue.requested.value}" was found${formatSnapshotSuffix(packet)}.`;
  }

  if (issue.requested.kind === "symbol-query") {
    return `No indexed symbol named "${issue.requested.value}" was found${formatSnapshotSuffix(packet)}.`;
  }

  if (issue.requested.kind === "module-query") {
    return `No indexed importers matched "${issue.requested.value}"${formatSnapshotSuffix(packet)}.`;
  }

  if (issue.requested.kind === "keyword-query") {
    return `No indexed symbols matched keyword query "${issue.requested.value}"${formatSnapshotSuffix(packet)}.`;
  }

  return `No grounded result was found for "${issue.requested.value}"${formatSnapshotSuffix(packet)}.`;
};

const renderAmbiguousIssue = (packet: RetrievalPacket, issue: RetrievalAmbiguousIssue): string => {
  if (issue.requested.kind === "file-query") {
    return `Ambiguous file query "${issue.requested.value}"${formatSnapshotSuffix(packet)}. Matching files: ${renderCandidates(issue.candidates)}.`;
  }

  if (issue.requested.kind === "symbol-query") {
    return `Ambiguous symbol query "${issue.requested.value}"${formatSnapshotSuffix(packet)}. Matching symbols: ${renderCandidates(issue.candidates)}.`;
  }

  return `Ambiguous query "${issue.requested.value}"${formatSnapshotSuffix(packet)}. Matching candidates: ${renderCandidates(issue.candidates)}.`;
};

const renderUnsupportedIssue = (_packet: RetrievalPacket, issue: RetrievalUnsupportedIssue): string =>
  `Unsupported query shape. ${issue.reason}`;

const renderPayload = (packet: RetrievalPacket, payload: RetrievalPayload): string => {
  if (payload.family === "count") {
    return renderCountPayload(packet, payload);
  }

  if (payload.family === "subject-detail") {
    return renderSubjectDetailPayload(packet, payload);
  }

  if (payload.family === "relation-list") {
    return renderRelationListPayload(packet, payload);
  }

  return renderSearchResultsPayload(packet, payload);
};

const renderIssue = (packet: RetrievalPacket, issue: RetrievalIssue): string => {
  if (issue.kind === "no-match") {
    return renderNoMatchIssue(packet, issue);
  }

  if (issue.kind === "ambiguous") {
    return renderAmbiguousIssue(packet, issue);
  }

  return renderUnsupportedIssue(packet, issue);
};

/**
 * Render a deterministic grounded answer from a frozen retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const renderRetrievalPacketAnswer = (packet: RetrievalPacket): string => {
  if (packet.outcome === "resolved") {
    return pipe(
      packet.payload,
      O.match({
        onNone: () => packet.summary,
        onSome: (payload) => renderPayload(packet, payload),
      })
    );
  }

  return pipe(
    packet.issue,
    O.match({
      onNone: () => packet.summary,
      onSome: (issue) => renderIssue(packet, issue),
    })
  );
};

export {
  /**
   * Ambiguous retrieval issue model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalAmbiguousIssue,
  /**
   * Retrieval candidate model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalCandidate,
  /**
   * Resolved count payload model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalCountPayload,
  /**
   * Count target literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalCountTarget,
  /**
   * Declaration facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalDeclarationFacet,
  /**
   * Deprecation facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalDeprecationFacet,
  /**
   * Documentation facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalDocumentationFacet,
  /**
   * Retrieval facet union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalFacet,
  /**
   * File requested-target model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalFileRequestedTarget,
  /**
   * File subject model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalFileSubject,
  /**
   * Retrieval issue union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalIssue,
  /**
   * Retrieval item union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalItem,
  /**
   * Location facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalLocationFacet,
  /**
   * Retrieval match-kind literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalMatchKind,
  /**
   * Module requested-target model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalModuleRequestedTarget,
  /**
   * Module subject model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalModuleSubject,
  /**
   * No-match retrieval issue model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalNoMatchIssue,
  /**
   * Retrieval outcome literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalOutcome,
  /**
   * Retrieval packet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalPacket,
  /**
   * Parameter item model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalParameterItem,
  /**
   * Parameters facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalParametersFacet,
  /**
   * Retrieval payload union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalPayload,
  /**
   * Retrieval query-kind literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalQueryKind,
  /**
   * Question requested-target model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalQuestionRequestedTarget,
  /**
   * Retrieval relation literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalRelation,
  /**
   * Relation-list payload model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalRelationListPayload,
  /**
   * Requested-target union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalRequestedTarget,
  /**
   * Return item model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalReturnItem,
  /**
   * Returns facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalReturnsFacet,
  /**
   * Search-results payload model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSearchResultsPayload,
  /**
   * Retrieval subject union model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSubject,
  /**
   * Subject-detail aspect literal domain.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSubjectDetailAspect,
  /**
   * Subject-detail payload model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSubjectDetailPayload,
  /**
   * Symbol requested-target model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSymbolRequestedTarget,
  /**
   * Symbol subject model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalSymbolSubject,
  /**
   * Throw item model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalThrowItem,
  /**
   * Throws facet model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalThrowsFacet,
  /**
   * Unsupported retrieval issue model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RetrievalUnsupportedIssue,
} from "../internal/domain.js";
