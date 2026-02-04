import { useState } from "react"
import { useParams } from "react-router-dom"
import { useAtomValue } from "@effect-atom/atom-react"
import { allBatchesAtom, activeBatchesAtom, type BatchState, type BatchStage } from "@/atoms/batch"

// Form state for creating new batches
interface BatchFormData {
  ontologyUri: string
  ontologyVersion: string
  targetNamespace: string
  documentUris: string // newline-separated
}

const initialFormData: BatchFormData = {
  ontologyUri: "",
  ontologyVersion: "",
  targetNamespace: "",
  documentUris: ""
}

// Helper to compute progress percentage
function getProgress(state: BatchState): number {
  switch (state._tag) {
    case "Pending": return 0
    case "Preprocessing": {
      const total = state.documentsTotal ?? 0
      const classified = state.documentsClassified ?? 0
      return total > 0 ? Math.round((classified / total) * 20) : 5
    }
    case "Extracting": {
      const total = state.documentsTotal ?? 0
      const completed = state.documentsCompleted ?? 0
      return total > 0 ? 20 + Math.round((completed / total) * 50) : 25
    }
    case "Resolving": return 75
    case "Validating": return 85
    case "Ingesting": {
      const total = state.triplesTotal ?? 0
      const ingested = state.triplesIngested ?? 0
      return total > 0 ? 85 + Math.round((ingested / total) * 15) : 90
    }
    case "Complete": return 100
    case "Failed": return 0
  }
}

// Status badge component
function StatusBadge({ stage }: { stage: BatchStage }) {
  const config: Record<BatchStage, { color: string; bg: string }> = {
    Pending: { color: "text-gray-400", bg: "bg-gray-500/10" },
    Preprocessing: { color: "text-purple-400", bg: "bg-purple-500/10" },
    Extracting: { color: "text-cyan-400", bg: "bg-cyan-500/10" },
    Resolving: { color: "text-blue-400", bg: "bg-blue-500/10" },
    Validating: { color: "text-amber-400", bg: "bg-amber-500/10" },
    Ingesting: { color: "text-teal-400", bg: "bg-teal-500/10" },
    Complete: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    Failed: { color: "text-red-400", bg: "bg-red-500/10" }
  }

  const { color, bg } = config[stage]
  const isTerminal = stage === "Complete" || stage === "Failed"

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} ${bg} border border-current/20`}>
      {!isTerminal && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {stage === "Complete" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {stage === "Failed" && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {stage}
    </span>
  )
}

// Progress bar component
function ProgressBar({ progress, stage }: { progress: number; stage: BatchStage }) {
  const colors: Record<BatchStage, string> = {
    Pending: "bg-gray-500",
    Preprocessing: "bg-purple-500",
    Extracting: "bg-cyan-500",
    Resolving: "bg-blue-500",
    Validating: "bg-amber-500",
    Ingesting: "bg-teal-500",
    Complete: "bg-emerald-500",
    Failed: "bg-red-500"
  }

  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full ${colors[stage]} transition-all duration-500`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Helper to format date (handles both Date and string)
function formatDate(date: unknown): string {
  if (date instanceof Date) return date.toLocaleString()
  if (typeof date === "string") return new Date(date).toLocaleString()
  return String(date)
}

// Single batch card
function BatchCard({ state, onResume }: { state: BatchState; onResume?: () => void }) {
  const progress = getProgress(state)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <code className="font-mono text-sm text-gray-300">{state.batchId}</code>
            <StatusBadge stage={state._tag} />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="font-mono text-cyan-500/60">{state.ontologyVersion}</span>
            <span>Started {formatDate(state.createdAt)}</span>
          </div>

          <ProgressBar progress={progress} stage={state._tag} />

          {/* Stage-specific details */}
          <div className="mt-3 text-xs text-gray-400">
            {state._tag === "Preprocessing" && (
              <span>Classifying documents: {state.documentsClassified ?? 0}/{state.documentsTotal ?? 0}</span>
            )}
            {state._tag === "Extracting" && (
              <span>Extracting: {state.documentsCompleted ?? 0}/{state.documentsTotal ?? 0} documents</span>
            )}
            {state._tag === "Resolving" && (
              <span>Forming clusters: {state.clustersFormed ?? 0} from {state.entitiesTotal ?? 0} entities</span>
            )}
            {state._tag === "Validating" && (
              <span>Running SHACL validation...</span>
            )}
            {state._tag === "Ingesting" && (
              <span>Ingesting: {state.triplesIngested ?? 0}/{state.triplesTotal ?? 0} triples</span>
            )}
            {state._tag === "Complete" && state.stats && (
              <span className="text-emerald-400">
                Completed in {Math.round(state.stats.totalDurationMs / 1000)}s -
                {" "}{state.stats.entitiesExtracted} entities,
                {" "}{state.stats.relationsExtracted} relations
              </span>
            )}
            {state._tag === "Failed" && state.error && (
              <span className="text-red-400">
                Failed in {state.failedInStage ?? "unknown"}: {state.error.message}
              </span>
            )}
          </div>
        </div>

        {onResume && (
          <button
            onClick={onResume}
            className="px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  )
}

// Main component
export function BatchMonitor() {
  const { ontologyId } = useParams<{ ontologyId: string }>()
  const [formData, setFormData] = useState<BatchFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get batch state from atoms (updated via EventBus in AppShell)
  const batchList = useAtomValue(allBatchesAtom(ontologyId ?? ""))
  const activeBatches = useAtomValue(activeBatchesAtom(ontologyId ?? ""))

  // Submit new batch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const documents = formData.documentUris
        .split("\n")
        .map(uri => uri.trim())
        .filter(uri => uri.length > 0)
        .map(sourceUri => ({
          sourceUri,
          contentType: sourceUri.endsWith(".txt") ? "text/plain" : "application/octet-stream"
        }))

      if (documents.length === 0) {
        throw new Error("At least one document URI is required")
      }

      const response = await fetch("/api/v1/extract/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ontologyUri: formData.ontologyUri,
          ontologyVersion: formData.ontologyVersion,
          targetNamespace: formData.targetNamespace,
          documents
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Failed to start batch")
      }

      // Batch started - state updates will come via EventBus/WebSocket
      // which updates the batch atoms automatically
      setFormData(initialFormData)

    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Resume a suspended batch
  const handleResume = async (batchId: string) => {
    try {
      const response = await fetch(`/api/v1/batch/${batchId}/resume`, {
        method: "POST"
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Failed to resume batch")
      }

      // State updates will come via EventBus automatically
    } catch (e) {
      console.error("Resume failed:", e)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-white">Batch Monitor</h1>
        <p className="text-gray-400 mt-1">
          Start and monitor extraction batches
        </p>
      </div>

      {/* New Batch Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-4">Start New Batch</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ontology URI (GCS)</label>
              <input
                type="text"
                value={formData.ontologyUri}
                onChange={e => setFormData(prev => ({ ...prev, ontologyUri: e.target.value }))}
                placeholder="gs://bucket/ontology.ttl"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Ontology Version</label>
              <input
                type="text"
                value={formData.ontologyVersion}
                onChange={e => setFormData(prev => ({ ...prev, ontologyVersion: e.target.value }))}
                placeholder="namespace/name@hash"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Target Namespace</label>
            <input
              type="text"
              value={formData.targetNamespace}
              onChange={e => setFormData(prev => ({ ...prev, targetNamespace: e.target.value }))}
              placeholder="my-namespace"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Document URIs (one per line)</label>
            <textarea
              value={formData.documentUris}
              onChange={e => setFormData(prev => ({ ...prev, documentUris: e.target.value }))}
              placeholder="gs://bucket/doc1.txt&#10;gs://bucket/doc2.txt"
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Starting..." : "Start Batch"}
          </button>
        </form>
      </div>

      {/* Active count */}
      {activeBatches.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          {activeBatches.length} active batch{activeBatches.length !== 1 ? "es" : ""}
        </div>
      )}

      {/* Batch list */}
      <div className="space-y-3">
        {batchList.map(state => (
          <BatchCard
            key={state.batchId}
            state={state}
            onResume={state._tag === "Failed" ? () => handleResume(state.batchId) : undefined}
          />
        ))}
      </div>

      {batchList.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400">No batches yet. Start one above.</p>
        </div>
      )}
    </div>
  )
}
