import { ChatClient } from "@template/client/ChatClient"
import { RegistryContext, useAtomValue } from "@effect/atom-react"
import { Effect, ServiceMap } from "effect"
import * as React from "react"
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import {
  availableChannelsAtom,
  channelIdAtom,
  connectionStatusAtom,
  modalAtom,
  themeIdAtom
} from "./atoms/session.js"
import { ChatPane } from "./components/ChatPane.js"
import { InputBar } from "./components/InputBar.js"
import { ModalLayer } from "./components/ModalLayer.js"
import type { PaletteCommand } from "./components/ModalLayer.js"
import { StatusBar } from "./components/StatusBar.js"
import { SidePanel } from "./components/SidePanel.js"
import { useDecideCheckpoint } from "./hooks/useDecideCheckpoint.js"
import { useSendMessage } from "./hooks/useSendMessage.js"
import { useTheme } from "./hooks/useTheme.js"
import { applyRestoredHistory, restoreHistory } from "./state/restoreHistory.js"
import { themes, type ThemeId } from "./theme.js"

type ChatClientShape = ServiceMap.Service.Shape<typeof ChatClient>

const DEFAULT_AGENT_ID = "agent:bootstrap"

const themeIds = Object.keys(themes) as ReadonlyArray<ThemeId>

export function App({ client }: { readonly client: ChatClientShape }) {
  const theme = useTheme()
  const registry = React.useContext(RegistryContext)
  const initializedRef = React.useRef(false)
  const sendMessage = useSendMessage(client)
  const decideCheckpoint = useDecideCheckpoint(client)
  const activeModal = useAtomValue(modalAtom)
  const activeChannelId = useAtomValue(channelIdAtom)
  const availableChannels = useAtomValue(availableChannelsAtom)
  const { width } = useTerminalDimensions()
  const inputRef = React.useRef(null)

  const layout: "compact" | "medium" | "wide" = width < 80 ? "compact" : width < 120 ? "medium" : "wide"

  const refreshChannels = React.useCallback(() => {
    const load = Effect.gen(function*() {
      const channels = yield* client.listChannels(DEFAULT_AGENT_ID)
      registry.set(availableChannelsAtom, channels)
    }).pipe(
      Effect.catch((error) =>
        Effect.sync(() => {
          console.error("Loading channels failed:", error)
        })
      )
    )
    Effect.runFork(load)
  }, [registry, client])

  const restoreChannel = React.useCallback((channelId: string) => {
    const program = Effect.gen(function*() {
      registry.set(connectionStatusAtom, "connecting")
      registry.set(channelIdAtom, channelId)
      yield* client.initialize(channelId, DEFAULT_AGENT_ID)
      const history = yield* client.getHistory(channelId)
      applyRestoredHistory(registry, restoreHistory(history))
      registry.set(connectionStatusAtom, "connected")
    }).pipe(
      Effect.catch((error) =>
        Effect.sync(() => {
          console.error("Channel restore failed:", error)
          registry.set(connectionStatusAtom, "error")
        })
      )
    )
    Effect.runFork(program)
  }, [registry, client])

  const selectChannel = React.useCallback((channelId: string) => {
    registry.set(modalAtom, null)
    if (channelId === activeChannelId) {
      return
    }
    restoreChannel(channelId)
  }, [registry, restoreChannel, activeChannelId])

  const deleteSelectedChannel = React.useCallback((targetChannelId: string) => {
    const program = Effect.gen(function*() {
      registry.set(connectionStatusAtom, "connecting")
      yield* client.deleteChannel(targetChannelId)

      const channels = yield* client.listChannels(DEFAULT_AGENT_ID)
      registry.set(availableChannelsAtom, channels)

      if (targetChannelId !== activeChannelId) {
        registry.set(connectionStatusAtom, "connected")
        return
      }

      if (channels.length === 0) {
        const freshChannelId = `channel:${crypto.randomUUID()}`
        registry.set(channelIdAtom, freshChannelId)
        yield* client.initialize(freshChannelId, DEFAULT_AGENT_ID)
        const history = yield* client.getHistory(freshChannelId)
        applyRestoredHistory(registry, restoreHistory(history))
        registry.set(connectionStatusAtom, "connected")
        return
      }

      const nextChannelId = channels[0]!.channelId
      registry.set(channelIdAtom, nextChannelId)
      yield* client.initialize(nextChannelId, DEFAULT_AGENT_ID)
      const history = yield* client.getHistory(nextChannelId)
      applyRestoredHistory(registry, restoreHistory(history))
      registry.set(connectionStatusAtom, "connected")
    }).pipe(
      Effect.catch((error) =>
        Effect.sync(() => {
          console.error("Delete channel failed:", error)
          registry.set(connectionStatusAtom, "error")
        })
      )
    )

    Effect.runFork(program)
  }, [registry, client, activeChannelId])

  const cycleTheme = React.useCallback(() => {
    const currentId = registry.get(themeIdAtom)
    const idx = themeIds.indexOf(currentId)
    const nextId = themeIds[(idx + 1) % themeIds.length]!
    registry.set(themeIdAtom, nextId)
  }, [registry])

  const commands: ReadonlyArray<PaletteCommand> = React.useMemo(() => [
    {
      id: "new-session",
      label: "New Session",
      shortcut: "Ctrl+N",
      action: () => {
        registry.set(modalAtom, null)
        const freshChannelId = `channel:${crypto.randomUUID()}`
        restoreChannel(freshChannelId)
      }
    },
    {
      id: "switch-session",
      label: "Switch Session",
      shortcut: "Ctrl+S",
      action: () => {
        refreshChannels()
        registry.set(modalAtom, "session-picker")
      }
    },
    {
      id: "memory-search",
      label: "Memory Search",
      shortcut: "Ctrl+M",
      action: () => registry.set(modalAtom, "memory-search")
    },
    {
      id: "settings",
      label: "Settings",
      shortcut: "Ctrl+,",
      action: () => registry.set(modalAtom, "settings")
    },
    {
      id: "tool-inspector",
      label: "Tool Inspector",
      action: () => registry.set(modalAtom, "tool-inspector")
    },
    {
      id: "switch-theme",
      label: "Switch Theme",
      action: cycleTheme
    }
  ], [registry, refreshChannels, restoreChannel, cycleTheme])

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      process.exit(0)
    }

    if (key.name === "escape" && activeModal !== null) {
      registry.set(modalAtom, null)
      return
    }

    if (key.ctrl && key.name === "k") {
      registry.set(modalAtom, "command-palette")
      return
    }
    if (key.ctrl && key.name === "s") {
      refreshChannels()
      registry.set(modalAtom, "session-picker")
      return
    }
    if (key.ctrl && key.name === ",") {
      registry.set(modalAtom, "settings")
      return
    }
    if (key.ctrl && key.name === "m") {
      registry.set(modalAtom, "memory-search")
      return
    }
    if (key.ctrl && key.name === "n") {
      const freshChannelId = `channel:${crypto.randomUUID()}`
      restoreChannel(freshChannelId)
      return
    }

    if (activeModal === "session-picker" && key.name === "x") {
      deleteSelectedChannel(activeChannelId)
      return
    }
  })

  const closeModal = React.useCallback(() => {
    registry.set(modalAtom, null)
  }, [registry])

  React.useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true

    const init = Effect.gen(function*() {
      registry.set(connectionStatusAtom, "connecting")
      const channels = yield* client.listChannels(DEFAULT_AGENT_ID)
      registry.set(availableChannelsAtom, channels)
      const chId = channels[0]?.channelId ?? `channel:${crypto.randomUUID()}`
      registry.set(channelIdAtom, chId)

      yield* client.initialize(chId, DEFAULT_AGENT_ID)
      registry.set(connectionStatusAtom, "connected")

      const history = yield* client.getHistory(chId)
      applyRestoredHistory(registry, restoreHistory(history))
    }).pipe(
      Effect.catch((error) =>
        Effect.sync(() => {
          console.error("Channel initialization failed:", error)
          registry.set(connectionStatusAtom, "error")
        })
      )
    )
    Effect.runFork(init)
  }, [registry, client])

  return (
    <ModalLayer
        activeModal={activeModal}
        onClose={closeModal}
        sessionPicker={{
          channels: availableChannels,
          activeChannelId,
          selectedIndex: 0,
          onSelect: selectChannel,
          onDelete: deleteSelectedChannel
        }}
        commands={commands}
      >
        <box flexDirection="column" flexGrow={1} backgroundColor={theme.bg}>
          <box flexDirection="row" flexGrow={1}>
            <ChatPane />
            {layout !== "compact" && <SidePanel compact={layout === "medium"} />}
          </box>
          <InputBar
            onSubmit={sendMessage}
            onDecision={decideCheckpoint}
            focused={activeModal === null}
            inputRef={inputRef}
          />
          <StatusBar compact={layout === "compact"} />
        </box>
    </ModalLayer>
  )
}
