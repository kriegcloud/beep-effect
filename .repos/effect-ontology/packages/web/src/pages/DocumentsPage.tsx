/**
 * DocumentsPage - Editorial Minimalism Layout
 *
 * Data-dense document list with:
 * - Compact table-like rows
 * - Inline claim counts and metadata
 * - High data-ink ratio
 * - Keyboard navigation ready
 *
 * @since 2.0.0
 * @module pages/DocumentsPage
 */

import { useAtomValue, useAtom } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { Link, useParams } from "react-router-dom"
import { documentsAtom, documentsFiltersAtom } from "@/atoms/api"
import { documentLink } from "@/lib/routing"
import type { DocumentsFilter } from "@/services/ApiClient"
import { Schema } from "@effect-ontology/core-v2/Domain"
import { FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

type ArticleSearchResult = typeof Schema.ArticleSearchResult.Type

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  })
}

function DocumentRow({ result, ontologyId }: { result: ArticleSearchResult; ontologyId: string }) {
  const { article, claimCount, conflictCount } = result
  const publishedAt = typeof article.publishedAt === "string"
    ? article.publishedAt
    : article.publishedAt.toString()

  return (
    <Link
      to={documentLink(ontologyId, article.id)}
      className="data-row group flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle"
    >
      {/* Icon */}
      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        {/* Headline */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {article.headline || "Untitled"}
          </span>
        </div>

        {/* Source badge */}
        {article.sourceName && (
          <span className="namespace-badge flex-shrink-0">
            {article.sourceName}
          </span>
        )}

        {/* Claims count */}
        <div className="flex items-center gap-3 text-2xs text-muted-foreground flex-shrink-0 w-24 justify-end">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {claimCount}
          </span>
          {conflictCount > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <AlertCircle className="w-3 h-3" />
              {conflictCount}
            </span>
          )}
        </div>

        {/* Date */}
        <span className="text-2xs text-muted-foreground flex-shrink-0 w-16 text-right tabular-nums">
          {formatDate(publishedAt)}
        </span>
      </div>
    </Link>
  )
}

function FilterBar({
  filters,
  onChange,
  total
}: {
  filters: DocumentsFilter
  onChange: (updater: (prev: DocumentsFilter) => DocumentsFilter) => void
  total?: number
}) {
  const currentSource = filters.sources?.[0] ?? ""

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-subtle">
      <div className="flex items-center gap-3">
        <select
          value={currentSource}
          onChange={(e) => onChange((prev) => ({
            ...prev,
            sources: e.target.value ? [e.target.value] : undefined,
            offset: 0
          }))}
          className="text-sm bg-transparent border border-border rounded px-2 py-1 text-foreground
                     focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="">All sources</option>
          <option value="seattletimes.com">Seattle Times</option>
          <option value="kuow.org">KUOW</option>
          <option value="seattle.gov">Seattle.gov</option>
        </select>
      </div>

      {total !== undefined && (
        <span className="text-2xs text-muted-foreground">
          {total.toLocaleString()} {total === 1 ? "document" : "documents"}
        </span>
      )}
    </div>
  )
}

function Pagination({
  total,
  offset,
  limit,
  hasMore,
  onPageChange
}: {
  total: number
  offset: number
  limit: number
  hasMore: boolean
  onPageChange: (newOffset: number) => void
}) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background-subtle">
      <span className="text-2xs text-muted-foreground tabular-nums">
        {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed
                     text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-2xs text-muted-foreground px-2 tabular-nums">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={!hasMore}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed
                     text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border-subtle">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-4 h-4 rounded bg-muted animate-pulse" />
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
            <div className="w-20 h-4 rounded bg-muted animate-pulse" />
            <div className="w-12 h-4 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DocumentsPage() {
  const { ontologyId = "seattle" } = useParams<{ ontologyId: string }>()
  const result = useAtomValue(documentsAtom(ontologyId))
  const [filters, setFilters] = useAtom(documentsFiltersAtom(ontologyId))
  const limit = filters.limit ?? 20

  const total = Result.match(result, {
    onInitial: () => undefined,
    onFailure: () => undefined,
    onSuccess: (s) => s.value.total
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Page header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-xl text-foreground">Documents</h1>
          <span className="text-2xs text-muted-foreground font-mono uppercase tracking-wide">
            Source Evidence
          </span>
        </div>
      </header>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        total={total}
      />

      {/* Document list */}
      <div className="flex-1 overflow-auto scroll-subtle">
        {Result.match(result, {
          onInitial: () => <LoadingSkeleton />,
          onFailure: (failure) => (
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    Failed to load documents
                  </p>
                  <p className="text-2xs text-muted-foreground mt-1">
                    {String(failure.cause)}
                  </p>
                </div>
              </div>
            </div>
          ),
          onSuccess: (success) => {
            const data = success.value

            if (data.articles.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    No documents found
                  </h3>
                  <p className="text-2xs text-muted-foreground">
                    {filters.sources?.length
                      ? "Try removing filters to see more results"
                      : "Ingest some links to get started"}
                  </p>
                </div>
              )
            }

            return (
              <div className="divide-y divide-border-subtle">
                {data.articles.map((article) => (
                  <DocumentRow
                    key={article.article.id}
                    result={article}
                    ontologyId={ontologyId}
                  />
                ))}
              </div>
            )
          }
        })}
      </div>

      {/* Pagination */}
      {Result.isSuccess(result) && (
        <Pagination
          total={result.value.total}
          offset={result.value.offset}
          limit={limit}
          hasMore={result.value.hasMore}
          onPageChange={(newOffset) => setFilters((prev) => ({ ...prev, offset: newOffset }))}
        />
      )}
    </div>
  )
}
