/**
 * TimelinePage
 *
 * Displays extracted claims in chronological order.
 * Uses live stream-based updates for real-time claim display.
 *
 * @since 2.0.0
 * @module pages/TimelinePage
 */

import { useState, useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { useAtomValue } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { entityLink } from "@/lib/routing"
import { toLabel } from "@/lib/namespace"
import {
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { Clock } from "lucide-react"
import { liveTimelineAtom } from "@/atoms/api"

interface ClaimWithRank {
  id: string
  subjectIri: string
  predicateIri: string
  objectValue: string
  objectType?: "iri" | "literal" | "typed_literal"
  rank: "preferred" | "normal" | "deprecated"
  source: {
    id: string
    uri: string
    headline: string | null
    sourceName: string | null
    publishedAt: string
    ingestedAt: string
  }
  validFrom: string | null
  validTo: string | null
  assertedAt: string
  confidence: number | null
  evidenceText: string | null
}

interface TimelineClaimsResponse {
  claims: ReadonlyArray<ClaimWithRank>
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

function groupByDate(claims: ClaimWithRank[]): Map<string, ClaimWithRank[]> {
  const groups = new Map<string, ClaimWithRank[]>()
  for (const claim of claims) {
    const date = claim.assertedAt?.split("T")[0] || "unknown"
    const existing = groups.get(date) || []
    existing.push(claim)
    groups.set(date, existing)
  }
  return groups
}

function ClaimCard({ claim, ontologyId }: { claim: ClaimWithRank; ontologyId: string }) {
  const [expanded, setExpanded] = useState(false)

  const rankStyles = {
    preferred: "border-l-success",
    normal: "border-l-border",
    deprecated: "border-l-destructive opacity-60"
  }

  const rankLabel = {
    preferred: "current",
    normal: "",
    deprecated: "superseded"
  }

  return (
    <div
      className={`
        border border-border-subtle border-l-4 ${rankStyles[claim.rank]}
        bg-background p-4 hover:bg-muted/30 transition-colors rounded-r
      `}
    >
      <div className={`flex items-baseline gap-2 flex-wrap ${claim.rank === "deprecated" ? "line-through" : ""}`}>
        <Link
          to={entityLink(ontologyId, claim.subjectIri)}
          className="text-primary hover:underline font-medium"
        >
          {toLabel(claim.subjectIri)}
        </Link>
        <span className="text-muted-foreground text-sm">
          {toLabel(claim.predicateIri)}
        </span>
        {claim.objectType === "iri" ? (
          <Link
            to={entityLink(ontologyId, claim.objectValue)}
            className="text-primary hover:underline"
          >
            {toLabel(claim.objectValue)}
          </Link>
        ) : (
          <span className="text-foreground font-mono text-sm">{claim.objectValue}</span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2 text-2xs text-muted-foreground">
        {rankLabel[claim.rank] && (
          <span className={claim.rank === "preferred" ? "text-success" : "text-destructive"}>
            {rankLabel[claim.rank]}
          </span>
        )}
        {claim.confidence !== null && (
          <span>{Math.round(claim.confidence * 100)}% confident</span>
        )}
        {claim.validFrom && (
          <span>
            valid: {formatDate(claim.validFrom)}
            {claim.validTo ? ` – ${formatDate(claim.validTo)}` : " – present"}
          </span>
        )}
        <span className="text-muted-foreground/50">
          {formatTime(claim.assertedAt)}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle">
        <div className="text-sm text-muted-foreground">
          <span className="text-muted-foreground/50">from: </span>
          {claim.source.headline ? (
            <a
              href={claim.source.uri}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {claim.source.headline}
            </a>
          ) : (
            <a
              href={claim.source.uri}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {claim.source.uri}
            </a>
          )}
          {claim.source.sourceName && (
            <span className="text-muted-foreground/50 ml-1">({claim.source.sourceName})</span>
          )}
        </div>

        {claim.evidenceText && (
          <div className="mt-2">
            <button
              className="text-2xs text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "− hide evidence" : "+ show evidence"}
            </button>
            {expanded && (
              <blockquote className="mt-2 text-sm text-muted-foreground italic border-l-2 border-border pl-3">
                "{claim.evidenceText}"
              </blockquote>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
        {date === "unknown" ? "Unknown date" : formatDate(date)}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function FilterDropdown({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground
                 focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <option value="all">All facts</option>
      <option value="preferred">Current facts only</option>
      <option value="deprecated">Superseded facts only</option>
    </select>
  )
}

export function TimelinePage() {
  const { ontologyId = "seattle" } = useParams<{ ontologyId: string }>()
  const [filter, setFilter] = useState("all")

  // Use live stream-based atom for real-time updates
  const result = useAtomValue(liveTimelineAtom(ontologyId))

  // Extract data from result with proper type handling
  const isLoading = Result.isWaiting(result)
  const error = Result.isFailure(result) ? result.cause : null
  const data = Result.isSuccess(result) ? result.value as TimelineClaimsResponse : null

  // Filter claims based on selected rank filter
  const claims = useMemo(() => {
    if (!data?.claims) return []
    if (filter === "all") return data.claims as ClaimWithRank[]
    return (data.claims as ClaimWithRank[]).filter((c) => c.rank === filter)
  }, [data?.claims, filter])

  const groupedClaims = groupByDate(claims)
  const sortedDates = Array.from(groupedClaims.keys()).sort().reverse()

  return (
    <PageContainer size="md">
      <PageHeader
        title="Timeline"
        subtitle="Facts as they were extracted from source documents"
        actions={
          <div className="flex items-center gap-4">
            {data && (
              <span className="text-sm text-muted-foreground">
                {data.total} facts
              </span>
            )}
            <FilterDropdown value={filter} onChange={setFilter} />
          </div>
        }
      />

      {isLoading && <LoadingState rows={5} />}

      {error && (
        <ErrorState
          title="Failed to load timeline"
          message={error instanceof Error ? error.message : String(error)}
        />
      )}

      {!isLoading && !error && claims.length === 0 && (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No facts found"
          description={
            filter !== "all"
              ? "Try changing the filter"
              : "The knowledge graph is empty"
          }
        />
      )}

      {!isLoading && !error && claims.length > 0 && (
        <div className="space-y-1">
          {sortedDates.map((date) => (
            <div key={date}>
              <DateDivider date={date} />
              <div className="space-y-3">
                {groupedClaims.get(date)?.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} ontologyId={ontologyId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
