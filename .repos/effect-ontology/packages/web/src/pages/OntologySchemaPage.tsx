/**
 * OntologySchemaPage
 *
 * Displays ontology schema with classes and properties.
 *
 * @since 2.0.0
 * @module pages/OntologySchemaPage
 */

import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { localName } from "@/lib/namespace"
import {
  PageContainer,
  PageHeader,
  PageSection,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { ExternalLink } from "lucide-react"

interface VocabularyRef {
  iri: string
  prefix: string
  name: string
  publisher?: string
  specUrl?: string
}

interface ClassSummary {
  iri: string
  localName: string
  label?: string
  comment?: string
  superClass?: string
}

interface PropertySummary {
  iri: string
  localName: string
  label?: string
  comment?: string
  domain?: string
  range?: string
  isObjectProperty: boolean
}

interface OntologyDetail {
  id: string
  iri: string
  title: string
  description?: string
  version: string
  creator?: string
  created?: string
  targetNamespace: string
  imports: VocabularyRef[]
  classes: ClassSummary[]
  properties: PropertySummary[]
  seeAlso: string[]
}

function prefixFromIri(iri: string, imports: VocabularyRef[]): string | null {
  for (const vocab of imports) {
    if (iri.startsWith(vocab.iri.replace(/#$/, ""))) {
      return vocab.prefix
    }
  }
  return null
}

function ImportCard({ vocab }: { vocab: VocabularyRef }) {
  return (
    <div className="border border-border bg-background px-4 py-3 rounded">
      <div className="flex items-baseline justify-between gap-3">
        <code className="text-sm font-mono font-medium text-primary">
          {vocab.prefix}:
        </code>
        {vocab.publisher && (
          <span className="text-2xs text-muted-foreground">{vocab.publisher}</span>
        )}
      </div>
      <p className="text-sm text-foreground mt-1">{vocab.name}</p>
      {vocab.specUrl && (
        <a
          href={vocab.specUrl}
          target="_blank"
          rel="noopener"
          className="text-2xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
        >
          Specification
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

function ClassRow({ cls, imports }: { cls: ClassSummary; imports: VocabularyRef[] }) {
  const superPrefix = cls.superClass ? prefixFromIri(cls.superClass, imports) : null
  const superLocal = cls.superClass ? localName(cls.superClass) : null

  return (
    <tr className="border-b border-border-subtle hover:bg-muted/30">
      <td className="py-3 pr-4 align-top">
        <code className="text-sm font-mono text-success">{cls.localName}</code>
      </td>
      <td className="py-3 pr-4 align-top">
        {cls.superClass && (
          <code className="text-2xs font-mono text-muted-foreground">
            {superPrefix ? `${superPrefix}:${superLocal}` : superLocal}
          </code>
        )}
      </td>
      <td className="py-3 align-top text-sm text-muted-foreground max-w-md">
        {cls.comment || <span className="text-muted-foreground/50">—</span>}
      </td>
    </tr>
  )
}

function PropertyRow({ prop }: { prop: PropertySummary }) {
  return (
    <tr className="border-b border-border-subtle hover:bg-muted/30">
      <td className="py-3 pr-4 align-top">
        <code className="text-sm font-mono text-primary">{prop.localName}</code>
      </td>
      <td className="py-3 pr-4 align-top">
        <span className={`text-2xs px-1.5 py-0.5 rounded ${
          prop.isObjectProperty
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}>
          {prop.isObjectProperty ? "Object" : "Datatype"}
        </span>
      </td>
      <td className="py-3 align-top text-sm text-muted-foreground max-w-md">
        {prop.comment || <span className="text-muted-foreground/50">—</span>}
      </td>
    </tr>
  )
}

export function OntologySchemaPage() {
  const { ontologyId } = useParams<{ ontologyId: string; iri?: string }>()

  const { data, isLoading, error } = useQuery<OntologyDetail>({
    queryKey: ["ontology", ontologyId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/ontologies/${ontologyId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error("Ontology not found")
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      return res.json()
    },
    enabled: !!ontologyId
  })

  return (
    <PageContainer size="lg">
      <PageHeader
        title={data?.title || "Schema"}
        subtitle={data?.iri}
        backTo={{ label: "Ontologies", href: "/ontologies" }}
        actions={
          data && (
            <span className="text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded">
              v{data.version}
            </span>
          )
        }
      />

      {isLoading && <LoadingState rows={5} />}

      {error && (
        <ErrorState
          title="Failed to load ontology"
          message={(error as Error).message}
        />
      )}

      {data && (
        <>
          {/* Description */}
          {data.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl">
              {data.description}
            </p>
          )}

          {/* Metadata */}
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Namespace:</dt>
              <dd className="font-mono text-foreground truncate">{data.targetNamespace}</dd>
            </div>
            {data.creator && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Creator:</dt>
                <dd className="text-foreground">{data.creator}</dd>
              </div>
            )}
            {data.created && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Created:</dt>
                <dd className="text-foreground">{data.created}</dd>
              </div>
            )}
          </dl>

          {/* Imports */}
          <PageSection title={`Imported Vocabularies (${data.imports.length})`}>
            <div className="grid grid-cols-2 gap-3">
              {data.imports.map((vocab) => (
                <ImportCard key={vocab.iri} vocab={vocab} />
              ))}
            </div>
          </PageSection>

          {/* Classes */}
          {data.classes.length > 0 && (
            <PageSection title={`Domain Classes (${data.classes.length})`}>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Class
                      </th>
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Extends
                      </th>
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.classes.map((cls) => (
                      <ClassRow key={cls.iri} cls={cls} imports={data.imports} />
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          )}

          {/* Properties */}
          {data.properties.length > 0 && (
            <PageSection title={`Properties (${data.properties.length})`}>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Property
                      </th>
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Type
                      </th>
                      <th className="py-2 px-4 text-2xs font-mono uppercase tracking-wide text-muted-foreground">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.properties.map((prop) => (
                      <PropertyRow key={prop.iri} prop={prop} />
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          )}

          {/* References */}
          {data.seeAlso.length > 0 && (
            <PageSection title="References">
              <ul className="space-y-1">
                {data.seeAlso.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener"
                      className="text-sm text-primary hover:underline font-mono inline-flex items-center gap-1"
                    >
                      {url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </PageSection>
          )}
        </>
      )}
    </PageContainer>
  )
}
