/**
 * Connection Status Indicator
 *
 * Displays the WebSocket connection status for an ontology.
 *
 * @since 1.0.0
 */

import { useAtom } from "@effect-atom/atom-react"
import { Wifi, WifiOff, RefreshCw, Cloud } from "lucide-react"
import { connectionStatusAtom } from "../../atoms/events"
import type { ConnectionStatus } from "../../services/EventBusClient"

interface ConnectionIndicatorProps {
  ontologyId: string
  className?: string
}

/**
 * Get icon for connection status
 */
const getStatusIcon = (status: ConnectionStatus) => {
  switch (status) {
    case "connected":
      return <Wifi className="h-4 w-4 text-green-500" />
    case "connecting":
      return <Cloud className="h-4 w-4 text-yellow-500 animate-pulse" />
    case "syncing":
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    case "disconnected":
      return <WifiOff className="h-4 w-4 text-gray-400" />
  }
}

/**
 * Get label for connection status
 */
const getStatusLabel = (status: ConnectionStatus): string => {
  switch (status) {
    case "connected":
      return "Connected"
    case "connecting":
      return "Connecting..."
    case "syncing":
      return "Syncing..."
    case "disconnected":
      return "Offline"
  }
}

/**
 * Get color class for status badge
 */
const getStatusColorClass = (status: ConnectionStatus): string => {
  switch (status) {
    case "connected":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "connecting":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "syncing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "disconnected":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }
}

/**
 * Connection status indicator component
 */
export function ConnectionIndicator({
  ontologyId,
  className = ""
}: ConnectionIndicatorProps) {
  const [status] = useAtom(connectionStatusAtom(ontologyId))

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(status)} ${className}`}
      title={`Event sync: ${getStatusLabel(status)}`}
    >
      {getStatusIcon(status)}
      <span>{getStatusLabel(status)}</span>
    </div>
  )
}

/**
 * Minimal connection indicator (icon only)
 */
export function ConnectionIndicatorIcon({
  ontologyId,
  className = ""
}: ConnectionIndicatorProps) {
  const [status] = useAtom(connectionStatusAtom(ontologyId))

  return (
    <span
      className={`inline-flex items-center ${className}`}
      title={`Event sync: ${getStatusLabel(status)}`}
    >
      {getStatusIcon(status)}
    </span>
  )
}
