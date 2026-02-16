"use server";

import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  ENRON_DEMO_ONTOLOGY_CONTENT,
  ENRON_DEMO_ONTOLOGY_ID,
  MAX_DOCUMENTS_PER_SCENARIO,
} from "./constants";
import { CURATED_SCENARIOS } from "./data/scenarios";
import type { PreparedScenarioIngestPayload, ScenarioId } from "./types";

interface CuratedThreadMessage {
  readonly id: string;
  readonly messageId?: undefined | string;
}

interface CuratedThread {
  readonly threadId: string;
  readonly messages: readonly CuratedThreadMessage[];
}

interface CuratedDocumentMetadata {
  readonly threadId?: undefined | string;
  readonly messageId?: undefined | string;
}

interface CuratedDocument {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly metadata?: undefined | CuratedDocumentMetadata;
}

interface CuratedDataset {
  readonly ontologyContent: string;
  readonly threadsById: ReadonlyMap<string, CuratedThread>;
  readonly documentsById: ReadonlyMap<string, CuratedDocument>;
  readonly documentsByThreadId: ReadonlyMap<string, readonly CuratedDocument[]>;
}

const SCENARIO_BY_ID = new Map(CURATED_SCENARIOS.map((scenario) => [scenario.id, scenario] as const));

const CURATED_DATA_ROOT =
  process.env.ENRON_CURATED_DATA_ROOT ?? path.join(os.homedir(), ".cache", "todox-test-data", "enron", "curated");

const CURATED_THREADS_PATH = path.join(CURATED_DATA_ROOT, "threads.json");
const CURATED_DOCUMENTS_PATH = path.join(CURATED_DATA_ROOT, "documents.json");

let datasetPromise: undefined | Promise<CuratedDataset> = undefined;

const readJsonFile = async <A>(filePath: string): Promise<A> => {
  const fileContents = await readFile(filePath, "utf8");
  return JSON.parse(fileContents) as A;
};

const createDeterministicDocumentId = (sourceDocumentId: string): WorkspacesEntityIds.DocumentId.Type => {
  const digest = Crypto.createHash("sha256").update(sourceDocumentId).digest();
  const byteSix = digest[6];
  const byteEight = digest[8];
  if (byteSix === undefined || byteEight === undefined) {
    throw new Error("Deterministic document id digest is missing expected bytes");
  }

  // Format as RFC 4122 UUIDv5 for deterministic id generation.
  digest[6] = (byteSix & 0x0f) | 0x50;
  digest[8] = (byteEight & 0x3f) | 0x80;

  const hex = digest.toString("hex");
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

  return WorkspacesEntityIds.DocumentId.make(`workspaces_document__${uuid}`);
};

const compareDocuments = (left: CuratedDocument, right: CuratedDocument): number => {
  const byId = left.id.localeCompare(right.id);
  if (byId !== 0) {
    return byId;
  }

  const leftMessageId = left.metadata?.messageId ?? "";
  const rightMessageId = right.metadata?.messageId ?? "";
  return leftMessageId.localeCompare(rightMessageId);
};

const loadCuratedDataset = async (): Promise<CuratedDataset> => {
  if (datasetPromise !== undefined) {
    return datasetPromise;
  }

  datasetPromise = (async () => {
    const [threads, documents] = await Promise.all([
      readJsonFile<readonly CuratedThread[]>(CURATED_THREADS_PATH),
      readJsonFile<readonly CuratedDocument[]>(CURATED_DOCUMENTS_PATH),
    ]);

    const threadsById = new Map(threads.map((thread) => [thread.threadId, thread] as const));
    const documentsById = new Map(documents.map((document) => [document.id, document] as const));

    const documentsByThreadIdMutable = new Map<string, CuratedDocument[]>();
    for (const document of documents) {
      const threadId = document.metadata?.threadId;
      if (threadId === undefined || threadId.length === 0) {
        continue;
      }

      const existing = documentsByThreadIdMutable.get(threadId);
      if (existing === undefined) {
        documentsByThreadIdMutable.set(threadId, [document]);
        continue;
      }
      existing.push(document);
    }

    const documentsByThreadId = new Map<string, readonly CuratedDocument[]>();
    for (const [threadId, threadDocuments] of documentsByThreadIdMutable.entries()) {
      documentsByThreadId.set(threadId, [...threadDocuments].sort(compareDocuments));
    }

    return {
      ontologyContent: ENRON_DEMO_ONTOLOGY_CONTENT,
      threadsById,
      documentsById,
      documentsByThreadId,
    };
  })();

  return datasetPromise;
};

const resolveScenarioDocuments = (
  scenarioId: ScenarioId,
  dataset: CuratedDataset
): readonly { readonly sourceDocumentId: string; readonly documentId: WorkspacesEntityIds.DocumentId.Type; readonly text: string }[] => {
  const scenario = SCENARIO_BY_ID.get(scenarioId);
  if (scenario === undefined) {
    throw new Error(`Unknown scenario "${scenarioId}"`);
  }

  const thread = dataset.threadsById.get(scenario.sourceThreadId);
  if (thread === undefined) {
    throw new Error(`Scenario "${scenario.id}" thread "${scenario.sourceThreadId}" was not found in threads`);
  }

  const messageDocuments = thread.messages
    .map((message) => dataset.documentsById.get(message.id))
    .filter((document): document is CuratedDocument => document !== undefined);

  const fallbackThreadDocuments = dataset.documentsByThreadId.get(scenario.sourceThreadId) ?? [];

  const fullThreadDocuments = (messageDocuments.length > 0 ? messageDocuments : fallbackThreadDocuments)
    .slice()
    .sort(compareDocuments)
    .slice(0, MAX_DOCUMENTS_PER_SCENARIO);

  if (fullThreadDocuments.length === 0) {
    throw new Error(`Scenario "${scenario.id}" resolved no documents for ingest`);
  }

  return fullThreadDocuments.map((document) => ({
    sourceDocumentId: document.id,
    documentId: createDeterministicDocumentId(document.id),
    text: document.body,
  }));
};

const buildSourceText = (documents: readonly { readonly sourceDocumentId: string; readonly text: string }[]): string =>
  documents
    .map((document, index) => `### Document ${index + 1}: ${document.sourceDocumentId}\n\n${document.text}`)
    .join("\n\n---\n\n");

export async function prepareScenarioIngestPayload(input: {
  readonly scenarioId: ScenarioId;
}): Promise<PreparedScenarioIngestPayload> {
  const scenario = SCENARIO_BY_ID.get(input.scenarioId);
  if (scenario === undefined) {
    throw new Error(`Unknown scenario "${input.scenarioId}"`);
  }

  const dataset = await loadCuratedDataset();
  const documents = resolveScenarioDocuments(input.scenarioId, dataset);

  return {
    scenarioId: input.scenarioId,
    ontologyId: ENRON_DEMO_ONTOLOGY_ID,
    ontologyContent: dataset.ontologyContent,
    documents: documents.map((document) => ({
      sourceDocumentId: document.sourceDocumentId,
      documentId: document.documentId,
      text: document.text,
    })),
    sourceText: buildSourceText(documents),
  };
}
