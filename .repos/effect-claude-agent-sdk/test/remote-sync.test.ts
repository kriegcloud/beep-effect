import { test, expect } from "bun:test"
import { buildRemoteUrl } from "../src/Sync/RemoteSync.js"

test("buildRemoteUrl requires a tenant for event-log", () => {
  expect(() => buildRemoteUrl("wss://sync.example.com")).toThrow(
    "Remote sync requires a tenant when using /event-log."
  )
})

test("buildRemoteUrl appends tenant and token", () => {
  const url = buildRemoteUrl("wss://sync.example.com/event-log", {
    tenant: "demo",
    authToken: "token-123"
  })
  expect(url).toBe("wss://sync.example.com/event-log/demo?token=token-123")
})

test("buildRemoteUrl preserves custom path", () => {
  const url = buildRemoteUrl("wss://sync.example.com/custom", {
    tenant: "demo"
  })
  expect(url).toBe("wss://sync.example.com/custom")
})

test("buildRemoteUrl rejects invalid tenant format", () => {
  expect(() =>
    buildRemoteUrl("wss://sync.example.com/event-log", {
      tenant: "bad/tenant"
    })
  ).toThrow("Invalid tenant format.")
})
