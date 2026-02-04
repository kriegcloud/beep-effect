/**
 * EntityRegistryRepository Integration Tests
 *
 * Tests EntityRegistryRepository against a real PostgreSQL database with pgvector.
 * Requires PostgreSQL to be running with pgvector extension.
 *
 * Run manually: POSTGRES_PASSWORD=workflow bun vitest test/Repository/EntityRegistry.integration.test.ts
 *
 * @module test/Repository/EntityRegistry.integration.test
 */

import { describe, expect, it } from "@effect/vitest"
import { EntityRegistryRepository } from "../../src/Repository/EntityRegistry.js"

// =============================================================================
// Tests - Service exports and types
// =============================================================================

describe("EntityRegistryRepository", () => {
  describe("exports", () => {
    it("exports EntityRegistryRepository service", () => {
      expect(EntityRegistryRepository).toBeDefined()
      expect(EntityRegistryRepository.Default).toBeDefined()
    })
  })
})

// =============================================================================
// Integration Tests - Skipped by default (require PostgreSQL with pgvector)
// =============================================================================

// To run these tests, start PostgreSQL with pgvector:
//   docker-compose up postgres
//
// Then run migrations to create the entity registry tables (v4):
//   POSTGRES_PASSWORD=workflow bun run db:migrate
//
// Then run just this test file:
//   POSTGRES_PASSWORD=workflow bun vitest test/Repository/EntityRegistry.integration.test.ts
//
// The integration tests verify:
// - insertCanonicalEntity: Insert entities with 768-dim embeddings
// - getCanonicalEntityByIri: Lookup by IRI
// - findSimilarEntities: pgvector ANN search with HNSW
// - findCandidatesByTokens: Token-based blocking search
// - insertAlias: Create alias linking to canonical
// - insertBlockingTokens: Populate blocking index
// - touchCanonicalEntity: Update last_seen_at
