/**
 * Event Timeline Component
 *
 * Displays a timeline of events for an ontology.
 * Shows curation and extraction events with icons and timestamps.
 *
 * @since 1.0.0
 */

import { useAtom } from "@effect-atom/atom-react"
import {
  CheckCircle,
  XCircle,
  Tag,
  ArrowUp,
  Link,
  FileCheck,
  AlertTriangle,
  Activity
} from "lucide-react"
import { eventsAtom, eventTypeFilterAtom } from "../../atoms/events"
import {
  getEventDisplayName,
  isCurationEvent
} from "../../services/EventHandlers"
import type { ClientEventEntry } from "../../services/EventBusClient"
import { useMemo } from "react"

interface EventTimelineProps {
  ontologyId: string
  limit?: number
  className?: string
}

/**
 * Get icon component for event type
 */
const getEventIcon = (eventType: string) => {
  const iconClass = "h-4 w-4"
  switch (eventType) {
    case "ClaimCorrected":
      return <CheckCircle className={`${iconClass} text-green-500`} />
    case "ClaimDeprecated":
      return <XCircle className={`${iconClass} text-red-500`} />
    case "AliasAdded":
      return <Tag className={`${iconClass} text-blue-500`} />
    case "ClaimPromoted":
      return <ArrowUp className={`${iconClass} text-purple-500`} />
    case "EntityLinked":
      return <Link className={`${iconClass} text-cyan-500`} />
    case "ExtractionCompleted":
      return <FileCheck className={`${iconClass} text-green-600`} />
    case "ValidationFailed":
      return <AlertTriangle className={`${iconClass} text-orange-500`} />
    default:
      return <Activity className={`${iconClass} text-gray-500`} />
  }
}

/**
 * Get background color class for event type
 */
const getEventBgClass = (eventType: string): string => {
  if (isCurationEvent(eventType)) {
    return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
  }
  return "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
}

/**
 * Format timestamp for display
 */
const formatTimestamp = (createdAt: unknown): string => {
  if (createdAt instanceof Date) {
    return createdAt.toLocaleString()
  }
  if (typeof createdAt === "number") {
    return new Date(createdAt).toLocaleString()
  }
  return String(createdAt)
}

/**
 * Single event item in the timeline
 */
function EventItem({ event }: { event: ClientEventEntry }) {
  const payload = event.payload as Record<string, unknown>

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${getEventBgClass(event.event)}`}
    >
      <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.event)}</div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">
            {getEventDisplayName(event.event)}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTimestamp(event.createdAt)}
          </span>
        </div>
        {payload && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {typeof payload.claimId === "string" && (
              <span className="inline-block mr-2">
                Claim: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{payload.claimId.slice(0, 20)}...</code>
              </span>
            )}
            {typeof payload.batchId === "string" && (
              <span className="inline-block mr-2">
                Batch: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{payload.batchId.slice(0, 12)}...</code>
              </span>
            )}
            {typeof payload.entityCount === "number" && (
              <span className="inline-block mr-2">
                Entities: {payload.entityCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Event type filter tabs
 */
function EventFilters({
  ontologyId,
  eventCounts
}: {
  ontologyId: string
  eventCounts: { all: number; curation: number; extraction: number }
}) {
  const [filter, setFilter] = useAtom(eventTypeFilterAtom(ontologyId))

  const tabs = [
    { key: null, label: "All", count: eventCounts.all },
    { key: "curation", label: "Curation", count: eventCounts.curation },
    { key: "extraction", label: "Extraction", count: eventCounts.extraction }
  ]

  return (
    <div className="flex gap-1 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key ?? "all"}
          onClick={() => setFilter(tab.key)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            filter === tab.key
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tab.label}
          <span className="ml-1.5 opacity-70">({tab.count})</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Event timeline component
 */
export function EventTimeline({
  ontologyId,
  limit = 50,
  className = ""
}: EventTimelineProps) {
  const [events] = useAtom(eventsAtom(ontologyId))
  const [filter] = useAtom(eventTypeFilterAtom(ontologyId))

  // Calculate counts
  const eventCounts = useMemo(() => {
    const curation = events.filter((e) => isCurationEvent(e.event)).length
    return {
      all: events.length,
      curation,
      extraction: events.length - curation
    }
  }, [events])

  // Filter and limit events
  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    if (filter === "curation") {
      filtered = filtered.filter((e) => isCurationEvent(e.event))
    } else if (filter === "extraction") {
      filtered = filtered.filter((e) => !isCurationEvent(e.event))
    }

    // Sort by timestamp descending and limit
    return filtered
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt)
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : Number(b.createdAt)
        return bTime - aTime
      })
      .slice(0, limit)
  }, [events, filter, limit])

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No events yet</p>
        <p className="text-sm mt-1">Events will appear here as they occur</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <EventFilters ontologyId={ontologyId} eventCounts={eventCounts} />
      <div className="space-y-2">
        {filteredEvents.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
      {filteredEvents.length < eventCounts.all && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {filteredEvents.length} of {eventCounts.all} events
        </p>
      )}
    </div>
  )
}

/**
 * Compact event list (for sidebar or widget)
 */
export function EventListCompact({
  ontologyId,
  limit = 5,
  className = ""
}: EventTimelineProps) {
  const [events] = useAtom(eventsAtom(ontologyId))

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : Number(a.createdAt)
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : Number(b.createdAt)
        return bTime - aTime
      })
      .slice(0, limit)
  }, [events, limit])

  if (recentEvents.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No recent events
      </div>
    )
  }

  return (
    <ul className={`space-y-1 ${className}`}>
      {recentEvents.map((event) => (
        <li
          key={event.id}
          className="flex items-center gap-2 text-sm"
        >
          {getEventIcon(event.event)}
          <span className="truncate">{getEventDisplayName(event.event)}</span>
        </li>
      ))}
    </ul>
  )
}
