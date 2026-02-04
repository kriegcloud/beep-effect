/**
 * OntologyIndex (Entities Page)
 *
 * Displays all entities in the knowledge graph with search and filtering.
 *
 * @since 2.0.0
 * @module pages/OntologyIndex
 */

import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { entityLink } from "../lib/routing"
import { localName } from "@/lib/namespace"
import { Database, Search } from "lucide-react"
import {
  PageContainer,
  PageHeader,
  EmptyState,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
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
  confidence: number | null
  evidenceText: string | null
}

interface TimelineClaimsResponse {
  claims: ClaimWithRank[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface EntitySummary {
  iri: string
  localName: string
  label: string
  types: string[]
  claimCount: number
  latestClaim: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

function deriveEntities(claims: ClaimWithRank[]): EntitySummary[] {
  const entityMap = new Map<string, {
    iri: string
    claimCount: number
    types: Set<string>
    latestClaim: string
  }>()

  for (const claim of claims) {
    if (!entityMap.has(claim.subjectIri)) {
      entityMap.set(claim.subjectIri, {
        iri: claim.subjectIri,
        claimCount: 0,
        types: new Set(),
        latestClaim: claim.assertedAt
      })
    }

    const entry = entityMap.get(claim.subjectIri)!
    entry.claimCount++

    if (claim.assertedAt > entry.latestClaim) {
      entry.latestClaim = claim.assertedAt
    }

    if (claim.predicateIri.includes("type") || claim.predicateIri.includes("Type")) {
      entry.types.add(localName(claim.objectValue))
    }
  }

  return Array.from(entityMap.values())
    .map((e) => ({
      iri: e.iri,
      localName: localName(e.iri),
      label: localName(e.iri).replace(/([A-Z])/g, " $1").trim(),
      types: Array.from(e.types),
      claimCount: e.claimCount,
      latestClaim: e.latestClaim
    }))
    .sort((a, b) => b.latestClaim.localeCompare(a.latestClaim))
}

function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-muted/30 px-4 py-3 rounded">
      <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function EntityRow({ entity, ontologyId }: { entity: EntitySummary; ontologyId: string }) {
  return (
    <tr className="border-b border-border-subtle hover:bg-muted/30">
      <td className="py-3 pr-4">
        <Link
          to={entityLink(ontologyId, entity.iri)}
          className="text-primary hover:underline font-medium"
        >
          {entity.label}
        </Link>
        <div className="text-2xs text-muted-foreground font-mono truncate max-w-xs">
          {entity.iri}
        </div>
      </td>
      <td className="py-3 pr-4">
        <div className="flex flex-wrap gap-1">
          {entity.types.length > 0 ? (
            entity.types.slice(0, 3).map((type) => (
              <Badge key={type} variant="secondary" className="text-2xs">
                {type}
              </Badge>
            ))
          ) : (
            <span className="text-2xs text-muted-foreground">—</span>
          )}
        </div>
      </td>
      <td className="py-3 pr-4 text-muted-foreground text-sm text-right tabular-nums">
        {entity.claimCount}
      </td>
      <td className="py-3 text-muted-foreground text-sm text-right whitespace-nowrap">
        {formatDate(entity.latestClaim)}
      </td>
    </tr>
  )
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search entities..."
        className="w-full border border-border rounded pl-10 pr-4 py-2 text-sm bg-background text-foreground
                   placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}

export function OntologyIndex() {
  const { ontologyId = "seattle" } = useParams<{ ontologyId: string }>()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const { data: claimsData, isLoading, error } = useQuery<TimelineClaimsResponse>({
    queryKey: ["claims-for-entities", ontologyId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/ontologies/${ontologyId}/claims?limit=500`)
      if (!res.ok) {
        throw new Error(`Failed to fetch claims: ${res.status}`)
      }
      return res.json()
    }
  })

  const allEntities = claimsData ? deriveEntities(claimsData.claims) : []
  const allTypes = [...new Set(allEntities.flatMap(e => e.types))].sort()
  const uniqueSources = new Set(claimsData?.claims.map(c => c.source.sourceName).filter(Boolean))

  let entities = allEntities
  if (search) {
    const q = search.toLowerCase()
    entities = entities.filter(e =>
      e.label.toLowerCase().includes(q) ||
      e.localName.toLowerCase().includes(q) ||
      e.iri.toLowerCase().includes(q)
    )
  }
  if (typeFilter) {
    entities = entities.filter(e => e.types.includes(typeFilter))
  }

  return (
    <PageContainer size="lg">
      <PageHeader
        title="Entities"
        subtitle="Structured facts extracted from source documents"
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard label="Entities" value={allEntities.length} />
        <StatsCard label="Facts" value={claimsData?.total ?? 0} />
        <StatsCard label="Sources" value={uniqueSources.size} />
        <StatsCard label="Types" value={allTypes.length} />
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <SearchBox value={search} onChange={setSearch} />
        </div>
        <select
          value={typeFilter || ""}
          onChange={(e) => setTypeFilter(e.target.value || null)}
          className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground
                     focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All types</option>
          {allTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingState rows={5} />}

      {error && (
        <ErrorState
          title="Could not load data"
          message={(error as Error).message}
        />
      )}

      {!isLoading && !error && entities.length === 0 && (
        <EmptyState
          icon={<Database className="w-6 h-6" />}
          title="No entities found"
          description={
            search || typeFilter
              ? "Try adjusting your search or filter"
              : "The knowledge graph is empty. Add some source documents to extract facts."
          }
        />
      )}

      {!isLoading && !error && entities.length > 0 && (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left py-3 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                  Entity
                </th>
                <th className="text-left py-3 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                  Types
                </th>
                <th className="text-right py-3 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                  Facts
                </th>
                <th className="text-right py-3 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <EntityRow key={entity.iri} entity={entity} ontologyId={ontologyId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}
