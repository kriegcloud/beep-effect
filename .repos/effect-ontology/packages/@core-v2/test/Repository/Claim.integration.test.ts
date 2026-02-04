/**
 * ClaimRepository Integration Tests
 *
 * Tests ClaimRepository against a real PostgreSQL database.
 * Requires PostgreSQL to be running (docker-compose up postgres).
 *
 * @module test/Repository/Claim.integration.test
 */

import * as Pg from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import { describe, expect, it } from "@effect/vitest"
import { Config, ConfigProvider, Effect, Layer, Option } from "effect"
import { ArticleRepository } from "../../src/Repository/Article.js"
import { ClaimRepository } from "../../src/Repository/Claim.js"
import type { ArticleInsertRow, ClaimInsertRow } from "../../src/Repository/schema.js"
import { ClaimPersistenceService } from "../../src/Service/ClaimPersistence.js"
import type { ClaimData } from "../../src/Utils/ClaimFactory.js"
import { generateClaimId } from "../../src/Utils/ClaimFactory.js"

// =============================================================================
// Test Configuration
// =============================================================================

const TestConfig = ConfigProvider.fromMap(
  new Map([
    ["POSTGRES_HOST", "localhost"],
    ["POSTGRES_PORT", "5432"],
    ["POSTGRES_DATABASE", "workflow"],
    ["POSTGRES_USER", "workflow"],
    ["POSTGRES_PASSWORD", "workflow"]
  ])
)

const PgClientLive = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT"),
  database: Config.string("POSTGRES_DATABASE"),
  username: Config.string("POSTGRES_USER"),
  password: Config.redacted("POSTGRES_PASSWORD"),
  ssl: Config.boolean("POSTGRES_SSL").pipe(Config.withDefault(false))
}).pipe(Layer.provide(Layer.setConfigProvider(TestConfig)))

const DrizzleLive = Pg.layer.pipe(Layer.provide(PgClientLive))

const TestLayer = Layer.mergeAll(
  ClaimRepository.Default,
  ArticleRepository.Default
).pipe(Layer.provide(DrizzleLive))

// Layer with ClaimPersistenceService for persistence tests
const PersistenceTestLayer = Layer.mergeAll(
  ClaimPersistenceService.Default,
  ClaimRepository.Default,
  ArticleRepository.Default
).pipe(Layer.provide(DrizzleLive))

// =============================================================================
// Test Fixtures
// =============================================================================

const makeTestArticle = (suffix: string): ArticleInsertRow => ({
  uri: `https://example.com/article-${suffix}-${Date.now()}`,
  ontologyId: "test-ontology",
  sourceName: "Test Source",
  headline: `Test Article ${suffix}`,
  publishedAt: new Date()
})

const makeTestClaim = (articleId: string, suffix: string): ClaimInsertRow => ({
  ontologyId: "test-ontology",
  articleId,
  subjectIri: `http://example.com/entity/${suffix}`,
  predicateIri: "http://example.com/predicate/hasRole",
  objectValue: `http://example.com/role/${suffix}`,
  objectType: "iri",
  rank: "normal",
  confidenceScore: "0.95"
})

// =============================================================================
// Tests
// =============================================================================

describe("ClaimRepository Integration", () => {
  describe("CRUD Operations", () => {
    it.effect("should insert and retrieve an article", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const article = makeTestArticle("crud-1")
        const inserted = yield* articleRepo.insertArticle(article)

        expect(inserted.id).toBeDefined()
        expect(inserted.uri).toBe(article.uri)
        expect(inserted.sourceName).toBe(article.sourceName)

        const retrieved = yield* articleRepo.getArticle(inserted.id)
        expect(Option.isSome(retrieved)).toBe(true)
        if (Option.isSome(retrieved)) {
          expect(retrieved.value.uri).toBe(article.uri)
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should insert and retrieve a claim", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("crud-2"))
        const claim = makeTestClaim(article.id, "test-entity-1")
        const inserted = yield* claimRepo.insertClaim(claim)

        expect(inserted.id).toBeDefined()
        expect(inserted.subjectIri).toBe(claim.subjectIri)
        expect(inserted.rank).toBe("normal")

        const retrieved = yield* claimRepo.getClaim(inserted.id)
        expect(Option.isSome(retrieved)).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should get claims by article", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("by-article"))

        yield* claimRepo.insertClaim(makeTestClaim(article.id, "entity-a"))
        yield* claimRepo.insertClaim(makeTestClaim(article.id, "entity-b"))
        yield* claimRepo.insertClaim(makeTestClaim(article.id, "entity-c"))

        const claims = yield* claimRepo.getClaimsByArticle(article.id)
        expect(claims.length).toBeGreaterThanOrEqual(3)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Query Operations", () => {
    it.effect("should get claims by subject IRI", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("by-subject"))
        const subjectIri = `http://example.com/entity/query-test-${Date.now()}`

        yield* claimRepo.insertClaim({ ...makeTestClaim(article.id, "x"), subjectIri })
        yield* claimRepo.insertClaim({ ...makeTestClaim(article.id, "y"), subjectIri })

        const claims = yield* claimRepo.getClaimsBySubject(subjectIri)
        expect(claims.length).toBeGreaterThanOrEqual(2)
        claims.forEach((c) => expect(c.subjectIri).toBe(subjectIri))
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should get preferred claims only", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("preferred"))
        const subjectIri = `http://example.com/entity/pref-${Date.now()}`
        const predicateIri = "http://example.com/predicate/testProp"

        yield* claimRepo.insertClaim({
          ontologyId: "test-ontology",
          articleId: article.id,
          subjectIri,
          predicateIri,
          objectValue: "preferred-value",
          rank: "preferred"
        })

        yield* claimRepo.insertClaim({
          ontologyId: "test-ontology",
          articleId: article.id,
          subjectIri,
          predicateIri,
          objectValue: "normal-value",
          rank: "normal"
        })

        const preferred = yield* claimRepo.getPreferredClaims(subjectIri, predicateIri)
        expect(preferred.length).toBe(1)
        expect(preferred[0].objectValue).toBe("preferred-value")
        expect(preferred[0].rank).toBe("preferred")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should get claim history including deprecated", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("history"))
        const subjectIri = `http://example.com/entity/hist-${Date.now()}`
        const predicateIri = "http://example.com/predicate/histProp"

        yield* claimRepo.insertClaim({
          ontologyId: "test-ontology",
          articleId: article.id,
          subjectIri,
          predicateIri,
          objectValue: "old-value",
          rank: "deprecated"
        })

        yield* claimRepo.insertClaim({
          ontologyId: "test-ontology",
          articleId: article.id,
          subjectIri,
          predicateIri,
          objectValue: "new-value",
          rank: "preferred"
        })

        const history = yield* claimRepo.getClaimHistory(subjectIri, predicateIri)
        expect(history.length).toBe(2)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Deprecation Workflow", () => {
    it.effect("should deprecate a claim", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("deprecate"))
        const claim = yield* claimRepo.insertClaim(makeTestClaim(article.id, "to-deprecate"))

        const correction = yield* claimRepo.insertCorrection({
          correctionType: "update",
          correctionDate: new Date(),
          reason: "Test deprecation"
        })

        yield* claimRepo.deprecateClaim(claim.id, correction.id)

        const updated = yield* claimRepo.getClaim(claim.id)
        expect(Option.isSome(updated)).toBe(true)
        if (Option.isSome(updated)) {
          expect(updated.value.rank).toBe("deprecated")
          expect(updated.value.deprecatedAt).not.toBeNull()
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should promote claim to preferred", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("promote"))
        const claim = yield* claimRepo.insertClaim({
          ...makeTestClaim(article.id, "to-promote"),
          rank: "normal"
        })

        yield* claimRepo.promoteToPreferred(claim.id)

        const updated = yield* claimRepo.getClaim(claim.id)
        expect(Option.isSome(updated)).toBe(true)
        if (Option.isSome(updated)) {
          expect(updated.value.rank).toBe("preferred")
        }
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Conflict Detection", () => {
    it.effect("should detect position conflicts", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article1 = yield* articleRepo.insertArticle(makeTestArticle("conflict-1"))
        const article2 = yield* articleRepo.insertArticle(makeTestArticle("conflict-2"))

        const subjectIri = `http://example.com/entity/conflict-${Date.now()}`
        const predicateIri = "http://example.com/predicate/position"

        yield* claimRepo.insertClaim({
          ontologyId: "test-ontology",
          articleId: article1.id,
          subjectIri,
          predicateIri,
          objectValue: "value-A",
          rank: "normal"
        })

        const newClaim: ClaimInsertRow = {
          ontologyId: "test-ontology",
          articleId: article2.id,
          subjectIri,
          predicateIri,
          objectValue: "value-B",
          rank: "normal"
        }

        const conflicts = yield* claimRepo.findConflictingClaims(newClaim)
        expect(conflicts.length).toBe(1)
        expect(conflicts[0].conflictType).toBe("position")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Bulk Operations", () => {
    it.effect("should insert claims in batch", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("bulk"))

        const claimBatch: Array<ClaimInsertRow> = [
          makeTestClaim(article.id, "bulk-1"),
          makeTestClaim(article.id, "bulk-2"),
          makeTestClaim(article.id, "bulk-3"),
          makeTestClaim(article.id, "bulk-4"),
          makeTestClaim(article.id, "bulk-5")
        ]

        const inserted = yield* claimRepo.insertClaimsBatch(claimBatch)
        expect(inserted.length).toBe(5)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should count claims with filters", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository
        const claimRepo = yield* ClaimRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("count"))
        const subjectIri = `http://example.com/entity/count-${Date.now()}`

        yield* claimRepo.insertClaimsBatch([
          { ...makeTestClaim(article.id, "c1"), subjectIri, rank: "preferred" },
          { ...makeTestClaim(article.id, "c2"), subjectIri, rank: "normal" },
          { ...makeTestClaim(article.id, "c3"), subjectIri, rank: "normal" }
        ])

        const totalCount = yield* claimRepo.countClaims({ subjectIri })
        expect(totalCount).toBe(3)

        const preferredCount = yield* claimRepo.countClaims({ subjectIri, rank: "preferred" })
        expect(preferredCount).toBe(1)
      }).pipe(Effect.provide(TestLayer)))
  })
})

describe("ArticleRepository Integration", () => {
  describe("CRUD Operations", () => {
    it.effect("should get or create article by URI", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const article = makeTestArticle("upsert")

        const created = yield* articleRepo.getOrCreateArticle(article)
        expect(created.id).toBeDefined()

        const existing = yield* articleRepo.getOrCreateArticle(article)
        expect(existing.id).toBe(created.id)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should update article", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("update"))

        const updated = yield* articleRepo.updateArticle(article.id, {
          headline: "Updated Headline"
        })

        expect(Option.isSome(updated)).toBe(true)
        if (Option.isSome(updated)) {
          expect(updated.value.headline).toBe("Updated Headline")
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should set graph URI", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("graph-uri"))
        const graphUri = "gs://bucket/graphs/test.trig"

        yield* articleRepo.setGraphUri(article.id, graphUri)

        const updated = yield* articleRepo.getArticle(article.id)
        expect(Option.isSome(updated)).toBe(true)
        if (Option.isSome(updated)) {
          expect(updated.value.graphUri).toBe(graphUri)
        }
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Query Operations", () => {
    it.effect("should get articles by source", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const sourceName = `Test Source ${Date.now()}`

        yield* articleRepo.insertArticle({ ...makeTestArticle("src-1"), sourceName })
        yield* articleRepo.insertArticle({ ...makeTestArticle("src-2"), sourceName })

        const articles = yield* articleRepo.getArticlesBySource(sourceName)
        expect(articles.length).toBeGreaterThanOrEqual(2)
        articles.forEach((a) => expect(a.sourceName).toBe(sourceName))
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should get articles in date range", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const now = new Date()
        const hourAgo = new Date(now.getTime() - 3600000)
        const hourFromNow = new Date(now.getTime() + 3600000)

        yield* articleRepo.insertArticle({ ...makeTestArticle("date-range"), publishedAt: now })

        const articles = yield* articleRepo.getArticlesInDateRange(hourAgo, hourFromNow)
        expect(articles.length).toBeGreaterThanOrEqual(1)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should check article existence", () =>
      Effect.gen(function*() {
        const articleRepo = yield* ArticleRepository

        const article = yield* articleRepo.insertArticle(makeTestArticle("exists"))

        const exists = yield* articleRepo.articleExists(article.uri)
        expect(exists).toBe(true)

        const notExists = yield* articleRepo.articleExists("https://nonexistent.example.com")
        expect(notExists).toBe(false)
      }).pipe(Effect.provide(TestLayer)))
  })
})

// =============================================================================
// ClaimPersistenceService Tests
// =============================================================================

const makeTestClaimData = (suffix: string, articleId = "test-article"): ClaimData => {
  const subjectIri = `http://effect-ontology.dev/seattle/Entity_${suffix}`
  const predicateIri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  const objectValue = "http://effect-ontology.dev/seattle/Person"

  return {
    claimId: generateClaimId(subjectIri, predicateIri, objectValue, articleId),
    ontologyId: "test-ontology",
    articleId,
    subjectIri,
    predicateIri,
    objectValue,
    objectType: "iri" as const,
    confidence: 0.92,
    evidence: {
      text: `Test evidence text for ${suffix}`,
      startOffset: 0,
      endOffset: 30
    }
  }
}

describe("ClaimPersistenceService Integration", () => {
  describe("persistClaims", () => {
    it.effect("should persist claims and create article", () =>
      Effect.gen(function*() {
        const persistence = yield* ClaimPersistenceService
        const articleRepo = yield* ArticleRepository

        const claims: Array<ClaimData> = [
          makeTestClaimData("pers-1"),
          makeTestClaimData("pers-2"),
          makeTestClaimData("pers-3")
        ]

        const articleUri = `https://seattletimes.com/article-${Date.now()}`
        const result = yield* persistence.persistClaims(
          claims,
          {
            uri: articleUri,
            ontologyId: "test-ontology",
            headline: "Test Article for Persistence",
            publishedAt: new Date(),
            sourceName: "Seattle Times"
          },
          "gs://test-bucket/graphs/test.trig"
        )

        expect(result.articleId).toBeDefined()
        expect(result.claimsInserted).toBe(3)
        expect(result.claimsTotal).toBe(3)

        // Verify article was created with graph URI
        const article = yield* articleRepo.getArticle(result.articleId)
        expect(Option.isSome(article)).toBe(true)
        if (Option.isSome(article)) {
          expect(article.value.uri).toBe(articleUri)
          expect(article.value.graphUri).toBe("gs://test-bucket/graphs/test.trig")
        }
      }).pipe(Effect.provide(PersistenceTestLayer)))

    it.effect("should be idempotent - skip duplicate claims on re-run", () =>
      Effect.gen(function*() {
        const persistence = yield* ClaimPersistenceService

        const claims: Array<ClaimData> = [
          makeTestClaimData("idem-1"),
          makeTestClaimData("idem-2")
        ]

        const articleUri = `https://seattletimes.com/idempotent-${Date.now()}`
        const articleMeta = {
          uri: articleUri,
          ontologyId: "test-ontology",
          headline: "Idempotency Test",
          publishedAt: new Date(),
          sourceName: "Seattle Times"
        }

        // First run - should insert all claims
        const result1 = yield* persistence.persistClaims(claims, articleMeta)
        expect(result1.claimsInserted).toBe(2)
        expect(result1.claimsTotal).toBe(2)

        // Second run - should skip all claims (duplicates)
        const result2 = yield* persistence.persistClaims(claims, articleMeta)
        expect(result2.claimsInserted).toBe(0)
        expect(result2.claimsTotal).toBe(2)

        // Same article ID should be returned
        expect(result2.articleId).toBe(result1.articleId)
      }).pipe(Effect.provide(PersistenceTestLayer)))

    it.effect("should handle empty claims array", () =>
      Effect.gen(function*() {
        const persistence = yield* ClaimPersistenceService

        const articleUri = `https://seattletimes.com/empty-${Date.now()}`
        const result = yield* persistence.persistClaims(
          [],
          {
            uri: articleUri,
            ontologyId: "test-ontology",
            headline: "Empty Claims Test",
            publishedAt: new Date()
          }
        )

        expect(result.claimsInserted).toBe(0)
        expect(result.claimsTotal).toBe(0)
        // Article should still be created
        expect(result.articleId).toBeDefined()
      }).pipe(Effect.provide(PersistenceTestLayer)))

    it.effect("should persist claims with temporal validity", () =>
      Effect.gen(function*() {
        const persistence = yield* ClaimPersistenceService
        const claimRepo = yield* ClaimRepository

        const now = new Date()
        const future = new Date(now.getTime() + 86400000) // +1 day

        const claims: Array<ClaimData> = [
          {
            ...makeTestClaimData("temporal"),
            validFrom: now,
            validTo: future
          }
        ]

        const articleUri = `https://seattletimes.com/temporal-${Date.now()}`
        const result = yield* persistence.persistClaims(
          claims,
          {
            uri: articleUri,
            ontologyId: "test-ontology",
            headline: "Temporal Validity Test",
            publishedAt: new Date()
          }
        )

        expect(result.claimsInserted).toBe(1)

        // Verify temporal fields were saved
        const savedClaims = yield* claimRepo.getClaimsByArticle(result.articleId)
        const temporalClaim = savedClaims.find(
          (c) => c.subjectIri.includes("temporal")
        )
        expect(temporalClaim).toBeDefined()
        expect(temporalClaim?.validFrom).toBeDefined()
        expect(temporalClaim?.validTo).toBeDefined()
      }).pipe(Effect.provide(PersistenceTestLayer)))
  })
})
