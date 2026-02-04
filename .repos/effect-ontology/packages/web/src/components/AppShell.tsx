/**
 * AppShell - Editorial Minimalism Layout
 *
 * Sidebar-first layout with:
 * - Collapsible navigation sidebar
 * - Ontology context selector
 * - Class/namespace hierarchy browser
 * - Data-dense content area
 *
 * @since 2.0.0
 * @module components/AppShell
 */

import type { ReactNode } from "react"
import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAtomValue, RegistryContext } from "@effect-atom/atom-react"
import { Result } from "@effect-atom/atom"
import { Effect, Fiber, Layer, Stream } from "effect"
import { healthAtom, ontologiesAtom } from "@/atoms/api"
import { updateBatchState, type BatchState } from "@/atoms/batch"
import { BrowserLoggerLayer } from "@/services/BrowserLogger"
import { invalidateForEvent, requiresInvalidation } from "@/services/CacheInvalidation"
import {
  EventBusClient,
  EventBusClientLayer,
  EventBusClientMemoryLayer,
  type AuthMode
} from "@/services/EventBusClient"
import {
  linksLink,
  documentsLink,
  timelineLink,
  classesLink,
  entitiesLink,
  batchesLink
} from "../lib/routing"
import {
  FileText,
  Link2,
  Clock,
  Layers,
  Database,
  Activity,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Circle
} from "lucide-react"

interface AppShellProps {
  children: ReactNode
}

type HealthStatus = "checking" | "online" | "offline" | "degraded"

/**
 * Extract ontology ID from current path
 */
function useOntologyId(): string | null {
  const location = useLocation()
  const match = location.pathname.match(/^\/o\/([^/]+)/)
  return match ? match[1] : null
}

/**
 * Detect WebSocket auth mode from environment
 *
 * In development (VITE dev server), uses "dev" mode which bypasses ticket auth.
 * In production, uses "prod" mode which requires ticket authentication.
 */
function getAuthMode(): AuthMode {
  // Check for explicit mode override
  const explicitMode = import.meta.env.VITE_WS_MODE
  if (explicitMode === "dev" || explicitMode === "prod") {
    return explicitMode
  }

  // Default: dev mode in development, prod in production
  return import.meta.env.DEV ? "dev" : "prod"
}

/**
 * Get API key from environment (for prod mode ticket fetching)
 */
function getApiKey(): string | undefined {
  return import.meta.env.VITE_API_KEY
}

/**
 * Hook to subscribe to events and trigger cache invalidation
 */
function useEventSubscription(ontologyId: string | null) {
  const registry = useContext(RegistryContext)

  useEffect(() => {
    if (!ontologyId) return

    // Create a fiber handle for cleanup
    let subscriptionFiber: Fiber.RuntimeFiber<void, unknown> | null = null

    // Determine auth mode and API key
    const authMode = getAuthMode()
    const apiKey = getApiKey()

    // Subscribe to events and invalidate caches
    const subscription = Effect.gen(function* () {
      yield* Effect.logInfo("EventBus subscription starting", {
        ontologyId,
        authMode,
        hasApiKey: !!apiKey
      })

      const eventBus = yield* EventBusClient
      const eventStream = yield* eventBus.subscribeEvents()

      yield* Effect.logInfo("EventBus connected, listening for events")

      yield* Stream.runForEach(eventStream, (event) =>
        Effect.gen(function* () {
          yield* Effect.logDebug("Event received", {
            eventType: event.event,
            eventId: event.id
          })

          // Handle BatchStateChanged events - update batch atoms directly
          if (event.event === "BatchStateChanged" && event.payload) {
            const payload = event.payload as { batchId: string; state: BatchState }
            if (payload.batchId && payload.state) {
              // Update batch state atom
              updateBatchState(ontologyId, payload.batchId, payload.state)
              yield* Effect.logDebug("Batch state updated", {
                batchId: payload.batchId,
                stage: payload.state._tag
              })
            }
          }

          // Only invalidate if this event type requires it
          if (requiresInvalidation(event.event)) {
            yield* invalidateForEvent(event, ontologyId, registry)
            yield* Effect.logInfo("Cache invalidated for event", {
              eventType: event.event,
              ontologyId
            })
          }
        })
      )
    }).pipe(
      // Use real WebSocket with dual-mode auth
      Effect.provide(
        EventBusClientLayer(ontologyId, window.location.origin, {
          mode: authMode,
          apiKey
        })
      ),
      // Add browser console logging
      Effect.provide(BrowserLoggerLayer),
      Effect.catchAll((error) =>
        Effect.logWarning("Event subscription error", { error }).pipe(
          Effect.provide(BrowserLoggerLayer)
        )
      )
    )

    // Run the subscription in the background
    const fiber = Effect.runFork(subscription)
    subscriptionFiber = fiber

    // Cleanup on unmount or ontologyId change
    return () => {
      if (subscriptionFiber) {
        Effect.runFork(Fiber.interrupt(subscriptionFiber))
      }
    }
  }, [ontologyId, registry])
}

/**
 * Derive health status from atom result
 */
function useHealthStatus(): HealthStatus {
  const result = useAtomValue(healthAtom)

  if (result.waiting) return "checking"

  return Result.match(result, {
    onInitial: () => "checking" as HealthStatus,
    onFailure: () => "offline" as HealthStatus,
    onSuccess: (s) => (s.value.status === "ok" ? "online" : "degraded") as HealthStatus
  })
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const health = useHealthStatus()
  const location = useLocation()
  const ontologyId = useOntologyId()

  // Subscribe to events for cache invalidation
  useEventSubscription(ontologyId)

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/")

  // Build ontology-scoped nav links
  const scopedLinks = ontologyId
    ? {
        links: linksLink(ontologyId),
        documents: documentsLink(ontologyId),
        timeline: timelineLink(ontologyId),
        classes: classesLink(ontologyId),
        entities: entitiesLink(ontologyId),
        batches: batchesLink(ontologyId)
      }
    : {
        links: "/o/seattle/links",
        documents: "/o/seattle/documents",
        timeline: "/o/seattle/timeline",
        classes: "/o/seattle/classes",
        entities: "/o/seattle/entities",
        batches: "/o/seattle/batches"
      }

  const navItems = [
    {
      to: scopedLinks.documents,
      icon: FileText,
      label: "Documents",
      description: "Source articles"
    },
    {
      to: scopedLinks.timeline,
      icon: Clock,
      label: "Timeline",
      description: "Claims history"
    },
    {
      to: scopedLinks.entities,
      icon: Database,
      label: "Entities",
      description: "Knowledge graph"
    },
    {
      to: scopedLinks.classes,
      icon: Layers,
      label: "Schema",
      description: "Ontology structure"
    },
    {
      to: scopedLinks.links,
      icon: Link2,
      label: "Links",
      description: "Ingestion queue"
    },
    {
      to: scopedLinks.batches,
      icon: Activity,
      label: "Batches",
      description: "Extraction jobs"
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40
          flex flex-col
          border-r border-border bg-background-subtle
          transition-all duration-200 ease-out
          ${sidebarCollapsed ? "w-12" : "w-sidebar"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-3 border-b border-border">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xs font-semibold">EO</span>
              </div>
              <span className="font-serif text-sm font-medium text-foreground truncate">
                Effect Ontology
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Ontology Selector */}
        {!sidebarCollapsed && (
          <OntologySelector currentOntologyId={ontologyId} />
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 scroll-subtle">
          {!sidebarCollapsed && (
            <div className="nav-section-title">Navigate</div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive(item.to) ? "active" : ""}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="nav-item-icon flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-sm leading-tight">{item.label}</div>
                  <div className="text-2xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer - Status */}
        <div className="border-t border-border p-2">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <StatusDot status={health} />
            {!sidebarCollapsed && (
              <span className="text-2xs text-muted-foreground">
                {health === "online"
                  ? "Connected"
                  : health === "checking"
                    ? "Connecting..."
                    : health === "offline"
                      ? "Offline"
                      : "Degraded"}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`
          flex-1 min-h-screen
          transition-all duration-200 ease-out
          ${sidebarCollapsed ? "ml-12" : "ml-sidebar"}
        `}
      >
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Ontology selector dropdown
 */
function OntologySelector({ currentOntologyId }: { currentOntologyId: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const result = useAtomValue(ontologiesAtom)

  const ontologies = Result.match(result, {
    onInitial: () => [],
    onFailure: () => [],
    onSuccess: (s) => s.value
  })

  const currentOntology = ontologies.find((o) => o.id === currentOntologyId)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="class-indicator owl-class" />
          <div className="min-w-0 text-left">
            <div className="text-sm font-medium truncate">
              {currentOntology?.title || currentOntologyId || "Select ontology"}
            </div>
            {currentOntologyId && (
              <div className="text-2xs text-muted-foreground font-mono">
                {currentOntologyId}
              </div>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && ontologies.length > 0 && (
        <div className="border-t border-border-subtle bg-background">
          {ontologies.map((ontology) => (
            <button
              key={ontology.id}
              onClick={() => {
                navigate(`/o/${ontology.id}/documents`)
                setExpanded(false)
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-left
                hover:bg-muted/50 transition-colors
                ${ontology.id === currentOntologyId ? "bg-primary/5" : ""}
              `}
            >
              <span className="class-indicator owl-class" />
              <div className="min-w-0">
                <div className="text-sm truncate">{ontology.title}</div>
                <div className="text-2xs text-muted-foreground">
                  {ontology.classCount} classes
                </div>
              </div>
            </button>
          ))}
          <Link
            to="/ontologies"
            className="block px-3 py-2 text-2xs text-primary hover:bg-muted/50 transition-colors"
            onClick={() => setExpanded(false)}
          >
            View all ontologies...
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * Connection status indicator
 */
function StatusDot({ status }: { status: HealthStatus }) {
  const colors: Record<HealthStatus, string> = {
    checking: "text-muted-foreground animate-pulse",
    online: "text-success",
    offline: "text-destructive",
    degraded: "text-warning"
  }

  return <Circle className={`w-2 h-2 fill-current ${colors[status]}`} />
}
