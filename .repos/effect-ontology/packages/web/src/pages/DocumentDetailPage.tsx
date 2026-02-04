/**
 * DocumentDetailPage
 *
 * Displays document with extracted claims and evidence highlighting.
 *
 * @since 2.0.0
 * @module pages/DocumentDetailPage
 */

import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useAtomValue } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { documentsLink } from "@/lib/routing"
import { documentDetailAtom } from "@/atoms/api"
import { toLabel } from "@/lib/namespace"
import { Schema } from "@effect-ontology/core-v2/Domain"
import {
  PageContainer,
  PageHeader,
  PageSection,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { ExternalLink, FileText } from "lucide-react"

type ClaimWithRank = typeof Schema.ClaimWithRank.Type

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

function ClaimCard({
  claim,
  isActive,
  onHover,
  onLeave
}: {
  claim: ClaimWithRank
  isActive: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const rankColors = {
    preferred: "border-l-success bg-success/5",
    normal: "border-l-border bg-background",
    deprecated: "border-l-muted bg-muted/30 opacity-60"
  }

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        border-l-2 pl-3 pr-4 py-3 transition-all duration-150 cursor-pointer
        ${rankColors[claim.rank]}
        ${isActive ? "ring-2 ring-warning ring-inset" : ""}
      `}
    >
      <div className={`text-sm ${claim.rank === "deprecated" ? "line-through" : ""}`}>
        <span className="font-medium text-foreground">
          {toLabel(claim.subjectIri)}
        </span>
        <span className="text-muted-foreground mx-1.5">
          {toLabel(claim.predicateIri)}
        </span>
        {claim.objectType === "iri" ? (
          <span className="text-primary">{toLabel(claim.objectValue)}</span>
        ) : (
          <span className="font-mono text-foreground">{claim.objectValue}</span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 text-2xs text-muted-foreground">
        {claim.rank === "preferred" && (
          <span className="text-success">current</span>
        )}
        {claim.rank === "deprecated" && (
          <span className="text-muted-foreground/50">superseded</span>
        )}
        {claim.confidence !== null && (
          <span>{Math.round(claim.confidence * 100)}%</span>
        )}
      </div>

      {claim.evidenceText && (
        <blockquote className="mt-2 text-2xs text-muted-foreground italic border-l border-border pl-2 line-clamp-2">
          "{claim.evidenceText}"
        </blockquote>
      )}
    </div>
  )
}

function ClaimsSidebar({
  claims,
  activeClaimId,
  onClaimHover,
  onClaimLeave
}: {
  claims: ReadonlyArray<ClaimWithRank>
  activeClaimId: string | null
  onClaimHover: (id: string) => void
  onClaimLeave: () => void
}) {
  const groupedClaims = useMemo(() => {
    const groups = new Map<string, ClaimWithRank[]>()
    for (const claim of claims) {
      const existing = groups.get(claim.subjectIri) || []
      existing.push(claim)
      groups.set(claim.subjectIri, existing)
    }
    return groups
  }, [claims])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Extracted Claims
        </h2>
        <span className="text-2xs text-muted-foreground">{claims.length} total</span>
      </div>

      <div className="space-y-4">
        {Array.from(groupedClaims.entries()).map(([subjectIri, subjectClaims]) => (
          <div key={subjectIri}>
            <h3 className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {toLabel(subjectIri)}
            </h3>
            <div className="space-y-1.5">
              {subjectClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  isActive={claim.id === activeClaimId}
                  onHover={() => onClaimHover(claim.id)}
                  onLeave={onClaimLeave}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DocumentDetailPage() {
  const { ontologyId = "seattle", id } = useParams<{ ontologyId: string; id: string }>()
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null)

  const result = useAtomValue(documentDetailAtom(`${ontologyId}:${id}`))

  const hasEvidence = Result.isSuccess(result) && result.value.claims.some((c) => c.evidenceText)

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Document"
        backTo={{ label: "Documents", href: documentsLink(ontologyId) }}
      />

      {Result.match(result, {
        onInitial: () => <LoadingState rows={5} />,
        onFailure: (failure) => (
          <ErrorState
            title="Failed to load document"
            message={String(failure.cause)}
          />
        ),
        onSuccess: (success) => {
          const data = success.value
          const publishedAt = typeof data.article.publishedAt === "string"
            ? data.article.publishedAt
            : data.article.publishedAt.toString()

          return (
            <>
              {/* Header */}
              <header className="mb-8 border-b border-border pb-6">
                <h1 className="font-serif text-2xl text-foreground mb-2 leading-tight">
                  {data.article.headline || "Untitled Document"}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {data.article.sourceName && (
                    <span className="font-medium">{data.article.sourceName}</span>
                  )}
                  <span>{formatDate(publishedAt)}</span>
                  <a
                    href={data.article.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-6 mt-4 text-2xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {data.claims.length} claims
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {data.entityCount} entities
                  </span>
                  {data.conflictCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      {data.conflictCount} conflicts
                    </span>
                  )}
                </div>
              </header>

              {/* Main content: Article + Claims sidebar */}
              <div className="flex gap-8">
                {/* Article content */}
                <article className="flex-1 min-w-0">
                  <PageSection title="Evidence Spans">
                    {hasEvidence ? (
                      <div className="space-y-4">
                        {data.claims
                          .filter((c) => c.evidenceText)
                          .map((claim) => (
                            <blockquote
                              key={claim.id}
                              onMouseEnter={() => setActiveClaimId(claim.id)}
                              onMouseLeave={() => setActiveClaimId(null)}
                              className={`
                                border-l-2 pl-4 py-2 transition-all duration-150 cursor-pointer
                                ${claim.id === activeClaimId
                                  ? "border-warning bg-warning/10"
                                  : "border-border hover:border-warning/50"
                                }
                                ${claim.rank === "deprecated" ? "opacity-60 line-through" : ""}
                              `}
                            >
                              <p className="text-foreground text-sm leading-relaxed">
                                "{claim.evidenceText}"
                              </p>
                              <footer className="text-2xs text-muted-foreground mt-1">
                                → {toLabel(claim.subjectIri)} {toLabel(claim.predicateIri)}{" "}
                                <span className="font-mono">
                                  {claim.objectType === "iri" ? toLabel(claim.objectValue) : claim.objectValue}
                                </span>
                              </footer>
                            </blockquote>
                          ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm py-8 text-center border border-border rounded">
                        No evidence text available for this document.
                      </div>
                    )}
                  </PageSection>
                </article>

                {/* Claims sidebar */}
                <aside className="w-80 shrink-0">
                  <ClaimsSidebar
                    claims={data.claims}
                    activeClaimId={activeClaimId}
                    onClaimHover={setActiveClaimId}
                    onClaimLeave={() => setActiveClaimId(null)}
                  />
                </aside>
              </div>
            </>
          )
        }
      })}
    </PageContainer>
  )
}
