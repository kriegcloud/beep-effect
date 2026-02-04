/**
 * LinksPage
 *
 * Lists ingested links with filtering and pagination.
 *
 * @since 2.0.0
 * @module pages/LinksPage
 */

import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { Link, useParams } from "react-router-dom"
import { Plus, RefreshCw, FileText } from "lucide-react"
import { linksAtom, linksFiltersAtom } from "@/atoms/api"
import { ingestLink, linkLink } from "@/lib/routing"
import {
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function getStatusVariant(status: string) {
  switch (status) {
    case "enriched":
      return "default" as const
    case "processed":
      return "secondary" as const
    case "failed":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function LinkRow({
  link,
  ontologyId
}: {
  link: {
    id: string
    headline?: string | null
    sourceUri?: string | null
    organization?: string | null
    status: string
    sourceType: string | null
    wordCount?: number | null
  }
  ontologyId: string
}) {
  return (
    <Link
      to={linkLink(ontologyId, link.id)}
      className="data-row flex items-center gap-4 px-4 py-3 border-b border-border-subtle"
    >
      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">
          {link.headline || link.sourceUri || link.id}
        </div>
        {link.organization && (
          <div className="text-2xs text-muted-foreground">{link.organization}</div>
        )}
      </div>

      <Badge variant={getStatusVariant(link.status)} className="flex-shrink-0">
        {link.status}
      </Badge>

      <span className="text-2xs text-muted-foreground w-16 text-right flex-shrink-0">
        {link.sourceType ?? "—"}
      </span>

      <span className="text-2xs text-muted-foreground tabular-nums w-16 text-right flex-shrink-0">
        {link.wordCount?.toLocaleString() ?? "—"}
      </span>
    </Link>
  )
}

export function LinksPage() {
  const { ontologyId = "seattle" } = useParams<{ ontologyId: string }>()
  const result = useAtomValue(linksAtom(ontologyId))
  const setFilters = useAtomSet(linksFiltersAtom(ontologyId))

  const handleRefresh = () => {
    setFilters((prev) => ({ ...prev }))
  }

  const isLoading = result.waiting
  const linkCount = Result.isSuccess(result) ? result.value.links.length : 0

  return (
    <PageContainer size="lg">
      <PageHeader
        title="Ingested Links"
        subtitle="Documents fetched via Jina Reader"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link to={ingestLink(ontologyId)}>
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Ingest URL
              </Button>
            </Link>
          </>
        }
      />

      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
        <div className="w-4" />
        <div className="flex-1">Document</div>
        <div className="w-20">Status</div>
        <div className="w-16 text-right">Type</div>
        <div className="w-16 text-right">Words</div>
      </div>

      {/* Content */}
      <div className="border border-border rounded-lg overflow-hidden">
        {Result.match(result, {
          onInitial: () => (
            <div className="p-4">
              <LoadingState rows={5} />
            </div>
          ),
          onFailure: (failure) => (
            <div className="p-4">
              <ErrorState
                title="Failed to load links"
                message={String(failure.cause)}
              />
            </div>
          ),
          onSuccess: (success) =>
            success.value.links.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title="No links ingested yet"
                description="Start by ingesting your first URL"
                action={
                  <Link to={ingestLink(ontologyId)}>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                      Ingest URL
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div>
                {success.value.links.map((link) => (
                  <LinkRow key={link.id} link={link} ontologyId={ontologyId} />
                ))}
              </div>
            )
        })}
      </div>

      {/* Footer */}
      {linkCount > 0 && (
        <div className="mt-4 text-2xs text-muted-foreground text-center">
          {linkCount} {linkCount === 1 ? "link" : "links"}
        </div>
      )}
    </PageContainer>
  )
}
