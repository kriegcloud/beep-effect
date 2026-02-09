"use server";

import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type {
  AssembledEntity,
  EntityCluster,
  ExtractionResult,
  ExtractionSession,
  GraphRAGConfig,
  GraphRAGResult,
  Relation,
  ResolutionResult,
  SameAsLink,
} from "./types";

const E = {
  john: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__person-john-smith-mock-0001"),
  sarah: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__person-sarah-chen-mock-0002"),
  mike: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__person-mike-wilson-mock-0003"),
  alex: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__person-alex-rodriguez-mock-0004"),
  lisa: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__person-lisa-park-mock-0005"),
  acme: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__org-acme-corp-mock-0006"),
  engTeam: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__org-engineering-team-mock-0007"),
  platformTeam: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__org-platform-team-mock-0008"),
  q4Release: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__project-q4-release-mock-0009"),
  budgetReview: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__project-budget-review-mock-0010"),
} as const;

const Rel = {
  johnWorksAcme: KnowledgeEntityIds.RelationId.make("knowledge_relation__john-works-acme-mock-0001"),
  sarahWorksAcme: KnowledgeEntityIds.RelationId.make("knowledge_relation__sarah-works-acme-mock-0002"),
  mikeWorksAcme: KnowledgeEntityIds.RelationId.make("knowledge_relation__mike-works-acme-mock-0003"),
  sarahMemberEng: KnowledgeEntityIds.RelationId.make("knowledge_relation__sarah-member-eng-mock-0004"),
  mikeMemberEng: KnowledgeEntityIds.RelationId.make("knowledge_relation__mike-member-eng-mock-0005"),
  lisaMemberEng: KnowledgeEntityIds.RelationId.make("knowledge_relation__lisa-member-eng-mock-0006"),
  alexMemberPlatform: KnowledgeEntityIds.RelationId.make("knowledge_relation__alex-member-platform-mock-0007"),
  sarahReportsJohn: KnowledgeEntityIds.RelationId.make("knowledge_relation__sarah-reports-john-mock-0008"),
  mikeReportsJohn: KnowledgeEntityIds.RelationId.make("knowledge_relation__mike-reports-john-mock-0009"),
  johnLeadsQ4: KnowledgeEntityIds.RelationId.make("knowledge_relation__john-leads-q4-mock-0010"),
  sarahContributesQ4: KnowledgeEntityIds.RelationId.make("knowledge_relation__sarah-contributes-q4-mock-0011"),
  mikeContributesQ4: KnowledgeEntityIds.RelationId.make("knowledge_relation__mike-contributes-q4-mock-0012"),
  johnPresentsBudget: KnowledgeEntityIds.RelationId.make("knowledge_relation__john-presents-budget-mock-0013"),
  q4Deadline: KnowledgeEntityIds.RelationId.make("knowledge_relation__q4-deadline-mock-0014"),
  budgetQuarter: KnowledgeEntityIds.RelationId.make("knowledge_relation__budget-quarter-mock-0015"),
  engTeamPartAcme: KnowledgeEntityIds.RelationId.make("knowledge_relation__eng-team-part-acme-mock-0016"),
  platformTeamPartAcme: KnowledgeEntityIds.RelationId.make("knowledge_relation__platform-team-part-acme-mock-0017"),
  johnRole: KnowledgeEntityIds.RelationId.make("knowledge_relation__john-role-mock-0018"),
  sarahRole: KnowledgeEntityIds.RelationId.make("knowledge_relation__sarah-role-mock-0019"),
  mikeRole: KnowledgeEntityIds.RelationId.make("knowledge_relation__mike-role-mock-0020"),
} as const;

const MOCK_ENTITIES: AssembledEntity[] = [
  {
    id: E.john,
    mention: "John Smith",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Senior Engineering Manager", email: "john.smith@acmecorp.com" },
    confidence: 0.95,
    canonicalName: "John Smith",
  },
  {
    id: E.sarah,
    mention: "Sarah Chen",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "UX Lead" },
    confidence: 0.92,
    canonicalName: "Sarah Chen",
  },
  {
    id: E.mike,
    mention: "Mike Wilson",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Tech Lead" },
    confidence: 0.93,
    canonicalName: "Mike Wilson",
  },
  {
    id: E.alex,
    mention: "Alex Rodriguez",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Platform team member" },
    confidence: 0.88,
    canonicalName: "Alex Rodriguez",
  },
  {
    id: E.lisa,
    mention: "Lisa Park",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Engineering team member" },
    confidence: 0.87,
    canonicalName: "Lisa Park",
  },
  {
    id: E.acme,
    mention: "Acme Corp",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization"],
    attributes: {},
    confidence: 0.98,
    canonicalName: "Acme Corp",
  },
  {
    id: E.engTeam,
    mention: "Engineering team",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization", "http://example.org/Team"],
    attributes: { department: "Engineering" },
    confidence: 0.85,
    canonicalName: "Engineering Team",
  },
  {
    id: E.platformTeam,
    mention: "Platform team",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization", "http://example.org/Team"],
    attributes: { department: "Platform" },
    confidence: 0.86,
    canonicalName: "Platform Team",
  },
  {
    id: E.q4Release,
    mention: "Q4 Release",
    primaryType: "http://example.org/Project",
    types: ["http://example.org/Project"],
    attributes: { deadline: "December 15, 2024" },
    confidence: 0.9,
    canonicalName: "Q4 Release",
  },
  {
    id: E.budgetReview,
    mention: "Budget Review",
    primaryType: "http://example.org/Project",
    types: ["http://example.org/Project", "http://schema.org/Event"],
    attributes: { quarter: "Q4 2024" },
    confidence: 0.88,
    canonicalName: "Budget Review",
  },
];

const MOCK_RELATIONS: Relation[] = [
  // Employment & organizational relations
  {
    id: Rel.johnWorksAcme,
    subjectId: E.john,
    predicate: "http://schema.org/worksFor",
    objectId: E.acme,
    evidence: {
      text: "John Smith from Acme Corp",
      startChar: 0,
      endChar: 25,
      confidence: 0.94,
    },
    groundingConfidence: 0.94,
  },
  {
    id: Rel.sarahWorksAcme,
    subjectId: E.sarah,
    predicate: "http://schema.org/worksFor",
    objectId: E.acme,
    groundingConfidence: 0.89,
  },
  {
    id: Rel.mikeWorksAcme,
    subjectId: E.mike,
    predicate: "http://schema.org/worksFor",
    objectId: E.acme,
    groundingConfidence: 0.91,
  },

  // Team membership relations
  {
    id: Rel.sarahMemberEng,
    subjectId: E.sarah,
    predicate: "http://schema.org/memberOf",
    objectId: E.engTeam,
    evidence: {
      text: "Sarah Chen from the Engineering team",
      startChar: 120,
      endChar: 156,
      confidence: 0.91,
    },
    groundingConfidence: 0.91,
  },
  {
    id: Rel.mikeMemberEng,
    subjectId: E.mike,
    predicate: "http://schema.org/memberOf",
    objectId: E.engTeam,
    evidence: {
      text: "Mike Wilson, our Tech Lead",
      startChar: 200,
      endChar: 226,
      confidence: 0.88,
    },
    groundingConfidence: 0.88,
  },
  {
    id: Rel.lisaMemberEng,
    subjectId: E.lisa,
    predicate: "http://schema.org/memberOf",
    objectId: E.engTeam,
    groundingConfidence: 0.85,
  },
  {
    id: Rel.alexMemberPlatform,
    subjectId: E.alex,
    predicate: "http://schema.org/memberOf",
    objectId: E.platformTeam,
    evidence: {
      text: "Alex Rodriguez from the Platform team",
      startChar: 350,
      endChar: 387,
      confidence: 0.87,
    },
    groundingConfidence: 0.87,
  },

  // Reporting structure relations
  {
    id: Rel.sarahReportsJohn,
    subjectId: E.sarah,
    predicate: "http://example.org/reportsTo",
    objectId: E.john,
    evidence: {
      text: "Sarah reports to John Smith",
      startChar: 450,
      endChar: 477,
      confidence: 0.82,
    },
    groundingConfidence: 0.82,
  },
  {
    id: Rel.mikeReportsJohn,
    subjectId: E.mike,
    predicate: "http://example.org/reportsTo",
    objectId: E.john,
    groundingConfidence: 0.84,
  },

  // Project leadership relations
  {
    id: Rel.johnLeadsQ4,
    subjectId: E.john,
    predicate: "http://example.org/leadsProject",
    objectId: E.q4Release,
    evidence: {
      text: "John Smith is leading the Q4 Release",
      startChar: 80,
      endChar: 116,
      confidence: 0.93,
    },
    groundingConfidence: 0.93,
  },
  {
    id: Rel.sarahContributesQ4,
    subjectId: E.sarah,
    predicate: "http://example.org/contributesTo",
    objectId: E.q4Release,
    groundingConfidence: 0.86,
  },
  {
    id: Rel.mikeContributesQ4,
    subjectId: E.mike,
    predicate: "http://example.org/contributesTo",
    objectId: E.q4Release,
    groundingConfidence: 0.88,
  },

  // Budget review relations
  {
    id: Rel.johnPresentsBudget,
    subjectId: E.john,
    predicate: "http://example.org/presents",
    objectId: E.budgetReview,
    evidence: {
      text: "John will present the Budget Review",
      startChar: 520,
      endChar: 555,
      confidence: 0.79,
    },
    groundingConfidence: 0.79,
  },

  // Literal value relations (dates, deadlines, etc.)
  {
    id: Rel.q4Deadline,
    subjectId: E.q4Release,
    predicate: "http://example.org/hasDeadline",
    literalValue: "December 15, 2024",
    evidence: {
      text: "Q4 Release deadline is December 15, 2024",
      startChar: 280,
      endChar: 320,
      confidence: 0.96,
    },
    groundingConfidence: 0.96,
  },
  {
    id: Rel.budgetQuarter,
    subjectId: E.budgetReview,
    predicate: "http://example.org/forQuarter",
    literalValue: "Q4 2024",
    groundingConfidence: 0.92,
  },

  // Team hierarchy relations
  {
    id: Rel.engTeamPartAcme,
    subjectId: E.engTeam,
    predicate: "http://schema.org/parentOrganization",
    objectId: E.acme,
    groundingConfidence: 0.95,
  },
  {
    id: Rel.platformTeamPartAcme,
    subjectId: E.platformTeam,
    predicate: "http://schema.org/parentOrganization",
    objectId: E.acme,
    groundingConfidence: 0.95,
  },

  // Role relations
  {
    id: Rel.johnRole,
    subjectId: E.john,
    predicate: "http://schema.org/jobTitle",
    literalValue: "Senior Engineering Manager",
    evidence: {
      text: "John Smith, Senior Engineering Manager",
      startChar: 0,
      endChar: 38,
      confidence: 0.97,
    },
    groundingConfidence: 0.97,
  },
  {
    id: Rel.sarahRole,
    subjectId: E.sarah,
    predicate: "http://schema.org/jobTitle",
    literalValue: "UX Lead",
    groundingConfidence: 0.91,
  },
  {
    id: Rel.mikeRole,
    subjectId: E.mike,
    predicate: "http://schema.org/jobTitle",
    literalValue: "Tech Lead",
    evidence: {
      text: "Mike Wilson, our Tech Lead",
      startChar: 200,
      endChar: 226,
      confidence: 0.93,
    },
    groundingConfidence: 0.93,
  },
];

const MENTION_PATTERNS: Record<string, readonly string[]> = {
  [E.john]: ["john smith", "john", "smith"],
  [E.sarah]: ["sarah chen", "sarah", "chen"],
  [E.mike]: ["mike wilson", "mike", "wilson"],
  [E.alex]: ["alex rodriguez", "alex", "rodriguez"],
  [E.lisa]: ["lisa park", "lisa", "park"],
  [E.acme]: ["acme corp", "acme"],
  [E.engTeam]: ["engineering team", "engineering"],
  [E.platformTeam]: ["platform team", "platform"],
  [E.q4Release]: ["q4 release", "q4"],
  [E.budgetReview]: ["budget review", "budget"],
};

function findMatchingEntities(text: string): readonly AssembledEntity[] {
  const lowerText = text.toLowerCase();

  const matched = A.filter(MOCK_ENTITIES, (entity) => {
    const patterns = MENTION_PATTERNS[entity.id] ?? [];
    return A.some(patterns, (pattern) => lowerText.includes(pattern));
  });

  return A.isEmptyReadonlyArray(matched) ? A.take(MOCK_ENTITIES, 5) : matched;
}

function findMatchingRelations(matchedEntities: readonly AssembledEntity[]): readonly Relation[] {
  const entityIds = A.map(matchedEntities, (e) => e.id);

  return A.filter(MOCK_RELATIONS, (relation) => {
    const subjectMatches = A.contains(entityIds, relation.subjectId);
    const objectMatches = relation.objectId ? A.contains(entityIds, relation.objectId) : true;
    return subjectMatches && objectMatches;
  });
}

export async function extractFromText(text: string): Promise<ExtractionResult> {
  const startTime = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const entities = findMatchingEntities(text);
  const relations = findMatchingRelations(entities);
  const durationMs = Date.now() - startTime;

  return {
    entities,
    relations,
    sourceText: text,
    stats: {
      entityCount: entities.length,
      relationCount: relations.length,
      durationMs,
    },
  };
}

function findSeedEntities(query: string): readonly AssembledEntity[] {
  const lowerQuery = F.pipe(query, Str.toLowerCase);

  return A.filter(MOCK_ENTITIES, (entity) => {
    const patterns = MENTION_PATTERNS[entity.id] ?? [];
    const mentionMatch = F.pipe(
      entity.mention,
      Str.toLowerCase,
      (m) => Str.includes(lowerQuery)(m) || Str.includes(lowerQuery)(m)
    );

    const patternMatch = A.some(patterns, Str.includes(lowerQuery));

    const attrMatch = F.pipe(
      R.toEntries(entity.attributes),
      A.some(([, value]) => F.pipe(String(value), Str.toLowerCase, Str.includes(lowerQuery)))
    );

    return mentionMatch || patternMatch || attrMatch;
  });
}

function expandFromSeeds(seeds: readonly AssembledEntity[], maxHops: number): readonly AssembledEntity[] {
  type EntityId = AssembledEntity["id"];

  const seedIds = new Set<EntityId>(A.map(seeds, (e) => e.id));
  const visited = new Set<EntityId>(seedIds);
  let frontier: EntityId[] = [...seedIds];

  for (let hop = 0; hop < maxHops && frontier.length > 0; hop++) {
    const nextFrontier: EntityId[] = [];

    for (const entityId of frontier) {
      const connectedIds = F.pipe(
        MOCK_RELATIONS,
        A.filterMap((rel) => {
          if (rel.subjectId === entityId && rel.objectId && !visited.has(rel.objectId)) {
            return O.some(rel.objectId);
          }
          if (rel.objectId === entityId && !visited.has(rel.subjectId)) {
            return O.some(rel.subjectId);
          }
          return O.none();
        })
      );

      for (const id of connectedIds) {
        if (!visited.has(id)) {
          visited.add(id);
          nextFrontier.push(id);
        }
      }
    }

    frontier = nextFrontier;
  }

  return A.filter(MOCK_ENTITIES, (e) => visited.has(e.id));
}

function findRelationsForEntities(entities: readonly AssembledEntity[]): readonly Relation[] {
  const entityIds = new Set(A.map(entities, (e) => e.id));

  return A.filter(MOCK_RELATIONS, (rel) => {
    const subjectIn = entityIds.has(rel.subjectId);
    const objectIn = rel.objectId ? entityIds.has(rel.objectId) : true;
    return subjectIn && objectIn;
  });
}

function formatEntityType(uri: string): string {
  return F.pipe(
    uri,
    Str.split("/"),
    A.last,
    O.getOrElse(() => uri)
  );
}

function formatPredicateLabel(uri: string): string {
  return F.pipe(
    uri,
    Str.split("/"),
    A.last,
    O.getOrElse(() => uri)
  );
}

function buildContext(entities: readonly AssembledEntity[], relations: readonly Relation[]): string {
  const entityLines = F.pipe(
    entities,
    A.map((entity) => {
      const types = F.pipe(entity.types, A.map(formatEntityType), (ts) => A.join(ts, ", "));

      const attrs = F.pipe(
        R.toEntries(entity.attributes),
        A.map(([k, v]) => `${k}: ${v}`),
        (pairs) => A.join(pairs, ", ")
      );

      const attrPart = A.isEmptyReadonlyArray(R.toEntries(entity.attributes)) ? "" : `(${attrs})`;

      return `- ${entity.mention} [${types}]${attrPart}`;
    }),
    (lines) => A.join(lines, "\n")
  );

  const relationLines = F.pipe(
    relations,
    A.map((rel) => {
      const subject = F.pipe(
        A.findFirst(entities, (e) => e.id === rel.subjectId),
        O.map((e) => e.mention),
        O.getOrElse(() => rel.subjectId)
      );

      const predicate = formatPredicateLabel(rel.predicate);

      const object = rel.objectId
        ? F.pipe(
            A.findFirst(entities, (e) => e.id === rel.objectId),
            O.map((e) => e.mention),
            O.getOrElse(() => rel.objectId)
          )
        : `"${rel.literalValue}"`;

      return `- ${subject} --[${predicate}]--> ${object}`;
    }),
    (lines) => A.join(lines, "\n")
  );

  return `## Retrieved Entities\n\n${entityLines}\n\n## Relations\n\n${relationLines}`;
}

function computeScores(
  entities: readonly AssembledEntity[],
  seeds: readonly AssembledEntity[]
): Record<string, number> {
  const seedIds = new Set(A.map(seeds, (e) => e.id));

  return F.pipe(
    entities,
    A.map((entity, index) => {
      const baseScore = 1 / (60 + index);
      const seedBoost = seedIds.has(entity.id) ? 0.1 : 0;
      return [entity.id, baseScore + seedBoost] as const;
    }),
    R.fromEntries
  );
}

export async function queryGraphRAG(query: string, config: GraphRAGConfig): Promise<GraphRAGResult> {
  const delay = 800 + Math.floor(Math.random() * 700);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const seeds = findSeedEntities(query);
  const effectiveSeeds = A.isEmptyReadonlyArray(seeds) ? A.take(MOCK_ENTITIES, 2) : seeds;

  const expandedEntities = expandFromSeeds(effectiveSeeds, config.maxHops);
  const limitedEntities = A.take(expandedEntities, config.topK);
  const relations = findRelationsForEntities(limitedEntities);

  const context = buildContext(limitedEntities, relations);
  const scores = computeScores(limitedEntities, effectiveSeeds);

  const estimatedTokens = Math.ceil(context.length / 4);

  return {
    entities: limitedEntities,
    relations,
    seeds: effectiveSeeds,
    context,
    scores,
    stats: {
      seedEntityCount: effectiveSeeds.length,
      totalEntityCount: limitedEntities.length,
      totalRelationCount: relations.length,
      hopsTraversed: config.maxHops,
      estimatedTokens,
      truncated: expandedEntities.length > config.topK,
    },
  };
}

// Normalize entity mention for comparison
function normalizeMention(mention: string): string {
  return F.pipe(
    mention,
    Str.toLowerCase,
    Str.trim,
    // Remove common prefixes/suffixes
    (s) => s.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, ""),
    // Normalize whitespace
    (s) => s.replace(/\s+/g, " ")
  );
}

// Extract name parts for matching
function extractNameParts(mention: string): readonly string[] {
  const normalized = normalizeMention(mention);
  return F.pipe(
    normalized,
    Str.split(" "),
    A.filter((part) => part.length > 1) // Filter out initials like "J."
  );
}

// Calculate name similarity score between two entities
function calculateNameSimilarity(a: AssembledEntity, b: AssembledEntity): number {
  const aNormalized = normalizeMention(a.mention);
  const bNormalized = normalizeMention(b.mention);

  // Exact match after normalization
  if (aNormalized === bNormalized) {
    return 1.0;
  }

  const aParts = extractNameParts(a.mention);
  const bParts = extractNameParts(b.mention);

  // Check if one is a subset of the other (e.g., "John" vs "John Smith")
  const aSet = new Set(aParts);
  const bSet = new Set(bParts);

  const intersection = A.filter([...aSet], (part) => bSet.has(part));
  const intersectionSize = intersection.length;

  if (intersectionSize === 0) {
    return 0;
  }

  // One name contains the other entirely
  if (intersectionSize === Math.min(aSet.size, bSet.size) && intersectionSize > 0) {
    // Prefer longer matches
    return 0.7 + 0.2 * (intersectionSize / Math.max(aSet.size, bSet.size));
  }

  // Partial overlap
  const unionSize = new Set([...aParts, ...bParts]).size;
  return intersectionSize / unionSize;
}

// Check if two entities share the same type
function shareType(a: AssembledEntity, b: AssembledEntity): boolean {
  return A.some(a.types, (aType) => A.contains(b.types, aType));
}

// Find shared types between entities
function findSharedTypes(entities: readonly AssembledEntity[]): readonly string[] {
  if (A.isEmptyReadonlyArray(entities)) {
    return [];
  }

  const first = entities[0];
  if (first === undefined) {
    return [];
  }

  return A.filter(first.types, (t) => A.every(A.drop(entities, 1), (e) => A.contains(e.types, t)));
}

// Select the canonical entity from a group (longest mention, highest confidence)
function selectCanonical(entities: readonly AssembledEntity[]): AssembledEntity {
  return F.pipe(
    entities,
    A.reduce(entities[0]!, (best, current) => {
      // Prefer longer mentions (more specific)
      if (current.mention.length > best.mention.length) {
        return current;
      }
      // Tie-break by confidence
      if (current.mention.length === best.mention.length && current.confidence > best.confidence) {
        return current;
      }
      return best;
    })
  );
}

// Calculate cohesion for a cluster (average pairwise similarity)
function calculateCohesion(members: readonly AssembledEntity[]): number {
  if (members.length <= 1) {
    return 1.0;
  }

  // Generate all pairs and calculate similarity
  const pairs = F.pipe(
    A.flatMap(members, (a, i) =>
      F.pipe(
        A.drop(members, i + 1),
        A.map((b) => [a, b] as const)
      )
    )
  );

  if (A.isEmptyReadonlyArray(pairs)) {
    return 1.0;
  }

  const totalSimilarity = A.reduce(pairs, 0, (acc, [a, b]) => acc + calculateNameSimilarity(a, b));

  return totalSimilarity / pairs.length;
}

// Build entity clusters from all entities using functional approach
function buildClusters(allEntities: readonly AssembledEntity[]): readonly EntityCluster[] {
  const SIMILARITY_THRESHOLD = 0.6;

  // Use reduce to build clusters while tracking processed entities
  const { clusters } = A.reduce(
    allEntities,
    { clusters: [] as EntityCluster[], processedIds: new Set<string>() },
    (acc, entity) => {
      // Skip if already processed
      if (acc.processedIds.has(entity.id)) {
        return acc;
      }

      // Find all similar entities not yet processed
      const similar = A.filter(allEntities, (other) => {
        if (acc.processedIds.has(other.id) || other.id === entity.id) {
          return false;
        }
        // Must share at least one type
        if (!shareType(entity, other)) {
          return false;
        }
        return calculateNameSimilarity(entity, other) >= SIMILARITY_THRESHOLD;
      });

      const clusterMembers = [entity, ...similar];
      const canonical = selectCanonical(clusterMembers);
      const cohesion = calculateCohesion(clusterMembers);

      const cluster: EntityCluster = {
        id: KnowledgeEntityIds.EntityClusterId.create(),
        canonicalEntityId: canonical.id,
        canonicalEntity: canonical,
        memberIds: A.map(clusterMembers, (e) => e.id),
        memberEntities: clusterMembers,
        cohesion,
        sharedTypes: [...findSharedTypes(clusterMembers)],
      };

      // Mark all members as processed
      const newProcessedIds = new Set(acc.processedIds);
      A.forEach(clusterMembers, (member) => newProcessedIds.add(member.id));

      return {
        clusters: [...acc.clusters, cluster],
        processedIds: newProcessedIds,
      };
    }
  );

  return clusters;
}

// Determine reason based on similarity score
function determineReason(similarity: number): string {
  if (similarity >= 0.95) {
    return "exact_match";
  }
  if (similarity >= 0.8) {
    return "name_similarity";
  }
  return "partial_name_match";
}

// Generate same-as links from clusters using functional approach
function generateSameAsLinks(clusters: readonly EntityCluster[]): readonly SameAsLink[] {
  return F.pipe(
    clusters,
    // Only process clusters with more than one member
    A.filter((cluster) => cluster.memberIds.length > 1),
    // FlatMap each cluster to its same-as links
    A.flatMap((cluster) => {
      const nonCanonicalMembers = A.filter(cluster.memberEntities, (e) => e.id !== cluster.canonicalEntityId);

      return A.map(nonCanonicalMembers, (member): SameAsLink => {
        const similarity = calculateNameSimilarity(cluster.canonicalEntity, member);

        return {
          id: KnowledgeEntityIds.SameAsLinkId.create(),
          canonicalId: cluster.canonicalEntityId,
          memberId: member.id,
          confidence: similarity,
          reason: determineReason(similarity),
        };
      });
    })
  );
}

export async function resolveEntities(sessions: readonly ExtractionSession[]): Promise<ResolutionResult> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Collect all entities across sessions
  const allEntities = A.flatMap(sessions, (s) => [...s.entities]);

  if (A.isEmptyReadonlyArray(allEntities)) {
    return {
      clusters: [],
      sameAsLinks: [],
      stats: {
        originalEntityCount: 0,
        resolvedEntityCount: 0,
        clusterCount: 0,
        sameAsLinkCount: 0,
        mergedEntityCount: 0,
      },
    };
  }

  // Build clusters
  const clusters = buildClusters(allEntities);

  // Generate same-as links
  const sameAsLinks = generateSameAsLinks(clusters);

  // Calculate stats
  const originalEntityCount = allEntities.length;
  const resolvedEntityCount = clusters.length;
  const mergedEntityCount = originalEntityCount - resolvedEntityCount;

  return {
    clusters,
    sameAsLinks,
    stats: {
      originalEntityCount,
      resolvedEntityCount,
      clusterCount: clusters.length,
      sameAsLinkCount: sameAsLinks.length,
      mergedEntityCount,
    },
  };
}

export type {
  AssembledEntity,
  EntityCluster,
  EvidenceSpan,
  ExtractionResult,
  ExtractionSession,
  Relation,
  ResolutionResult,
  SameAsLink,
} from "./types";
