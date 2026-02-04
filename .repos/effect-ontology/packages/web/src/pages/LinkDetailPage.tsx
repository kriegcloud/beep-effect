/**
 * LinkDetailPage
 *
 * Displays detailed information about a single ingested link.
 *
 * @since 2.0.0
 * @module pages/LinkDetailPage
 */

import { useAtomValue } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { useParams } from "react-router-dom"
import { ExternalLink } from "lucide-react"
import { linkDetailAtom } from "@/atoms/api"
import { linksLink } from "@/lib/routing"
import {
  PageContainer,
  PageHeader,
  PageSection,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { Badge } from "@/components/ui/badge"

function formatDate(date: unknown): string {
  if (!date) return "—"
  try {
    return new Date(date as string).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return "—"
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <h3 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  )
}

export function LinkDetailPage() {
  const { ontologyId = "seattle", id } = useParams<{ ontologyId: string; id: string }>()
  const result = useAtomValue(linkDetailAtom(`${ontologyId}:${id}`))

  return (
    <PageContainer size="lg">
      <PageHeader
        title="Link Details"
        backTo={{ label: "Links", href: linksLink(ontologyId) }}
      />

      {Result.match(result, {
        onInitial: () => <LoadingState rows={4} />,
        onFailure: (failure) => (
          <ErrorState
            title="Failed to load link"
            message={String(failure.cause)}
          />
        ),
        onSuccess: (success) => {
          const link = success.value
          return (
            <div className="space-y-6">
              {/* Header info */}
              <div>
                <h2 className="font-serif text-xl text-foreground mb-2">
                  {link.headline || "Untitled"}
                </h2>
                {link.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {link.description}
                  </p>
                )}
                {link.sourceUri && (
                  <a
                    href={link.sourceUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {link.sourceUri}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Details and Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard title="Details">
                  <DetailRow label="Status" value={<Badge>{link.status}</Badge>} />
                  <DetailRow label="Type" value={link.sourceType} />
                  {link.author && <DetailRow label="Author" value={link.author} />}
                  {link.organization && <DetailRow label="Organization" value={link.organization} />}
                  {link.language && <DetailRow label="Language" value={link.language} />}
                  {link.wordCount && (
                    <DetailRow label="Word Count" value={link.wordCount.toLocaleString()} />
                  )}
                </DetailCard>

                <DetailCard title="Timestamps">
                  <DetailRow label="Published" value={formatDate(link.publishedAt)} />
                  <DetailRow label="Fetched" value={formatDate(link.fetchedAt)} />
                  <DetailRow label="Enriched" value={formatDate(link.enrichedAt)} />
                  <DetailRow label="Processed" value={formatDate(link.processedAt)} />
                </DetailCard>
              </div>

              {/* Topics & Entities */}
              {(link.topics.length > 0 || link.keyEntities.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {link.topics.length > 0 && (
                    <DetailCard title="Topics">
                      <div className="flex flex-wrap gap-2 py-1">
                        {link.topics.map((topic: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </DetailCard>
                  )}

                  {link.keyEntities.length > 0 && (
                    <DetailCard title="Key Entities">
                      <div className="flex flex-wrap gap-2 py-1">
                        {link.keyEntities.map((entity: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </DetailCard>
                  )}
                </div>
              )}

              {/* Storage Info */}
              <DetailCard title="Storage">
                <DetailRow label="ID" value={<code className="text-xs">{link.id}</code>} />
                <DetailRow
                  label="Content Hash"
                  value={<code className="text-xs truncate max-w-xs">{link.contentHash}</code>}
                />
                {link.storageUri && (
                  <DetailRow
                    label="Storage URI"
                    value={<code className="text-xs truncate max-w-xs">{link.storageUri}</code>}
                  />
                )}
              </DetailCard>

              {/* Error */}
              {link.errorMessage && (
                <ErrorState title="Processing Error" message={link.errorMessage} />
              )}
            </div>
          )
        }
      })}
    </PageContainer>
  )
}
