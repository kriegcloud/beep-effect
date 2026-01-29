"use server";

import * as A from "effect/Array";
import type { AssembledEntity, ExtractionResult, Relation } from "./types";

const MOCK_ENTITIES: AssembledEntity[] = [
  {
    id: "person-john-smith",
    mention: "John Smith",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Senior Engineering Manager", email: "john.smith@acmecorp.com" },
    confidence: 0.95,
    canonicalName: "John Smith",
  },
  {
    id: "person-sarah-chen",
    mention: "Sarah Chen",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "UX Lead" },
    confidence: 0.92,
    canonicalName: "Sarah Chen",
  },
  {
    id: "person-mike-wilson",
    mention: "Mike Wilson",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Tech Lead" },
    confidence: 0.93,
    canonicalName: "Mike Wilson",
  },
  {
    id: "person-alex-rodriguez",
    mention: "Alex Rodriguez",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Platform team member" },
    confidence: 0.88,
    canonicalName: "Alex Rodriguez",
  },
  {
    id: "person-lisa-park",
    mention: "Lisa Park",
    primaryType: "http://schema.org/Person",
    types: ["http://schema.org/Person"],
    attributes: { role: "Engineering team member" },
    confidence: 0.87,
    canonicalName: "Lisa Park",
  },
  {
    id: "org-acme-corp",
    mention: "Acme Corp",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization"],
    attributes: {},
    confidence: 0.98,
    canonicalName: "Acme Corp",
  },
  {
    id: "org-engineering-team",
    mention: "Engineering team",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization", "http://example.org/Team"],
    attributes: { department: "Engineering" },
    confidence: 0.85,
    canonicalName: "Engineering Team",
  },
  {
    id: "org-platform-team",
    mention: "Platform team",
    primaryType: "http://schema.org/Organization",
    types: ["http://schema.org/Organization", "http://example.org/Team"],
    attributes: { department: "Platform" },
    confidence: 0.86,
    canonicalName: "Platform Team",
  },
  {
    id: "project-q4-release",
    mention: "Q4 Release",
    primaryType: "http://example.org/Project",
    types: ["http://example.org/Project"],
    attributes: { deadline: "December 15, 2024" },
    confidence: 0.9,
    canonicalName: "Q4 Release",
  },
  {
    id: "project-budget-review",
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
    id: "rel-john-works-acme",
    subjectId: "person-john-smith",
    predicate: "http://schema.org/worksFor",
    objectId: "org-acme-corp",
    evidence: {
      text: "John Smith from Acme Corp",
      startChar: 0,
      endChar: 25,
      confidence: 0.94,
    },
    groundingConfidence: 0.94,
  },
  {
    id: "rel-sarah-works-acme",
    subjectId: "person-sarah-chen",
    predicate: "http://schema.org/worksFor",
    objectId: "org-acme-corp",
    groundingConfidence: 0.89,
  },
  {
    id: "rel-mike-works-acme",
    subjectId: "person-mike-wilson",
    predicate: "http://schema.org/worksFor",
    objectId: "org-acme-corp",
    groundingConfidence: 0.91,
  },

  // Team membership relations
  {
    id: "rel-sarah-member-eng",
    subjectId: "person-sarah-chen",
    predicate: "http://schema.org/memberOf",
    objectId: "org-engineering-team",
    evidence: {
      text: "Sarah Chen from the Engineering team",
      startChar: 120,
      endChar: 156,
      confidence: 0.91,
    },
    groundingConfidence: 0.91,
  },
  {
    id: "rel-mike-member-eng",
    subjectId: "person-mike-wilson",
    predicate: "http://schema.org/memberOf",
    objectId: "org-engineering-team",
    evidence: {
      text: "Mike Wilson, our Tech Lead",
      startChar: 200,
      endChar: 226,
      confidence: 0.88,
    },
    groundingConfidence: 0.88,
  },
  {
    id: "rel-lisa-member-eng",
    subjectId: "person-lisa-park",
    predicate: "http://schema.org/memberOf",
    objectId: "org-engineering-team",
    groundingConfidence: 0.85,
  },
  {
    id: "rel-alex-member-platform",
    subjectId: "person-alex-rodriguez",
    predicate: "http://schema.org/memberOf",
    objectId: "org-platform-team",
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
    id: "rel-sarah-reports-john",
    subjectId: "person-sarah-chen",
    predicate: "http://example.org/reportsTo",
    objectId: "person-john-smith",
    evidence: {
      text: "Sarah reports to John Smith",
      startChar: 450,
      endChar: 477,
      confidence: 0.82,
    },
    groundingConfidence: 0.82,
  },
  {
    id: "rel-mike-reports-john",
    subjectId: "person-mike-wilson",
    predicate: "http://example.org/reportsTo",
    objectId: "person-john-smith",
    groundingConfidence: 0.84,
  },

  // Project leadership relations
  {
    id: "rel-john-leads-q4",
    subjectId: "person-john-smith",
    predicate: "http://example.org/leadsProject",
    objectId: "project-q4-release",
    evidence: {
      text: "John Smith is leading the Q4 Release",
      startChar: 80,
      endChar: 116,
      confidence: 0.93,
    },
    groundingConfidence: 0.93,
  },
  {
    id: "rel-sarah-contributes-q4",
    subjectId: "person-sarah-chen",
    predicate: "http://example.org/contributesTo",
    objectId: "project-q4-release",
    groundingConfidence: 0.86,
  },
  {
    id: "rel-mike-contributes-q4",
    subjectId: "person-mike-wilson",
    predicate: "http://example.org/contributesTo",
    objectId: "project-q4-release",
    groundingConfidence: 0.88,
  },

  // Budget review relations
  {
    id: "rel-john-presents-budget",
    subjectId: "person-john-smith",
    predicate: "http://example.org/presents",
    objectId: "project-budget-review",
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
    id: "rel-q4-deadline",
    subjectId: "project-q4-release",
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
    id: "rel-budget-quarter",
    subjectId: "project-budget-review",
    predicate: "http://example.org/forQuarter",
    literalValue: "Q4 2024",
    groundingConfidence: 0.92,
  },

  // Team hierarchy relations
  {
    id: "rel-eng-team-part-acme",
    subjectId: "org-engineering-team",
    predicate: "http://schema.org/parentOrganization",
    objectId: "org-acme-corp",
    groundingConfidence: 0.95,
  },
  {
    id: "rel-platform-team-part-acme",
    subjectId: "org-platform-team",
    predicate: "http://schema.org/parentOrganization",
    objectId: "org-acme-corp",
    groundingConfidence: 0.95,
  },

  // Role relations
  {
    id: "rel-john-role",
    subjectId: "person-john-smith",
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
    id: "rel-sarah-role",
    subjectId: "person-sarah-chen",
    predicate: "http://schema.org/jobTitle",
    literalValue: "UX Lead",
    groundingConfidence: 0.91,
  },
  {
    id: "rel-mike-role",
    subjectId: "person-mike-wilson",
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
  "person-john-smith": ["john smith", "john", "smith"],
  "person-sarah-chen": ["sarah chen", "sarah", "chen"],
  "person-mike-wilson": ["mike wilson", "mike", "wilson"],
  "person-alex-rodriguez": ["alex rodriguez", "alex", "rodriguez"],
  "person-lisa-park": ["lisa park", "lisa", "park"],
  "org-acme-corp": ["acme corp", "acme"],
  "org-engineering-team": ["engineering team", "engineering"],
  "org-platform-team": ["platform team", "platform"],
  "project-q4-release": ["q4 release", "q4"],
  "project-budget-review": ["budget review", "budget"],
};

function findMatchingEntities(text: string): readonly AssembledEntity[] {
  const lowerText = text.toLowerCase();

  const matched = A.filter(MOCK_ENTITIES, (entity) => {
    const patterns = MENTION_PATTERNS[entity.id] ?? [];
    return A.some(patterns, (pattern) => lowerText.includes(pattern));
  });

  return A.isEmptyReadonlyArray(matched) ? A.take(MOCK_ENTITIES, 5) : matched;
}

function findMatchingRelations(
  matchedEntities: readonly AssembledEntity[]
): readonly Relation[] {
  const entityIds = A.map(matchedEntities, (e) => e.id);

  return A.filter(MOCK_RELATIONS, (relation) => {
    const subjectMatches = A.contains(entityIds, relation.subjectId);
    const objectMatches = relation.objectId
      ? A.contains(entityIds, relation.objectId)
      : true;
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

export type { AssembledEntity, ExtractionResult, EvidenceSpan, Relation } from "./types";
