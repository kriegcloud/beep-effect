/**
 * OntologyPage (Entity Detail)
 *
 * Displays detailed information about a single entity with Wikipedia-style infobox.
 *
 * @since 2.0.0
 * @module pages/OntologyPage
 */

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { entityLink, entitiesLink } from "@/lib/routing"
import { toLabel } from "@/lib/namespace"
import {
  PageContainer,
  PageHeader,
  PageSection,
  EmptyState,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { ExternalLink, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  deprecatedAt: string | null
  confidence: number | null
  evidenceText: string | null
}

interface TimelineEntityResponse {
  iri: string
  asOf: string | null
  claims: ClaimWithRank[]
  corrections: unknown[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null) return null
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? "bg-success/10 text-success" : pct >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
  return (
    <span className={`text-2xs px-1.5 py-0.5 rounded ${color}`} title={`Confidence: ${pct}%`}>
      {pct}%
    </span>
  )
}

function RankIndicator({ rank }: { rank: ClaimWithRank["rank"] }) {
  if (rank === "preferred") {
    return <span className="text-success" title="Preferred rank (current best)">★</span>
  }
  if (rank === "deprecated") {
    return <span className="text-destructive" title="Deprecated (superseded)">⊘</span>
  }
  return null
}

function ObjectValue({ claim, ontologyId }: { claim: ClaimWithRank; ontologyId: string }) {
  if (claim.objectType === "iri") {
    return (
      <Link
        to={entityLink(ontologyId, claim.objectValue)}
        className="text-primary hover:underline"
      >
        {toLabel(claim.objectValue)}
      </Link>
    )
  }
  return <span className="font-mono text-foreground">{claim.objectValue}</span>
}

function SourceCitation({ claim }: { claim: ClaimWithRank }) {
  const source = claim.source
  return (
    <div className="text-sm border-l-2 border-border pl-3 py-2">
      <div className="text-muted-foreground">
        {source.headline ? (
          <a
            href={source.uri}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.headline}
          </a>
        ) : (
          <span className="italic text-muted-foreground/50">Untitled source</span>
        )}
        {source.sourceName && (
          <span className="text-muted-foreground/50 text-2xs ml-2">
            ({source.sourceName})
          </span>
        )}
        {source.publishedAt && (
          <span className="text-muted-foreground/50 text-2xs ml-2">
            {formatDate(source.publishedAt)}
          </span>
        )}
      </div>
      {claim.evidenceText && (
        <blockquote className="mt-1 text-muted-foreground italic text-sm leading-relaxed">
          "{claim.evidenceText}"
        </blockquote>
      )}
    </div>
  )
}

function FactRow({ claim, ontologyId }: { claim: ClaimWithRank; ontologyId: string }) {
  const [showSource, setShowSource] = useState(false)
  const deprecated = claim.rank === "deprecated"

  return (
    <>
      <tr className={`border-b border-border-subtle hover:bg-muted/30 ${deprecated ? "opacity-50" : ""}`}>
        <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
          <span className={deprecated ? "line-through" : ""}>
            {toLabel(claim.predicateIri)}
          </span>
        </td>
        <td className={`py-3 pr-4 align-top ${deprecated ? "line-through" : ""}`}>
          <ObjectValue claim={claim} ontologyId={ontologyId} />
          {claim.validFrom && (
            <div className="text-2xs text-muted-foreground mt-0.5">
              {formatDate(claim.validFrom)} – {claim.validTo ? formatDate(claim.validTo) : "present"}
            </div>
          )}
        </td>
        <td className="py-3 pr-2 align-top w-12">
          <ConfidenceBadge value={claim.confidence} />
        </td>
        <td className="py-3 pr-2 align-top w-6">
          <RankIndicator rank={claim.rank} />
        </td>
        <td className="py-3 align-top w-20">
          <button
            onClick={() => setShowSource(!showSource)}
            className="text-2xs text-primary hover:underline"
          >
            {showSource ? "hide" : "source"}
          </button>
        </td>
      </tr>
      {showSource && (
        <tr className="bg-muted/20">
          <td colSpan={5} className="py-2 px-4">
            <SourceCitation claim={claim} />
          </td>
        </tr>
      )}
    </>
  )
}

function Infobox({ iri, claims, ontologyId }: { iri: string; claims: ClaimWithRank[]; ontologyId: string }) {
  const label = toLabel(iri)
  const preferredClaims = claims.filter(c => c.rank === "preferred").slice(0, 6)

  const types = claims
    .filter(c => c.predicateIri.includes("type") || c.predicateIri.includes("Type"))
    .map(c => toLabel(c.objectValue))

  return (
    <div className="border border-border bg-muted/20 w-72 float-right ml-6 mb-4 rounded overflow-hidden">
      <div className="bg-muted/50 px-3 py-2 border-b border-border">
        <h2 className="font-semibold text-foreground text-center">{label}</h2>
      </div>
      <div className="p-3">
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 justify-center">
            {types.map((type, i) => (
              <Badge key={i} variant="secondary" className="text-2xs">
                {type}
              </Badge>
            ))}
          </div>
        )}

        {preferredClaims.length > 0 && (
          <table className="w-full text-sm">
            <tbody>
              {preferredClaims
                .filter(c => !c.predicateIri.includes("type"))
                .slice(0, 5)
                .map((claim) => (
                  <tr key={claim.id} className="border-t border-border-subtle">
                    <th className="py-1.5 pr-2 text-left text-muted-foreground font-normal align-top">
                      {toLabel(claim.predicateIri)}
                    </th>
                    <td className="py-1.5 text-foreground">
                      {claim.objectType === "iri" ? (
                        <Link
                          to={entityLink(ontologyId, claim.objectValue)}
                          className="text-primary hover:underline"
                        >
                          {toLabel(claim.objectValue)}
                        </Link>
                      ) : (
                        claim.objectValue
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-muted/30 px-3 py-2 border-t border-border">
        <div className="text-2xs text-muted-foreground break-all font-mono">
          {iri}
        </div>
      </div>
    </div>
  )
}

export function OntologyPage() {
  const { ontologyId = "seattle", entityId } = useParams<{ ontologyId: string; entityId: string }>()

  const iri = entityId ? decodeURIComponent(entityId) : ""

  const { data, isLoading, error } = useQuery<TimelineEntityResponse>({
    queryKey: ["entity", ontologyId, iri],
    queryFn: async () => {
      const res = await fetch(`/api/v1/ontologies/${ontologyId}/timeline/entities/${encodeURIComponent(iri)}`)
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Entity not found")
        }
        throw new Error(`Failed to fetch entity: ${res.status}`)
      }
      return res.json()
    },
    enabled: !!iri
  })

  const claims = data?.claims ?? []
  const label = toLabel(iri)

  const uniqueSources = [...new Map(claims.map(c => [c.source.id, c.source])).values()]

  return (
    <PageContainer size="lg">
      <PageHeader
        title={label}
        backTo={{ label: "Entities", href: entitiesLink(ontologyId) }}
      />

      {isLoading && <LoadingState rows={5} />}

      {error && (
        <ErrorState
          title="Entity Not Found"
          message={(error as Error).message}
        />
      )}

      {!isLoading && !error && (
        <article className="clearfix">
          {claims.length > 0 && <Infobox iri={iri} claims={claims} ontologyId={ontologyId} />}

          {claims.length === 0 && (
            <EmptyState
              icon={<User className="w-6 h-6" />}
              title="No facts recorded"
              description="This entity exists in the knowledge graph but has no claims yet."
            />
          )}

          {claims.length > 0 && (
            <PageSection title={`Facts (${claims.length})`}>
              <table className="w-full">
                <tbody>
                  {claims.map((claim) => (
                    <FactRow key={claim.id} claim={claim} ontologyId={ontologyId} />
                  ))}
                </tbody>
              </table>
            </PageSection>
          )}

          {uniqueSources.length > 0 && (
            <PageSection title={`Sources (${uniqueSources.length})`}>
              <div className="space-y-4">
                {uniqueSources.map((source, i) => (
                  <div key={source.id} className="text-sm border-l-2 border-border pl-3 py-2">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground/50 font-mono text-2xs">[{i + 1}]</span>
                      <div className="flex-1">
                        <div className="text-muted-foreground">
                          <a
                            href={source.uri}
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.headline || source.uri}
                          </a>
                          {source.sourceName && (
                            <span className="text-muted-foreground/50 text-2xs ml-2">
                              ({source.sourceName})
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground/50 text-2xs mt-0.5">
                          Published: {formatDate(source.publishedAt)} · Ingested: {formatDate(source.ingestedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PageSection>
          )}

          <footer className="border-t border-border pt-4 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <code className="text-2xs font-mono">{iri}</code>
              <div className="flex items-center gap-4">
                <span>★ = preferred (current)</span>
                <span>⊘ = deprecated</span>
              </div>
            </div>
          </footer>
        </article>
      )}
    </PageContainer>
  )
}
