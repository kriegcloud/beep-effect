#!/usr/bin/env bun

import { ChatClient } from "@template/client/ChatClient"
import { RegistryContext } from "@effect/atom-react"
import { BunHttpClient } from "@effect/platform-bun"
import { Effect } from "effect"
import { AtomRegistry } from "effect/unstable/reactivity"
import { createCliRenderer, SyntaxStyle } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App.js"
import { SyntaxStyleContext } from "./components/SyntaxStyleContext.js"

// Build the ChatClient service — resolves Config + HttpClient dependencies.
const client = await Effect.runPromise(
  ChatClient.make.pipe(Effect.provide(BunHttpClient.layer))
)

// Create shared atom registry — single instance for the entire app
const registry = AtomRegistry.make()

const syntaxStyle = SyntaxStyle.create()

const renderer = await createCliRenderer()
const root = createRoot(renderer)

// RegistryContext.Provider MUST wrap App so that useContext(RegistryContext)
// inside useSendMessage and all components reads from this registry.
root.render(
  <RegistryContext.Provider value={registry}>
    <SyntaxStyleContext.Provider value={syntaxStyle}>
      <App client={client} />
    </SyntaxStyleContext.Provider>
  </RegistryContext.Provider>
)
