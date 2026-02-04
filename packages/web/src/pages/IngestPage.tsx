/**
 * IngestPage
 *
 * Form for ingesting new URLs via Jina Reader.
 *
 * @since 2.0.0
 * @module pages/IngestPage
 */

import { useState, useEffect } from "react"
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { useNavigate, useParams } from "react-router-dom"
import { Eye, Upload } from "lucide-react"
import { toast } from "sonner"
import { ingestAtom, previewAtom } from "@/atoms/api"
import { linksLink, linkLink } from "@/lib/routing"
import {
  PageContainer,
  PageHeader,
  ErrorState,
  LoadingState
} from "@/components/PageLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function IngestPage() {
  const { ontologyId = "seattle" } = useParams<{ ontologyId: string }>()
  const [url, setUrl] = useState("")
  const navigate = useNavigate()

  const ingest = useAtomSet(ingestAtom)
  const ingestResult = useAtomValue(ingestAtom)

  const preview = useAtomSet(previewAtom)
  const previewResult = useAtomValue(previewAtom)

  const handlePreview = () => {
    if (url.trim()) {
      preview(url.trim())
    }
  }

  const handleIngest = () => {
    if (url.trim()) {
      ingest({ url: url.trim(), ontologyId })
    }
  }

  useEffect(() => {
    if (Result.isSuccess(ingestResult)) {
      const data = ingestResult.value
      if (data.duplicate) {
        toast.info("Content already exists (duplicate)")
      } else {
        toast.success("Link ingested successfully")
      }
      navigate(linkLink(ontologyId, data.id))
    }
  }, [ingestResult, navigate, ontologyId])

  const isLoading = ingestResult.waiting || previewResult.waiting
  const isValidUrl = url.trim().match(/^https?:\/\/.+/)

  return (
    <PageContainer size="sm">
      <PageHeader
        title="Ingest URL"
        subtitle="Fetch and store content using Jina Reader"
        backTo={{ label: "Links", href: linksLink(ontologyId) }}
      />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">URL</label>
            <Input
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidUrl) {
                  handleIngest()
                }
              }}
            />
            {url && !isValidUrl && (
              <p className="text-2xs text-destructive">
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>

          {/* Preview Result */}
          {previewResult.waiting && (
            <div className="p-4 bg-muted/30 rounded">
              <LoadingState rows={2} />
            </div>
          )}

          {Result.isSuccess(previewResult) && (
            <div className="border border-border rounded overflow-hidden">
              <div className="px-4 py-2 bg-muted/30 border-b border-border">
                <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                  Preview
                </span>
              </div>
              <pre className="p-4 text-xs overflow-auto max-h-64 bg-background">
                {JSON.stringify(previewResult.value, null, 2)}
              </pre>
            </div>
          )}

          {Result.isFailure(previewResult) && (
            <ErrorState title="Preview failed" message={String(previewResult.cause)} />
          )}

          {Result.isFailure(ingestResult) && (
            <ErrorState title="Ingestion failed" message={String(ingestResult.cause)} />
          )}
        </div>

        <div className="flex gap-2 px-6 py-4 bg-muted/30 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!isValidUrl || isLoading}
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={handleIngest} disabled={!isValidUrl || isLoading}>
            <Upload className="w-4 h-4" />
            {ingestResult.waiting ? "Ingesting..." : "Ingest"}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
