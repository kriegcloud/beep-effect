import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EnronDataCache, EnronDataCacheLive } from "./cache.js";
import { S3DataSourceLive } from "./s3-client.js";
import type { EnronDocument } from "./schemas.js";

const DEFAULT_DOCUMENT_LIMIT = 25;
const DEFAULT_DOCUMENT_OFFSET = 0;
const DEFAULT_ONTOLOGY_PATH = fileURLToPath(new URL("./test-ontology.ttl", import.meta.url));
const DEFAULT_OUTPUT_PATH = join(process.cwd(), "specs/pending/enron-data-pipeline/outputs/extraction-results.json");

const personTypeHints = ["person", "individual"] as const;
const organizationTypeHints = ["organization", "company", "corp", "inc", "llc", "ltd", "bank", "energy"] as const;
const instrumentTypeHints = [
  "instrument",
  "deal",
  "contract",
  "portfolio",
  "risk",
  "position",
  "equity",
  "bond",
] as const;
const actionTypeHints = ["action", "task", "follow", "deadline", "request"] as const;
const amountTypeHints = ["amount", "money", "monetary", "price", "value"] as const;

const organizationMentionPattern =
  /\b[A-Z][A-Za-z&.'-]*(?:\s+[A-Z][A-Za-z&.'-]*)*\s(?:Corp|Corporation|Company|Inc|LLC|Ltd|Bank|Energy)\b/g;
const personMentionPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g;
const emailMentionPattern = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const instrumentMentionPattern = /\b(?:portfolio|swap|derivative|bond|equity|contract|deal|position|risk)\b/gi;
const actionMentionPattern = /\b(?:follow up|deadline|action item|please review|please send|need to)\b/gi;
const amountMentionPattern = /\$[0-9][0-9,]*(?:\.[0-9]{2})?/g;

const ignoredTitleCaseMentions = new Set([
  "From",
  "To",
  "Cc",
  "Bcc",
  "Subject",
  "Original Message",
  "Forwarded Message",
  "Thanks",
  "Regards",
]);

interface HarnessCliOptions {
  readonly limit: number;
  readonly offset: number;
  readonly cacheDirectory: string | undefined;
  readonly ontologyPath: string;
  readonly outputPath: string | undefined;
  readonly printJson: boolean;
}

interface OntologySummary {
  readonly classIris: ReadonlyArray<string>;
  readonly propertyIris: ReadonlyArray<string>;
}

interface MentionCandidate {
  readonly text: string;
  readonly startChar: number;
  readonly endChar: number;
  readonly confidence: number;
  readonly suggestedType?: string;
}

interface MentionSpanRecord {
  readonly text: string;
  readonly startChar: number;
  readonly endChar: number;
  readonly confidence: number;
  readonly chunkIndex: number;
}

interface ExtractedEntityRecord {
  readonly entityId: string;
  readonly mention: string;
  readonly primaryType: string;
  readonly types: ReadonlyArray<string>;
  readonly confidence: number;
  readonly canonicalName?: string;
}

interface ExtractedRelationRecord {
  readonly relationId: string;
  readonly predicate: string;
  readonly subjectMention: string;
  readonly confidence: number;
  readonly objectMention?: string;
  readonly literalValue?: string;
  readonly literalType?: string;
  readonly evidence?: string;
  readonly evidenceStartChar?: number;
  readonly evidenceEndChar?: number;
}

interface DocumentQualityIssue {
  readonly code: string;
  readonly message: string;
}

interface DocumentQualityValidation {
  readonly entityTypeChecks: number;
  readonly invalidEntityTypes: ReadonlyArray<DocumentQualityIssue>;
  readonly predicateChecks: number;
  readonly invalidPredicates: ReadonlyArray<DocumentQualityIssue>;
  readonly evidenceChecks: number;
  readonly invalidEvidence: ReadonlyArray<DocumentQualityIssue>;
  readonly hallucinationChecks: number;
  readonly hallucinationSignals: ReadonlyArray<DocumentQualityIssue>;
}

interface DocumentExtractionRecord {
  readonly documentId: string;
  readonly messageId: string;
  readonly title: string;
  readonly runtimeMs: number;
  readonly tokensUsed: number;
  readonly chunkCount: number;
  readonly mentionCount: number;
  readonly entityCount: number;
  readonly relationCount: number;
  readonly mentions: ReadonlyArray<MentionSpanRecord>;
  readonly entities: ReadonlyArray<ExtractedEntityRecord>;
  readonly relations: ReadonlyArray<ExtractedRelationRecord>;
  readonly validation: DocumentQualityValidation;
}

interface DocumentFailureRecord {
  readonly documentId: string;
  readonly messageId: string;
  readonly error: string;
}

interface AggregateQualitySummary {
  readonly entityTypeAlignmentRate: number;
  readonly predicateValidityRate: number;
  readonly evidenceGroundingRate: number;
  readonly nonHallucinationRate: number;
}

export interface ExtractionHarnessReport {
  readonly generatedAt: string;
  readonly options: {
    readonly limit: number;
    readonly offset: number;
    readonly cacheDirectory: string | undefined;
    readonly ontologyPath: string;
    readonly outputPath: string | undefined;
  };
  readonly dataset: {
    readonly cacheDirectory: string;
    readonly cacheStatus: string;
    readonly datasetHash: string;
    readonly selectedMessageCount: number;
    readonly selectedThreadCount: number;
    readonly source: string;
  };
  readonly ontology: {
    readonly classCount: number;
    readonly propertyCount: number;
    readonly classIris: ReadonlyArray<string>;
    readonly propertyIris: ReadonlyArray<string>;
  };
  readonly summary: {
    readonly requestedDocuments: number;
    readonly processedDocuments: number;
    readonly successfulDocuments: number;
    readonly failedDocuments: number;
    readonly totalMentions: number;
    readonly totalEntities: number;
    readonly totalRelations: number;
    readonly totalTokensUsed: number;
    readonly totalRuntimeMs: number;
  };
  readonly quality: AggregateQualitySummary;
  readonly runtimeConstraints: ReadonlyArray<string>;
  readonly failures: ReadonlyArray<DocumentFailureRecord>;
  readonly documents: ReadonlyArray<DocumentExtractionRecord>;
}

interface DeterministicExtractionResult {
  readonly mentions: ReadonlyArray<MentionSpanRecord>;
  readonly entities: ReadonlyArray<ExtractedEntityRecord>;
  readonly relations: ReadonlyArray<ExtractedRelationRecord>;
  readonly stats: {
    readonly chunkCount: number;
    readonly mentionCount: number;
    readonly entityCount: number;
    readonly relationCount: number;
    readonly tokensUsed: number;
    readonly runtimeMs: number;
  };
}

interface DeterministicExtractionPipeline {
  readonly run: (document: EnronDocument, ontology: OntologySummary) => Effect.Effect<DeterministicExtractionResult>;
}

const DeterministicExtractionPipeline = Context.GenericTag<DeterministicExtractionPipeline>(
  "@beep/repo-cli/enron/DeterministicExtractionPipeline"
);

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();

const lowerIncludes = (haystack: string, needle: string): boolean =>
  haystack.toLowerCase().includes(needle.toLowerCase());

const parseIntOption = (rawValue: string, flagName: string): number => {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${flagName}: ${rawValue}`);
  }
  return parsed;
};

const parseCliOptions = (argv: ReadonlyArray<string>): HarnessCliOptions => {
  let limit = DEFAULT_DOCUMENT_LIMIT;
  let offset = DEFAULT_DOCUMENT_OFFSET;
  let cacheDirectory: string | undefined;
  let ontologyPath = DEFAULT_ONTOLOGY_PATH;
  let outputPath: string | undefined = DEFAULT_OUTPUT_PATH;
  let printJson = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) {
      continue;
    }

    if (arg === "--limit") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--limit requires a numeric value");
      }
      limit = parseIntOption(value, "--limit");
      index += 1;
      continue;
    }

    if (arg === "--offset") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--offset requires a numeric value");
      }
      offset = parseIntOption(value, "--offset");
      index += 1;
      continue;
    }

    if (arg === "--cache-dir") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--cache-dir requires a path value");
      }
      cacheDirectory = value;
      index += 1;
      continue;
    }

    if (arg === "--ontology") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--ontology requires a path value");
      }
      ontologyPath = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--output requires a path value");
      }
      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--no-output") {
      outputPath = undefined;
      continue;
    }

    if (arg === "--print-json") {
      printJson = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (limit <= 0) {
    throw new Error("--limit must be greater than zero");
  }

  return {
    limit,
    offset,
    cacheDirectory,
    ontologyPath,
    outputPath,
    printJson,
  };
};

const compareDocuments = (left: EnronDocument, right: EnronDocument): number => {
  const byId = left.id.localeCompare(right.id);
  if (byId !== 0) {
    return byId;
  }

  return left.metadata.messageId.localeCompare(right.metadata.messageId);
};

const parsePrefixLine = (line: string): Readonly<{ prefix: string; iri: string }> | undefined => {
  const match = /^@prefix\s+([A-Za-z][\w-]*):\s+<([^>]+)>\s*\.$/.exec(line.trim());
  if (match === null) {
    return undefined;
  }

  const prefix = match[1];
  const iri = match[2];
  if (prefix === undefined || iri === undefined) {
    return undefined;
  }

  return { prefix, iri };
};

const expandCurie = (value: string, prefixes: ReadonlyMap<string, string>): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1);
  }

  const curie = /^([A-Za-z][\w-]*):([A-Za-z0-9._-]+)$/.exec(trimmed);
  if (curie === null) {
    return trimmed;
  }

  const prefix = curie[1];
  const localName = curie[2];
  if (prefix === undefined || localName === undefined) {
    return trimmed;
  }

  const iriPrefix = prefixes.get(prefix);
  return iriPrefix === undefined ? trimmed : `${iriPrefix}${localName}`;
};

const splitStatements = (ontologyContent: string): ReadonlyArray<string> => {
  const statements: Array<string> = [];
  let current = "";

  for (const rawLine of ontologyContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("@prefix ")) {
      statements.push(line);
      continue;
    }

    current = current.length === 0 ? line : `${current} ${line}`;
    if (line.endsWith(".")) {
      statements.push(current);
      current = "";
    }
  }

  if (current.length > 0) {
    statements.push(current);
  }

  return statements;
};

const parseOntologySummary = (ontologyContent: string): OntologySummary => {
  const prefixes = new Map<string, string>();
  const classIris = new Set<string>();
  const propertyIris = new Set<string>();

  for (const statement of splitStatements(ontologyContent)) {
    const prefix = parsePrefixLine(statement);
    if (prefix !== undefined) {
      prefixes.set(prefix.prefix, prefix.iri);
      continue;
    }

    const subjectMatch = /^([A-Za-z][\w-]*:[A-Za-z0-9._-]+|<[^>]+>)\s+([\s\S]*)\.$/.exec(statement);
    if (subjectMatch === null) {
      continue;
    }

    const subjectToken = subjectMatch[1];
    const body = subjectMatch[2] ?? "";
    if (subjectToken === undefined) {
      continue;
    }

    const subjectIri = expandCurie(subjectToken, prefixes);
    if (/\ba\s+owl:Class\b/.test(body)) {
      classIris.add(subjectIri);
    }

    if (/\ba\s+owl:(?:ObjectProperty|DatatypeProperty)\b/.test(body)) {
      propertyIris.add(subjectIri);
    }
  }

  return {
    classIris: [...classIris].sort((left, right) => left.localeCompare(right)),
    propertyIris: [...propertyIris].sort((left, right) => left.localeCompare(right)),
  };
};

const pushMentionCandidate = (
  text: string,
  startChar: number,
  confidence: number,
  suggestedType: string | undefined,
  dedupe: Set<string>,
  sink: Array<MentionCandidate>
): void => {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return;
  }

  if (ignoredTitleCaseMentions.has(normalized)) {
    return;
  }

  const endChar = startChar + normalized.length;
  const key = `${normalized.toLowerCase()}::${startChar}::${endChar}`;
  if (dedupe.has(key)) {
    return;
  }

  dedupe.add(key);
  sink.push({
    text: normalized,
    startChar,
    endChar,
    confidence,
    ...(suggestedType !== undefined ? { suggestedType } : {}),
  });
};

const collectMentionCandidates = (sourceText: string): ReadonlyArray<MentionCandidate> => {
  const candidates: Array<MentionCandidate> = [];
  const dedupe = new Set<string>();

  for (const match of sourceText.matchAll(emailMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.94, "Person", dedupe, candidates);
    }
  }

  for (const match of sourceText.matchAll(organizationMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.91, "Organization", dedupe, candidates);
    }
  }

  for (const match of sourceText.matchAll(personMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.86, "Person", dedupe, candidates);
    }
  }

  for (const match of sourceText.matchAll(instrumentMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.79, "FinancialInstrument", dedupe, candidates);
    }
  }

  for (const match of sourceText.matchAll(actionMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.78, "ActionItem", dedupe, candidates);
    }
  }

  for (const match of sourceText.matchAll(amountMentionPattern)) {
    if (match.index !== undefined) {
      pushMentionCandidate(match[0], match.index, 0.9, "MonetaryAmount", dedupe, candidates);
    }
  }

  return [...candidates].sort((left, right) => {
    const byStart = left.startChar - right.startChar;
    if (byStart !== 0) {
      return byStart;
    }
    return right.confidence - left.confidence;
  });
};

const pickByHint = (iris: ReadonlyArray<string>, hints: ReadonlyArray<string>): string | undefined => {
  for (const iri of iris) {
    const normalized = iri.toLowerCase();
    if (hints.some((hint) => normalized.includes(hint))) {
      return iri;
    }
  }
  return undefined;
};

const pickTypeIri = (mention: string, classIris: ReadonlyArray<string>): string => {
  const normalized = mention.toLowerCase();

  if (normalized.includes("@")) {
    return pickByHint(classIris, personTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/Person";
  }

  if (/(corp|corporation|company|inc|llc|ltd|bank|energy|committee)/.test(normalized)) {
    return pickByHint(classIris, organizationTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/Organization";
  }

  if (/(portfolio|swap|derivative|bond|equity|contract|deal|position|risk)/.test(normalized)) {
    return (
      pickByHint(classIris, instrumentTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/FinancialInstrument"
    );
  }

  if (/(follow up|deadline|action|review|send)/.test(normalized)) {
    return pickByHint(classIris, actionTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/ActionItem";
  }

  if (/\$[0-9]/.test(normalized)) {
    return pickByHint(classIris, amountTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/MonetaryAmount";
  }

  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(mention)) {
    return pickByHint(classIris, personTypeHints) ?? classIris[0] ?? "https://todox.dev/ontology/wm/Person";
  }

  return classIris[0] ?? "https://todox.dev/ontology/wm/Person";
};

const pickPredicate = (propertyIris: ReadonlyArray<string>, mention: string): string => {
  const normalized = mention.toLowerCase();

  if (/\$[0-9]/.test(normalized)) {
    return (
      pickByHint(propertyIris, amountTypeHints) ?? propertyIris[0] ?? "https://todox.dev/ontology/wm/reportsAmount"
    );
  }

  if (/(corp|organization|company|inc|llc|ltd|bank|energy)/.test(normalized)) {
    return (
      pickByHint(propertyIris, organizationTypeHints) ??
      propertyIris[0] ??
      "https://todox.dev/ontology/wm/mentionsOrganization"
    );
  }

  if (/(portfolio|swap|derivative|bond|equity|contract|deal|risk|position)/.test(normalized)) {
    return (
      pickByHint(propertyIris, instrumentTypeHints) ??
      propertyIris[0] ??
      "https://todox.dev/ontology/wm/discussesInstrument"
    );
  }

  if (/(follow up|deadline|action|review|send)/.test(normalized)) {
    return (
      pickByHint(propertyIris, actionTypeHints) ?? propertyIris[0] ?? "https://todox.dev/ontology/wm/requestsAction"
    );
  }

  return (
    pickByHint(propertyIris, personTypeHints) ?? propertyIris[0] ?? "https://todox.dev/ontology/wm/mentionsParticipant"
  );
};

const buildEntities = (
  document: EnronDocument,
  ontology: OntologySummary,
  mentions: ReadonlyArray<MentionCandidate>
): ReadonlyArray<ExtractedEntityRecord> => {
  const selectedMentions = mentions.slice(0, 120);

  return selectedMentions.map((mention, index) => {
    const mentionText = mention.text.trim();
    const canonicalNameCandidate = mentionText.includes("@") || mentionText.startsWith("$") ? undefined : mentionText;

    return {
      entityId: `entity:${document.id}:${index + 1}`,
      mention: mentionText,
      primaryType: pickTypeIri(mentionText, ontology.classIris),
      types: [pickTypeIri(mentionText, ontology.classIris)],
      confidence: mention.confidence,
      ...(canonicalNameCandidate !== undefined ? { canonicalName: canonicalNameCandidate } : {}),
    };
  });
};

const buildRelations = (
  document: EnronDocument,
  ontology: OntologySummary,
  mentions: ReadonlyArray<MentionCandidate>,
  entities: ReadonlyArray<ExtractedEntityRecord>
): ReadonlyArray<ExtractedRelationRecord> => {
  if (entities.length <= 1) {
    return [];
  }

  const subjectMention = entities[0]?.mention ?? document.metadata.sender;
  const relations: Array<ExtractedRelationRecord> = [];

  for (let index = 1; index < entities.length; index += 1) {
    const entity = entities[index];
    const mention = mentions[index];

    if (entity === undefined || mention === undefined) {
      continue;
    }

    const predicate = pickPredicate(ontology.propertyIris, entity.mention);
    const relationId = `relation:${document.id}:${relations.length + 1}`;

    if (entity.mention.startsWith("$")) {
      relations.push({
        relationId,
        predicate,
        subjectMention,
        confidence: Number.parseFloat((0.72 + (index % 5) * 0.04).toFixed(2)),
        literalValue: entity.mention,
        literalType: "http://www.w3.org/2001/XMLSchema#decimal",
        evidence: document.body.slice(mention.startChar, mention.endChar),
        evidenceStartChar: mention.startChar,
        evidenceEndChar: mention.endChar,
      });
    } else {
      relations.push({
        relationId,
        predicate,
        subjectMention,
        confidence: Number.parseFloat((0.7 + (index % 4) * 0.05).toFixed(2)),
        objectMention: entity.mention,
        evidence: document.body.slice(mention.startChar, mention.endChar),
        evidenceStartChar: mention.startChar,
        evidenceEndChar: mention.endChar,
      });
    }

    if (relations.length >= 64) {
      break;
    }
  }

  return relations;
};

const runDeterministicExtraction = (
  document: EnronDocument,
  ontology: OntologySummary
): Effect.Effect<DeterministicExtractionResult> =>
  Effect.gen(function* () {
    const startedAt = Date.now();

    const mentionCandidates = collectMentionCandidates(document.body);
    const mentionSpans: ReadonlyArray<MentionSpanRecord> = mentionCandidates.slice(0, 120).map((mention) => ({
      text: mention.text,
      startChar: mention.startChar,
      endChar: mention.endChar,
      confidence: mention.confidence,
      chunkIndex: 0,
    }));

    const entities = buildEntities(document, ontology, mentionCandidates);
    const relations = buildRelations(document, ontology, mentionCandidates, entities);

    const tokensUsed = Math.max(1, Math.ceil((document.title.length + document.body.length) / 4));
    const runtimeMs = Math.max(1, Date.now() - startedAt);

    return {
      mentions: mentionSpans,
      entities,
      relations,
      stats: {
        chunkCount: 1,
        mentionCount: mentionSpans.length,
        entityCount: entities.length,
        relationCount: relations.length,
        tokensUsed,
        runtimeMs,
      },
    };
  });

const DeterministicExtractionPipelineLive: Layer.Layer<DeterministicExtractionPipeline> = Layer.succeed(
  DeterministicExtractionPipeline,
  {
    run: runDeterministicExtraction,
  }
);

const validateDocumentExtraction = (
  document: EnronDocument,
  entities: ReadonlyArray<ExtractedEntityRecord>,
  relations: ReadonlyArray<ExtractedRelationRecord>,
  ontologySummary: OntologySummary
): DocumentQualityValidation => {
  const entityTypeIssues: Array<DocumentQualityIssue> = [];
  const predicateIssues: Array<DocumentQualityIssue> = [];
  const evidenceIssues: Array<DocumentQualityIssue> = [];
  const hallucinationIssues: Array<DocumentQualityIssue> = [];

  const classSet = new Set(ontologySummary.classIris);
  const propertySet = new Set(ontologySummary.propertyIris);

  let entityTypeChecks = 0;
  let predicateChecks = 0;
  let evidenceChecks = 0;
  let hallucinationChecks = 0;

  const sourceText = `${document.title}\n${document.body}`;
  const sourceTextLower = sourceText.toLowerCase();

  for (const entity of entities) {
    for (const typeIri of entity.types) {
      entityTypeChecks += 1;
      if (!classSet.has(typeIri)) {
        entityTypeIssues.push({
          code: "entity-type-not-in-ontology",
          message: `Entity "${entity.mention}" has unknown type ${typeIri}`,
        });
      }
    }

    hallucinationChecks += 1;
    if (!lowerIncludes(sourceTextLower, entity.mention.toLowerCase())) {
      hallucinationIssues.push({
        code: "entity-not-grounded",
        message: `Entity mention "${entity.mention}" was not found in source text`,
      });
    }
  }

  for (const relation of relations) {
    predicateChecks += 1;
    if (!propertySet.has(relation.predicate)) {
      predicateIssues.push({
        code: "predicate-not-in-ontology",
        message: `Relation predicate ${relation.predicate} is not defined in ontology`,
      });
    }

    hallucinationChecks += 1;
    if (!lowerIncludes(sourceTextLower, relation.subjectMention.toLowerCase())) {
      hallucinationIssues.push({
        code: "relation-subject-not-grounded",
        message: `Relation subject "${relation.subjectMention}" was not found in source text`,
      });
    }

    if (relation.objectMention !== undefined) {
      hallucinationChecks += 1;
      if (!lowerIncludes(sourceTextLower, relation.objectMention.toLowerCase())) {
        hallucinationIssues.push({
          code: "relation-object-not-grounded",
          message: `Relation object "${relation.objectMention}" was not found in source text`,
        });
      }
    }

    if (relation.literalValue !== undefined) {
      hallucinationChecks += 1;
      if (!lowerIncludes(sourceTextLower, relation.literalValue.toLowerCase())) {
        hallucinationIssues.push({
          code: "relation-literal-not-grounded",
          message: `Relation literal "${relation.literalValue}" was not found in source text`,
        });
      }
    }

    if (
      relation.evidence !== undefined ||
      relation.evidenceStartChar !== undefined ||
      relation.evidenceEndChar !== undefined
    ) {
      evidenceChecks += 1;
      const hasCompleteSpan =
        relation.evidence !== undefined &&
        relation.evidenceStartChar !== undefined &&
        relation.evidenceEndChar !== undefined;

      if (!hasCompleteSpan) {
        evidenceIssues.push({
          code: "evidence-span-incomplete",
          message: `Relation ${relation.relationId} has partial evidence span fields`,
        });
        continue;
      }

      const start = relation.evidenceStartChar;
      const end = relation.evidenceEndChar;
      if (start < 0 || end < 0 || start >= end || end > document.body.length) {
        evidenceIssues.push({
          code: "evidence-span-out-of-bounds",
          message: `Relation ${relation.relationId} evidence span (${start}, ${end}) is outside body bounds`,
        });
        continue;
      }

      const slice = document.body.slice(start, end);
      if (normalizeWhitespace(slice) !== normalizeWhitespace(relation.evidence)) {
        evidenceIssues.push({
          code: "evidence-span-mismatch",
          message: `Relation ${relation.relationId} evidence text does not match source substring`,
        });
      }
    }
  }

  return {
    entityTypeChecks,
    invalidEntityTypes: entityTypeIssues,
    predicateChecks,
    invalidPredicates: predicateIssues,
    evidenceChecks,
    invalidEvidence: evidenceIssues,
    hallucinationChecks,
    hallucinationSignals: hallucinationIssues,
  };
};

const buildAggregateQuality = (documents: ReadonlyArray<DocumentExtractionRecord>): AggregateQualitySummary => {
  const totalEntityTypeChecks = documents.reduce((total, document) => total + document.validation.entityTypeChecks, 0);
  const totalInvalidEntityTypes = documents.reduce(
    (total, document) => total + document.validation.invalidEntityTypes.length,
    0
  );
  const totalPredicateChecks = documents.reduce((total, document) => total + document.validation.predicateChecks, 0);
  const totalInvalidPredicates = documents.reduce(
    (total, document) => total + document.validation.invalidPredicates.length,
    0
  );
  const totalEvidenceChecks = documents.reduce((total, document) => total + document.validation.evidenceChecks, 0);
  const totalInvalidEvidence = documents.reduce(
    (total, document) => total + document.validation.invalidEvidence.length,
    0
  );
  const totalHallucinationChecks = documents.reduce(
    (total, document) => total + document.validation.hallucinationChecks,
    0
  );
  const totalHallucinations = documents.reduce(
    (total, document) => total + document.validation.hallucinationSignals.length,
    0
  );

  const ratio = (numerator: number, denominator: number): number =>
    denominator === 0 ? 1 : Number.parseFloat((numerator / denominator).toFixed(4));

  return {
    entityTypeAlignmentRate: ratio(totalEntityTypeChecks - totalInvalidEntityTypes, totalEntityTypeChecks),
    predicateValidityRate: ratio(totalPredicateChecks - totalInvalidPredicates, totalPredicateChecks),
    evidenceGroundingRate: ratio(totalEvidenceChecks - totalInvalidEvidence, totalEvidenceChecks),
    nonHallucinationRate: ratio(totalHallucinationChecks - totalHallucinations, totalHallucinationChecks),
  };
};

const buildFailureReport = (options: HarnessCliOptions, error: unknown): ExtractionHarnessReport => {
  const message = error instanceof Error ? error.message : String(error);

  return {
    generatedAt: new Date().toISOString(),
    options: {
      limit: options.limit,
      offset: options.offset,
      cacheDirectory: options.cacheDirectory,
      ontologyPath: options.ontologyPath,
      outputPath: options.outputPath,
    },
    dataset: {
      cacheDirectory: options.cacheDirectory ?? "unresolved",
      cacheStatus: "failed",
      datasetHash: "unavailable",
      selectedMessageCount: 0,
      selectedThreadCount: 0,
      source: "unavailable",
    },
    ontology: {
      classCount: 0,
      propertyCount: 0,
      classIris: [],
      propertyIris: [],
    },
    summary: {
      requestedDocuments: options.limit,
      processedDocuments: 0,
      successfulDocuments: 0,
      failedDocuments: 0,
      totalMentions: 0,
      totalEntities: 0,
      totalRelations: 0,
      totalTokensUsed: 0,
      totalRuntimeMs: 0,
    },
    quality: {
      entityTypeAlignmentRate: 0,
      predicateValidityRate: 0,
      evidenceGroundingRate: 0,
      nonHallucinationRate: 0,
    },
    runtimeConstraints: [message],
    failures: [],
    documents: [],
  };
};

const extractionHarnessProgram = (
  options: HarnessCliOptions
): Effect.Effect<ExtractionHarnessReport, string, EnronDataCache | DeterministicExtractionPipeline> =>
  Effect.gen(function* () {
    const dataCache = yield* EnronDataCache;
    const extractionPipeline = yield* DeterministicExtractionPipeline;

    const ontologyContent = yield* Effect.tryPromise({
      try: () => readFile(options.ontologyPath, "utf8"),
      catch: (cause) => `Failed to read ontology file at ${options.ontologyPath}: ${String(cause)}`,
    });

    const ontologySummary = parseOntologySummary(ontologyContent);
    if (ontologySummary.classIris.length === 0 || ontologySummary.propertyIris.length === 0) {
      return yield* Effect.fail("Ontology file did not produce class/property IRIs for validation");
    }

    const loaded = yield* dataCache
      .loadCuratedDocuments({
        ...(options.cacheDirectory !== undefined ? { cacheDirectory: options.cacheDirectory } : {}),
      })
      .pipe(Effect.mapError((error) => `Failed to load curated documents: ${String(error)}`));

    const sortedDocuments = [...loaded.documents].sort(compareDocuments);
    const selectedDocuments = sortedDocuments.slice(options.offset, options.offset + options.limit);

    const successfulDocuments: Array<DocumentExtractionRecord> = [];
    const failedDocuments: Array<DocumentFailureRecord> = [];

    for (const document of selectedDocuments) {
      const resultExit = yield* extractionPipeline.run(document, ontologySummary).pipe(Effect.exit);

      if (resultExit._tag === "Failure") {
        failedDocuments.push({
          documentId: document.id,
          messageId: document.metadata.messageId,
          error: String(resultExit.cause),
        });
        continue;
      }

      const result = resultExit.value;
      const validation = validateDocumentExtraction(document, result.entities, result.relations, ontologySummary);

      successfulDocuments.push({
        documentId: document.id,
        messageId: document.metadata.messageId,
        title: document.title,
        runtimeMs: result.stats.runtimeMs,
        tokensUsed: result.stats.tokensUsed,
        chunkCount: result.stats.chunkCount,
        mentionCount: result.stats.mentionCount,
        entityCount: result.stats.entityCount,
        relationCount: result.stats.relationCount,
        mentions: result.mentions,
        entities: result.entities,
        relations: result.relations,
        validation,
      });
    }

    const aggregateQuality = buildAggregateQuality(successfulDocuments);
    const totalMentions = successfulDocuments.reduce((total, document) => total + document.mentionCount, 0);
    const totalEntities = successfulDocuments.reduce((total, document) => total + document.entityCount, 0);
    const totalRelations = successfulDocuments.reduce((total, document) => total + document.relationCount, 0);
    const totalTokensUsed = successfulDocuments.reduce((total, document) => total + document.tokensUsed, 0);
    const totalRuntimeMs = successfulDocuments.reduce((total, document) => total + document.runtimeMs, 0);

    const runtimeConstraints: Array<string> = [];
    if (selectedDocuments.length < options.limit) {
      runtimeConstraints.push(
        `Requested ${options.limit} documents but only ${selectedDocuments.length} were available after deterministic slicing`
      );
    }
    if (failedDocuments.length > 0) {
      runtimeConstraints.push(`Extraction failures for ${failedDocuments.length} document(s)`);
    }
    if (successfulDocuments.length === 0) {
      runtimeConstraints.push("No successful extraction runs were produced");
    }

    return {
      generatedAt: new Date().toISOString(),
      options: {
        limit: options.limit,
        offset: options.offset,
        cacheDirectory: options.cacheDirectory,
        ontologyPath: options.ontologyPath,
        outputPath: options.outputPath,
      },
      dataset: {
        cacheDirectory: loaded.cache.cacheDirectory,
        cacheStatus: loaded.cache.status,
        datasetHash: loaded.cache.manifest.datasetHash,
        selectedMessageCount: loaded.cache.manifest.selectedMessageCount,
        selectedThreadCount: loaded.cache.manifest.selectedThreadCount,
        source: loaded.cache.manifest.source,
      },
      ontology: {
        classCount: ontologySummary.classIris.length,
        propertyCount: ontologySummary.propertyIris.length,
        classIris: ontologySummary.classIris,
        propertyIris: ontologySummary.propertyIris,
      },
      summary: {
        requestedDocuments: options.limit,
        processedDocuments: selectedDocuments.length,
        successfulDocuments: successfulDocuments.length,
        failedDocuments: failedDocuments.length,
        totalMentions,
        totalEntities,
        totalRelations,
        totalTokensUsed,
        totalRuntimeMs,
      },
      quality: aggregateQuality,
      runtimeConstraints,
      failures: failedDocuments,
      documents: successfulDocuments,
    };
  });

export const runExtractionHarness = (options: HarnessCliOptions): Effect.Effect<ExtractionHarnessReport, never> => {
  const cacheLayer = EnronDataCacheLive.pipe(Layer.provideMerge(S3DataSourceLive));

  return extractionHarnessProgram(options).pipe(
    Effect.provide(Layer.mergeAll(cacheLayer, DeterministicExtractionPipelineLive)),
    Effect.catchAll((error) => Effect.succeed(buildFailureReport(options, error)))
  );
};

const renderSummary = (report: ExtractionHarnessReport): string => {
  const lines = [
    "enron extraction harness",
    `generatedAt: ${report.generatedAt}`,
    `datasetHash: ${report.dataset.datasetHash}`,
    `cacheStatus: ${report.dataset.cacheStatus}`,
    `requestedDocuments: ${report.summary.requestedDocuments}`,
    `processedDocuments: ${report.summary.processedDocuments}`,
    `successfulDocuments: ${report.summary.successfulDocuments}`,
    `failedDocuments: ${report.summary.failedDocuments}`,
    `totalMentions: ${report.summary.totalMentions}`,
    `totalEntities: ${report.summary.totalEntities}`,
    `totalRelations: ${report.summary.totalRelations}`,
    `totalTokensUsed: ${report.summary.totalTokensUsed}`,
    `totalRuntimeMs: ${report.summary.totalRuntimeMs}`,
    `entityTypeAlignmentRate: ${report.quality.entityTypeAlignmentRate}`,
    `predicateValidityRate: ${report.quality.predicateValidityRate}`,
    `evidenceGroundingRate: ${report.quality.evidenceGroundingRate}`,
    `nonHallucinationRate: ${report.quality.nonHallucinationRate}`,
  ];

  if (report.runtimeConstraints.length > 0) {
    lines.push(`runtimeConstraints: ${report.runtimeConstraints.join(" | ")}`);
  } else {
    lines.push("runtimeConstraints: none");
  }

  return `${lines.join("\n")}\n`;
};

const writeReportIfRequested = (
  report: ExtractionHarnessReport,
  outputPath: string | undefined
): Effect.Effect<void, never> => {
  if (outputPath === undefined) {
    return Effect.void;
  }

  return Effect.tryPromise({
    try: async () => {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    },
    catch: (cause) => `Failed to write extraction report to ${outputPath}: ${String(cause)}`,
  }).pipe(
    Effect.tapError((error) => Effect.logWarning(String(error))),
    Effect.asVoid,
    Effect.catchAll(() => Effect.void)
  );
};

const main = (argv: ReadonlyArray<string>): Effect.Effect<void, never> =>
  Effect.gen(function* () {
    const options = parseCliOptions(argv);
    const report = yield* runExtractionHarness(options);

    yield* writeReportIfRequested(report, options.outputPath);
    yield* Effect.sync(() => {
      process.stdout.write(renderSummary(report));
      if (options.printJson) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      }
    });
  }).pipe(Effect.asVoid);

if (import.meta.main) {
  Effect.runPromise(main(process.argv.slice(2)));
}
