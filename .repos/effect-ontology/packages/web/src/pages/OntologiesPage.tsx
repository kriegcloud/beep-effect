/**
 * OntologiesPage - Editorial Minimalism Layout
 *
 * Ontology registry with data-dense cards showing:
 * - Schema summary statistics
 * - W3C standard references
 * - Quick navigation to schema browser
 *
 * @since 2.0.0
 * @module pages/OntologiesPage
 */

import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Layers, Box, ArrowRight, ExternalLink, AlertCircle } from "lucide-react"

interface OntologySummary {
  id: string
  iri: string
  title: string
  description?: string
  version: string
  classCount: number
  propertyCount: number
  importCount: number
}

interface OntologyListResponse {
  ontologies: OntologySummary[]
}

function OntologyRow({ ontology }: { ontology: OntologySummary }) {
  return (
    <Link
      to={`/o/${ontology.id}/documents`}
      className="data-row group flex items-center gap-4 px-4 py-3 border-b border-border-subtle"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Layers className="w-4 h-4 text-primary" />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {ontology.title}
          </span>
          <span className="namespace-badge text-2xs">
            v{ontology.version}
          </span>
        </div>
        <code className="text-2xs text-muted-foreground font-mono block truncate mt-0.5">
          {ontology.iri}
        </code>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-2xs text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1 tabular-nums">
          <span className="class-indicator owl-class" />
          {ontology.classCount}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <span className="class-indicator property" />
          {ontology.propertyCount}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Box className="w-3 h-3" />
          {ontology.importCount}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  )
}

function StandardsReference() {
  const standards = [
    { name: "RDF 1.1", url: "https://www.w3.org/TR/rdf11-primer/" },
    { name: "OWL 2", url: "https://www.w3.org/TR/owl2-overview/" },
    { name: "SHACL", url: "https://www.w3.org/TR/shacl/" },
    { name: "SKOS", url: "https://www.w3.org/TR/skos-reference/" }
  ]

  return (
    <div className="px-4 py-3 bg-background-subtle border-b border-border">
      <div className="flex items-center gap-4">
        <span className="text-2xs font-mono uppercase tracking-wide text-muted-foreground">
          W3C Standards
        </span>
        <div className="flex items-center gap-3">
          {standards.map((std) => (
            <a
              key={std.name}
              href={std.url}
              target="_blank"
              rel="noopener"
              className="text-2xs text-muted-foreground hover:text-primary transition-colors
                         flex items-center gap-1"
            >
              {std.name}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border-subtle">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-muted animate-pulse mb-1" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-8 rounded bg-muted animate-pulse" />
            <div className="h-3 w-8 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OntologiesPage() {
  const { data, isLoading, error } = useQuery<OntologyListResponse>({
    queryKey: ["ontologies"],
    queryFn: async () => {
      const res = await fetch("/api/v1/ontologies")
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      return res.json()
    }
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Page header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-xl text-foreground">Ontologies</h1>
          <span className="text-2xs text-muted-foreground font-mono uppercase tracking-wide">
            Schema Registry
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Select a knowledge graph schema to explore
        </p>
      </header>

      {/* Standards reference */}
      <StandardsReference />

      {/* Ontology list */}
      <div className="flex-1 overflow-auto scroll-subtle">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">
                  Failed to load ontologies
                </p>
                <p className="text-2xs text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            </div>
          </div>
        )}

        {data && data.ontologies.length > 0 && (
          <div className="divide-y divide-border-subtle">
            {data.ontologies.map((ont) => (
              <OntologyRow key={ont.id} ontology={ont} />
            ))}
          </div>
        )}

        {data && data.ontologies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              No ontologies registered
            </h3>
            <p className="text-2xs text-muted-foreground">
              Configure an ontology registry to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
