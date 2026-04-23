/**
 * Canonical editor document schema model.
 *
 * @module
 * @since 0.0.0
 */

import { $EditorDomainId } from "@beep/identity/packages";
import { LiteralKit, MimeType, NonEmptyTrimmedStr, NonNegativeInt, SchemaUtils, Slug, UUID } from "@beep/schema";
import { Struct } from "@beep/utils";
import { type DateTime, Effect, flow, identity, Match, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $EditorDomainId.create("Canonical");

/**
 * Stable page identifier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PageId = UUID.pipe(
  S.brand("PageId"),
  S.annotate(
    $I.annote("PageId", {
      description: "Stable internal identifier for a page document.",
    })
  )
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type PageId = typeof PageId.Type;

/**
 * Stable block identifier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BlockId = UUID.pipe(
  S.brand("BlockId"),
  S.annotate(
    $I.annote("BlockId", {
      description: "Stable internal identifier for a block within a page document.",
    })
  )
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type BlockId = typeof BlockId.Type;

/**
 * Stable revision identifier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RevisionId = UUID.pipe(
  S.brand("RevisionId"),
  S.annotate(
    $I.annote("RevisionId", {
      description: "Stable internal identifier for a persisted page revision record.",
    })
  )
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RevisionId = typeof RevisionId.Type;
const createRevisionId = (): RevisionId => RevisionId.make(crypto.randomUUID());

/**
 * Stable workspace identifier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const WorkspaceId = UUID.pipe(
  S.brand("WorkspaceId"),
  S.annotate(
    $I.annote("WorkspaceId", {
      description: "Stable internal identifier for an app-owned editor workspace.",
    })
  )
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type WorkspaceId = typeof WorkspaceId.Type;

/**
 * Supported canonical export formats for the editor runtime.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ExportFormat = LiteralKit(["json", "markdown"]).annotate(
  $I.annote("ExportFormat", {
    description: "Canonical export formats currently implemented by the editor runtime.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ExportFormat = typeof ExportFormat.Type;

/**
 * Heading depth supported by the initial canonical document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const HeadingLevel = LiteralKit([1, 2, 3]).annotate(
  $I.annote("HeadingLevel", {
    description: "Heading depth supported by the initial editor bootstrap.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type HeadingLevel = typeof HeadingLevel.Type;

/**
 * Normalized outbound page link reference extracted from a page document.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PageLinkRef extends S.Class<PageLinkRef>($I`PageLinkRef`)(
  {
    targetSlug: Slug,
  },
  $I.annote("PageLinkRef", {
    description: "Canonical outbound page-link reference derived from page content.",
  })
) {}

/**
 * Paragraph block in the canonical document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ParagraphBlock extends S.Class<ParagraphBlock>($I`ParagraphBlock`)(
  {
    kind: S.tag("paragraph"),
    id: BlockId,
    text: S.String,
  },
  $I.annote("ParagraphBlock", {
    description: "Paragraph block in the canonical editor document model.",
  })
) {}

/**
 * Heading block in the canonical document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class HeadingBlock extends S.Class<HeadingBlock>($I`HeadingBlock`)(
  {
    kind: S.tag("heading"),
    id: BlockId,
    level: HeadingLevel,
    text: S.String,
  },
  $I.annote("HeadingBlock", {
    description: "Heading block in the canonical editor document model.",
  })
) {}

/**
 * Quote block in the canonical document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class QuoteBlock extends S.Class<QuoteBlock>($I`QuoteBlock`)(
  {
    kind: S.tag("quote"),
    id: BlockId,
    text: S.String,
  },
  $I.annote("QuoteBlock", {
    description: "Quote block in the canonical editor document model.",
  })
) {}

/**
 * Canonical editor document block union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const DocumentBlockSchema = S.Union([ParagraphBlock, HeadingBlock, QuoteBlock]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("DocumentBlock", {
    description: "Supported block variants in the canonical editor document model.",
  })
);
type DocumentBlockValue = typeof DocumentBlockSchema.Type;
type DocumentBlockCases<A> = {
  readonly paragraph: (block: ParagraphBlock) => A;
  readonly heading: (block: HeadingBlock) => A;
  readonly quote: (block: QuoteBlock) => A;
};
const matchDocumentBlock: {
  <A>(cases: DocumentBlockCases<A>): (block: DocumentBlockValue) => A;
  <A>(block: DocumentBlockValue, cases: DocumentBlockCases<A>): A;
} = dual(2, <A>(block: DocumentBlockValue, cases: DocumentBlockCases<A>) =>
  Match.value(block).pipe(Match.discriminatorsExhaustive("kind")(cases))
);
/**
 * Canonical editor document block union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DocumentBlock = DocumentBlockSchema.pipe(
  SchemaUtils.withStatics(() => ({
    match: matchDocumentBlock,
  }))
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type DocumentBlock = typeof DocumentBlock.Type;

/**
 * Canonical persisted page document.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PageDocument extends S.Class<PageDocument>($I`PageDocument`)(
  {
    id: PageId,
    slug: Slug,
    title: NonEmptyTrimmedStr,
    blocks: S.Array(DocumentBlock),
    outboundLinks: PageLinkRef.pipe(S.Array, S.optionalKey, SchemaUtils.withKeyDefaults(A.empty<PageLinkRef>())),
    createdAt: S.DateTimeUtcFromMillis,
    updatedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("PageDocument", {
    description: "Canonical persisted editor page document stored by the local workspace.",
  })
) {}

const PageDocumentJson = S.fromJsonString(PageDocument);
const encodePageDocumentJson = S.encodeUnknownSync(PageDocumentJson);

/**
 * Summary projection for a page in lists/search/backlinks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PageSummary extends S.Class<PageSummary>($I`PageSummary`)(
  {
    id: PageId,
    slug: Slug,
    title: NonEmptyTrimmedStr,
    excerpt: S.String,
    updatedAt: S.DateTimeUtcFromMillis,
    outboundLinkCount: NonNegativeInt,
    backlinkCount: NonNegativeInt,
  },
  $I.annote("PageSummary", {
    description: "Lightweight page projection used for listings, search, and backlink surfaces.",
  })
) {}

/**
 * App-owned workspace manifest.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WorkspaceManifest extends S.Class<WorkspaceManifest>($I`WorkspaceManifest`)(
  {
    id: WorkspaceId,
    name: NonEmptyTrimmedStr,
    rootPageSlug: S.OptionFromOptionalKey(Slug),
    createdAt: S.DateTimeUtcFromMillis,
    updatedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("WorkspaceManifest", {
    description: "App-owned workspace manifest for the local editor workspace.",
  })
) {}

/**
 * Immutable page revision record.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RevisionRecord extends S.Class<RevisionRecord>($I`RevisionRecord`)(
  {
    id: RevisionId.pipe(
      S.optionalKey,
      S.withConstructorDefault(Effect.sync(createRevisionId)),
      S.withDecodingDefaultKey(Effect.sync(createRevisionId))
    ),
    pageId: PageId,
    pageSlug: Slug,
    savedAt: S.DateTimeUtcFromMillis,
    reason: S.String,
    page: PageDocument,
  },
  $I.annote("RevisionRecord", {
    description: "Immutable local revision record captured whenever a page is saved.",
  })
) {}

/**
 * Export payload materialized by the editor runtime.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PageExport extends S.Class<PageExport>($I`PageExport`)(
  {
    pageId: PageId,
    slug: Slug,
    format: ExportFormat,
    fileName: S.String,
    content: S.String,
  },
  $I.annote("PageExport", {
    description: "Export payload materialized from the canonical page document.",
  })
) {}

const untitledSlug = Slug.make("untitled");

class TextBlock extends S.Class<TextBlock>($I`TextBlock`)({
  text: S.String,
}) {}

const getText = <
  T extends {
    readonly text: string;
  },
>(
  i: T
) => Struct.get(i, "text");
const blockText = DocumentBlock.match({
  paragraph: getText,
  heading: getText,
  quote: getText,
});
const markdownBlockText = DocumentBlock.match({
  paragraph: getText,
  heading: ({ level, text }) => `${Str.repeat(level)("#")} ${text}`,
  quote: ({ text }) => `> ${text}`,
});
const markdownFileExtension = (): "md" => "md";
const exportFormatExtension = ExportFormat.$match({
  json: identity,
  markdown: markdownFileExtension,
});
const exportFormatContent = (page: PageDocument, format: ExportFormat): string =>
  ExportFormat.$match(format, {
    json: () => encodePageDocumentJson(page),
    markdown: () => pageToMarkdown(page),
  });
const withDerivedOutboundLinks = (page: PageDocument): PageDocument =>
  new PageDocument({
    ...page,
    outboundLinks: A.fromIterable(extractPageLinks(page)),
  });
const extractLinksFromTextBlock = ({ text }: TextBlock): ReadonlyArray<PageLinkRef> => extractBlockLinks(text);
const extractLinksFromBlock = DocumentBlock.match({
  paragraph: extractLinksFromTextBlock,
  heading: extractLinksFromTextBlock,
  quote: extractLinksFromTextBlock,
});

const extractBlockLinks = (text: string): ReadonlyArray<PageLinkRef> => {
  const pageLinkPattern = /\[\[([a-z0-9-]+)]]/g;
  let links = A.empty<PageLinkRef>();
  let match = pageLinkPattern.exec(text);

  while (P.isNotNull(match)) {
    const slugOption = Slug.makeOption(match[1]);
    if (O.isSome(slugOption)) {
      links = A.append(
        links,
        new PageLinkRef({
          targetSlug: slugOption.value,
        })
      );
    }

    match = pageLinkPattern.exec(text);
  }

  return links;
};

/**
 * Normalize free-form text into a canonical page slug.
 *
 * @param input - The free-form page label to normalize.
 * @returns The normalized canonical page slug.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const normalizePageSlug = (input: string): Slug =>
  pipe(
    input,
    Str.trim,
    Str.toLowerCase,
    Str.replace(/[^a-z0-9]+/g, "-"),
    Str.replace(/^-+/g, ""),
    Str.replace(/-+$/g, ""),
    Str.replace(/-{2,}/g, "-"),
    flow(
      Slug.makeOption,
      O.getOrElse(() => untitledSlug)
    )
  );

/**
 * Construct a stable paragraph block.
 *
 * @param text - The paragraph text content.
 * @returns A canonical paragraph block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeParagraphBlock = (text: string): ParagraphBlock =>
  new ParagraphBlock({
    id: BlockId.make(crypto.randomUUID()),
    text,
  });

/**
 * Construct a stable heading block.
 *
 * @param text - The heading text content.
 * @param level - The heading depth for the block.
 * @returns A canonical heading block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeHeadingBlock: {
  (text: string, level: HeadingLevel): HeadingBlock;
  (level: HeadingLevel): (text: string) => HeadingBlock;
} = dual(
  2,
  (text: string, level: HeadingLevel): HeadingBlock =>
    new HeadingBlock({
      id: BlockId.make(crypto.randomUUID()),
      level,
      text,
    })
);

/**
 * Construct a stable quote block.
 *
 * @param text - The quote text content.
 * @returns A canonical quote block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeQuoteBlock = (text: string): QuoteBlock =>
  new QuoteBlock({
    id: BlockId.make(crypto.randomUUID()),
    text,
  });

/**
 * Extract outbound page references from a canonical page document.
 *
 * @param page - The page document to inspect.
 * @returns The outbound page references extracted from the page blocks.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const extractPageLinks = (page: PageDocument): ReadonlyArray<PageLinkRef> =>
  pipe(page.blocks, A.flatMap(extractLinksFromBlock));

/**
 * Render a canonical page to plain text for search and previews.
 *
 * @param page - The page document to render.
 * @returns The plain-text projection of the page.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToPlainText = (page: PageDocument): string => pipe(page.blocks, A.map(blockText), A.join("\n"));

/**
 * Render a canonical page to Markdown.
 *
 * @param page - The page document to render.
 * @returns The Markdown projection of the page.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToMarkdown = (page: PageDocument): string =>
  pipe(page.blocks, A.map(markdownBlockText), A.join("\n\n"));

/**
 * Resolve the persisted file extension for an export format.
 *
 * @param format - The canonical export format.
 * @returns The file extension for the exported artifact.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const exportPageExtension = (format: ExportFormat): "json" | "md" => exportFormatExtension(format);

/**
 * Resolve the MIME type for an export format.
 *
 * @param format - The canonical export format.
 * @returns The MIME type for the exported artifact.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const exportPageMimeType = (format: ExportFormat): "application/json" | "text/markdown" =>
  ExportFormat.$match(format, {
    json: MimeType.thunk["application/json"],
    markdown: MimeType.thunk["text/markdown"],
  });

/**
 * Materialize an export payload from a canonical page document.
 *
 * @param page - The page document to export.
 * @param format - The desired export format.
 * @returns The export payload materialized from the page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToExport: {
  (page: PageDocument, format: ExportFormat): PageExport;
  (format: ExportFormat): (page: PageDocument) => PageExport;
} = dual(
  2,
  (page: PageDocument, format: ExportFormat): PageExport =>
    new PageExport({
      pageId: page.id,
      slug: page.slug,
      format,
      fileName: `${page.slug}.${exportFormatExtension(format)}`,
      content: exportFormatContent(page, format),
    })
);

/**
 * Create a new canonical page document with normalized slug and derived outbound links.
 *
 * @param input - Page construction inputs containing title, optional slug, blocks, and timestamp.
 * @returns The newly created canonical page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const createPageDocument = (input: {
  readonly title: NonEmptyTrimmedStr;
  readonly slug?: Slug | undefined;
  readonly blocks: ReadonlyArray<DocumentBlock>;
  readonly now: DateTime.Utc;
}): PageDocument =>
  withDerivedOutboundLinks(
    new PageDocument({
      id: PageId.make(crypto.randomUUID()),
      slug: input.slug ?? normalizePageSlug(input.title),
      title: input.title,
      blocks: A.fromIterable(input.blocks),
      createdAt: input.now,
      updatedAt: input.now,
    })
  );

/**
 * Produce a lightweight page summary.
 *
 * @param page - The page document to summarize.
 * @param backlinkCount - The number of backlinks pointing to the page.
 * @returns The summary projection for list and search surfaces.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makePageSummary: {
  (page: PageDocument, backlinkCount: number): PageSummary;
  (backlinkCount: number): (page: PageDocument) => PageSummary;
} = dual(
  2,
  (page: PageDocument, backlinkCount: number): PageSummary =>
    new PageSummary({
      id: page.id,
      slug: page.slug,
      title: page.title,
      excerpt: pipe(pageToPlainText(page), Str.slice(0, 160)),
      updatedAt: page.updatedAt,
      outboundLinkCount: NonNegativeInt.make(page.outboundLinks?.length ?? 0),
      backlinkCount: NonNegativeInt.make(backlinkCount),
    })
);

/**
 * Update a page document while preserving creation time and refreshing derived fields.
 *
 * @param page - The existing page document.
 * @param input - Replacement title, slug, blocks, and update timestamp.
 * @returns The refreshed canonical page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const refreshPageDocument: {
  (
    page: PageDocument,
    input: {
      readonly title: NonEmptyTrimmedStr;
      readonly slug: Slug;
      readonly blocks: ReadonlyArray<DocumentBlock>;
      readonly now: DateTime.Utc;
    }
  ): PageDocument;
  (input: {
    readonly title: NonEmptyTrimmedStr;
    readonly slug: Slug;
    readonly blocks: ReadonlyArray<DocumentBlock>;
    readonly now: DateTime.Utc;
  }): (page: PageDocument) => PageDocument;
} = dual(
  2,
  (
    page: PageDocument,
    input: {
      readonly title: NonEmptyTrimmedStr;
      readonly slug: Slug;
      readonly blocks: ReadonlyArray<DocumentBlock>;
      readonly now: DateTime.Utc;
    }
  ): PageDocument =>
    withDerivedOutboundLinks(
      new PageDocument({
        id: page.id,
        slug: input.slug,
        title: input.title,
        blocks: A.fromIterable(input.blocks),
        outboundLinks: A.empty<PageLinkRef>(),
        createdAt: page.createdAt,
        updatedAt: input.now,
      })
    )
);

/**
 * Options for creating an immutable revision record from a page save.
 *
 * @example
 * ```ts
 * import type { MakeRevisionRecordOptions } from "@beep/editor-domain/Canonical"
 *
 * const options: MakeRevisionRecordOptions = { reason: "manual save" }
 * void options
 * ```
 *
 * @since 0.0.0
 * @category Helpers
 */
export type MakeRevisionRecordOptions = {
  readonly reason: string;
};

const makeRevisionRecordInternal = (
  page: PageDocument,
  savedAt: DateTime.Utc,
  options: MakeRevisionRecordOptions | string
): RevisionRecord => {
  const reason = P.isString(options) ? options : options.reason;
  return new RevisionRecord({
    id: createRevisionId(),
    pageId: page.id,
    pageSlug: page.slug,
    savedAt,
    reason,
    page,
  });
};

/**
 * Create an immutable revision record from a page save.
 *
 * @param page - The saved page document snapshot.
 * @param savedAt - The timestamp when the save completed.
 * @param options - Revision metadata captured with the save.
 * @returns The immutable revision record.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeRevisionRecord: {
  (page: PageDocument, savedAt: DateTime.Utc, options: MakeRevisionRecordOptions): RevisionRecord;
  (savedAt: DateTime.Utc, options: MakeRevisionRecordOptions): (page: PageDocument) => RevisionRecord;
} = dual(3, makeRevisionRecordInternal);

/**
 * Create a new workspace manifest.
 *
 * @param input - Workspace construction inputs containing name, optional root slug, and timestamp.
 * @returns The newly created workspace manifest.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const createWorkspaceManifest = (input: {
  readonly name: NonEmptyTrimmedStr;
  readonly rootPageSlug?: Slug | undefined;
  readonly now: DateTime.Utc;
}): WorkspaceManifest =>
  new WorkspaceManifest({
    id: WorkspaceId.make(crypto.randomUUID()),
    name: input.name,
    rootPageSlug: O.fromUndefinedOr(input.rootPageSlug),
    createdAt: input.now,
    updatedAt: input.now,
  });
