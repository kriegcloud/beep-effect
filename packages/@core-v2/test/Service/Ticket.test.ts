import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { TicketService } from "../../src/Service/Ticket.js"

describe("TicketService", () => {
  it.effect("creates a ticket with correct properties", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const ontologyId = "test-ontology"
      const apiKey = "test-api-key"

      const result = yield* ticketService.createTicket(ontologyId, apiKey)

      expect(result.ticket).toBeDefined()
      expect(result.ticket.length).toBeGreaterThan(20) // Base64url encoded 32 bytes
      // expiresAt should be a positive number (will be 300000 with TestClock at 0)
      expect(result.expiresAt).toBeGreaterThan(0)
      expect(result.ttlSeconds).toBe(300) // Default 5 minutes
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("validates a ticket successfully (single-use)", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const ontologyId = "test-ontology"
      const apiKey = "test-api-key"

      // Create ticket
      const { ticket } = yield* ticketService.createTicket(ontologyId, apiKey)

      // Validate ticket (should succeed)
      const validatedOntologyId = yield* ticketService.validateTicket(ticket)
      expect(validatedOntologyId).toBe(ontologyId)

      // Validate again (should fail - single-use)
      const result = yield* ticketService.validateTicket(ticket).pipe(
        Effect.either
      )
      expect(result._tag).toBe("Left")
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("rejects invalid ticket", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService

      const result = yield* ticketService.validateTicket("invalid-ticket").pipe(
        Effect.either
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("TicketNotFoundError")
      }
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("hasTicket returns true for valid ticket", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const ontologyId = "test-ontology"
      const apiKey = "test-api-key"

      const { ticket } = yield* ticketService.createTicket(ontologyId, apiKey)

      const exists = yield* ticketService.hasTicket(ticket)
      expect(exists).toBe(true)

      const notExists = yield* ticketService.hasTicket("non-existent")
      expect(notExists).toBe(false)
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("getActiveCount tracks active tickets", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const apiKey = "test-api-key"

      // Create 3 tickets
      yield* ticketService.createTicket("onto-1", apiKey)
      yield* ticketService.createTicket("onto-2", apiKey)
      yield* ticketService.createTicket("onto-3", apiKey)

      const count = yield* ticketService.getActiveCount()
      expect(count).toBe(3)
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("validates API key - missing", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const validKeys = new Set(["key1", "key2"])

      const result = yield* ticketService.validateApiKey(undefined, validKeys).pipe(
        Effect.either
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("AuthenticationError")
        expect(result.left.reason).toBe("missing")
      }
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("validates API key - invalid", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const validKeys = new Set(["key1", "key2"])

      const result = yield* ticketService.validateApiKey("wrong-key", validKeys).pipe(
        Effect.either
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("AuthenticationError")
        expect(result.left.reason).toBe("invalid")
      }
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("validates API key - valid", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const validKeys = new Set(["key1", "key2"])

      const result = yield* ticketService.validateApiKey("key1", validKeys)
      expect(result).toBe("key1")
    }).pipe(Effect.provide(TicketService.Default)))

  it.effect("respects custom TTL", () =>
    Effect.gen(function*() {
      const ticketService = yield* TicketService
      const ontologyId = "test-ontology"
      const apiKey = "test-api-key"
      const customTtlMs = 60_000 // 1 minute

      const result = yield* ticketService.createTicket(ontologyId, apiKey, customTtlMs)

      expect(result.ttlSeconds).toBe(60)
      // With TestClock at 0, expiresAt should equal the TTL
      expect(result.expiresAt).toBe(customTtlMs)
    }).pipe(Effect.provide(TicketService.Default)))
})
