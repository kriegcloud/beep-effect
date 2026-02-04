/**
 * Tests for KnowledgeModel Schema
 *
 * @since 2.0.0
 * @module Test/Domain/Schema/KnowledgeModel
 */

import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect, Schema } from "effect"
import { GcsUri } from "../../../src/Domain/Identity.js"
import type { IRI } from "../../../src/Domain/Rdf/Types.js"
import {
  AssertionId,
  EntityRef,
  Event,
  EventId,
  eventIdFromHash,
  EventType
} from "../../../src/Domain/Schema/KnowledgeModel.js"

describe("KnowledgeModel Event Schema", () => {
  describe("EventId", () => {
    it.effect("accepts valid event ID format", () =>
      Effect.gen(function*() {
        const validId = "event-abc123def456"
        const result = Schema.decodeUnknownSync(EventId)(validId)
        expect(result).toBe(validId)
      }))

    it.effect("rejects invalid event ID format", () =>
      Effect.gen(function*() {
        const invalidIds = [
          "event-abc", // too short
          "event-ABC123DEF456", // uppercase
          "evt-abc123def456", // wrong prefix
          "abc123def456", // no prefix
          "event-abc123def456g" // too long
        ]

        for (const id of invalidIds) {
          expect(() => Schema.decodeUnknownSync(EventId)(id)).toThrow()
        }
      }))
  })

  describe("EventType", () => {
    it.effect("accepts all valid event types", () =>
      Effect.gen(function*() {
        const validTypes = [
          "StaffAnnouncement",
          "PolicyInitiative",
          "CouncilVote",
          "Appointment",
          "BudgetAction",
          "PublicMeeting",
          "Generic"
        ]

        for (const type of validTypes) {
          const result = Schema.decodeUnknownSync(EventType)(type)
          expect(result).toBe(type)
        }
      }))

    it.effect("rejects invalid event types", () =>
      Effect.gen(function*() {
        expect(() => Schema.decodeUnknownSync(EventType)("InvalidType")).toThrow()
        expect(() => Schema.decodeUnknownSync(EventType)("")).toThrow()
      }))
  })

  describe("EntityRef", () => {
    it.effect("accepts entity reference with all fields", () =>
      Effect.gen(function*() {
        const ref = {
          iri: "http://example.org/person/jane_doe",
          role: "appointee",
          label: "Jane Doe"
        }
        const result = Schema.decodeUnknownSync(EntityRef)(ref)
        expect(result.iri).toBe(ref.iri)
        expect(result.role).toBe(ref.role)
        expect(result.label).toBe(ref.label)
      }))

    it.effect("accepts entity reference with only required fields", () =>
      Effect.gen(function*() {
        const ref = {
          iri: "http://example.org/person/jane_doe"
        }
        const result = Schema.decodeUnknownSync(EntityRef)(ref)
        expect(result.iri).toBe(ref.iri)
        expect(result.role).toBeUndefined()
        expect(result.label).toBeUndefined()
      }))
  })

  describe("Event", () => {
    const validEvent = {
      id: "event-abc123def456",
      type: "StaffAnnouncement",
      title: "City Manager Announces New Finance Director",
      publishedAt: "2024-01-15T14:30:00Z",
      participants: [
        { iri: "http://example.org/person/jane_doe", role: "appointee" }
      ],
      factGroup: [],
      sourceDocuments: ["gs://bucket-name/docs/press-release.txt"]
    }

    it.effect("accepts valid event with all fields", () =>
      Effect.gen(function*() {
        const fullEvent = {
          ...validEvent,
          eventTime: "2024-01-15T09:00:00Z",
          ingestedAt: "2024-01-15T15:00:00Z",
          summary: "Jane Doe appointed as new Finance Director",
          tags: ["finance", "appointment"]
        }

        const result = Schema.decodeUnknownSync(Event)(fullEvent)
        expect(result.id).toBe(fullEvent.id)
        expect(result.type).toBe(fullEvent.type)
        expect(result.title).toBe(fullEvent.title)
        expect(result.summary).toBe(fullEvent.summary)
        expect(result.tags).toEqual(fullEvent.tags)
      }))

    it.effect("accepts event with minimal required fields", () =>
      Effect.gen(function*() {
        const minimalEvent = {
          id: "event-abc123def456",
          type: "Generic",
          publishedAt: "2024-01-15T14:30:00Z",
          participants: [],
          factGroup: [],
          sourceDocuments: ["gs://bucket-name/docs/document.txt"]
        }

        const result = Schema.decodeUnknownSync(Event)(minimalEvent)
        expect(result.id).toBe(minimalEvent.id)
        expect(result.type).toBe("Generic")
        expect(result.title).toBeUndefined()
        expect(result.eventTime).toBeUndefined()
      }))

    it.effect("rejects event without source documents", () =>
      Effect.gen(function*() {
        const invalidEvent = {
          id: "event-abc123def456",
          type: "Generic",
          publishedAt: "2024-01-15T14:30:00Z",
          participants: [],
          factGroup: [],
          sourceDocuments: [] // NonEmptyArray requires at least one
        }

        expect(() => Schema.decodeUnknownSync(Event)(invalidEvent)).toThrow()
      }))

    it.effect("accepts event with multiple participants", () =>
      Effect.gen(function*() {
        const eventWithParticipants = {
          ...validEvent,
          participants: [
            { iri: "http://example.org/person/jane_doe", role: "appointee", label: "Jane Doe" },
            { iri: "http://example.org/person/city_manager", role: "announcer", label: "City Manager" },
            { iri: "http://example.org/org/city_council", role: "approver" }
          ]
        }

        const result = Schema.decodeUnknownSync(Event)(eventWithParticipants)
        expect(result.participants.length).toBe(3)
        expect(result.participants[0].role).toBe("appointee")
        expect(result.participants[1].role).toBe("announcer")
      }))

    it.effect("accepts event with fact group", () =>
      Effect.gen(function*() {
        const eventWithFacts = {
          ...validEvent,
          factGroup: [
            "assertion-111111111111",
            "assertion-222222222222"
          ]
        }

        const result = Schema.decodeUnknownSync(Event)(eventWithFacts)
        expect(result.factGroup.length).toBe(2)
      }))
  })

  describe("eventIdFromHash", () => {
    it.effect("creates valid EventId from hash", () =>
      Effect.gen(function*() {
        const hash = "abc123def456789"
        const eventId = eventIdFromHash(hash)
        expect(eventId).toBe("event-abc123def456")

        // Verify it's a valid EventId
        const result = Schema.decodeUnknownSync(EventId)(eventId)
        expect(result).toBe(eventId)
      }))

    it.effect("truncates long hashes to 12 chars", () =>
      Effect.gen(function*() {
        const longHash = "abcdef123456789abcdef123456789"
        const eventId = eventIdFromHash(longHash)
        expect(eventId).toBe("event-abcdef123456")
      }))
  })
})
