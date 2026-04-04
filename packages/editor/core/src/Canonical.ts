import { $EditorId } from "@beep/identity/packages";
import { LiteralKit, NonEmptyTrimmedStr, NonNegativeInt, Slug, UUID } from "@beep/schema";
import { type DateTime, flow, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $EditorId.create("Canonical");

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

const decodeBlockId = S.decodeUnknownSync(BlockId);
const decodePageId = S.decodeUnknownSync(PageId);
const decodeRevisionId = S.decodeUnknownSync(RevisionId);
const decodeSlug = S.decodeUnknownOption(Slug);
const decodeWorkspaceId = S.decodeUnknownSync(WorkspaceId);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

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
export const DocumentBlock = S.Union([ParagraphBlock, HeadingBlock, QuoteBlock])
  .pipe(S.toTaggedUnion("kind"))
  .annotate(
    $I.annote("DocumentBlock", {
      description: "Supported block variants in the canonical editor document model.",
    })
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
    outboundLinks: S.Array(PageLinkRef),
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
    id: RevisionId,
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

const pageLinkPattern = /\[\[([a-z0-9-]+)]]/g;
const untitledSlug = S.decodeUnknownSync(Slug)("untitled");

const blockText = (block: DocumentBlock): string =>
  DocumentBlock.match(block, {
    paragraph: ({ text }) => text,
    heading: ({ text }) => text,
    quote: ({ text }) => text,
  });
const markdownBlockText = (block: DocumentBlock): string =>
  DocumentBlock.match(block, {
    paragraph: ({ text }) => text,
    heading: ({ level, text }) => `${"#".repeat(level)} ${text}`,
    quote: ({ text }) => `> ${text}`,
  });

const extractBlockLinks = (text: string): ReadonlyArray<PageLinkRef> => {
  let links = A.empty<PageLinkRef>();
  let match = pageLinkPattern.exec(text);

  while (P.isNotNull(match)) {
    const slugOption = decodeSlug(match[1]);
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

  pageLinkPattern.lastIndex = 0;
  return links;
};

/**
 * Normalize free-form text into a canonical page slug.
 *
 * @param input {string} - The free-form page label to normalize.
 * @returns {Slug} - The normalized canonical page slug.
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
      decodeSlug,
      O.getOrElse(() => untitledSlug)
    )
  );

/**
 * Construct a stable paragraph block.
 *
 * @param text {string} - The paragraph text content.
 * @returns {ParagraphBlock} - A canonical paragraph block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeParagraphBlock = (text: string): ParagraphBlock =>
  new ParagraphBlock({
    id: decodeBlockId(crypto.randomUUID()),
    text,
  });

/**
 * Construct a stable heading block.
 *
 * @param text {string} - The heading text content.
 * @param level {HeadingLevel} - The heading depth for the block.
 * @returns {HeadingBlock} - A canonical heading block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeHeadingBlock = (text: string, level: HeadingLevel = 1): HeadingBlock =>
  new HeadingBlock({
    id: decodeBlockId(crypto.randomUUID()),
    level,
    text,
  });

/**
 * Construct a stable quote block.
 *
 * @param text {string} - The quote text content.
 * @returns {QuoteBlock} - A canonical quote block with a stable identifier.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeQuoteBlock = (text: string): QuoteBlock =>
  new QuoteBlock({
    id: decodeBlockId(crypto.randomUUID()),
    text,
  });

/**
 * Extract outbound page references from a canonical page document.
 *
 * @param page {PageDocument} - The page document to inspect.
 * @returns {ReadonlyArray<PageLinkRef>} - The outbound page references extracted from the page blocks.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const extractPageLinks = (page: PageDocument): ReadonlyArray<PageLinkRef> =>
  pipe(page.blocks, A.flatMap(flow(blockText, extractBlockLinks)));

/**
 * Render a canonical page to plain text for search and previews.
 *
 * @param page {PageDocument} - The page document to render.
 * @returns {string} - The plain-text projection of the page.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToPlainText = (page: PageDocument): string => pipe(page.blocks, A.map(blockText), A.join("\n"));

/**
 * Render a canonical page to Markdown.
 *
 * @param page {PageDocument} - The page document to render.
 * @returns {string} - The Markdown projection of the page.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToMarkdown = (page: PageDocument): string =>
  pipe(page.blocks, A.map(markdownBlockText), A.join("\n\n"));

/**
 * Materialize an export payload from a canonical page document.
 *
 * @param page {PageDocument} - The page document to export.
 * @param format {ExportFormat} - The desired export format.
 * @returns {PageExport} - The export payload materialized from the page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const pageToExport = (page: PageDocument, format: ExportFormat): PageExport =>
  new PageExport({
    pageId: page.id,
    slug: page.slug,
    format,
    fileName: `${page.slug}.${format === "json" ? "json" : "md"}`,
    content: format === "json" ? encodePageDocumentJson(page) : pageToMarkdown(page),
  });

/**
 * Create a new canonical page document with normalized slug and derived outbound links.
 *
 * @param input {object} - Page construction inputs containing title, optional slug, blocks, and timestamp.
 * @returns {PageDocument} - The newly created canonical page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const createPageDocument = (input: {
  readonly title: NonEmptyTrimmedStr;
  readonly slug?: Slug | undefined;
  readonly blocks: ReadonlyArray<DocumentBlock>;
  readonly now: DateTime.Utc;
}): PageDocument => {
  const page = new PageDocument({
    id: decodePageId(crypto.randomUUID()),
    slug: input.slug ?? normalizePageSlug(input.title),
    title: input.title,
    blocks: A.fromIterable(input.blocks),
    outboundLinks: A.empty<PageLinkRef>(),
    createdAt: input.now,
    updatedAt: input.now,
  });

  return new PageDocument({
    ...page,
    outboundLinks: A.fromIterable(extractPageLinks(page)),
  });
};

/**
 * Produce a lightweight page summary.
 *
 * @param page {PageDocument} - The page document to summarize.
 * @param backlinkCount {number} - The number of backlinks pointing to the page.
 * @returns {PageSummary} - The summary projection for list and search surfaces.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makePageSummary = (page: PageDocument, backlinkCount: number): PageSummary =>
  new PageSummary({
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: pipe(pageToPlainText(page), Str.slice(0, 160)),
    updatedAt: page.updatedAt,
    outboundLinkCount: decodeNonNegativeInt(page.outboundLinks.length),
    backlinkCount: decodeNonNegativeInt(backlinkCount),
  });

/**
 * Update a page document while preserving creation time and refreshing derived fields.
 *
 * @param page {PageDocument} - The existing page document.
 * @param input {object} - Replacement title, slug, blocks, and update timestamp.
 * @returns {PageDocument} - The refreshed canonical page document.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const refreshPageDocument = (
  page: PageDocument,
  input: {
    readonly title: NonEmptyTrimmedStr;
    readonly slug: Slug;
    readonly blocks: ReadonlyArray<DocumentBlock>;
    readonly now: DateTime.Utc;
  }
): PageDocument => {
  const nextPage = new PageDocument({
    id: page.id,
    slug: input.slug,
    title: input.title,
    blocks: A.fromIterable(input.blocks),
    outboundLinks: A.empty<PageLinkRef>(),
    createdAt: page.createdAt,
    updatedAt: input.now,
  });

  return new PageDocument({
    ...nextPage,
    outboundLinks: A.fromIterable(extractPageLinks(nextPage)),
  });
};

/**
 * Create an immutable revision record from a page save.
 *
 * @param page {PageDocument} - The saved page document snapshot.
 * @param savedAt {DateTime.Utc} - The timestamp when the save completed.
 * @param reason {string} - The save reason captured with the revision.
 * @returns {RevisionRecord} - The immutable revision record.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const makeRevisionRecord = (page: PageDocument, savedAt: DateTime.Utc, reason: string): RevisionRecord =>
  new RevisionRecord({
    id: decodeRevisionId(crypto.randomUUID()),
    pageId: page.id,
    pageSlug: page.slug,
    savedAt,
    reason,
    page,
  });

/**
 * Create a new workspace manifest.
 *
 * @param input {object} - Workspace construction inputs containing name, optional root slug, and timestamp.
 * @returns {WorkspaceManifest} - The newly created workspace manifest.
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
    id: decodeWorkspaceId(crypto.randomUUID()),
    name: input.name,
    rootPageSlug: O.fromUndefinedOr(input.rootPageSlug),
    createdAt: input.now,
    updatedAt: input.now,
  });
